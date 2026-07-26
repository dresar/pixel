/**
 * AI Engine Schema — Conversations, Messages, API Keys, & Prompt Studio
 * Matched with Neon DB gemini_api_keys table
 */

import { pgTable, text, timestamp, json, integer, boolean } from "drizzle-orm/pg-core";
import { users } from "./users.schema.js";

// ── AI Conversations ──────────────────────────────────────────────────────────
export const aiConversations = pgTable("ai_conversations", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  judul: text("judul"),
  konteks: text("konteks").default("UMUM"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── AI Messages ───────────────────────────────────────────────────────────────
export const aiMessages = pgTable("ai_messages", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => aiConversations.id, { onDelete: "cascade" }),
  peran: text("peran", { enum: ["USER", "ASSISTANT"] }).notNull(),
  konten: text("konten").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Gemini API Keys (Rotasi Key) — gemini_api_keys ─────────────────────────────
export const apiKeys = pgTable("gemini_api_keys", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  nama: text("nama").notNull(),
  apiKeyTerenkripsi: text("api_key_terenkripsi").notNull(),
  status: text("status").default("AKTIF"),
  prioritas: integer("prioritas").default(1),
  totalRequest: integer("total_request").default(0),
  errorCount: integer("error_count").default(0),
  pesanError: text("pesan_error"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Prompt Studio Engines ──────────────────────────────────────────────────────
export const promptEngines = pgTable("prompt_engines", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  nama: text("nama").notNull(),
  kodeEngine: text("kode_engine").notNull(),
  kategoriEngine: text("kategori_engine").notNull(),
  deskripsi: text("deskripsi"),
  kontenTemplate: text("konten_template").notNull(),
  urutanKompilasi: integer("urutan_kompilasi").default(99),
  aktif: boolean("aktif").default(true),
  tag: json("tag"),
  dibuatOleh: text("dibuat_oleh").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const promptEngineVersions = pgTable("prompt_engine_versions", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  engineId: text("engine_id")
    .notNull()
    .references(() => promptEngines.id, { onDelete: "cascade" }),
  nomorVersi: integer("nomor_versi").notNull(),
  kontenTemplate: text("konten_template").notNull(),
  dibuatOleh: text("dibuat_oleh").references(() => users.id),
  catatanRevisi: text("catatan_revisi"),
  createdAt: timestamp("created_at").defaultNow(),
});
