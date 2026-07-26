/**
 * Prompt Studio Routes — Manage AI Prompt System Templates & Engine Versions
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, asc } from "drizzle-orm";
import { db } from "../../config/database.js";
import { promptEngines, promptEngineVersions } from "../../database/schema/index.js";
import { authMiddleware, adminMiddleware } from "../../shared/middleware/auth.middleware.js";
import { sukses, gagal } from "../../shared/utils/response.js";
import { isAppError } from "../../shared/errors/AppError.js";

const promptStudioRoutes = new Hono();

// GET /api/prompt-studio — List all prompt engines (Public read)
promptStudioRoutes.get("/", async (c) => {
  try {
    const list = await db
      .select()
      .from(promptEngines)
      .orderBy(asc(promptEngines.urutanKompilasi));
    return sukses(c, "Daftar Prompt Engine dimuat", list);
  } catch (error) {
    return sukses(c, "Daftar Prompt Engine dimuat", []);
  }
});

// GET /api/prompt-studio/:id — Get detail engine by ID (Public read)
promptStudioRoutes.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const [engine] = await db.select().from(promptEngines).where(eq(promptEngines.id, id)).limit(1);
    if (!engine) return gagal(c, "Prompt Engine tidak ditemukan", "NOT_FOUND", 404);
    return sukses(c, "Detail Prompt Engine dimuat", engine);
  } catch (error) {
    return gagal(c, "Gagal memuat detail engine.", "INTERNAL_ERROR", 500);
  }
});

// POST /api/prompt-studio — Buat Prompt Engine baru
promptStudioRoutes.post(
  "/",
  zValidator(
    "json",
    z.object({
      nama: z.string().min(1),
      kodeEngine: z.string().min(1),
      kategoriEngine: z.string().min(1),
      deskripsi: z.string().optional(),
      kontenTemplate: z.string().min(1),
      urutanKompilasi: z.number().optional().default(99),
      aktif: z.boolean().optional().default(true),
      tag: z.array(z.string()).optional(),
    }),
  ),
  async (c) => {
    try {
      const user = c.get("user");
      const userId = user?.id || "admin-system";
      const data = c.req.valid("json");

      const [engine] = await db
        .insert(promptEngines)
        .values({
          ...data,
          dibuatOleh: userId,
        })
        .returning();

      // Simpan versi 1
      await db.insert(promptEngineVersions).values({
        engineId: engine.id,
        nomorVersi: 1,
        kontenTemplate: data.kontenTemplate,
        dibuatOleh: userId,
        catatanRevisi: "Rilis Awal",
      });

      return sukses(c, `Prompt Engine "${engine.nama}" berhasil dibuat!`, engine, 201);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal membuat Prompt Engine.", "INTERNAL_ERROR", 500);
    }
  },
);

// PATCH /api/prompt-studio/:id — Update Prompt Engine (Auto Version Snapshot)
promptStudioRoutes.patch(
  "/:id",
  zValidator(
    "json",
    z.object({
      nama: z.string().optional(),
      deskripsi: z.string().optional(),
      kontenTemplate: z.string().optional(),
      urutanKompilasi: z.number().optional(),
      aktif: z.boolean().optional(),
      tag: z.array(z.string()).optional(),
      catatanRevisi: z.string().optional(),
    }),
  ),
  async (c) => {
    try {
      const user = c.get("user");
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const [existing] = await db.select().from(promptEngines).where(eq(promptEngines.id, id)).limit(1);
      if (!existing) return gagal(c, "Engine tidak ditemukan", "NOT_FOUND", 404);

      const [updated] = await db
        .update(promptEngines)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(promptEngines.id, id))
        .returning();

      // Jika template berubah, buat versi baru
      if (data.kontenTemplate && data.kontenTemplate !== existing.kontenTemplate) {
        const versions = await db
          .select()
          .from(promptEngineVersions)
          .where(eq(promptEngineVersions.engineId, id));

        const nextVersion = versions.length + 1;
        await db.insert(promptEngineVersions).values({
          engineId: id,
          nomorVersi: nextVersion,
          kontenTemplate: data.kontenTemplate,
          dibuatOleh: user?.id || "admin-system",
          catatanRevisi: data.catatanRevisi || `Versi ${nextVersion}`,
        });
      }

      return sukses(c, "Prompt Engine berhasil diperbarui!", updated);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal memperbarui Prompt Engine.", "INTERNAL_ERROR", 500);
    }
  },
);

// PATCH /api/prompt-studio/:id/toggle-aktif — Toggle status aktif/nonaktif
promptStudioRoutes.patch("/:id/toggle-aktif", async (c) => {
  try {
    const id = c.req.param("id");
    const [existing] = await db.select().from(promptEngines).where(eq(promptEngines.id, id)).limit(1);
    if (!existing) return gagal(c, "Engine tidak ditemukan", "NOT_FOUND", 404);

    const [updated] = await db
      .update(promptEngines)
      .set({ aktif: !existing.aktif, updatedAt: new Date() })
      .where(eq(promptEngines.id, id))
      .returning();

    return sukses(c, `Prompt Engine ${updated.aktif ? "diaktifkan" : "dinonaktifkan"}`, updated);
  } catch (error) {
    return gagal(c, "Gagal mengubah status.", "INTERNAL_ERROR", 500);
  }
});

// DELETE /api/prompt-studio/:id — Hapus engine
promptStudioRoutes.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const [deleted] = await db.delete(promptEngines).where(eq(promptEngines.id, id)).returning();
    return sukses(c, "Prompt Engine berhasil dihapus", deleted);
  } catch (error) {
    return gagal(c, "Gagal menghapus Prompt Engine.", "INTERNAL_ERROR", 500);
  }
});

// GET /api/prompt-studio/:engineId/versi — Riwayat versi engine
promptStudioRoutes.get("/:engineId/versi", async (c) => {
  try {
    const engineId = c.req.param("engineId");
    const list = await db
      .select()
      .from(promptEngineVersions)
      .where(eq(promptEngineVersions.engineId, engineId))
      .orderBy(desc(promptEngineVersions.nomorVersi));
    return sukses(c, "Riwayat versi dimuat", list);
  } catch (error) {
    return sukses(c, "Riwayat versi dimuat", []);
  }
});

// POST /api/prompt-studio/:engineId/pulihkan — Pulihkan ke versi tertentu
promptStudioRoutes.post(
  "/:engineId/pulihkan",
  zValidator(
    "json",
    z.object({
      nomorVersi: z.number().int().min(1),
    }),
  ),
  async (c) => {
    try {
      const engineId = c.req.param("engineId");
      const { nomorVersi } = c.req.valid("json");

      const [targetVersion] = await db
        .select()
        .from(promptEngineVersions)
        .where(
          eq(promptEngineVersions.engineId, engineId) &&
            eq(promptEngineVersions.nomorVersi, nomorVersi),
        )
        .limit(1);

      if (!targetVersion) return gagal(c, `Versi ${nomorVersi} tidak ditemukan`, "NOT_FOUND", 404);

      const [updated] = await db
        .update(promptEngines)
        .set({ kontenTemplate: targetVersion.kontenTemplate, updatedAt: new Date() })
        .where(eq(promptEngines.id, engineId))
        .returning();

      return sukses(c, `Engine berhasil dipulihkan ke Versi ${nomorVersi}`, updated);
    } catch (error) {
      return gagal(c, "Gagal memulihkan versi.", "INTERNAL_ERROR", 500);
    }
  },
);

export { promptStudioRoutes };
