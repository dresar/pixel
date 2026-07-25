import { createServerFn } from "@tanstack/react-start";
import { modulesService } from "./modules.service";
import { BuatModulSchema, FilterModulSchema } from "./modules.schema";
import { validasiSesi } from "../../shared/middleware/auth-middleware";
import { validasiPeran, membutuhkanAdmin, membutuhkanStudent } from "../../shared/middleware/role-middleware";
import { sukses, gagal, terpaginasi } from "../../shared/utils/response-builder";
import { isAppError } from "../../shared/errors/AppError";
import { logger } from "../../shared/logger/logger";
import { z } from "zod";

export const getRoadmap = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const data = await modulesService.daftarRoadmap();
    return sukses("Roadmap berhasil dimuat", data);
  } catch (error) {
    if (isAppError(error)) return gagal(error.message, error.code);
    logger.error("Gagal memuat roadmap", error);
    return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
  }
});

export const getDaftarModul = createServerFn({ method: "GET" })
  .validator(FilterModulSchema)
  .handler(async ({ data }) => {
    try {
      await validasiSesi();
      const hasil = await modulesService.daftarModul(data);
      return terpaginasi("Daftar modul berhasil dimuat", hasil.data, hasil.pagination);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      logger.error("Gagal memuat daftar modul", error);
      return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
    }
  });

export const getDetailModul = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    try {
      await validasiSesi();
      const modul = await modulesService.detailModul(data.slug);
      return sukses("Detail modul berhasil dimuat", modul);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      logger.error("Gagal memuat detail modul", error);
      return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
    }
  });

export const buatModulBaru = createServerFn({ method: "POST" })
  .validator(BuatModulSchema)
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      const pengguna = await validasiPeran(sesi.userId, membutuhkanAdmin());
      const modul = await modulesService.buatModul(data, pengguna.id);
      return sukses("Modul baru berhasil dibuat", modul);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      logger.error("Gagal membuat modul", error);
      return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
    }
  });

export const terbitkanModul = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      const pengguna = await validasiPeran(sesi.userId, membutuhkanAdmin());
      const modul = await modulesService.terbitkanModul(data.id, pengguna.id);
      return sukses("Modul berhasil diterbitkan", modul);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      logger.error("Gagal menerbitkan modul", error);
      return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
    }
  });

export const getKontenPelajaran = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    try {
      await validasiSesi();
      const pelajaran = await modulesService.ambilKontenPelajaran(data.slug);
      return sukses("Konten pelajaran berhasil dimuat", { ...pelajaran, kontenJson: pelajaran.kontenJson as any });
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      logger.error("Gagal memuat konten pelajaran", error);
      return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
    }
  });
