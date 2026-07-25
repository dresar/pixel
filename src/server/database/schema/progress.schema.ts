import { pgTable, text, timestamp, uuid, integer, pgEnum } from "drizzle-orm/pg-core";
import { lessons, modules } from "./modules.schema";
import { users } from "./users.schema";

export const statusProgresEnum = pgEnum("status_progres", ["BELUM", "SEDANG", "SELESAI"]);

export const learningProgress = pgTable("learning_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  moduleId: uuid("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  status: statusProgresEnum("status").notNull().default("BELUM"),
  persentase: integer("persentase").notNull().default(0),
  waktuBelajarDetik: integer("waktu_belajar_detik").notNull().default(0),
  terakhirDibuka: timestamp("terakhir_dibuka").notNull().defaultNow(),
  selesaiPada: timestamp("selesai_pada"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const moduleProgress = pgTable("module_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  moduleId: uuid("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  totalPelajaran: integer("total_pelajaran").notNull().default(0),
  selesai: integer("selesai").notNull().default(0),
  persentase: integer("persentase").notNull().default(0),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type LearningProgress = typeof learningProgress.$inferSelect;
export type ModuleProgress = typeof moduleProgress.$inferSelect;
