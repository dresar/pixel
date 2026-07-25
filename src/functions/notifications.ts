import { createServerFn } from "@tanstack/react-start";
import { validasiSesi } from "../server/shared/middleware/auth-middleware";
import { db } from "../server/config/database";
import { notifications } from "../server/database/schema";
import { eq, desc } from "drizzle-orm";
import { sukses, gagal } from "../server/shared/utils/response-builder";
import { isAppError } from "../server/shared/errors/AppError";
import { z } from "zod";

export const getNotifikasi = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sesi = await validasiSesi();
    const daftar = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, sesi.userId))
      .orderBy(desc(notifications.createdAt))
      .limit(30);
    return sukses("Notifikasi berhasil dimuat", daftar);
  } catch (error) {
    if (isAppError(error)) return gagal(error.message, error.code);
    return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
  }
});

export const tandaiNotifikasiDibaca = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid().optional() }))
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      if (data.id) {
        await db
          .update(notifications)
          .set({ dibaca: true, dibacaPada: new Date() })
          .where(eq(notifications.id, data.id));
      } else {
        await db
          .update(notifications)
          .set({ dibaca: true, dibacaPada: new Date() })
          .where(eq(notifications.userId, sesi.userId));
      }
      return sukses("Notifikasi berhasil diperbarui", null);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
    }
  });
