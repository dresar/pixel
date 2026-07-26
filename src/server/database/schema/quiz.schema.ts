import { pgTable, text, timestamp, uuid, integer, pgEnum, boolean, real } from "drizzle-orm/pg-core";
import { lessons, modules } from "./modules.schema";
import { users } from "./users.schema";

export const tipeKuisEnum = pgEnum("tipe_kuis", ["LATIHAN", "PENILAIAN", "AKHIR_MODUL"]);
export const tipePertanyaanEnum = pgEnum("tipe_pertanyaan", ["PILIHAN_GANDA", "BENAR_SALAH", "ESAI"]);

export const quizzes = pgTable("quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
  moduleId: uuid("module_id").references(() => modules.id, { onDelete: "cascade" }),
  judul: text("judul").notNull(),
  slug: text("slug").unique().notNull(),
  deskripsi: text("deskripsi"),
  tipeKuis: tipeKuisEnum("tipe_kuis").notNull().default("LATIHAN"),
  batasWaktuMenit: integer("batas_waktu_menit"),
  nilaiMinimumLulus: integer("nilai_minimum_lulus").notNull().default(70),
  urutanAcak: boolean("urutan_acak").notNull().default(false),
  aktif: boolean("aktif").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const quizQuestions = pgTable("quiz_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  pertanyaanTeks: text("pertanyaan_teks").notNull(),
  tipePertanyaan: tipePertanyaanEnum("tipe_pertanyaan").notNull().default("PILIHAN_GANDA"),
  poin: integer("poin").notNull().default(1),
  penjelasan: text("penjelasan"),
  kunciJawabanEsai: text("kunci_jawaban_esai"),
  urutan: integer("urutan").notNull().default(0),
});

export const quizOptions = pgTable("quiz_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id").notNull().references(() => quizQuestions.id, { onDelete: "cascade" }),
  teksOpsi: text("teks_opsi").notNull(),
  adalahBenar: boolean("adalah_benar").notNull().default(false),
  urutan: integer("urutan").notNull().default(0),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  quizId: uuid("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  skor: real("skor").notNull().default(0),
  nilaiPersen: real("nilai_persen").notNull().default(0),
  lulus: boolean("lulus").notNull().default(false),
  durasiDetik: integer("durasi_detik"),
  mulaiPada: timestamp("mulai_pada").notNull().defaultNow(),
  selesaiPada: timestamp("selesai_pada"),
});

export const quizAnswers = pgTable("quiz_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  attemptId: uuid("attempt_id").notNull().references(() => quizAttempts.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => quizQuestions.id, { onDelete: "cascade" }),
  optionId: uuid("option_id").references(() => quizOptions.id, { onDelete: "set null" }),
  jawabanTeks: text("jawaban_teks"),
  umpanBalikAi: text("umpan_balik_ai"),
});

export type Quiz = typeof quizzes.$inferSelect;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type QuizOption = typeof quizOptions.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
