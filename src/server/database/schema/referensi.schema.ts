import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const referensiHukum = pgTable("referensi_hukum", {
  id: uuid("id").primaryKey().defaultRandom(),
  nomorPeraturan: text("nomor_peraturan").notNull(),
  slug: text("slug").unique().notNull(),
  judul: text("judul").notNull(),
  kategori: text("kategori").notNull().default("UU"), // UU, PMK, PER, PP
  tahun: text("tahun"),
  ringkasan: text("ringkasan").notNull(),
  kontenLengkap: text("konten_lengkap"),
  urlDokumen: text("url_dokumen"),
  status: text("status").notNull().default("AKTIF"),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ReferensiHukum = typeof referensiHukum.$inferSelect;
export type NewReferensiHukum = typeof referensiHukum.$inferInsert;
