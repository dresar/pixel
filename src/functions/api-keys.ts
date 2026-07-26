import { createServerFn } from "@tanstack/react-start";
import { apiKeysService } from "../server/features/api-keys/api-keys.service";
import { ImportBanyakApiKeySchema, TambahApiKeySchema, UbahStatusApiKeySchema } from "../server/features/api-keys/api-keys.schema";
import { validasiSesi } from "../server/shared/middleware/auth-middleware";
import { validasiPeran, membutuhkanSuperAdmin } from "../server/shared/middleware/role-middleware";
import { sukses, gagal } from "../server/shared/utils/response-builder";
import { isAppError } from "../server/shared/errors/AppError";
import { logger } from "../server/shared/logger/logger";
import { z } from "zod";

export const daftarApiKeys = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sesi = await validasiSesi();
    await validasiPeran(sesi.userId, membutuhkanSuperAdmin());
    const data = await apiKeysService.daftarSemua();
    return sukses("Daftar API key berhasil dimuat", data);
  } catch (error) {
    if (isAppError(error)) return gagal(error.message, error.code);
    logger.error("Gagal memuat daftar API key", error);
    return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
  }
});

export const tambahApiKey = createServerFn({ method: "POST" })
  .validator(TambahApiKeySchema)
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanSuperAdmin());
      const hasil = await apiKeysService.tambahSatuKey(
        { nama: data.nama, apiKey: data.apiKey, prioritas: data.prioritas },
        sesi.userId,
      );
      return sukses("API key berhasil ditambahkan", hasil);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      logger.error("Gagal menambahkan API key", error);
      return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
    }
  });

export const importBanyakApiKey = createServerFn({ method: "POST" })
  .validator(ImportBanyakApiKeySchema)
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanSuperAdmin());
      const hasil = await apiKeysService.importBanyakKey(data.keys, sesi.userId);
      return sukses(
        `Import selesai: ${hasil.berhasil} berhasil, ${hasil.duplikat} duplikat, ${hasil.gagal} gagal`,
        hasil,
      );
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      logger.error("Gagal import batch API key", error);
      return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
    }
  });

export const ubahStatusApiKey = createServerFn({ method: "POST" })
  .validator(UbahStatusApiKeySchema.extend({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanSuperAdmin());
      await apiKeysService.ubahStatus(data.id, data.status);
      return sukses("Status API key berhasil diperbarui", null);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
    }
  });

export const hapusApiKey = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanSuperAdmin());
      await apiKeysService.hapus(data.id);
      return sukses("API key berhasil dihapus", null);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
    }
  });

export const tesApiKeyServer = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanSuperAdmin());
      const hasil = await apiKeysService.tesKey(data.id);
      if (hasil.success) return sukses(hasil.message, null);
      return gagal(hasil.message, "KEY_TEST_FAILED");
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Terjadi kesalahan saat menguji API key.", "INTERNAL_ERROR");
    }
  });

export const tesSemuaApiKeyServer = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const sesi = await validasiSesi();
    await validasiPeran(sesi.userId, membutuhkanSuperAdmin());
    const hasil = await apiKeysService.tesSemuaKey();
    return sukses(`Tes selesai: ${hasil.ok} Aktif, ${hasil.error} Error (dipindahkan ke urutan akhir).`, hasil);
  } catch (error) {
    if (isAppError(error)) return gagal(error.message, error.code);
    return gagal("Terjadi kesalahan saat menguji semua API key.", "INTERNAL_ERROR");
  }
});
