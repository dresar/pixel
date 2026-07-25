import { pgTable, text, timestamp, uuid, integer, boolean } from "drizzle-orm/pg-core";
import { lessons, modules } from "./modules.schema";
import { users } from "./users.schema";

export const flashcardDecks = pgTable("flashcard_decks", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  moduleId: uuid("module_id").references(() => modules.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  judul: text("judul").notNull(),
  deskripsi: text("deskripsi"),
  aktif: boolean("aktif").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const flashcards = pgTable("flashcards", {
  id: uuid("id").primaryKey().defaultRandom(),
  deckId: uuid("deck_id").notNull().references(() => flashcardDecks.id, { onDelete: "cascade" }),
  depanTeks: text("depan_teks").notNull(),
  belakangTeks: text("belakang_teks").notNull(),
  tag: text("tag").array(),
  urutan: integer("urutan").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const flashcardReviews = pgTable("flashcard_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  flashcardId: uuid("flashcard_id").notNull().references(() => flashcards.id, { onDelete: "cascade" }),
  kemudahan: integer("kemudahan").notNull().default(2),
  intervalHari: integer("interval_hari").notNull().default(1),
  ulasanBerikutnya: timestamp("ulasan_berikutnya").notNull().defaultNow(),
  totalUlasan: integer("total_ulasan").notNull().default(0),
  lastReviewed: timestamp("last_reviewed"),
});

export type FlashcardDeck = typeof flashcardDecks.$inferSelect;
export type Flashcard = typeof flashcards.$inferSelect;
export type FlashcardReview = typeof flashcardReviews.$inferSelect;
