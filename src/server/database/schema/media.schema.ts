import { pgTable, text, timestamp, uuid, integer, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const statusMediaEnum = pgEnum("status_media", ["AKTIF", "DIHAPUS"]);

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  cloudinaryPublicId: text("cloudinary_public_id").unique().notNull(),
  secureUrl: text("secure_url").notNull(),
  namaFile: text("nama_file").notNull(),
  namaTampilan: text("nama_tampilan"),
  folder: text("folder").notNull(),
  mimeType: text("mime_type").notNull(),
  lebar: integer("lebar"),
  tinggi: integer("tinggi"),
  ukuranByte: integer("ukuran_byte"),
  altText: text("alt_text"),
  tag: text("tag").array(),
  entitasTipe: text("entitas_tipe"),
  entitasId: uuid("entitas_id"),
  versi: integer("versi").notNull().default(1),
  diunggahOleh: text("diunggah_oleh").references(() => users.id, { onDelete: "set null" }),
  status: statusMediaEnum("status").notNull().default("AKTIF"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type NewMediaAsset = typeof mediaAssets.$inferInsert;
