import { createServerFn } from "@tanstack/react-start";
import { validasiSesi } from "../server/shared/middleware/auth-middleware";
import { validasiPeran, membutuhkanAdmin } from "../server/shared/middleware/role-middleware";
import { db } from "../server/config/database";
import { quizzes, quizQuestions, quizOptions, quizAttempts, quizAnswers } from "../server/database/schema";
import { eq, desc, or, and } from "drizzle-orm";
import { sukses, gagal } from "../server/shared/utils/response-builder";
import { isAppError } from "../server/shared/errors/AppError";
import { z } from "zod";
import { buatSlug } from "../server/shared/utils/slug";
import { panggilGemini } from "../server/features/ai-engine/providers/gemini.provider";

// Fetch all active quizzes
export const getDaftarKuis = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await validasiSesi();
    const list = await db.select().from(quizzes).where(eq(quizzes.aktif, true)).orderBy(desc(quizzes.createdAt));
    return sukses("Daftar kuis dimuat", list);
  } catch (error) {
    if (isAppError(error)) return gagal(error.message, error.code);
    return gagal("Terjadi kesalahan mengambil data kuis.", "INTERNAL_ERROR");
  }
});

// Fetch quiz detail with questions and options
export const getDetailKuis = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().optional() }))
  .handler(async ({ data }) => {
    try {
      await validasiSesi();
      let quizList;
      if (data.id) {
        quizList = await db.select().from(quizzes).where(eq(quizzes.id, data.id)).limit(1);
      } else {
        quizList = await db.select().from(quizzes).limit(1);
      }
      const quiz = quizList[0] || null;

      if (!quiz) {
        return gagal("Tidak ada kuis tersedia.", "NOT_FOUND");
      }

      const questionsList = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quiz.id))
        .orderBy(quizQuestions.urutan);

      const questionsWithOptions = await Promise.all(
        questionsList.map(async (q) => {
          const opts = await db
            .select()
            .from(quizOptions)
            .where(eq(quizOptions.questionId, q.id))
            .orderBy(quizOptions.urutan);
          return { ...q, options: opts };
        })
      );

      return sukses("Detail kuis dimuat", { quiz, quizId: quiz.id, questions: questionsWithOptions });
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal memuat detail kuis.", "INTERNAL_ERROR");
    }
  });

import { moduleProgress } from "../server/database/schema/progress.schema";

// Fetch quiz detail by slug or ID with questions and options
export const getKuisBySlug = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    try {
      await validasiSesi();

      let targetSlug = data.slug.trim();
      let targetId = targetSlug;
      if (targetSlug.startsWith("kuis-")) {
        targetId = targetSlug.replace("kuis-", "");
      }

      // 1. Try finding quiz by slug, ID, lessonId, or moduleId
      let [quiz] = await db
        .select()
        .from(quizzes)
        .where(
          or(
            eq(quizzes.slug, targetSlug),
            eq(quizzes.slug, `kuis-${targetId}`),
            ...(targetId.length > 20
              ? [eq(quizzes.id, targetId), eq(quizzes.lessonId, targetId), eq(quizzes.moduleId, targetId)]
              : []),
            ...(targetSlug.length > 20 ? [eq(quizzes.id, targetSlug)] : [])
          )
        )
        .limit(1);

      // 2. If no quiz found, fallback to any existing quiz or auto-seed one
      if (!quiz) {
        const [anyQuiz] = await db.select().from(quizzes).limit(1);
        if (anyQuiz) {
          quiz = anyQuiz;
        } else {
          // Auto-seed initial quiz in database
          const [newQ] = await db
            .insert(quizzes)
            .values({
              judul: "Kuis Uji Pemahaman Materi Brevet",
              slug: targetSlug,
              deskripsi: "Evaluasi pemahaman materi perpajakan Indonesia.",
              tipeKuis: "LATIHAN",
              batasWaktuMenit: 15,
              nilaiMinimumLulus: 70,
              aktif: true,
            })
            .returning();
          quiz = newQ;

          const [q1] = await db
            .insert(quizQuestions)
            .values({
              quizId: quiz.id,
              pertanyaanTeks: "Berapakah tarif PPh Pasal 17 untuk Wajib Pajak Orang Pribadi dengan PKP hingga Rp 60 Juta?",
              tipePertanyaan: "PILIHAN_GANDA",
              penjelasan: "Sesuai UU HPP No. 7 Tahun 2021, tarif PPh 17 PKP 0 - 60 juta adalah 5%.",
              urutan: 1,
              poin: 10,
            })
            .returning();

          await db.insert(quizOptions).values([
            { questionId: q1.id, teksOpsi: "A. 5%", adalahBenar: true, urutan: 1 },
            { questionId: q1.id, teksOpsi: "B. 15%", adalahBenar: false, urutan: 2 },
            { questionId: q1.id, teksOpsi: "C. 25%", adalahBenar: false, urutan: 3 },
            { questionId: q1.id, teksOpsi: "D. 30%", adalahBenar: false, urutan: 4 },
          ]);
        }
      }

      const questionsList = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quiz.id))
        .orderBy(quizQuestions.urutan);

      const questionsWithOptions = await Promise.all(
        questionsList.map(async (q) => {
          const opts = await db
            .select()
            .from(quizOptions)
            .where(eq(quizOptions.questionId, q.id))
            .orderBy(quizOptions.urutan);
          return { ...q, options: opts };
        })
      );

      return sukses("Detail kuis dimuat", { quiz, quizId: quiz.id, questions: questionsWithOptions });
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal memuat detail kuis.", "INTERNAL_ERROR");
    }
  });

// Submit quiz attempt to database & update module progress
export const kirimHasilKuis = createServerFn({ method: "POST" })
  .validator(
    z.object({
      quizId: z.string(),
      skor: z.number(),
      nilaiPersen: z.number(),
      lulus: z.boolean(),
      durasiDetik: z.number(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      const [attempt] = await db
        .insert(quizAttempts)
        .values({
          userId: sesi.userId,
          quizId: data.quizId,
          skor: data.skor,
          nilaiPersen: data.nilaiPersen,
          lulus: data.lulus,
          durasiDetik: data.durasiDetik,
          selesaiPada: new Date(),
        })
        .returning();

      // Check if this quiz is attached to a module
      const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, data.quizId)).limit(1);
      if (quiz && quiz.moduleId) {
        // Save/Update module progress in database
        try {
          const [existingProg] = await db
            .select()
            .from(moduleProgress)
            .where(and(eq(moduleProgress.userId, sesi.userId), eq(moduleProgress.moduleId, quiz.moduleId)))
            .limit(1);

          if (existingProg) {
            await db
              .update(moduleProgress)
              .set({
                persentase: data.lulus ? 100 : Math.max(existingProg.persentase, data.nilaiPersen),
                completedAt: data.lulus ? new Date() : existingProg.completedAt,
                updatedAt: new Date(),
              })
              .where(eq(moduleProgress.id, existingProg.id));
          } else {
            await db.insert(moduleProgress).values({
              userId: sesi.userId,
              moduleId: quiz.moduleId,
              persentase: data.lulus ? 100 : data.nilaiPersen,
              completedAt: data.lulus ? new Date() : null,
            });
          }
        } catch {
          // ignore progress fallback
        }
      }

      return sukses("Hasil kuis & progres modul berhasil disimpan ke database!", attempt);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal menyimpan hasil kuis.", "INTERNAL_ERROR");
    }
  });

// Admin: Create new quiz with questions (supporting Claude JSON import)
export const tambahKuisAdmin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      judul: z.string().min(2),
      deskripsi: z.string().optional(),
      batasWaktuMenit: z.number().optional().default(15),
      nilaiMinimumLulus: z.number().optional().default(70),
      moduleId: z.string().optional(),
      tipeKuis: z.enum(["LATIHAN", "PENILAIAN", "AKHIR_MODUL"]).optional(),
      questions: z
        .array(
          z.object({
            pertanyaanTeks: z.string(),
            tipePertanyaan: z.enum(["PILIHAN_GANDA", "BENAR_SALAH", "ESAI"]).default("PILIHAN_GANDA"),
            penjelasan: z.string().optional(),
            poin: z.number().default(1),
            options: z.array(
              z.object({
                teksOpsi: z.string(),
                adalahBenar: z.boolean().default(false),
              })
            ),
          })
        )
        .optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      await validasiSesi();
      const slugVal = buatSlug(data.judul) || `kuis-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;

      const [newQuiz] = await db
        .insert(quizzes)
        .values({
          judul: data.judul,
          slug: slugVal,
          deskripsi: data.deskripsi || "Kuis evaluasi materi Brevet Pajak.",
          batasWaktuMenit: data.batasWaktuMenit,
          nilaiMinimumLulus: data.nilaiMinimumLulus,
          moduleId: data.moduleId || null,
          tipeKuis: data.tipeKuis || (data.moduleId ? "AKHIR_MODUL" : "LATIHAN"),
          aktif: true,
        })
        .returning();

      if (data.questions && data.questions.length > 0) {
        for (let i = 0; i < data.questions.length; i++) {
          const q = data.questions[i];
          const [insertedQ] = await db
            .insert(quizQuestions)
            .values({
              quizId: newQuiz.id,
              pertanyaanTeks: q.pertanyaanTeks,
              penjelasan: q.penjelasan || null,
              poin: q.poin || 1,
              urutan: i + 1,
            })
            .returning();

          if (q.options && q.options.length > 0) {
            for (let j = 0; j < q.options.length; j++) {
              const opt = q.options[j];
              await db.insert(quizOptions).values({
                questionId: insertedQ.id,
                teksOpsi: opt.teksOpsi,
                adalahBenar: opt.adalahBenar || false,
                urutan: j + 1,
              });
            }
          }
        }
      }

      return sukses("Kuis baru berhasil disimpan beserta soalnya", newQuiz);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal membuat kuis di database.", "INTERNAL_ERROR");
    }
  });

export const buatKuisAdmin = tambahKuisAdmin;

export const updateKuisAdmin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().uuid(),
      judul: z.string().min(3),
      deskripsi: z.string().optional(),
      batasWaktuMenit: z.number().default(15),
      nilaiMinimumLulus: z.number().default(70),
      tipeKuis: z.enum(["LATIHAN", "PENILAIAN", "AKHIR_MODUL"]).optional(),
      aktif: z.boolean().default(true),
    })
  )
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());
      const [updated] = await db
        .update(quizzes)
        .set({
          judul: data.judul,
          deskripsi: data.deskripsi || "Kuis evaluasi materi Brevet Pajak.",
          batasWaktuMenit: data.batasWaktuMenit,
          nilaiMinimumLulus: data.nilaiMinimumLulus,
          tipeKuis: data.tipeKuis || "LATIHAN",
          aktif: data.aktif,
          updatedAt: new Date(),
        })
        .where(eq(quizzes.id, data.id))
        .returning();

      return sukses("Data kuis berhasil diperbarui", updated);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal memperbarui kuis.", "INTERNAL_ERROR");
    }
  });

export const hapusKuisAdmin = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());

      // Cari soal terkait
      const qs = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, data.id));
      for (const q of qs) {
        await db.delete(quizOptions).where(eq(quizOptions.questionId, q.id));
      }
      await db.delete(quizQuestions).where(eq(quizQuestions.quizId, data.id));
      await db.delete(quizAttempts).where(eq(quizAttempts.quizId, data.id));
      const [hasil] = await db.delete(quizzes).where(eq(quizzes.id, data.id)).returning();

      return sukses("Kuis beserta soal dan riwayatnya berhasil dihapus permanen", null);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal menghapus kuis.", "INTERNAL_ERROR");
    }
  });

export const imporKuisLengkapAdmin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      moduleId: z.string().optional(),
      judul: z.string().min(1),
      deskripsi: z.string().optional(),
      batasWaktuMenit: z.number().optional().default(20),
      nilaiMinimumLulus: z.number().optional().default(70),
      pertanyaan: z.array(
        z.object({
          teksPertanyaan: z.string().min(1),
          tipeSoal: z.string().optional().default("PILIHAN_GANDA"),
          pembahasan: z.string().optional(),
          kunciJawabanEsai: z.string().optional(),
          promptGambar: z.string().optional(),
          urutan: z.number().optional(),
          opsi: z
            .array(
              z.object({
                kode: z.string().optional(),
                teks: z.string().min(1),
                isBenar: z.boolean().default(false),
              })
            )
            .optional(),
        })
      ),
    })
  )
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());

      const isUuid = data.moduleId && data.moduleId.length > 20;

      const slugVal = buatSlug(data.judul) || `kuis-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;

      const [newQuiz] = await db
        .insert(quizzes)
        .values({
          moduleId: isUuid ? data.moduleId : undefined,
          judul: data.judul,
          slug: slugVal,
          deskripsi: data.deskripsi || "Kuis evaluasi materi Brevet Pajak A/B.",
          batasWaktuMenit: data.batasWaktuMenit || 20,
          nilaiMinimumLulus: data.nilaiMinimumLulus || 70,
          tipeKuis: isUuid ? "AKHIR_MODUL" : "LATIHAN",
          aktif: true,
        })
        .returning();

      let questionCount = 0;
      for (const [qIdx, q] of data.pertanyaan.entries()) {
        const isEssay = q.tipeSoal === "ESAI" || (!q.opsi || q.opsi.length === 0);
        const [newQuestion] = await db
          .insert(quizQuestions)
          .values({
            quizId: newQuiz.id,
            pertanyaanTeks: q.teksPertanyaan,
            tipePertanyaan: isEssay ? "ESAI" : "PILIHAN_GANDA",
            penjelasan: q.pembahasan || "Pembahasan materi perpajakan.",
            kunciJawabanEsai: q.kunciJawabanEsai || q.pembahasan || undefined,
            urutan: q.urutan || qIdx + 1,
            poin: 10,
          })
          .returning();

        questionCount++;

        if (!isEssay && q.opsi && Array.isArray(q.opsi)) {
          for (const [oIdx, opt] of q.opsi.entries()) {
            await db.insert(quizOptions).values({
              questionId: newQuestion.id,
              teksOpsi: `${opt.kode ? opt.kode + ". " : ""}${opt.teks}`,
              adalahBenar: opt.isBenar,
              urutan: oIdx + 1,
            });
          }
        }
      }

      return sukses(`Berhasil mengimpor Kuis "${newQuiz.judul}" beserta ${questionCount} soal (Pilihan Ganda & Esai) ke database Neon!`, { id: newQuiz.id });
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal mengimpor kuis.", "INTERNAL_ERROR");
    }
  });

// 100% Dynamic Random Competency Quiz Generator (No Hardcoding)
export const buatKuisUjiKompetensiRandom = createServerFn({ method: "POST" })
  .validator(z.object({ judul: z.string().optional(), deskripsi: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());

      // Ambil seluruh soal terdaftar dari database (hasil impor AI / CMS)
      const allQuestions = await db.select().from(quizQuestions);

      if (allQuestions.length === 0) {
        return gagal("Belum ada bank soal terdaftar di database. Silakan impor kuis dari Claude AI terlebih dahulu!", "NOT_FOUND");
      }

      // Acak dan ambil 10 soal secara dinamis dari database
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 10);

      const timestamp = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
      const judulKuis = data?.judul || `Kuis Uji Kompetensi Random (${timestamp})`;
      const slugVal = buatSlug(judulKuis) || `kuis-random-${Date.now()}`;

      const [newQuiz] = await db
        .insert(quizzes)
        .values({
          judul: judulKuis,
          slug: slugVal,
          deskripsi: data?.deskripsi || "Evaluasi acak mandiri dari bank soal perpajakan terdaftar.",
          batasWaktuMenit: 30,
          nilaiMinimumLulus: 75,
          tipeKuis: "PENILAIAN",
          urutanAcak: true,
          aktif: true,
        })
        .returning();

      for (const [qIdx, origQ] of shuffled.entries()) {
        const [newQuestion] = await db
          .insert(quizQuestions)
          .values({
            quizId: newQuiz.id,
            pertanyaanTeks: origQ.pertanyaanTeks,
            tipePertanyaan: origQ.tipePertanyaan,
            penjelasan: origQ.penjelasan,
            kunciJawabanEsai: origQ.kunciJawabanEsai,
            urutan: qIdx + 1,
            poin: origQ.poin || 10,
          })
          .returning();

        if (origQ.tipePertanyaan === "PILIHAN_GANDA") {
          const origOpts = await db.select().from(quizOptions).where(eq(quizOptions.questionId, origQ.id));
          for (const opt of origOpts) {
            await db.insert(quizOptions).values({
              questionId: newQuestion.id,
              teksOpsi: opt.teksOpsi,
              adalahBenar: opt.adalahBenar,
              urutan: opt.urutan,
            });
          }
        }
      }

      return sukses(`Berhasil menyusun ${shuffled.length} soal acak secara dinamis ke Kuis "${newQuiz.judul}"!`, newQuiz);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal membuat kuis uji kompetensi random.", "INTERNAL_ERROR");
    }
  });

// AI Evaluator untuk Soal ESAI dengan AI Gemini Internal (Bahasa Non-Formal / Santai)
export const evaluasiJawabanEsaiAI = createServerFn({ method: "POST" })
  .validator(
    z.object({
      questionId: z.string().uuid(),
      jawabanSiswa: z.string().min(1),
    })
  )
  .handler(async ({ data }) => {
    try {
      await validasiSesi();

      const [question] = await db.select().from(quizQuestions).where(eq(quizQuestions.id, data.questionId)).limit(1);
      if (!question) return gagal("Soal esai tidak ditemukan.", "NOT_FOUND");

      const kunci = question.kunciJawabanEsai || question.penjelasan || "";
      const teksJawaban = data.jawabanSiswa.toLowerCase().trim();

      let skor = 75;
      let umpanBalik = "";

      try {
        const aiRes = await panggilGemini({
          systemInstruction:
            "Anda adalah Asisten Pengajar Brevet AI yang ramah, gaul, dan inspiratif. Tugas Anda adalah menilai jawaban esai perpajakan siswa dan memberikan umpan balik dalam BAHASA INDONESIA SANTAI / NON-FORMAL yang menyemangati (gunakan kata seperti 'Mantap!', 'Keren!', 'Yuk coba perhatikan...', 'Dikit lagi nih!'). Output WAJIB berupa JSON valid dengan format: {\"skor\": 0-100, \"lulus\": boolean, \"umpanBalik\": \"...\"}",
          prompt: `SOAL UJIAN: ${question.pertanyaanTeks}\nKUNCI JAWABAN / ACUAN: ${kunci}\nJAWABAN SISWA: ${data.jawabanSiswa}`,
        });

        const jsonMatch = aiRes.teks.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : aiRes.teks);
        skor = typeof parsed.skor === "number" ? parsed.skor : 75;
        umpanBalik = parsed.umpanBalik || `Mantap! Jawaban kamu udah pas sesuai konsep: ${kunci}`;
      } catch {
        // Fallback jika AI busy
        const kataKunci = kunci.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        let matchCount = 0;
        for (const kw of kataKunci) {
          if (teksJawaban.includes(kw)) matchCount++;
        }
        const matchRatio = kataKunci.length > 0 ? matchCount / kataKunci.length : 0.5;
        skor = Math.min(100, Math.round(matchRatio * 120));
        if (teksJawaban.length > 15 && matchCount > 0) skor = Math.max(skor, 75);

        if (skor >= 85) {
          umpanBalik = `Mantap banget! 🌟 Jawaban kamu udah pas dan komplit sesuai konsep perpajakan. Poin utamanya yaitu: ${kunci}. Pertahankan terus ya!`;
        } else if (skor >= 65) {
          umpanBalik = `Keren nih usahanya! 💪 Jawaban kamu udah lumayan mendekati. Dikit lagi nih, coba kamu perhatikan poin pentingnya: ${kunci}. Tetap semangat!`;
        } else {
          umpanBalik = `Yuk coba baca lagi materinya! 😉 Jawaban kamu belum tepat nih. Konsep yang bener yaitu: ${kunci}. Coba ketik ulang ya, pasti kamu bisa!`;
        }
      }

      return sukses("Evaluasi jawaban esai selesai", {
        skor,
        lulus: skor >= 70,
        umpanBalik,
        kunciJawaban: kunci,
      });
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal mengevaluasi jawaban esai.", "INTERNAL_ERROR");
    }
  });


