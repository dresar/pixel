import { createServerFn } from "@tanstack/react-start";
import { validasiSesi } from "../server/shared/middleware/auth-middleware";
import { validasiPeran, membutuhkanAdmin } from "../server/shared/middleware/role-middleware";
import { db } from "../server/config/database";
import { quizzes, quizQuestions, quizOptions, quizAttempts, quizAnswers } from "../server/database/schema";
import { eq, desc } from "drizzle-orm";
import { sukses, gagal } from "../server/shared/utils/response-builder";
import { isAppError } from "../server/shared/errors/AppError";
import { z } from "zod";

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

// Submit quiz attempt to database
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

      return sukses("Hasil kuis berhasil disimpan ke database", attempt);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal menyimpan hasil kuis.", "INTERNAL_ERROR");
    }
  });

// Admin: Create new quiz with questions (supporting Claude JSON import)
export const buatKuisAdmin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      judul: z.string().min(3),
      deskripsi: z.string().optional(),
      batasWaktuMenit: z.number().default(15),
      nilaiMinimumLulus: z.number().default(70),
      moduleId: z.string().uuid().optional(),
      tipeKuis: z.enum(["LATIHAN", "PENILAIAN", "AKHIR_MODUL"]).optional(),
      questions: z
        .array(
          z.object({
            pertanyaanTeks: z.string(),
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
      const [newQuiz] = await db
        .insert(quizzes)
        .values({
          judul: data.judul,
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
          promptGambar: z.string().optional(),
          urutan: z.number().optional(),
          opsi: z.array(
            z.object({
              kode: z.string().optional(),
              teks: z.string().min(1),
              isBenar: z.boolean().default(false),
            })
          ),
        })
      ),
    })
  )
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());

      const isUuid = data.moduleId && data.moduleId.length > 20;

      const [newQuiz] = await db
        .insert(quizzes)
        .values({
          moduleId: isUuid ? data.moduleId : undefined,
          judul: data.judul,
          deskripsi: data.deskripsi || "Kuis evaluasi materi Brevet Pajak A/B.",
          batasWaktuMenit: data.batasWaktuMenit || 20,
          nilaiMinimumLulus: data.nilaiMinimumLulus || 70,
          tipeKuis: isUuid ? "AKHIR_MODUL" : "LATIHAN",
          aktif: true,
        })
        .returning();

      let questionCount = 0;
      for (const [qIdx, q] of data.pertanyaan.entries()) {
        const [newQuestion] = await db
          .insert(quizQuestions)
          .values({
            quizId: newQuiz.id,
            pertanyaanTeks: q.teksPertanyaan,
            tipePertanyaan: "PILIHAN_GANDA",
            penjelasan: q.pembahasan || "Pembahasan materi perpajakan.",
            urutan: q.urutan || qIdx + 1,
            poin: 10,
          })
          .returning();

        questionCount++;

        for (const [oIdx, opt] of q.opsi.entries()) {
          await db.insert(quizOptions).values({
            questionId: newQuestion.id,
            teksOpsi: `${opt.kode ? opt.kode + ". " : ""}${opt.teks}`,
            adalahBenar: opt.isBenar,
            urutan: oIdx + 1,
          });
        }
      }

      return sukses(`Berhasil mengimpor Kuis "${newQuiz.judul}" beserta ${questionCount} soal ke database Neon!`, { id: newQuiz.id });
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal mengimpor kuis.", "INTERNAL_ERROR");
    }
  });


