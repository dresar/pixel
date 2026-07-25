import { createServerFn } from "@tanstack/react-start";
import { aiService } from "../server/features/ai-engine/ai.service";
import { PermintaanAiSchema, PesanChatSchema } from "../server/features/ai-engine/ai.schema";
import { validasiSesi } from "../server/shared/middleware/auth-middleware";
import { validasiPeran, membutuhkanStudent } from "../server/shared/middleware/role-middleware";
import { sukses, gagal } from "../server/shared/utils/response-builder";
import { isAppError } from "../server/shared/errors/AppError";
import { logger } from "../server/shared/logger/logger";
import { z } from "zod";

export const prosesPermintaanAi = createServerFn({ method: "POST" })
  .validator(PermintaanAiSchema)
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      const pengguna = await validasiPeran(sesi.userId, membutuhkanStudent());
      const hasil = await aiService.prosesPermintaan(data, pengguna.id);
      return sukses("Respons AI berhasil diproses", hasil);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      logger.error("Gagal memproses permintaan AI", error);
      return gagal("Asisten AI sedang tidak tersedia. Silakan coba lagi.", "EXTERNAL_SERVICE_ERROR");
    }
  });

export const kirimPesanChat = createServerFn({ method: "POST" })
  .validator(PesanChatSchema)
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      const pengguna = await validasiPeran(sesi.userId, membutuhkanStudent());
      const hasil = await aiService.lanjutkanChat(data, pengguna.id);
      return sukses("Pesan berhasil diproses", hasil);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      logger.error("Gagal mengirim pesan chat", error);
      return gagal("Asisten AI sedang tidak tersedia. Silakan coba lagi.", "EXTERNAL_SERVICE_ERROR");
    }
  });

export const getRiwayatAi = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sesi = await validasiSesi();
    const pengguna = await validasiPeran(sesi.userId, membutuhkanStudent());
    const data = await aiService.riwayatPercakapan(pengguna.id);
    return sukses("Riwayat AI berhasil dimuat", data);
  } catch (error) {
    if (isAppError(error)) return gagal(error.message, error.code);
    return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
  }
});

export const getDetailPercakapan = createServerFn({ method: "GET" })
  .validator(z.object({ conversationId: z.string().uuid() }))
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      const pengguna = await validasiPeran(sesi.userId, membutuhkanStudent());
      const detail = await aiService.detailPercakapan(data.conversationId, pengguna.id);
      if (!detail) return gagal("Percakapan tidak ditemukan.", "NOT_FOUND");
      return sukses("Detail percakapan berhasil dimuat", detail);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
    }
  });
