/**
 * Notifications Schema
 */

import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users.schema.js";

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  judul: text("judul").notNull(),
  pesan: text("pesan").notNull(),
  tipe: text("tipe").default("INFO"),
  dibaca: boolean("dibaca").default(false),
  dibacaPada: timestamp("dibaca_pada"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Progress ──────────────────────────────────────────────────────────────────
export const moduleProgress = pgTable("module_progress", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  moduleId: text("module_id").notNull(),
  lessonId: text("lesson_id"),
  persenSelesai: text("persen_selesai").default("0"),
  selesai: boolean("selesai").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
