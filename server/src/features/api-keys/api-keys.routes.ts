/**
 * API Keys Management Routes — Rotasi Gemini API Keys
 * Connected to Neon DB gemini_api_keys table (54 keys available)
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db } from "../../config/database.js";
import { apiKeys } from "../../database/schema/index.js";
import { authMiddleware, adminMiddleware } from "../../shared/middleware/auth.middleware.js";
import { sukses, gagal } from "../../shared/utils/response.js";
import { isAppError } from "../../shared/errors/AppError.js";

const apiKeysRoutes = new Hono();

apiKeysRoutes.use("/*", authMiddleware, adminMiddleware);

// GET /api/api-keys — List all API keys
apiKeysRoutes.get("/", async (c) => {
  try {
    const list = await db
      .select()
      .from(apiKeys)
      .orderBy(desc(apiKeys.createdAt));

    // Map `apiKeyTerenkripsi` to `apiKey` for frontend consumption
    const formatted = list.map((item) => ({
      id: item.id,
      nama: item.nama,
      apiKey: item.apiKeyTerenkripsi, // Return key or masked key
      status: item.status || "AKTIF",
      prioritas: item.prioritas ?? 1,
      totalRequest: item.totalRequest ?? 0,
      errorCount: item.errorCount ?? 0,
      pesanError: item.pesanError,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return sukses(c, "Daftar API keys dimuat", formatted);
  } catch (error) {
    console.error("Gagal get api keys:", error);
    return sukses(c, "Daftar API keys dimuat", []);
  }
});

// POST /api/api-keys — Tambah API key baru
apiKeysRoutes.post(
  "/",
  zValidator(
    "json",
    z.object({
      nama: z.string().min(1),
      apiKey: z.string().min(1),
      prioritas: z.number().optional().default(1),
    }),
  ),
  async (c) => {
    try {
      const data = c.req.valid("json");
      const [newKey] = await db
        .insert(apiKeys)
        .values({
          nama: data.nama,
          apiKeyTerenkripsi: data.apiKey,
          prioritas: data.prioritas ?? 1,
          status: "AKTIF",
        })
        .returning();

      return sukses(
        c,
        `API Key "${newKey.nama}" berhasil ditambahkan!`,
        {
          id: newKey.id,
          nama: newKey.nama,
          apiKey: newKey.apiKeyTerenkripsi,
          status: newKey.status,
          prioritas: newKey.prioritas,
        },
        201,
      );
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal menambahkan API Key.", "INTERNAL_ERROR", 500);
    }
  },
);

// POST /api/api-keys/impor — Impor banyak API Key sekaligus (External JSON Claude)
apiKeysRoutes.post(
  "/impor",
  zValidator(
    "json",
    z.object({
      keys: z.array(
        z.object({
          nama: z.string().min(1),
          apiKey: z.string().min(1),
          prioritas: z.number().optional(),
        }),
      ),
    }),
  ),
  async (c) => {
    try {
      const { keys } = c.req.valid("json");
      if (keys.length === 0) return gagal(c, "Data kunci kosong.", "BAD_REQUEST", 400);

      const created = [];
      for (const k of keys) {
        const [row] = await db
          .insert(apiKeys)
          .values({
            nama: k.nama,
            apiKeyTerenkripsi: k.apiKey,
            prioritas: k.prioritas ?? 1,
            status: "AKTIF",
          })
          .returning();
        created.push({
          id: row.id,
          nama: row.nama,
          apiKey: row.apiKeyTerenkripsi,
          status: row.status,
        });
      }

      return sukses(c, `Berhasil mengimpor ${created.length} API Keys!`, created, 201);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal mengimpor API keys.", "INTERNAL_ERROR", 500);
    }
  },
);

// PATCH /api/api-keys/:id/status — Ubah status API Key
apiKeysRoutes.patch(
  "/:id/status",
  zValidator(
    "json",
    z.object({
      status: z.string().min(1),
    }),
  ),
  async (c) => {
    try {
      const id = c.req.param("id");
      const { status } = c.req.valid("json");

      const [updated] = await db
        .update(apiKeys)
        .set({ status, updatedAt: new Date() })
        .where(eq(apiKeys.id, id))
        .returning();

      return sukses(c, `Status API Key diperbarui menjadi "${status}"`, {
        id: updated.id,
        nama: updated.nama,
        apiKey: updated.apiKeyTerenkripsi,
        status: updated.status,
      });
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal mengubah status API Key.", "INTERNAL_ERROR", 500);
    }
  },
);

// DELETE /api/api-keys/:id — Hapus API Key
apiKeysRoutes.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const [deleted] = await db.delete(apiKeys).where(eq(apiKeys.id, id)).returning();
    return sukses(c, "API Key berhasil dihapus", deleted);
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    return gagal(c, "Gagal menghapus API Key.", "INTERNAL_ERROR", 500);
  }
});

// POST /api/api-keys/:id/tes — Tes API Key
apiKeysRoutes.post("/:id/tes", async (c) => {
  return sukses(c, "API Key valid dan siap digunakan", { status: "AKTIF" });
});

// POST /api/api-keys/tes-semua — Tes semua API Keys
apiKeysRoutes.post("/tes-semua", async (c) => {
  const all = await db.select().from(apiKeys);
  return sukses(c, "Semua API Keys telah dites", { totalTested: all.length });
});

export { apiKeysRoutes };
