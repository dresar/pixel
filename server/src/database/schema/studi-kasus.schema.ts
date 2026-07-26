/**
 * Studi Kasus & Simulasi Schema — Database Table Structure
 */

import { pgTable, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export const studiKasus = pgTable("studi_kasus", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  judul: text("judul").notNull(),
  slug: text("slug").notNull().unique(),
  deskripsi: text("deskripsi"),
  level: text("level").default("MENENGAH"), // "DASAR", "MENENGAH", "LANJUT"
  tag: text("tag").default("PPh OP"), // "PPh OP", "PPh Badan", "PPN", "Sengketa", etc.
  durasiMenit: integer("durasi_menit").default(45),
  skenarioTeks: text("skenario_teks"),
  soalJson: jsonb("soal_json"),
  terbit: boolean("terbit").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
