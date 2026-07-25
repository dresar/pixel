import { pgTable, text, timestamp, uuid, integer, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { lessons, modules } from "./modules.schema";
import { users } from "./users.schema";

export const aksiAiEnum = pgEnum("aksi_ai", [
  "JELASKAN", "RINGKAS", "SOROT", "KUIS", "KARTU",
  "MINDMAP", "VISUAL", "CHAT", "ANALOGI", "STUDI_KASUS", "RENCANA_BELAJAR",
]);
export const peranPesanEnum = pgEnum("peran_pesan", ["USER", "ASSISTANT"]);

export const aiConversations = pgTable("ai_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  judul: text("judul"),
  aksi: aksiAiEnum("aksi").notNull(),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  moduleId: uuid("module_id").references(() => modules.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const aiMessages = pgTable("ai_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").notNull().references(() => aiConversations.id, { onDelete: "cascade" }),
  peran: peranPesanEnum("peran").notNull(),
  konten: text("konten").notNull(),
  tokenPerkiraan: integer("token_perkiraan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const aiPromptTemplates = pgTable("ai_prompt_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  nama: text("nama").unique().notNull(),
  kategori: text("kategori").notNull(),
  aksi: aksiAiEnum("aksi").notNull(),
  templateTeks: text("template_teks").notNull(),
  variabelJson: jsonb("variabel_json"),
  versi: integer("versi").notNull().default(1),
  aktif: text("aktif").notNull().default("true"),
  dibuatOleh: text("dibuat_oleh").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const aiUsageLogs = pgTable("ai_usage_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  apiKeyId: uuid("api_key_id"),
  aksi: aksiAiEnum("aksi").notNull(),
  durasiMs: integer("durasi_ms"),
  tokenPerkiraan: integer("token_perkiraan"),
  sukses: text("sukses").notNull().default("true"),
  diCache: text("di_cache").notNull().default("false"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AiConversation = typeof aiConversations.$inferSelect;
export type AiMessage = typeof aiMessages.$inferSelect;
export type AiPromptTemplate = typeof aiPromptTemplates.$inferSelect;
