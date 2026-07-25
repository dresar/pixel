import { modulesRepository } from "./modules.repository";
import { buatSlug } from "../../shared/utils/slug";
import { normalisasiPaginasi, buatPaginasiMeta } from "../../shared/utils/pagination";
import { NotFoundError, ConflictError, BusinessError } from "../../shared/errors/AppError";
import type { BuatModulInput, FilterModulInput } from "./modules.schema";
import type { Module, Lesson } from "../../database/schema";

export const modulesService = {
  async daftarModul(filter: FilterModulInput) {
    const { halaman, per_halaman, offset } = normalisasiPaginasi(filter);
    const [data, total] = await Promise.all([
      modulesRepository.daftarModul({
        levelId: filter.levelId,
        status: filter.status,
        cari: filter.cari,
        limit: per_halaman,
        offset,
      }),
      modulesRepository.hitungModul({ levelId: filter.levelId, status: filter.status }),
    ]);
    return { data, pagination: buatPaginasiMeta(total, halaman, per_halaman) };
  },

  async detailModul(slug: string): Promise<Module> {
    const modul = await modulesRepository.ambilModulBySlug(slug);
    if (!modul) throw new NotFoundError("Modul tidak ditemukan.");
    return modul;
  },

  async buatModul(input: BuatModulInput, userId: string): Promise<Module> {
    const slug = buatSlug(input.judul);
    const existing = await modulesRepository.ambilModulBySlug(slug);
    if (existing) throw new ConflictError("Modul dengan judul ini sudah ada. Gunakan judul yang berbeda.");

    return modulesRepository.simpanModul({
      levelId: input.levelId,
      judul: input.judul,
      deskripsi: input.deskripsi,
      slug,
      statusPublikasi: "DRAFT",
      tingkatKesulitan: input.tingkatKesulitan,
      estimasiMenit: input.estimasiMenit,
      urutan: input.urutan,
      createdBy: userId,
      updatedBy: userId,
    });
  },

  async terbitkanModul(id: string, userId: string): Promise<Module> {
    const modul = await modulesRepository.ambilModulById(id);
    if (!modul) throw new NotFoundError("Modul tidak ditemukan.");
    if (modul.statusPublikasi === "TERBIT") throw new BusinessError("Modul sudah diterbitkan.");
    const updated = await modulesRepository.updateModul(id, { statusPublikasi: "TERBIT", updatedBy: userId });
    if (!updated) throw new BusinessError("Gagal menerbitkan modul. Silakan coba lagi.");
    return updated;
  },

  async ambilKontenPelajaran(slug: string): Promise<Lesson> {
    const lesson = await modulesRepository.ambilLessonBySlug(slug);
    if (!lesson) throw new NotFoundError("Pelajaran tidak ditemukan.");
    if (lesson.statusPublikasi !== "TERBIT") throw new NotFoundError("Pelajaran tidak ditemukan.");
    return lesson;
  },

  async daftarRoadmap() {
    return modulesRepository.daftarRoadmap();
  },

  async daftarSemuaLesson(): Promise<Lesson[]> {
    return modulesRepository.daftarSemuaLesson();
  },

  async daftarSemuaChapter() {
    return modulesRepository.daftarSemuaChapter();
  },

  async hapusModul(id: string): Promise<boolean> {
    const modul = await modulesRepository.ambilModulById(id);
    if (!modul) throw new NotFoundError("Modul tidak ditemukan.");
    return modulesRepository.hapusModul(id);
  },
};
