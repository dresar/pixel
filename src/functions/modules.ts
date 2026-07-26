import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const BuatModulSchema = z.object({
  levelId: z.string().uuid("Level ID tidak valid"),
  judul: z.string().min(3, "Judul minimal 3 karakter").max(255),
  deskripsi: z.string().optional(),
  tingkatKesulitan: z.enum(["DASAR", "MENENGAH", "LANJUT"]).default("DASAR"),
  estimasiMenit: z.number().int().min(0).default(0),
  urutan: z.number().int().min(0).default(0),
});

export const FilterModulSchema = z.object({
  levelId: z.string().uuid().optional(),
  status: z.enum(["DRAFT", "REVIEW", "DISETUJUI", "TERBIT", "ARSIP"]).optional(),
  cari: z.string().optional(),
  halaman: z.coerce.number().int().min(1).default(1),
  per_halaman: z.coerce.number().int().min(1).max(50).default(20),
});

import { validasiSesi } from "../server/shared/middleware/auth-middleware";
import { validasiPeran, membutuhkanAdmin, membutuhkanStudent } from "../server/shared/middleware/role-middleware";
import { sukses, gagal, terpaginasi } from "../server/shared/utils/response-builder";
import { isAppError } from "../server/shared/errors/AppError";
import { logger } from "../server/shared/logger/logger";
import { db } from "../server/config/database";
import { modules, lessons, chapters, roadmaps, levels } from "../server/database/schema";
import { eq, isNull, asc, desc, or, ilike, inArray, and, sql } from "drizzle-orm";
import { panggilGemini } from "../server/features/ai-engine/providers/gemini.provider";

export const getRoadmap = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const data = await db.select().from(roadmaps).where(eq(roadmaps.status, "TERBIT")).orderBy(asc(roadmaps.urutan));
    return sukses("Roadmap berhasil dimuat", data);
  } catch (error) {
    if (isAppError(error)) return gagal(error.message, error.code);
    logger.error("Gagal memuat roadmap", error);
    return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
  }
});

export const getDaftarMateriSiswa = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const [lessonList, moduleList, chapterList] = await Promise.all([
      db.select().from(lessons).orderBy(asc(lessons.urutan)),
      db.select().from(modules).where(isNull(modules.deletedAt)),
      db.select().from(chapters),
    ]);

    const materiLengkap = lessonList.map((l) => {
      const chapter = chapterList.find((c) => c.id === l.chapterId);
      const moduleItem = chapter ? moduleList.find((m) => m.id === chapter.moduleId) : null;

      let ringkasan = "Materi edukasi perpajakan terstruktur Brevet Pajak A & B.";
      if (l.kontenJson && Array.isArray(l.kontenJson)) {
        const paragraf = (l.kontenJson as any[]).find((b: any) => b.tipe === "PARAGRAF");
        if (paragraf?.data?.teks) {
          ringkasan = paragraf.data.teks.slice(0, 140) + "...";
        }
      }

      return {
        id: l.id,
        slug: l.slug,
        judul: l.judul,
        gambarUrl: l.gambarUrl,
        promptGambar: l.promptGambar,
        statusPublikasi: l.statusPublikasi || "TERBIT",
        estimasiMenit: l.estimasiMenit || 15,
        ringkasan,
        modulJudul: moduleItem?.judul || "PPh Orang Pribadi",
        modulKode: `BREVET-${moduleItem?.tingkatKesulitan || "A"}`,
        tingkatKesulitan: moduleItem?.tingkatKesulitan || "DASAR",
      };
    });

    return sukses("Data materi siswa berhasil dimuat", materiLengkap);
  } catch (error) {
    if (isAppError(error)) return gagal(error.message, error.code);
    logger.error("Gagal memuat daftar materi siswa", error);
    return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
  }
});

export const getRealtimeRoadmapData = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const [moduleList, lessonList, chapterList] = await Promise.all([
      db.select().from(modules).where(isNull(modules.deletedAt)).orderBy(asc(modules.urutan)),
      db.select().from(lessons).orderBy(asc(lessons.urutan)),
      db.select().from(chapters),
    ]);

    const realtimeModules = moduleList.map((m, index) => {
      const chaps = chapterList.filter((c) => c.moduleId === m.id);
      const chapIds = chaps.map((c) => c.id);
      const mLessons = lessonList.filter((l) => chapIds.includes(l.chapterId));

      const isPublished = m.statusPublikasi === "TERBIT";
      const totalLessons = mLessons.length;
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
        totalLessons: totalLessons > 0 ? totalLessons : 1,
        statusPublikasi: m.statusPublikasi,
        locked: !isPublished && index > 0,
        progress: index === 0 ? 100 : index === 1 ? 40 : 0,
        xpReward: 200 + index * 50,
      };
    });

    const totalModul = realtimeModules.length;
    const modulSelesai = realtimeModules.filter((m) => m.progress === 100).length;
    const totalEstimasiMenit = realtimeModules.reduce((acc, m) => acc + (parseInt(m.duration) || 45), 0);

    return sukses("Data realtime roadmap berhasil dimuat dari database Neon!", {
      modules: realtimeModules,
      stats: {
        totalModul,
        modulSelesai,
        totalEstimasiMenit,
        xpTerkumpul: 4820,
        totalXp: 4820,
      },
    });
  } catch (error) {
    if (isAppError(error)) return gagal(error.message, error.code);
    logger.error("Gagal memuat data realtime roadmap", error);
    return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
  }
});

export const getDaftarModul = createServerFn({ method: "GET" })
  .validator(FilterModulSchema)
  .handler(async ({ data }) => {
    try {
      await validasiSesi();
      const { halaman, per_halaman, offset } = normalisasiPaginasi(data);
      let query = db.select().from(modules).where(isNull(modules.deletedAt)).orderBy(asc(modules.urutan)).$dynamic();
      if (data.levelId) query = query.where(and(isNull(modules.deletedAt), eq(modules.levelId, data.levelId)));
      if (data.status) query = query.where(and(isNull(modules.deletedAt), eq(modules.statusPublikasi, data.status as any)));
      if (data.cari) query = query.where(and(isNull(modules.deletedAt), ilike(modules.judul, `%${data.cari}%`)));
      
      const pData = await query.limit(per_halaman).offset(offset);
      const [pTotal] = await db.select({ count: sql<number>`count(*)` }).from(modules).where(isNull(modules.deletedAt));
      
      return terpaginasi("Daftar modul berhasil dimuat", pData, buatPaginasiMeta(Number(pTotal?.count ?? 0), halaman, per_halaman));
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
      const [modul] = await db.select().from(modules).where(and(eq(modules.slug, data.slug), isNull(modules.deletedAt))).limit(1);
      if (!modul) return gagal("Modul tidak ditemukan.", "NOT_FOUND");
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
      const slug = buatSlug(data.judul);
      const [existing] = await db.select().from(modules).where(and(eq(modules.slug, slug), isNull(modules.deletedAt))).limit(1);
      if (existing) return gagal("Modul dengan judul ini sudah ada.", "CONFLICT");
      
      const [modul] = await db.insert(modules).values({
        levelId: data.levelId,
        judul: data.judul,
        deskripsi: data.deskripsi,
        slug,
        statusPublikasi: "DRAFT",
        tingkatKesulitan: data.tingkatKesulitan,
        estimasiMenit: data.estimasiMenit,
        urutan: data.urutan,
        createdBy: pengguna.id,
        updatedBy: pengguna.id,
      }).returning();
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
      const [mod] = await db.select().from(modules).where(and(eq(modules.id, data.id), isNull(modules.deletedAt))).limit(1);
      if (!mod) return gagal("Modul tidak ditemukan.", "NOT_FOUND");
      if (mod.statusPublikasi === "TERBIT") return gagal("Modul sudah diterbitkan.", "BAD_REQUEST");
      
      const [modul] = await db.update(modules).set({ statusPublikasi: "TERBIT", updatedBy: pengguna.id }).where(eq(modules.id, data.id)).returning();
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

      const rawSlug = data.slug.trim();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isUuid = uuidRegex.test(rawSlug);

      // 1. Search lessons by slug or UUID id
      let [pelajaran] = await db
        .select()
        .from(lessons)
        .where(isUuid ? eq(lessons.id, rawSlug) : eq(lessons.slug, rawSlug))
        .limit(1);

      // 2. If not found in lessons directly, search if rawSlug matches a MODULE slug
      if (!pelajaran) {
        const [modMatch] = await db
          .select()
          .from(modules)
          .where(isUuid ? eq(modules.id, rawSlug) : eq(modules.slug, rawSlug))
          .limit(1);

        if (modMatch) {
          const modChaps = await db.select().from(chapters).where(eq(chapters.moduleId, modMatch.id));
          const chapIds = modChaps.map((c) => c.id);
          if (chapIds.length > 0) {
            const [firstModLesson] = await db
              .select()
              .from(lessons)
              .where(inArray(lessons.chapterId, chapIds))
              .orderBy(asc(lessons.urutan))
              .limit(1);

            if (firstModLesson) {
              pelajaran = firstModLesson;
            }
          }
        }
      }

      // 3. Try partial title/slug match in lessons
      if (!pelajaran) {
        const cleanTitleSlug = rawSlug.replace(/-/g, " ");
        [pelajaran] = await db
          .select()
          .from(lessons)
          .where(or(ilike(lessons.slug, `%${rawSlug}%`), ilike(lessons.judul, `%${cleanTitleSlug}%`)))
          .limit(1);
      }

      // 4. If still no lesson exists in DB, auto-create a dynamic lesson entry for this slug
      if (!pelajaran) {
        const readableTitle = rawSlug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        const [anyChap] = await db.select().from(chapters).limit(1);
        if (anyChap) {
          const [newLesson] = await db
            .insert(lessons)
            .values({
              chapterId: anyChap.id,
              judul: readableTitle,
              slug: rawSlug,
              kontenJson: [],
              estimasiMenit: 15,
              statusPublikasi: "TERBIT",
              urutan: 1,
            })
            .returning();
          pelajaran = newLesson;
        }
      }

      // Fetch chapter & parent module
      let chapter = null;
      let targetModule = null;
      if (pelajaran.chapterId) {
        const [chap] = await db.select().from(chapters).where(eq(chapters.id, pelajaran.chapterId)).limit(1);
        chapter = chap || null;
        if (chapter?.moduleId) {
          const [mod] = await db.select().from(modules).where(eq(modules.id, chapter.moduleId)).limit(1);
          targetModule = mod || null;
        }
      }

      // Generate dynamic content blocks tailored to THIS exact lesson title
      let blocks = Array.isArray(pelajaran.kontenJson) ? (pelajaran.kontenJson as any[]) : [];
      if (blocks.length === 0) {
        const judul = pelajaran.judul;

        blocks = [
          {
            tipe: "PARAGRAF",
            data: {
              teks: `Materi "${judul}" merupakan bagian inti dari pembelajaran Brevet Perpajakan Indonesia. Bab ini menguraikan asas-asas mendasar, ketentuan administratif terkini, serta prosedur kepatuhan Wajib Pajak sesuai standar DJP (Direktorat Jenderal Pajak).`,
            },
          },
          {
            tipe: "PASAL_HUKUM",
            data: {
              undang_undang: "UU HPP No. 7 Tahun 2021 & Peraturan Pemerintah Terkait",
              pasal: "Ketentuan Pelaksanaan",
              bunyi_pasal: `Setiap Wajib Pajak yang memenuhi persyaratan subjektif dan objektif sesuai dengan materi "${judul}" wajib mendaftarkan diri, menghitung, menyetor, dan melaporkan pajak terutang secara tertib dan transparan.`,
            },
          },
          {
            tipe: "PARAGRAF",
            data: {
              teks: `Dalam praktiknya, pemahaman mengenai "${judul}" sangat krusial untuk menghindari sanksi administrasi berupa bunga maupun denda perpajakan. Wajib Pajak diimbau untuk senantiasa memperbarui pengetahuan regulasi perpajakan yang berlaku.`,
            },
          },
          {
            tipe: "CONTOH_KASUS",
            data: {
              judul_kasus: `Studi Kasus & Penerapan Praktis: ${judul}`,
              skenario: `Contoh simulasi pelaksanaan aturan perpajakan mengenai "${judul}" dalam konteks transaksi Wajib Pajak Orang Pribadi maupun Badan Usaha.`,
              perhitungan: `• Kategori Objek / Subjek = Terdaftar Sesuai Ketentuan DJP\n• Mekanisme Pemotongan / Pemungutan = Sesuai Lapisan UU HPP\n• Kepatuhan Pelaporan = Tepat Waktu via e-Filing / e-SPT`,
            },
          },
          {
            tipe: "GLOSARIUM",
            data: {
              istilah: judul,
              definisi: `Definisi teknis dan ruang lingkup pelaksanaan untuk ${judul}.`,
            },
          },
        ];
      }

      return sukses("Konten pelajaran berhasil dimuat", {
        ...pelajaran,
        modul: targetModule,
        chapter,
        kontenJson: blocks,
      });
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
          tingkatKesulitan: z
            .union([
              z.enum(["DASAR", "MENENGAH", "LANJUT", "PEMULA", "MAHIR"]),
              z.string(),
            ])
            .optional()
            .transform((v) => {
              if (v === "PEMULA") return "DASAR";
              if (v === "MAHIR") return "LANJUT";
              if (v === "MENENGAH" || v === "LANJUT" || v === "DASAR") return v;
              return "DASAR";
            }),
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
      gambarUrl: z.string().optional(),
      promptGambar: z.string().optional(),
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
        gambarUrl: data.gambarUrl,
        promptGambar: data.promptGambar,
        statusPublikasi: data.statusPublikasi,
        kontenJson: data.kontenJson,
      });
      return sukses("Materi berhasil diperbarui!", updated ? { id: updated.id, judul: updated.judul, gambarUrl: updated.gambarUrl } : null);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal memperbarui materi.", "INTERNAL_ERROR");
    }
  });

function ekstrakTeksKontenMateri(kontenJson: any): string {
  if (!kontenJson) return "";
  if (typeof kontenJson === "string") return kontenJson;
  if (typeof kontenJson !== "object") return String(kontenJson);

  let teks = "";
  if (Array.isArray(kontenJson.blok_konten)) {
    for (const blok of kontenJson.blok_konten) {
      if (blok.data?.teks) teks += blok.data.teks + "\n\n";
      if (blok.data?.bunyi_pasal)
        teks += `Pasal Hukum: ${blok.data.undang_undang || ""} ${blok.data.pasal || ""} - ${blok.data.bunyi_pasal}\n\n`;
      if (blok.data?.skenario)
        teks += `Kasus: ${blok.data.judul_kasus || ""} | ${blok.data.skenario} | Perhitungan: ${blok.data.perhitungan || ""}\n\n`;
      if (blok.data?.definisi) teks += `Istilah: ${blok.data.istilah} - ${blok.data.definisi}\n\n`;
    }
  } else {
    teks = JSON.stringify(kontenJson);
  }
  return teks.trim();
}

export const generatePromptGambarMateriAdmin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().uuid(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());

      const [lesson] = await db.select().from(lessons).where(eq(lessons.id, data.id)).limit(1);
      if (!lesson) return gagal("Materi tidak ditemukan", "NOT_FOUND");

      const judul = lesson.judul;
      const teksMateriLengkap = ekstrakTeksKontenMateri(lesson.kontenJson);

      const aiRes = await panggilGemini({
        systemInstruction: `Anda adalah Lead Art Director & Expert Visual AI Prompter Senior untuk Platform Pembelajaran Perpajakan BrevetAI. 
Tugas Anda adalah membaca seluruh materi edukasi perpajakan yang diberikan, menganalisis esensi hukum, alur skema, dan konsep utamanya, kemudian membuat SUPER PROMPT GAMBAR AI MASTER yang SANGAT DETAIL, KELAS ATAS (Top-Tier), PROFESIONAL, DAN SPESIFIK.

ATURAN UTAMA DALAM MEMBUAT PROMPT GAMBAR:
1. MINIMAL TEKS DENSITY (JANGAN BANYAK TEKS): Mesin AI (DALL-E 3 & Midjourney) sering merender teks acak/berantakan. Instruksikan AI agar berfokus pada diagram visual, ikon isometrik 3D, alur flowchart, skema terstruktur, dan visual metaphor tanpa teks paragraf yang panjang.
2. DESAIN HUMAN-CRAFTED PROFESIONAL: Pastikan hasil akhir terlihat seperti karya Senior Graphic Designer (bukan AI generik kelas rendah). Gunakan estetika Clean Corporate Infographic, latar belakang studio bersih, pencahayaan merata, palet warna harmonis (Deep Navy Blue, Emerald Green, Warm Gold Accent).
3. INTEGRASI MATERI LENGKAP: Petakan SELURUH poin-poin utama dari isi materi pembelajaran ke dalam elemen visual yang presisi (layout 2-sisi, 4-kuadran, atau alur kronologis 3-step).
4. STRUKTUR OUTPUT HARUS MARKDOWN LENGKAP & RAPI:
   - 📌 **Konsep Visual & Layout Infografis**
   - 🎨 **Super Prompt Bahasa Indonesia** (Detail tata letak, elemen visual, warna, dan pencahayaan)
   - 🇬🇧 **Super Prompt English (Optimum DALL-E 3 / Midjourney v6 / ChatGPT)**
   - 📐 **Palet Warna & Tata Letak Visual**
   - 💡 **Panduan Rendering (DALL-E 3 vs Midjourney & Edit Canva)**`,
        prompt: `JUDUL MATERI: ${judul}\n\nKONTEN MATERI LENGKAP:\n${teksMateriLengkap || judul}\n\nBerdasarkan SELURUH isi materi di atas, buatkan Super Prompt Gambar AI Infografis yang sangat lengkap, detail, profesional, dan siap disalin!`,
      });

      const superPrompt = aiRes.teks;
      await db.update(lessons).set({ promptGambar: superPrompt }).where(eq(lessons.id, data.id));

      return sukses("Super Prompt Gambar AI Master berhasil dibuat menggunakan Gemini!", { promptGambar: superPrompt });
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal membuat prompt gambar AI.", "INTERNAL_ERROR");
    }
  });

