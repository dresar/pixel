/**
 * Glossary Routes — /api/glosarium/*
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ilike, or, asc, eq } from "drizzle-orm";
import { db } from "../../config/database.js";
import { glossaryEntries } from "../../database/schema/index.js";
import { panggilGemini } from "../ai-engine/gemini.provider.js";
import { buatSlug } from "../../shared/utils/slug.js";
import { authMiddleware, adminMiddleware } from "../../shared/middleware/auth.middleware.js";
import { sukses, gagal } from "../../shared/utils/response.js";
import { isAppError } from "../../shared/errors/AppError.js";

const glossaryRoutes = new Hono();

// GET /api/glosarium — Daftar glosarium (public)
glossaryRoutes.get(
  "/",
  zValidator("query", z.object({ cari: z.string().optional() })),
  async (c) => {
    try {
      const { cari } = c.req.valid("query");
      let query = db.select().from(glossaryEntries).orderBy(asc(glossaryEntries.istilah)).$dynamic();
      if (cari) {
        query = query.where(
          or(
            ilike(glossaryEntries.istilah, `%${cari}%`),
            ilike(glossaryEntries.definisi, `%${cari}%`),
          ),
        );
      }
      const daftar = await query;
      return sukses(c, "Data glosarium berhasil dimuat", daftar);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Terjadi kesalahan sistem.", "INTERNAL_ERROR", 500);
    }
  },
);

// ── Admin Routes ──────────────────────────────────────────────────────────────
glossaryRoutes.use("/admin/*", authMiddleware, adminMiddleware);

// POST /api/glosarium/admin — Tambah istilah baru
glossaryRoutes.post(
  "/admin",
  zValidator(
    "json",
    z.object({
      istilah: z.string().min(2),
      slug: z.string().optional(),
      definisi: z.string().min(5),
      contoh: z.string().optional(),
      referensiUndangUndang: z.string().optional(),
      kategori: z.string().optional(),
    }),
  ),
  async (c) => {
    try {
      const data = c.req.valid("json");
      const slugFixed = data.slug || buatSlug(data.istilah);
      const [entry] = await db
        .insert(glossaryEntries)
        .values({ ...data, slug: slugFixed })
        .returning();
      return sukses(c, "Istilah glosarium berhasil ditambahkan", entry, 201);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Terjadi kesalahan sistem.", "INTERNAL_ERROR", 500);
    }
  },
);

// DELETE /api/glosarium/admin/:id — Hapus istilah
glossaryRoutes.delete("/admin/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db.delete(glossaryEntries).where(eq(glossaryEntries.id, id));
    return sukses(c, "Istilah glosarium berhasil dihapus!", null);
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    return gagal(c, "Gagal menghapus glosarium", "INTERNAL_ERROR", 500);
  }
});

// POST /api/glosarium/admin/impor — Impor batch glosarium
glossaryRoutes.post(
  "/admin/impor",
  zValidator(
    "json",
    z.object({
      items: z.array(
        z.object({
          istilah: z.string(),
          definisi: z.string(),
          contoh: z.string().optional(),
          referensiUndangUndang: z.string().optional(),
          kategori: z.string().optional(),
        }),
      ),
    }),
  ),
  async (c) => {
    try {
      const { items } = c.req.valid("json");
      let suksesCount = 0;
      for (const item of items) {
        const slug = buatSlug(item.istilah) || `istilah-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
        try {
          await db.insert(glossaryEntries).values({ istilah: item.istilah, slug, definisi: item.definisi, contoh: item.contoh || null, referensiUndangUndang: item.referensiUndangUndang || null, kategori: item.kategori || "UMUM" });
          suksesCount++;
        } catch { /* skip duplicate */ }
      }
      return sukses(c, `Berhasil mengimpor ${suksesCount} istilah glosarium!`, { count: suksesCount });
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal mengimpor glosarium.", "INTERNAL_ERROR", 500);
    }
  },
);

// POST /api/glosarium/admin/generate-ai — Generate glosarium dengan AI
glossaryRoutes.post(
  "/admin/generate-ai",
  zValidator(
    "json",
    z.object({ topik: z.string().min(2), jumlah: z.number().optional().default(10) }),
  ),
  async (c) => {
    try {
      const { topik, jumlah } = c.req.valid("json");
      const aiRes = await panggilGemini({
        systemInstruction: "Anda adalah Pakar Glosarium Perpajakan Brevet. Kembalikan HANYA JSON array valid tanpa markdown.",
        prompt: `Buatkan ${jumlah} istilah glosarium perpajakan seputar topik "${topik}". Format: [{"istilah":"...","definisi":"...","contoh":"...","referensiUndangUndang":"...","kategori":"..."}]`,
      });

      const cleanTeks = aiRes.teks.replace(/```json/g, "").replace(/```/g, "").trim();
      const jsonArray: any[] = JSON.parse(cleanTeks);

      let imported = 0;
      for (const item of jsonArray) {
        if (item.istilah && item.definisi) {
          const slug = buatSlug(item.istilah) || `glos-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
          try {
            await db.insert(glossaryEntries).values({ istilah: item.istilah, slug, definisi: item.definisi, contoh: item.contoh || null, referensiUndangUndang: item.referensiUndangUndang || null, kategori: item.kategori || "UMUM" });
            imported++;
          } catch { /* skip duplicate */ }
        }
      }

      return sukses(c, `AI berhasil membuat & menyimpan ${imported} istilah glosarium baru!`, { count: imported, rawJson: cleanTeks });
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal menghasilkan glosarium AI", "INTERNAL_ERROR", 500);
    }
  },
);

export { glossaryRoutes };
