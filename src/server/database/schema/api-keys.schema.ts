import { pgTable, text, timestamp, uuid, integer, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const statusApiKeyEnum = pgEnum("status_api_key", ["AKTIF", "NONAKTIF", "LIMIT", "ERROR"]);

export const geminiApiKeys = pgTable("gemini_api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  nama: text("nama").notNull(),
  apiKeyTerenkripsi: text("api_key_terenkripsi").notNull(),
  status: statusApiKeyEnum("status").notNull().default("AKTIF"),
  prioritas: integer("prioritas").notNull().default(0),
  totalRequest: integer("total_request").notNull().default(0),
  errorCount: integer("error_count").notNull().default(0),
  limitResetPada: timestamp("limit_reset_pada"),
  terakhirDigunakan: timestamp("terakhir_digunakan"),
  terakhirError: timestamp("terakhir_error"),
  pesanError: text("pesan_error"),
  ditambahkanOleh: text("ditambahkan_oleh").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type GeminiApiKey = typeof geminiApiKeys.$inferSelect;
export type NewGeminiApiKey = typeof geminiApiKeys.$inferInsert;
