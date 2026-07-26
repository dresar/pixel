/**
 * Media Assets Schema — Cloudinary media metadata (Matched to Neon DB)
 */

import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users.schema.js";

export const mediaAssets = pgTable("media_assets", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  cloudinaryPublicId: text("cloudinary_public_id").notNull(),
  secureUrl: text("secure_url").notNull(),
  namaFile: text("nama_file").notNull(),
  namaTampilan: text("nama_tampilan"),
  folder: text("folder"),
  mimeType: text("mime_type"),
  lebar: integer("lebar"),
  tinggi: integer("tinggi"),
  ukuranByte: integer("ukuran_byte"),
  entitasTipe: text("entitas_tipe").default("ILUSTRASI"),
  diunggahOleh: text("diunggah_oleh").references(() => users.id),
  status: text("status").default("AKTIF"),
  createdAt: timestamp("created_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});
