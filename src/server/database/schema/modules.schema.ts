/**
 * Learning Content Schema — Roadmaps, Levels, Modules, Chapters, Lessons
 */

import { pgTable, text, timestamp, integer, json } from "drizzle-orm/pg-core";
import { users } from "./users.schema.js";

// ── Roadmaps ─────────────────────────────────────────────────────────────────
export const roadmaps = pgTable("roadmaps", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  judul: text("judul").notNull(),
  slug: text("slug").notNull().unique(),
  deskripsi: text("deskripsi"),
  urutan: integer("urutan").default(0),
  status: text("status", { enum: ["DRAFT", "TERBIT", "ARSIP"] }).default("DRAFT"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Levels ───────────────────────────────────────────────────────────────────
export const levels = pgTable("levels", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  kode: text("kode").notNull().unique(),
  nama: text("nama").notNull(),
  deskripsi: text("deskripsi"),
  urutan: integer("urutan").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Modules ───────────────────────────────────────────────────────────────────
export const modules = pgTable("modules", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  levelId: text("level_id").references(() => levels.id),
  judul: text("judul").notNull(),
  slug: text("slug").notNull().unique(),
  deskripsi: text("deskripsi"),
  tingkatKesulitan: text("tingkat_kesulitan", {
    enum: ["DASAR", "MENENGAH", "LANJUT"],
  }).default("DASAR"),
  estimasiMenit: integer("estimasi_menit").default(0),
  urutan: integer("urutan").default(0),
  statusPublikasi: text("status_publikasi", {
    enum: ["DRAFT", "REVIEW", "DISETUJUI", "TERBIT", "ARSIP"],
  }).default("DRAFT"),
  createdBy: text("created_by").references(() => users.id),
  updatedBy: text("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

// ── Chapters (Bab) ────────────────────────────────────────────────────────────
export const chapters = pgTable("chapters", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  moduleId: text("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  judul: text("judul").notNull(),
  deskripsi: text("deskripsi"),
  urutan: integer("urutan").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Lessons (Materi) ──────────────────────────────────────────────────────────
export const lessons = pgTable("lessons", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  chapterId: text("chapter_id")
    .notNull()
    .references(() => chapters.id, { onDelete: "cascade" }),
  judul: text("judul").notNull(),
  slug: text("slug").notNull().unique(),
  kontenJson: json("konten_json"),
  gambarUrl: text("gambar_url"),
  promptGambar: text("prompt_gambar"),
  estimasiMenit: integer("estimasi_menit").default(15),
  urutan: integer("urutan").default(0),
  statusPublikasi: text("status_publikasi", {
    enum: ["DRAFT", "REVIEW", "DISETUJUI", "TERBIT", "ARSIP"],
  }).default("DRAFT"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
