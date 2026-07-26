/**
 * Glossary & Legal References Schema
 */

import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// ── Glossary Entries ──────────────────────────────────────────────────────────
export const glossaryEntries = pgTable("glossary_entries", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  istilah: text("istilah").notNull(),
  slug: text("slug").notNull().unique(),
  definisi: text("definisi").notNull(),
  contoh: text("contoh"),
  referensiUndangUndang: text("referensi_undang_undang"),
  kategori: text("kategori").default("UMUM"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Referensi Hukum ───────────────────────────────────────────────────────────
export const referensiHukum = pgTable("referensi_hukum", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  nomorPeraturan: text("nomor_peraturan").notNull(),
  slug: text("slug").notNull().unique(),
  judul: text("judul").notNull(),
  kategori: text("kategori").default("UU"),
  tahun: text("tahun"),
  ringkasan: text("ringkasan").notNull(),
  kontenLengkap: text("konten_lengkap"),
  urlDokumen: text("url_dokumen"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
