/**
 * Quiz Schema — Match exact Neon DB structure
 */

import { pgTable, text, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { users } from "./users.schema.js";
import { lessons, modules } from "./modules.schema.js";

// ── Quizzes ───────────────────────────────────────────────────────────────────
export const quizzes = pgTable("quizzes", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  judul: text("judul").notNull(),
  slug: text("slug").notNull().unique(),
  deskripsi: text("deskripsi"),
  lessonId: text("lesson_id"),
  moduleId: text("module_id"),
  tipeKuis: text("tipe_kuis").default("PILIHAN_GANDA"),
  batasWaktuMenit: integer("batas_waktu_menit").default(30),
  nilaiMinimumLulus: integer("nilai_minimum_lulus").default(70),
  urutanAcak: boolean("urutan_acak").default(false),
  aktif: boolean("aktif").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Quiz Questions ────────────────────────────────────────────────────────────
export const quizQuestions = pgTable("quiz_questions", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  quizId: text("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  pertanyaanTeks: text("pertanyaan_teks").notNull(),
  tipePertanyaan: text("tipe_pertanyaan").default("PILIHAN_GANDA"),
  penjelasan: text("penjelasan"),
  urutan: integer("urutan").default(0),
  poin: integer("poin").default(1),
  kunciJawabanEsai: text("kunci_jawaban_esai"),
});

// ── Quiz Options ──────────────────────────────────────────────────────────────
export const quizOptions = pgTable("quiz_options", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  questionId: text("question_id")
    .notNull()
    .references(() => quizQuestions.id, { onDelete: "cascade" }),
  teksOpsi: text("teks_opsi").notNull(),
  adalahBenar: boolean("adalah_benar").default(false),
  urutan: integer("urutan").default(0),
});

// ── Quiz Attempts ─────────────────────────────────────────────────────────────
export const quizAttempts = pgTable("quiz_attempts", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  quizId: text("quiz_id")
    .notNull()
    .references(() => quizzes.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  nilai: real("nilai").default(0),
  lulus: boolean("lulus").default(false),
  mulaiPada: timestamp("mulai_pada").defaultNow(),
  selesaiPada: timestamp("selesai_pada"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Quiz Answers ──────────────────────────────────────────────────────────────
export const quizAnswers = pgTable("quiz_answers", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  attemptId: text("attempt_id")
    .notNull()
    .references(() => quizAttempts.id, { onDelete: "cascade" }),
  questionId: text("question_id")
    .notNull()
    .references(() => quizQuestions.id),
  optionId: text("option_id"),
  benar: boolean("benar").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
