/**
 * Quiz Routes — /api/kuis/*
 * Connected to Neon DB quizzes, quiz_questions, quiz_options
 * Supports AI Quiz Generator (Gemini Internal / Claude External) & Manual Question Management (PG + Esai)
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, asc, or } from "drizzle-orm";
import { db } from "../../config/database.js";
import {
  quizzes,
  quizQuestions,
  quizOptions,
  quizAttempts,
  modules,
  lessons,
} from "../../database/schema/index.js";
import { authMiddleware, adminMiddleware } from "../../shared/middleware/auth.middleware.js";
import { sukses, gagal } from "../../shared/utils/response.js";
import { isAppError } from "../../shared/errors/AppError.js";
import { buatSlug } from "../../shared/utils/slug.js";
import { panggilGemini } from "../ai-engine/gemini.provider.js";
import { logger } from "../../shared/utils/logger.js";

const quizRoutes = new Hono();

function formatQuiz(q: any) {
  return {
    ...q,
    durasi: q.batasWaktuMenit ?? q.durasi ?? 30,
    nilaiLulus: q.nilaiMinimumLulus ?? q.nilaiLulus ?? 70,
    batasWaktuMenit: q.batasWaktuMenit ?? q.durasi ?? 30,
    nilaiMinimumLulus: q.nilaiMinimumLulus ?? q.nilaiLulus ?? 70,
  };
}

// GET /api/kuis — Daftar kuis aktif
quizRoutes.get("/", async (c) => {
  try {
    const list = await db
      .select()
      .from(quizzes)
      .orderBy(desc(quizzes.createdAt));

    const formatted = list.map(formatQuiz);
    return sukses(c, "Daftar kuis dimuat", formatted);
  } catch (error) {
    logger.warn("Daftar kuis query fallback:", error);
    return sukses(c, "Daftar kuis dimuat", []);
  }
});

// GET /api/kuis/:slug — Detail kuis by slug (dengan soal & opsi)
quizRoutes.get("/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");

    let targetSlug = slug.trim();
    let targetId = targetSlug;
    if (targetSlug.startsWith("kuis-")) targetId = targetSlug.replace("kuis-", "");

    const conditions = [
      eq(quizzes.slug, targetSlug),
      eq(quizzes.slug, `kuis-${targetId}`),
    ];
    if (targetId.length > 20) conditions.push(eq(quizzes.id, targetId));

    let [quiz] = await db
      .select()
      .from(quizzes)
      .where(or(...conditions))
      .limit(1);

    // Fallback ke quiz pertama jika tidak ditemukan slug spesifik
    if (!quiz) {
      const [anyQuiz] = await db.select().from(quizzes).limit(1);
      if (!anyQuiz) return gagal(c, "Tidak ada kuis tersedia.", "NOT_FOUND", 404);
      quiz = anyQuiz;
    }

    const questionsList = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quiz.id))
      .orderBy(asc(quizQuestions.urutan));

    const questionsWithOptions = await Promise.all(
      questionsList.map(async (q) => {
        const opts = await db
          .select()
          .from(quizOptions)
          .where(eq(quizOptions.questionId, q.id))
          .orderBy(asc(quizOptions.urutan));

        return {
          id: q.id,
          quizId: q.quizId,
          pertanyaanTeks: q.pertanyaanTeks,
          teksPertanyaan: q.pertanyaanTeks,
          pertanyaan: q.pertanyaanTeks,
          tipeSoal: q.tipePertanyaan || "PILIHAN_GANDA",
          tipePertanyaan: q.tipePertanyaan || "PILIHAN_GANDA",
          penjelasan: q.penjelasan,
          poin: q.poin ?? 1,
          kunciJawabanEsai: q.kunciJawabanEsai,
          options: opts.map((o) => ({
            id: o.id,
            teksOpsi: o.teksOpsi,
            teks: o.teksOpsi,
            isBenar: o.adalahBenar ?? false,
            benar: o.adalahBenar ?? false,
            adalahBenar: o.adalahBenar ?? false,
          })),
        };
      }),
    );

    const formattedQuiz = formatQuiz(quiz);

    return sukses(c, "Detail kuis dimuat", {
      quiz: formattedQuiz,
      quizId: formattedQuiz.id,
      questions: questionsWithOptions,
    });
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    logger.error("Gagal memuat detail kuis", error);
    return gagal(c, "Gagal memuat detail kuis.", "INTERNAL_ERROR", 500);
  }
});

// POST /api/kuis/generate-ai — Generate Soal Otomatis via Gemini / Claude
quizRoutes.post(
  "/generate-ai",
  zValidator(
    "json",
    z.object({
      quizId: z.string().optional(),
      judulMateri: z.string().min(1),
      kontenMateri: z.string().optional(),
      jumlahSoal: z.number().optional().default(5),
      tipeSoal: z.enum(["PILIHAN_GANDA", "ESAI", "CAMPURAN"]).optional().default("PILIHAN_GANDA"),
      provider: z.enum(["GEMINI", "CLAUDE"]).optional().default("GEMINI"),
    }),
  ),
  async (c) => {
    try {
      const data = c.req.valid("json");

      if (data.provider === "GEMINI") {
        const prompt = `Anda adalah Pembuat Soal Brevet Pajak A & B.
Buatkan ${data.jumlahSoal} soal kuis (Tipe: ${data.tipeSoal}) berdasarkan materi: "${data.judulMateri}".
KONTEN MATERI TAMBAHAN: "${data.kontenMateri || data.judulMateri}"

Sajikan HASIL HANYA DALAM FORMAT JSON MURNI tanpa komentar markdown dengan struktur:
{
  "questions": [
    {
      "pertanyaanTeks": "Teks soal perpajakan...",
      "tipePertanyaan": "PILIHAN_GANDA",
      "penjelasan": "Dasar hukum UU PPh/PPN...",
      "poin": 1,
      "options": [
        { "teksOpsi": "Jawaban A...", "adalahBenar": false },
        { "teksOpsi": "Jawaban B...", "adalahBenar": true }
      ]
    }
  ]
}`;

        const res = await panggilGemini({
          prompt,
          systemInstruction: "Anda adalah AI pembuat soal kuis perpajakan resmi BrevetAI.",
        });

        let jsonClean = res.teks.trim();
        if (jsonClean.startsWith("```json")) jsonClean = jsonClean.replace(/^```json/, "").replace(/```$/, "").trim();
        if (jsonClean.startsWith("```")) jsonClean = jsonClean.replace(/^```/, "").replace(/```$/, "").trim();

        let parsed: any;
        try {
          parsed = JSON.parse(jsonClean);
        } catch {
          parsed = { questions: [] };
        }

        // Simpan ke DB jika quizId ada
        if (data.quizId && parsed.questions?.length > 0) {
          let idx = 0;
          for (const q of parsed.questions) {
            idx++;
            const [qRow] = await db
              .insert(quizQuestions)
              .values({
                quizId: data.quizId,
                pertanyaanTeks: q.pertanyaanTeks,
                tipePertanyaan: q.tipePertanyaan || "PILIHAN_GANDA",
                penjelasan: q.penjelasan,
                poin: q.poin || 1,
                urutan: idx,
              })
              .returning();

            if (q.options?.length > 0) {
              let oIdx = 0;
              for (const o of q.options) {
                oIdx++;
                await db.insert(quizOptions).values({
                  questionId: qRow.id,
                  teksOpsi: o.teksOpsi,
                  adalahBenar: Boolean(o.adalahBenar),
                  urutan: oIdx,
                });
              }
            }
          }
        }

        return sukses(c, `Berhasil generate ${parsed.questions?.length || 0} soal kuis dengan Gemini AI!`, parsed);
      } else {
        // Claude external JSON Prompt Template Response
        const claudePrompt = `[CLAUDE PROMPT EXTERNAL]
Tolong buatkan ${data.jumlahSoal} soal kuis (${data.tipeSoal}) untuk materi "${data.judulMateri}".
Kembalikan format JSON: {"questions": [{"pertanyaanTeks": "...", "options": [...]}]}`;

        return sukses(c, "Prompt Claude AI siap digunakan", { prompt: claudePrompt });
      }
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal me-generate soal AI.", "INTERNAL_ERROR", 500);
    }
  },
);

// POST /api/kuis/hasil — Submit hasil kuis
quizRoutes.post(
  "/hasil",
  zValidator(
    "json",
    z.object({
      quizId: z.string(),
      skor: z.number(),
      nilaiPersen: z.number(),
      lulus: z.boolean(),
      durasiDetik: z.number(),
    }),
  ),
  async (c) => {
    try {
      const user = c.get("user");
      const data = c.req.valid("json");

      const [attempt] = await db
        .insert(quizAttempts)
        .values({
          quizId: data.quizId,
          userId: user.id,
          nilai: data.nilaiPersen,
          lulus: data.lulus,
          selesaiPada: new Date(),
        })
        .returning();

      return sukses(c, "Hasil kuis berhasil disimpan!", attempt, 201);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal menyimpan hasil kuis.", "INTERNAL_ERROR", 500);
    }
  },
);

// ── Admin Routes ──────────────────────────────────────────────────────────────
quizRoutes.use("/admin/*", adminMiddleware);

// POST /api/kuis/admin/soal — Tambah Butir Soal Baru (Pilihan Ganda atau Esai)
quizRoutes.post(
  "/admin/soal",
  zValidator(
    "json",
    z.object({
      quizId: z.string().min(1),
      pertanyaanTeks: z.string().min(1),
      tipePertanyaan: z.enum(["PILIHAN_GANDA", "ESAI"]).optional().default("PILIHAN_GANDA"),
      penjelasan: z.string().optional(),
      poin: z.number().optional().default(1),
      kunciJawabanEsai: z.string().optional(),
      opsi: z
        .array(
          z.object({
            teksOpsi: z.string().min(1),
            adalahBenar: z.boolean().optional().default(false),
          }),
        )
        .optional(),
    }),
  ),
  async (c) => {
    try {
      const data = c.req.valid("json");

      const [newQ] = await db
        .insert(quizQuestions)
        .values({
          quizId: data.quizId,
          pertanyaanTeks: data.pertanyaanTeks,
          tipePertanyaan: data.tipePertanyaan,
          penjelasan: data.penjelasan,
          poin: data.poin,
          kunciJawabanEsai: data.kunciJawabanEsai,
        })
        .returning();

      let createdOpts = [];
      if (data.tipePertanyaan === "PILIHAN_GANDA" && data.opsi && data.opsi.length > 0) {
        let idx = 0;
        for (const o of data.opsi) {
          idx++;
          const [oRow] = await db
            .insert(quizOptions)
            .values({
              questionId: newQ.id,
              teksOpsi: o.teksOpsi,
              adalahBenar: o.adalahBenar,
              urutan: idx,
            })
            .returning();
          createdOpts.push(oRow);
        }
      }

      return sukses(c, "Butir soal baru berhasil ditambahkan!", {
        question: newQ,
        options: createdOpts,
      }, 201);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal menambahkan butir soal.", "INTERNAL_ERROR", 500);
    }
  },
);

// POST /api/kuis/admin/random — Buat kuis acak / otomatis
quizRoutes.post("/admin/random", async (c) => {
  try {
    const allLessons = await db.select().from(lessons).limit(5);
    const targetLesson = allLessons[0];
    const judul = targetLesson ? `Kuis Evaluasi: ${targetLesson.judul}` : `Kuis Evaluasi Perpajakan ${Date.now()}`;
    const slug = `kuis-${buatSlug(judul)}-${Date.now()}`;

    const [newQuiz] = await db
      .insert(quizzes)
      .values({
        judul,
        slug,
        deskripsi: "Kuis acak otomatis dari materi kurikulum BrevetAI.",
        lessonId: targetLesson?.id,
        batasWaktuMenit: 20,
        nilaiMinimumLulus: 70,
        aktif: true,
      })
      .returning();

    return sukses(c, `Kuis acak "${newQuiz.judul}" berhasil dibuat!`, formatQuiz(newQuiz), 201);
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    return gagal(c, "Gagal membuat kuis acak.", "INTERNAL_ERROR", 500);
  }
});

// POST /api/kuis/admin — Buat kuis baru
quizRoutes.post(
  "/admin",
  zValidator(
    "json",
    z.object({
      judul: z.string().min(1),
      deskripsi: z.string().optional(),
      durasi: z.number().optional().default(30),
      nilaiLulus: z.number().optional().default(70),
      lessonId: z.string().optional(),
      moduleId: z.string().optional(),
    }),
  ),
  async (c) => {
    try {
      const data = c.req.valid("json");
      const slug = `kuis-${buatSlug(data.judul)}-${Date.now()}`;

      const [newQuiz] = await db
        .insert(quizzes)
        .values({
          judul: data.judul,
          slug,
          deskripsi: data.deskripsi,
          lessonId: data.lessonId,
          moduleId: data.moduleId,
          batasWaktuMenit: data.durasi,
          nilaiMinimumLulus: data.nilaiLulus,
          aktif: true,
        })
        .returning();

      return sukses(c, `Kuis "${newQuiz.judul}" berhasil dibuat!`, formatQuiz(newQuiz), 201);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal membuat kuis.", "INTERNAL_ERROR", 500);
    }
  },
);

// POST /api/kuis/admin/impor — Impor Kuis Lengkap dengan Soal & Opsi (JSON External Claude)
quizRoutes.post(
  "/admin/impor",
  zValidator(
    "json",
    z.object({
      moduleId: z.string().optional(),
      judul: z.string().min(1),
      deskripsi: z.string().optional(),
      batasWaktuMenit: z.number().optional().default(30),
      nilaiMinimumLulus: z.number().optional().default(70),
      pertanyaan: z.array(
        z.object({
          teksPertanyaan: z.string().min(1),
          tipeSoal: z.string().optional().default("PILIHAN_GANDA"),
          pembahasan: z.string().optional(),
          kunciJawabanEsai: z.string().optional(),
          urutan: z.number().optional(),
          opsi: z
            .array(
              z.object({
                teks: z.string(),
                isBenar: z.boolean(),
              }),
            )
            .optional(),
        }),
      ),
    }),
  ),
  async (c) => {
    try {
      const data = c.req.valid("json");
      const slug = `kuis-${buatSlug(data.judul)}-${Date.now()}`;

      const [newQuiz] = await db
        .insert(quizzes)
        .values({
          judul: data.judul,
          slug,
          deskripsi: data.deskripsi,
          moduleId: data.moduleId,
          batasWaktuMenit: data.batasWaktuMenit,
          nilaiMinimumLulus: data.nilaiMinimumLulus,
          aktif: true,
        })
        .returning();

      let qIdx = 0;
      for (const p of data.pertanyaan) {
        qIdx++;
        const [qRow] = await db
          .insert(quizQuestions)
          .values({
            quizId: newQuiz.id,
            pertanyaanTeks: p.teksPertanyaan,
            tipePertanyaan: p.tipeSoal || "PILIHAN_GANDA",
            penjelasan: p.pembahasan,
            urutan: p.urutan ?? qIdx,
            kunciJawabanEsai: p.kunciJawabanEsai,
          })
          .returning();

        if (p.opsi && p.opsi.length > 0) {
          let oIdx = 0;
          for (const o of p.opsi) {
            oIdx++;
            await db.insert(quizOptions).values({
              questionId: qRow.id,
              teksOpsi: o.teks,
              adalahBenar: o.isBenar,
              urutan: oIdx,
            });
          }
        }
      }

      return sukses(c, `Kuis "${newQuiz.judul}" dengan ${data.pertanyaan.length} soal berhasil diimpor!`, formatQuiz(newQuiz), 201);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal mengimpor kuis.", "INTERNAL_ERROR", 500);
    }
  },
);

// PATCH /api/kuis/admin/:id — Update kuis
quizRoutes.patch(
  "/admin/:id",
  zValidator(
    "json",
    z.object({
      judul: z.string().optional(),
      deskripsi: z.string().optional(),
      batasWaktuMenit: z.number().optional(),
      nilaiMinimumLulus: z.number().optional(),
      aktif: z.boolean().optional(),
    }),
  ),
  async (c) => {
    try {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const [updated] = await db
        .update(quizzes)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(quizzes.id, id))
        .returning();

      return sukses(c, "Kuis berhasil diperbarui", formatQuiz(updated));
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal memperbarui kuis.", "INTERNAL_ERROR", 500);
    }
  },
);

// DELETE /api/kuis/admin/:id — Hapus kuis
quizRoutes.delete("/admin/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const [deleted] = await db.delete(quizzes).where(eq(quizzes.id, id)).returning();
    return sukses(c, "Kuis berhasil dihapus", formatQuiz(deleted));
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    return gagal(c, "Gagal menghapus kuis.", "INTERNAL_ERROR", 500);
  }
});

export { quizRoutes };
