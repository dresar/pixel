import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  judul: text("judul").notNull(),
  pesan: text("pesan").notNull(),
  tipe: text("tipe").notNull().default("INFO"),
  tautan: text("tautan"),
  dibaca: boolean("dibaca").notNull().default(false),
  dibacaPada: timestamp("dibaca_pada"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
