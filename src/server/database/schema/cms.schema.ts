import { pgTable, text, timestamp, uuid, integer, jsonb, pgEnum, boolean } from "drizzle-orm/pg-core";
import { lessons, modules } from "./modules.schema";
import { users } from "./users.schema";

export const statusVersiEnum = pgEnum("status_versi", ["DRAFT", "REVIEW", "DISETUJUI", "TERBIT", "ARSIP"]);

export const contentVersions = pgTable("content_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
  moduleId: uuid("module_id").references(() => modules.id, { onDelete: "cascade" }),
  nomorVersi: integer("nomor_versi").notNull(),
  kontenJson: jsonb("konten_json").notNull(),
  statusPublikasi: statusVersiEnum("status_publikasi").notNull().default("DRAFT"),
  catatanRevisi: text("catatan_revisi"),
  penulisId: text("penulis_id").references(() => users.id, { onDelete: "set null" }),
  reviewerId: text("reviewer_id").references(() => users.id, { onDelete: "set null" }),
  diterbitkanPada: timestamp("diterbitkan_pada"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const promptTemplates = pgTable("prompt_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  nama: text("nama").unique().notNull(),
  kategori: text("kategori").notNull(),
  deskripsi: text("deskripsi"),
  templateTeks: text("template_teks").notNull(),
  variabelJson: jsonb("variabel_json"),
  versi: integer("versi").notNull().default(1),
  status: text("status").notNull().default("AKTIF"),
  tag: text("tag").array(),
  dibuatOleh: text("dibuat_oleh").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── PROMPT STUDIO: Prompt Engines & Versioning ─────────────────────────────

export const promptEngines = pgTable("prompt_engines", {
  id: uuid("id").primaryKey().defaultRandom(),
  nama: text("nama").notNull(),
  kodeEngine: text("kode_engine").unique().notNull(),
  kategoriEngine: text("kategori_engine").notNull(),
  deskripsi: text("deskripsi"),
  kontenTemplate: text("konten_template").notNull(),
  urutanKompilasi: integer("urutan_kompilasi").notNull().default(0),
  aktif: boolean("aktif").notNull().default(true),
  versi: integer("versi").notNull().default(1),
  tag: text("tag").array(),
  dibuatOleh: text("dibuat_oleh").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const promptEngineVersions = pgTable("prompt_engine_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  engineId: uuid("engine_id").notNull().references(() => promptEngines.id, { onDelete: "cascade" }),
  nomorVersi: integer("nomor_versi").notNull(),
  kontenTemplate: text("konten_template").notNull(),
  catatanRevisi: text("catatan_revisi"),
  dibuatOleh: text("dibuat_oleh").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ContentVersion = typeof contentVersions.$inferSelect;
export type PromptTemplate = typeof promptTemplates.$inferSelect;
export type PromptEngine = typeof promptEngines.$inferSelect;
export type PromptEngineVersion = typeof promptEngineVersions.$inferSelect;
export type NewPromptEngine = typeof promptEngines.$inferInsert;

