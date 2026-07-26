/**
 * Users Routes — /api/users/*
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db } from "../../config/database.js";
import { users, accounts } from "../../database/schema/index.js";
import { authMiddleware, adminMiddleware } from "../../shared/middleware/auth.middleware.js";
import { sukses, gagal } from "../../shared/utils/response.js";
import { isAppError } from "../../shared/errors/AppError.js";

const usersRoutes = new Hono();

usersRoutes.use("/*", authMiddleware);

// GET /api/users/profil — Profil pengguna yang sedang login
usersRoutes.get("/profil", async (c) => {
  try {
    const user = c.get("user");
    const [pengguna] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    if (!pengguna) return gagal(c, "Profil pengguna tidak ditemukan.", "NOT_FOUND", 404);
    return sukses(c, "Profil berhasil dimuat", pengguna);
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    return gagal(c, "Terjadi kesalahan sistem.", "INTERNAL_ERROR", 500);
  }
});

// PATCH /api/users/profil — Update profil
usersRoutes.patch(
  "/profil",
  zValidator(
    "json",
    z.object({
      namaLengkap: z.string().min(2).optional(),
      email: z.string().email().optional(),
      bio: z.string().optional(),
      image: z.string().optional(),
      password: z.string().min(6).optional(),
    }),
  ),
  async (c) => {
    try {
      const user = c.get("user");
      const { password, ...data } = c.req.valid("json");
      const updateData: any = { updatedAt: new Date() };
      if (data.namaLengkap) updateData.namaLengkap = data.namaLengkap;
      if (data.email) updateData.email = data.email;
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.image) updateData.image = data.image;

      const [updated] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, user.id))
        .returning();

      if (password) {
        await db
          .update(accounts)
          .set({ password, updatedAt: new Date() })
          .where(eq(accounts.userId, user.id));
      }

      return sukses(c, "Profil & kata sandi berhasil diperbarui!", updated);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Terjadi kesalahan sistem saat memperbarui profil.", "INTERNAL_ERROR", 500);
    }
  },
);

// GET /api/users/admin/daftar — Daftar semua pengguna (Public read)
usersRoutes.get("/admin/daftar", async (c) => {
  try {
    const list = await db.select().from(users).orderBy(desc(users.createdAt)).limit(100);
    return sukses(c, "Daftar pengguna dimuat", list);
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    return gagal(c, "Terjadi kesalahan mengambil data pengguna.", "INTERNAL_ERROR", 500);
  }
});

// ── Admin Routes ──────────────────────────────────────────────────────────────
usersRoutes.use("/admin/*", adminMiddleware);

// PATCH /api/users/admin/:id/peran — Update peran pengguna
usersRoutes.patch(
  "/admin/:id/peran",
  zValidator(
    "json",
    z.object({
      peran: z.enum(["STUDENT", "ADMIN", "SUPER_ADMIN"]),
      statusAkun: z.enum(["AKTIF", "NONAKTIF", "DITANGGUHKAN"]).optional(),
    }),
  ),
  async (c) => {
    try {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const updateData: any = { peran: data.peran, updatedAt: new Date() };
      if (data.statusAkun) updateData.statusAkun = data.statusAkun;

      const [updated] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

      if (!updated) return gagal(c, "Pengguna tidak ditemukan", "NOT_FOUND", 404);
      return sukses(c, "Peran & status pengguna berhasil diperbarui", updated);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal memperbarui data pengguna.", "INTERNAL_ERROR", 500);
    }
  },
);

export { usersRoutes };
