import { pgTable, text, timestamp, uuid, integer, pgEnum, jsonb } from "drizzle-orm/pg-core";

export const statusPublikasiEnum = pgEnum("status_publikasi", ["DRAFT", "REVIEW", "DISETUJUI", "TERBIT", "ARSIP"]);
export const tingkatKesulitanEnum = pgEnum("tingkat_kesulitan", ["DASAR", "MENENGAH", "LANJUT"]);
export const kodeLevel = pgEnum("kode_level", ["BREVET_A", "BREVET_B"]);

export const roadmaps = pgTable("roadmaps", {
  id: uuid("id").primaryKey().defaultRandom(),
  judul: text("judul").notNull(),
  deskripsi: text("deskripsi"),
  slug: text("slug").unique().notNull(),
  urutan: integer("urutan").notNull().default(0),
  status: statusPublikasiEnum("status").notNull().default("DRAFT"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const levels = pgTable("levels", {
  id: uuid("id").primaryKey().defaultRandom(),
  roadmapId: uuid("roadmap_id").notNull().references(() => roadmaps.id, { onDelete: "restrict" }),
  kodeLevel: kodeLevel("kode_level").notNull(),
  judul: text("judul").notNull(),
  deskripsi: text("deskripsi"),
  urutan: integer("urutan").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const modules = pgTable("modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  levelId: uuid("level_id").notNull().references(() => levels.id, { onDelete: "restrict" }),
  judul: text("judul").notNull(),
  deskripsi: text("deskripsi"),
  slug: text("slug").unique().notNull(),
  statusPublikasi: statusPublikasiEnum("status_publikasi").notNull().default("DRAFT"),
  tingkatKesulitan: tingkatKesulitanEnum("tingkat_kesulitan").notNull().default("DASAR"),
  estimasiMenit: integer("estimasi_menit").notNull().default(0),
  urutan: integer("urutan").notNull().default(0),
  versi: integer("versi").notNull().default(1),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const chapters = pgTable("chapters", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  judul: text("judul").notNull(),
  deskripsi: text("deskripsi"),
  urutan: integer("urutan").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  chapterId: uuid("chapter_id").notNull().references(() => chapters.id, { onDelete: "cascade" }),
  judul: text("judul").notNull(),
  slug: text("slug").unique().notNull(),
  kontenJson: jsonb("konten_json").notNull(),
  gambarUrl: text("gambar_url"),
  promptGambar: text("prompt_gambar"),
  estimasiMenit: integer("estimasi_menit").notNull().default(0),
  statusPublikasi: statusPublikasiEnum("status_publikasi").notNull().default("TERBIT"),
  urutan: integer("urutan").notNull().default(0),
  versi: integer("versi").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Roadmap = typeof roadmaps.$inferSelect;
export type Level = typeof levels.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type Chapter = typeof chapters.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type NewModule = typeof modules.$inferInsert;
export type NewLesson = typeof lessons.$inferInsert;
