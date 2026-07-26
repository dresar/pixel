/**
 * Modules Service — Logika bisnis untuk fitur modul pembelajaran
 */

import { modulesRepository } from "./modules.repository.js";
import { panggilGemini } from "../ai-engine/gemini.provider.js";
import { buatSlug } from "../../shared/utils/slug.js";
import { AppError } from "../../shared/errors/AppError.js";
import { logger } from "../../shared/utils/logger.js";
import { normalisasiPaginasi, buatPaginasiMeta } from "../../shared/utils/response.js";

export const modulesService = {
  // ── Roadmap ─────────────────────────────────────────────────────────────────
  async ambilRoadmap() {
    return modulesRepository.ambilRoadmapTerbit();
  },

  // ── Realtime Roadmap ─────────────────────────────────────────────────────────
  async ambilRealtimeRoadmap() {
    const [moduleList, lessonList, chapterList] = await Promise.all([
      modulesRepository.daftarModul({ limit: 100, offset: 0 }),
      modulesRepository.daftarSemuaLesson(),
      modulesRepository.daftarSemuaChapter(),
    ]);

    const realtimeModules = moduleList.map((m, index) => {
      const chaps = chapterList.filter((c) => c.moduleId === m.id);
      const chapIds = chaps.map((c) => c.id);
      const mLessons = lessonList.filter((l) => chapIds.includes(l.chapterId));
      const firstLessonSlug = mLessons.length > 0 ? mLessons[0].slug : m.slug;

      return {
        id: m.id,
        slug: m.slug,
        firstLessonSlug,
        title: m.judul,
        code: `BREVET-${m.tingkatKesulitan || "A"}`,
        difficulty: m.tingkatKesulitan || "DASAR",
        description: m.deskripsi || "Modul komprehensif perpajakan Indonesia.",
        duration: `${m.estimasiMenit || 45} menit`,
        totalLessons: mLessons.length > 0 ? mLessons.length : 1,
        statusPublikasi: m.statusPublikasi,
        locked: m.statusPublikasi !== "TERBIT" && index > 0,
        progress: index === 0 ? 100 : index === 1 ? 40 : 0,
        xpReward: 200 + index * 50,
      };
    });

    const totalModul = realtimeModules.length;
    const modulSelesai = realtimeModules.filter((m) => m.progress === 100).length;
    const totalEstimasiMenit = realtimeModules.reduce(
      (acc, m) => acc + (parseInt(m.duration) || 45),
      0,
    );

    return {
      modules: realtimeModules,
      stats: { totalModul, modulSelesai, totalEstimasiMenit, xpTerkumpul: 4820, totalXp: 4820 },
    };
  },

  // ── Modul ────────────────────────────────────────────────────────────────────
  async daftarModul(filter: {
    levelId?: string;
    status?: string;
    cari?: string;
    halaman?: number;
    per_halaman?: number;
  }) {
    const { halaman, per_halaman, offset } = normalisasiPaginasi(filter);
    const [data, total] = await Promise.all([
      modulesRepository.daftarModul({ ...filter, limit: per_halaman, offset }),
      modulesRepository.hitungTotalModul(),
    ]);
    return { data, meta: buatPaginasiMeta(total, halaman, per_halaman) };
  },

  async detailModulBySlug(slug: string) {
    let modul = await modulesRepository.modulBySlug(slug);
    if (!modul) {
      const res = await modulesRepository.daftarModul({ limit: 1, offset: 0 });
      modul = res[0] || null;
    }
    if (!modul) throw AppError.notFound("Modul tidak ditemukan");

    // Ambil chapters & lessons milik modul ini dari database Neon
    const chaptersList = await modulesRepository.daftarChapterByModul(modul.id);
    const chapterIds = chaptersList.map((c) => c.id);
    const lessonsList = await modulesRepository.lessonByChapters(chapterIds);

    return {
      ...modul,
      chapters: chaptersList,
      lessons: lessonsList,
    };
  },

  async buatModul(
    data: {
      levelId: string;
      judul: string;
      deskripsi?: string;
      tingkatKesulitan: "DASAR" | "MENENGAH" | "LANJUT";
      estimasiMenit: number;
      urutan: number;
    },
    userId: string,
  ) {
    const slug = buatSlug(data.judul);
    const existing = await modulesRepository.modulBySlug(slug);
    if (existing) throw AppError.conflict("Modul dengan judul ini sudah ada");

    return modulesRepository.simpanModul({
      ...data,
      slug,
      statusPublikasi: "DRAFT" as any,
      createdBy: userId,
      updatedBy: userId,
    });
  },

  async terbitkanModul(id: string, userId: string) {
    const modul = await modulesRepository.modulById(id);
    if (!modul) throw AppError.notFound("Modul tidak ditemukan");
    if (modul.statusPublikasi === "TERBIT") throw AppError.badRequest("Modul sudah diterbitkan");
    return modulesRepository.updateModul(id, { statusPublikasi: "TERBIT", updatedBy: userId });
  },

  async hapusModul(id: string) {
    await modulesRepository.softDeleteModul(id);
  },

  // ── Materi Siswa (Meliputi seluruh chapter & konten JSON utuh) ────────────────
  async daftarMateriSiswa() {
    const [lessonList, moduleList, chapterList] = await Promise.all([
      modulesRepository.daftarSemuaLesson(),
      modulesRepository.daftarModul({ limit: 200, offset: 0 }),
      modulesRepository.daftarSemuaChapter(),
    ]);

    return lessonList.map((l) => {
      const chapter = chapterList.find((c) => c.id === l.chapterId);
      const moduleItem = chapter ? moduleList.find((m) => m.id === chapter.moduleId) : null;

      let ringkasan = "Materi edukasi perpajakan terstruktur Brevet Pajak A & B.";
      if (l.kontenJson) {
        try {
          const pObj = typeof l.kontenJson === "string" ? JSON.parse(l.kontenJson) : l.kontenJson;
          const bList = pObj.blok_konten || pObj.blocks || (Array.isArray(pObj) ? pObj : []);
          const paragraf = bList.find((b: any) => b.tipe === "PARAGRAF" || b.tipe === "STORY_HOOK");
          if (paragraf?.data?.teks || paragraf?.data?.narasi) {
            ringkasan = (paragraf.data.teks || paragraf.data.narasi).slice(0, 140) + "...";
          }
        } catch {
          ringkasan = "Materi edukasi perpajakan terstruktur Brevet Pajak A & B.";
        }
      }

      return {
        id: l.id,
        slug: l.slug,
        judul: l.judul,
        chapterId: l.chapterId,
        chapterJudul: chapter?.judul || "Bab Pelajaran",
        moduleId: chapter?.moduleId || null,
        modulJudul: moduleItem?.judul || "Apa Itu Pajak?",
        modulKode: `BREVET-${moduleItem?.tingkatKesulitan || "A"}`,
        tingkatKesulitan: moduleItem?.tingkatKesulitan || "DASAR",
        gambarUrl: l.gambarUrl,
        statusPublikasi: l.statusPublikasi || "TERBIT",
        estimasiMenit: l.estimasiMenit || 15,
        ringkasan,
        kontenJson: l.kontenJson,
      };
    });
  },

  // ── Konten Pelajaran ─────────────────────────────────────────────────────────
  async kontenPelajaran(slug: string) {
    let lesson = (slug && slug !== "undefined") ? await modulesRepository.lessonBySlug(slug) : null;
    if (!lesson) {
      const allLessons = await modulesRepository.daftarSemuaLesson();
      if (allLessons.length > 0) {
        lesson = allLessons[0];
      }
    }
    if (!lesson) throw AppError.notFound("Materi tidak ditemukan");

    let parsedJson = lesson.kontenJson;
    if (typeof lesson.kontenJson === "string") {
      try {
        parsedJson = JSON.parse(lesson.kontenJson);
      } catch {
        parsedJson = {
          versi: "2.0",
          metadata: { tipe: "EDUKASI_TEKS" },
          blok_konten: [{ tipe: "PARAGRAF", data: { teks: lesson.kontenJson } }],
        };
      }
    }

    return {
      ...lesson,
      kontenJson: parsedJson,
    };
  },

  async updateLessonAdmin(data: {
    id: string;
    judul?: string;
    gambarUrl?: string;
    promptGambar?: string;
    statusPublikasi?: string;
    kontenJson?: unknown;
  }) {
    const existing = await modulesRepository.lessonById(data.id);
    if (!existing) throw AppError.notFound("Materi tidak ditemukan");

    return modulesRepository.updateLesson(data.id, data);
  },
};
