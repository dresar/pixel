import { createServerFn } from "@tanstack/react-start";
import { validasiSesi } from "../server/shared/middleware/auth-middleware";
import { validasiPeran, membutuhkanAdmin } from "../server/shared/middleware/role-middleware";
import { db } from "../server/config/database";
import { users, accounts } from "../server/database/schema";
import { eq, desc } from "drizzle-orm";
import { sukses, gagal } from "../server/shared/utils/response-builder";
import { isAppError } from "../server/shared/errors/AppError";
import { z } from "zod";

export const getProfilPengguna = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sesi = await validasiSesi();
    const [pengguna] = await db.select().from(users).where(eq(users.id, sesi.userId)).limit(1);
    if (!pengguna) return gagal("Profil pengguna tidak ditemukan.", "NOT_FOUND");
    return sukses("Profil berhasil dimuat", pengguna);
  } catch (error) {
    if (isAppError(error)) return gagal(error.message, error.code);
    return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
  }
});

export const updateProfilPengguna = createServerFn({ method: "POST" })
  .validator(
    z.object({
      namaLengkap: z.string().min(2).optional(),
      bio: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      const [updated] = await db
        .update(users)
        .set({
          namaLengkap: data.namaLengkap,
          bio: data.bio,
          updatedAt: new Date(),
        })
        .where(eq(users.id, sesi.userId))
        .returning();
      return sukses("Profil berhasil diperbarui", updated);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
    }
  });

export const getDaftarPenggunaAdmin = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const list = await db.select().from(users).orderBy(desc(users.createdAt)).limit(100);
    return sukses("Daftar pengguna dimuat", list);
  } catch (error) {
    if (isAppError(error)) return gagal(error.message, error.code);
    return gagal("Terjadi kesalahan mengambil data pengguna.", "INTERNAL_ERROR");
  }
});

export const updatePeranPenggunaAdmin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      userId: z.string(),
      peran: z.enum(["STUDENT", "ADMIN", "SUPER_ADMIN"]),
      statusAkun: z.enum(["AKTIF", "NONAKTIF", "DITANGGUHKAN"]).optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());

      const updateData: any = {
        peran: data.peran,
        updatedAt: new Date(),
      };
      if (data.statusAkun) updateData.statusAkun = data.statusAkun;

      const [updated] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, data.userId))
        .returning();

      if (!updated) return gagal("Pengguna tidak ditemukan", "NOT_FOUND");
      return sukses("Peran & status pengguna berhasil diperbarui", updated);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal memperbarui data pengguna.", "INTERNAL_ERROR");
    }
  });

export const gantiSandiPenggunaAdmin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      userId: z.string(),
      passwordBaru: z.string().min(6, "Kata sandi minimal 6 karakter"),
    })
  )
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());

      const userAcc = await db.select().from(accounts).where(eq(accounts.userId, data.userId)).limit(1);
      if (userAcc.length === 0) {
        // If account doesn't exist yet, insert account record
        await db.insert(accounts).values({
          id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          userId: data.userId,
          accountId: data.userId,
          providerId: "credential",
          password: data.passwordBaru,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        await db
          .update(accounts)
          .set({ password: data.passwordBaru, updatedAt: new Date() })
          .where(eq(accounts.userId, data.userId));
      }

      return sukses("Kata sandi pengguna berhasil diubah dan disimpan ke database!", null);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal mengubah kata sandi pengguna.", "INTERNAL_ERROR");
    }
  });

