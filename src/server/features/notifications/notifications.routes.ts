/**
 * Notifications Routes — /api/notifikasi/*
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db } from "../../config/database.js";
import { notifications } from "../../database/schema/index.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { sukses, gagal } from "../../shared/utils/response.js";
import { isAppError } from "../../shared/errors/AppError.js";

const notificationsRoutes = new Hono();

notificationsRoutes.use("/*", authMiddleware);

// GET /api/notifikasi — Notifikasi user yang login
notificationsRoutes.get("/", async (c) => {
  try {
    const user = c.get("user");
    const daftar = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(30);
    return sukses(c, "Notifikasi berhasil dimuat", daftar);
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    return gagal(c, "Terjadi kesalahan sistem.", "INTERNAL_ERROR", 500);
  }
});

// PATCH /api/notifikasi/baca — Tandai notifikasi dibaca
notificationsRoutes.patch(
  "/baca",
  zValidator(
    "json",
    z.object({ id: z.string().uuid().optional() }),
  ),
  async (c) => {
    try {
      const user = c.get("user");
      const { id } = c.req.valid("json");

      if (id) {
        await db
          .update(notifications)
          .set({ dibaca: true, dibacaPada: new Date() })
          .where(eq(notifications.id, id));
      } else {
        // Tandai semua
        await db
          .update(notifications)
          .set({ dibaca: true, dibacaPada: new Date() })
          .where(eq(notifications.userId, user.id));
      }

      return sukses(c, "Notifikasi berhasil diperbarui", null);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Terjadi kesalahan sistem.", "INTERNAL_ERROR", 500);
    }
  },
);

export { notificationsRoutes };
