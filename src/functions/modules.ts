import { createServerFn } from "@tanstack/react-start";
import { modulesService } from "../server/features/learning-modules/modules.service";
import { modulesRepository } from "../server/features/learning-modules/modules.repository";
import { BuatModulSchema, FilterModulSchema } from "../server/features/learning-modules/modules.schema";
import { validasiSesi } from "../server/shared/middleware/auth-middleware";
import { validasiPeran, membutuhkanAdmin, membutuhkanStudent } from "../server/shared/middleware/role-middleware";
import { sukses, gagal, terpaginasi } from "../server/shared/utils/response-builder";
import { isAppError } from "../server/shared/errors/AppError";
import { logger } from "../server/shared/logger/logger";
import { db } from "../server/config/database";
import { chapters, lessons } from "../server/database/schema";
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

export const getDaftarSemuaLesson = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const list = await modulesService.daftarSemuaLesson();
    const formatted = list.map((l) => ({ ...l, kontenJson: l.kontenJson as any }));
    return sukses("Daftar lesson dimuat", formatted);
  } catch (error) {
    if (isAppError(error)) return gagal(error.message, error.code);
    return gagal("Terjadi kesalahan mengambil daftar materi.", "INTERNAL_ERROR");
  }
});

export const getDaftarSemuaChapter = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const list = await modulesService.daftarSemuaChapter();
    return sukses("Daftar chapter dimuat", list);
  } catch (error) {
    if (isAppError(error)) return gagal(error.message, error.code);
    return gagal("Terjadi kesalahan mengambil daftar bab.", "INTERNAL_ERROR");
  }
});

export const hapusModulAdmin = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());
      await modulesService.hapusModul(data.id);
      return sukses("Modul beserta bab dan materinya berhasil dihapus", null);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Terjadi kesalahan sistem saat menghapus modul.", "INTERNAL_ERROR");
    }
  });

import { buatSlug } from "../server/shared/utils/slug";

export const imporBanyakModulAdmin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      modulList: z.array(
        z.object({
          judul: z.string().min(1),
          deskripsi: z.string().optional(),
          tingkatKesulitan: z.enum(["DASAR", "MENENGAH", "LANJUT"]).optional().default("DASAR"),
          urutan: z.number().optional().default(1),
          levelKode: z.string().optional(),
          bab: z.array(
            z.object({
              judul: z.string().min(1),
              deskripsi: z.string().optional(),
              urutan: z.number().optional(),
              materi: z.array(
                z.object({
                  judul: z.string().min(1),
                  slug: z.string().optional(),
                  kontenJson: z.any().optional(),
                })
              ).optional(),
            })
          ).optional(),
        })
      ),
    })
  )
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      const pengguna = await validasiPeran(sesi.userId, membutuhkanAdmin());

      const firstLevel = await modulesRepository.ambilLevelPertama();
      const defaultLevelId = firstLevel?.id || "00000000-0000-0000-0000-000000000001";

      let moduleCount = 0;
      let chapterCount = 0;
      let lessonCount = 0;

      for (const item of data.modulList) {
        try {
          const m = await modulesService.buatModul(
            {
              levelId: defaultLevelId,
              judul: item.judul,
              deskripsi: item.deskripsi || "Modul Kurikulum Resmi Brevet A & B Perpajakan Indonesia.",
              tingkatKesulitan: item.tingkatKesulitan || "DASAR",
              estimasiMenit: 0,
              urutan: item.urutan || (moduleCount + 1),
            },
            pengguna.id
          );
          // Auto publish to TERBIT
          await modulesService.terbitkanModul(m.id, pengguna.id);
          moduleCount++;

          if (item.bab && Array.isArray(item.bab)) {
            for (let cIdx = 0; cIdx < item.bab.length; cIdx++) {
              const bItem = item.bab[cIdx];
              const chap = await modulesRepository.simpanChapter({
                moduleId: m.id,
                judul: bItem.judul,
                deskripsi: bItem.deskripsi,
                urutan: bItem.urutan || (cIdx + 1),
              });
              chapterCount++;

              if (bItem.materi && Array.isArray(bItem.materi)) {
                for (let lIdx = 0; lIdx < bItem.materi.length; lIdx++) {
                  const mItem = bItem.materi[lIdx];
                  const lSlug = mItem.slug || `${buatSlug(mItem.judul)}-${Date.now()}-${lIdx}`;
                  const fallbackKonten = mItem.kontenJson || {
                    versi: "2.0",
                    metadata: { tipe: "EDUKASI_TEKS" },
                    blok_konten: [
                      { tipe: "PARAGRAF", data: { teks: `Penjelasan mendalam dan komprehensif mengenai ${mItem.judul}.` } }
                    ]
                  };
                  await modulesRepository.simpanLesson({
                    chapterId: chap.id,
                    judul: mItem.judul,
                    slug: lSlug,
                    kontenJson: fallbackKonten,
                    urutan: lIdx + 1,
                  });
                  lessonCount++;
                }
              }
            }
          }
        } catch {
          logger.warn(`Skipping duplicate module during import: ${item.judul}`);
        }
      }

      return sukses(`Berhasil mengimpor ${moduleCount} Modul, ${chapterCount} Bab, dan ${lessonCount} Materi ke database Neon!`, null);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal mengimpor daftar modul.", "INTERNAL_ERROR");
    }
  });

export const tambahChapterAdmin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      moduleId: z.string().uuid(),
      judul: z.string().min(1),
      deskripsi: z.string().optional(),
      urutan: z.number().optional().default(1),
    })
  )
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());
      const chap = await modulesRepository.simpanChapter(data);
      return sukses("Bab baru berhasil ditambahkan!", chap);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal menambah bab baru.", "INTERNAL_ERROR");
    }
  });

export const updateChapterAdmin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().uuid(),
      judul: z.string().optional(),
      deskripsi: z.string().optional(),
      urutan: z.number().optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());
      const updated = await modulesRepository.updateChapter(data.id, {
        judul: data.judul,
        deskripsi: data.deskripsi,
        urutan: data.urutan,
      });
      return sukses("Bab berhasil diperbarui!", updated);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal memperbarui bab.", "INTERNAL_ERROR");
    }
  });

export const hapusChapterAdmin = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());
      await modulesRepository.hapusChapter(data.id);
      return sukses("Bab beserta materinya berhasil dihapus!", null);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal menghapus bab.", "INTERNAL_ERROR");
    }
  });

export const updateLessonAdmin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().uuid(),
      judul: z.string().optional(),
      statusPublikasi: z.enum(["DRAFT", "REVIEW", "DISETUJUI", "TERBIT", "ARSIP"]).optional(),
      kontenJson: z.any().optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());
      const updated = await modulesRepository.updateLesson(data.id, {
        judul: data.judul,
        statusPublikasi: data.statusPublikasi,
        kontenJson: data.kontenJson,
      });
      return sukses("Materi berhasil diperbarui!", updated ? { id: updated.id, judul: updated.judul } : null);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal memperbarui materi.", "INTERNAL_ERROR");
    }
  });


