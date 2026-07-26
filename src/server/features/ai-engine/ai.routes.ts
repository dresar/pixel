/**
 * AI Routes — /api/ai/*
 */

import { Hono } from "hono";
import { aiService } from "./ai.service.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { sukses, gagal } from "../../shared/utils/response.js";
import { isAppError } from "../../shared/errors/AppError.js";
import { logger } from "../../shared/utils/logger.js";

const aiRoutes = new Hono();

// Semua route AI butuh auth (dengan fallback user)
aiRoutes.use("/*", authMiddleware);

// POST /api/ai/proses — Jelaskan/Ringkas/Quiz konten
aiRoutes.post(
  "/proses",
  async (c) => {
    try {
      const user = c.get("user");
      let body: any = {};
      try {
        body = await c.req.json();
      } catch {}

      const payload = body?.data ? body.data : body;
      const tipe = payload?.tipe || "JELASKAN";
      const konten = payload?.konten || payload?.prompt || "";

      if (!konten || typeof konten !== "string") {
        return gagal(c, "Konten wajib diisi", "BAD_REQUEST", 400);
      }

      const hasil = await aiService.prosesPermintaan(konten, tipe, user?.id || "anonymous");
      return sukses(c, "Respons AI berhasil diproses", hasil);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      logger.error("Gagal memproses permintaan AI", error);
      return gagal(c, "Asisten AI sedang tidak tersedia. Silakan coba lagi.", "EXTERNAL_SERVICE_ERROR", 503);
    }
  },
);

// POST /api/ai/chat — Kirim pesan chat (Kompatibel dengan teks, @mentions, dan gambar Base64)
aiRoutes.post("/chat", async (c) => {
  try {
    const user = c.get("user");
    let body: any = {};
    try {
      body = await c.req.json();
    } catch {}

    const payload = body?.data ? body.data : body;
    const pesan = payload?.pesan || payload?.prompt || "";
    let conversationId = payload?.conversationId;
    const gambarBase64 = payload?.gambarBase64 || payload?.gambar;
    const mimeType = payload?.mimeType || "image/jpeg";

    if (!pesan || typeof pesan !== "string" || !pesan.trim()) {
      return gagal(c, "Pesan wajib diisi", "BAD_REQUEST", 400);
    }

    // Validasi format UUID. Jika bukan UUID valid, set ke null agar dibuatkan percakapan baru
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (conversationId && (typeof conversationId !== "string" || !uuidRegex.test(conversationId))) {
      conversationId = null;
    }

    const hasil = await aiService.lanjutkanChat(
      conversationId || null,
      pesan,
      user?.id || "anonymous",
      gambarBase64,
      mimeType
    );
    return sukses(c, "Pesan berhasil diproses", hasil);
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    logger.error("Gagal mengirim pesan chat AI", error);
    return gagal(c, "Asisten AI sedang tidak tersedia.", "EXTERNAL_SERVICE_ERROR", 503);
  }
});

// GET /api/ai/riwayat — Riwayat percakapan user
aiRoutes.get("/riwayat", async (c) => {
  try {
    const user = c.get("user");
    const data = await aiService.riwayatPercakapan(user?.id || "anonymous");
    return sukses(c, "Riwayat AI berhasil dimuat", data);
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    return gagal(c, "Terjadi kesalahan sistem.", "INTERNAL_ERROR", 500);
  }
});

// GET /api/ai/percakapan/:id — Detail percakapan
aiRoutes.get("/percakapan/:id", async (c) => {
  try {
    const user = c.get("user");
    const id = c.req.param("id");
    const data = await aiService.detailPercakapan(id, user?.id || "anonymous");
    if (!data) return gagal(c, "Percakapan tidak ditemukan", "NOT_FOUND", 404);
    return sukses(c, "Detail percakapan berhasil dimuat", data);
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    return gagal(c, "Terjadi kesalahan sistem.", "INTERNAL_ERROR", 500);
  }
});

export { aiRoutes };
