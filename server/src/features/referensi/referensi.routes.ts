/**
 * Referensi Hukum Routes — /api/referensi/*
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ilike, or, asc, eq } from "drizzle-orm";
import { db } from "../../config/database.js";
import { referensiHukum } from "../../database/schema/index.js";
import { panggilGemini } from "../ai-engine/gemini.provider.js";
import { buatSlug } from "../../shared/utils/slug.js";
import { authMiddleware, adminMiddleware } from "../../shared/middleware/auth.middleware.js";
import { sukses, gagal } from "../../shared/utils/response.js";
import { isAppError } from "../../shared/errors/AppError.js";

const referensiRoutes = new Hono();

// GET /api/referensi — Daftar referensi hukum (public)
referensiRoutes.get(
  "/",
  zValidator(
    "query",
    z.object({ cari: z.string().optional(), kategori: z.string().optional() }),
  ),
  async (c) => {
    try {
      const { cari } = c.req.valid("query");
      let query = db.select().from(referensiHukum).orderBy(asc(referensiHukum.nomorPeraturan)).$dynamic();
      if (cari) {
        query = query.where(
          or(
            ilike(referensiHukum.nomorPeraturan, `%${cari}%`),
            ilike(referensiHukum.judul, `%${cari}%`),
            ilike(referensiHukum.ringkasan, `%${cari}%`),
          ),
        );
      }
      const daftar = await query;
      return sukses(c, "Data referensi hukum berhasil dimuat", daftar);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Terjadi kesalahan sistem.", "INTERNAL_ERROR", 500);
    }
  },
);

// ── Admin Routes ──────────────────────────────────────────────────────────────
referensiRoutes.use("/admin/*", authMiddleware, adminMiddleware);

// POST /api/referensi/admin — Tambah referensi baru
referensiRoutes.post(
  "/admin",
  zValidator(
    "json",
    z.object({
      nomorPeraturan: z.string().min(2),
      judul: z.string().min(2),
      kategori: z.string().default("UU"),
      tahun: z.string().optional(),
      ringkasan: z.string().min(5),
      kontenLengkap: z.string().optional(),
      urlDokumen: z.string().optional(),
    }),
  ),
  async (c) => {
    try {
      const data = c.req.valid("json");
      const slug = buatSlug(`${data.kategori}-${data.nomorPeraturan}`) || `ref-${Date.now()}`;
      const [ref] = await db.insert(referensiHukum).values({ ...data, slug }).returning();
      return sukses(c, "Referensi hukum berhasil ditambahkan!", ref, 201);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal menambahkan referensi hukum", "INTERNAL_ERROR", 500);
    }
  },
);

// DELETE /api/referensi/admin/:id — Hapus referensi
referensiRoutes.delete("/admin/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db.delete(referensiHukum).where(eq(referensiHukum.id, id));
    return sukses(c, "Referensi hukum berhasil dihapus!", null);
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    return gagal(c, "Gagal menghapus referensi hukum", "INTERNAL_ERROR", 500);
  }
});

// POST /api/referensi/admin/generate-ai — Generate referensi dengan AI
referensiRoutes.post(
  "/admin/generate-ai",
  zValidator(
    "json",
    z.object({ topik: z.string().min(2), jumlah: z.number().optional().default(5) }),
  ),
  async (c) => {
    try {
      const { topik, jumlah } = c.req.valid("json");
      const aiRes = await panggilGemini({
        systemInstruction: "Anda adalah Legal Specialist & Drafter Regulasi Perpajakan Indonesia. Kembalikan HANYA JSON array valid tanpa markdown.",
        prompt: `Buatkan ${jumlah} peraturan undang-undang / PMK perpajakan resmi Indonesia seputar topik "${topik}". Format: [{"nomorPeraturan":"...","judul":"...","kategori":"...","tahun":"...","ringkasan":"...","urlDokumen":"..."}]`,
      });

      const cleanTeks = aiRes.teks.replace(/```json/g, "").replace(/```/g, "").trim();
      const jsonArray: any[] = JSON.parse(cleanTeks);

      let imported = 0;
      for (const item of jsonArray) {
        if (item.nomorPeraturan && item.judul) {
          const slug = buatSlug(`${item.kategori || "UU"}-${item.nomorPeraturan}`) || `ref-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
          try {
            await db.insert(referensiHukum).values({ nomorPeraturan: item.nomorPeraturan, slug, judul: item.judul, kategori: item.kategori || "UU", tahun: item.tahun || "2024", ringkasan: item.ringkasan, urlDokumen: item.urlDokumen || null });
            imported++;
          } catch { /* skip duplicate */ }
        }
      }

      return sukses(c, `AI berhasil membuat & menyimpan ${imported} referensi hukum baru!`, { count: imported });
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal menghasilkan referensi AI", "INTERNAL_ERROR", 500);
    }
  },
);

export { referensiRoutes };
