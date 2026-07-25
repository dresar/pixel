import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const glossaryEntries = pgTable("glossary_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  istilah: text("istilah").notNull(),
  slug: text("slug").unique().notNull(),
  definisi: text("definisi").notNull(),
  contoh: text("contoh"),
  referensiUndangUndang: text("referensi_undang_undang"),
  kategori: text("kategori"),
  tag: text("tag").array(),
  status: text("status").notNull().default("AKTIF"),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type GlossaryEntry = typeof glossaryEntries.$inferSelect;
