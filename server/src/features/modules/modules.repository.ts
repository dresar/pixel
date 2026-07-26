/**
 * Modules Repository — Semua query database untuk fitur modul
 */

import { eq, isNull, asc, ilike, and, or, inArray, sql } from "drizzle-orm";
import { db } from "../../config/database.js";
import {
  modules,
  chapters,
  lessons,
  levels,
  roadmaps,
} from "../../database/schema/index.js";

export const modulesRepository = {
  // ── Roadmaps ────────────────────────────────────────────────────────────────
  async ambilRoadmapTerbit() {
    return db
      .select()
      .from(roadmaps)
      .where(eq(roadmaps.status, "TERBIT"))
      .orderBy(asc(roadmaps.urutan));
  },

  // ── Levels ──────────────────────────────────────────────────────────────────
  async ambilLevelPertama() {
    const [level] = await db.select().from(levels).orderBy(asc(levels.urutan)).limit(1);
    return level ?? null;
  },

  // ── Modules ─────────────────────────────────────────────────────────────────
  async daftarModul(filter: {
    levelId?: string;
    status?: string;
    cari?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = db
      .select()
      .from(modules)
      .where(isNull(modules.deletedAt))
      .orderBy(asc(modules.urutan))
      .$dynamic();

    const conditions: any[] = [isNull(modules.deletedAt)];
    if (filter.levelId) conditions.push(eq(modules.levelId, filter.levelId));
    if (filter.status) conditions.push(eq(modules.statusPublikasi, filter.status as any));
    if (filter.cari) conditions.push(ilike(modules.judul, `%${filter.cari}%`));

    if (conditions.length > 1) {
      query = query.where(and(...conditions));
    }

    return query.limit(filter.limit ?? 20).offset(filter.offset ?? 0);
  },

  async hitungTotalModul() {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(modules)
      .where(isNull(modules.deletedAt));
    return Number(result?.count ?? 0);
  },

  async modulBySlug(slug: string) {
    if (!slug || slug === "undefined") return null;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    const condition = isUuid
      ? and(or(eq(modules.slug, slug), eq(modules.id, slug)), isNull(modules.deletedAt))
      : and(eq(modules.slug, slug), isNull(modules.deletedAt));

    const [modul] = await db
      .select()
      .from(modules)
      .where(condition)
      .limit(1);

    return modul ?? null;
  },

  async modulById(id: string) {
    const [modul] = await db
      .select()
      .from(modules)
      .where(and(eq(modules.id, id), isNull(modules.deletedAt)))
      .limit(1);
    return modul ?? null;
  },

  async simpanModul(data: {
    levelId: string;
    judul: string;
    slug: string;
    deskripsi?: string;
    tingkatKesulitan: "DASAR" | "MENENGAH" | "LANJUT";
    estimasiMenit: number;
    urutan: number;
    statusPublikasi?: "DRAFT" | "REVIEW" | "DISETUJUI" | "TERBIT" | "ARSIP";
    createdBy: string;
    updatedBy: string;
  }) {
    const [modul] = await db.insert(modules).values(data).returning();
    return modul;
  },

  async updateModul(id: string, data: Partial<typeof modules.$inferInsert>) {
    const [modul] = await db
      .update(modules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(modules.id, id))
      .returning();
    return modul;
  },

  async softDeleteModul(id: string) {
    await db
      .update(modules)
      .set({ deletedAt: new Date() })
      .where(eq(modules.id, id));
  },

  // ── Chapters ────────────────────────────────────────────────────────────────
  async daftarChapterByModul(moduleId: string) {
    return db
      .select()
      .from(chapters)
      .where(eq(chapters.moduleId, moduleId))
      .orderBy(asc(chapters.urutan));
  },

  async daftarSemuaChapter() {
    try {
      return await db.select().from(chapters).orderBy(asc(chapters.urutan));
    } catch (err) {
      console.warn("Table chapters query fallback:", err);
      return [];
    }
  },

  async simpanChapter(data: {
    moduleId: string;
    judul: string;
    deskripsi?: string;
    urutan?: number;
  }) {
    const [chap] = await db
      .insert(chapters)
      .values({ ...data, urutan: data.urutan ?? 1 })
      .returning();
    return chap;
  },

  async updateChapter(
    id: string,
    data: { judul?: string; deskripsi?: string; urutan?: number },
  ) {
    const [chap] = await db
      .update(chapters)
      .set(data)
      .where(eq(chapters.id, id))
      .returning();
    return chap;
  },

  async hapusChapter(id: string) {
    await db.delete(chapters).where(eq(chapters.id, id));
  },

  // ── Lessons ─────────────────────────────────────────────────────────────────
  async daftarSemuaLesson() {
    try {
      return await db.select().from(lessons).orderBy(asc(lessons.urutan));
    } catch (err) {
      console.warn("Table lessons query fallback:", err);
      return [];
    }
  },

  async lessonBySlug(slug: string) {
    if (!slug || slug === "undefined") return null;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    const condition = isUuid
      ? or(eq(lessons.slug, slug), eq(lessons.id, slug))
      : eq(lessons.slug, slug);

    const [lesson] = await db
      .select()
      .from(lessons)
      .where(condition)
      .limit(1);

    return lesson ?? null;
  },

  async lessonById(id: string) {
    const [lesson] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, id))
      .limit(1);
    return lesson ?? null;
  },

  async lessonByChapters(chapIds: string[]) {
    if (chapIds.length === 0) return [];
    return db
      .select()
      .from(lessons)
      .where(inArray(lessons.chapterId, chapIds))
      .orderBy(asc(lessons.urutan));
  },

  async simpanLesson(data: {
    chapterId: string;
    judul: string;
    slug: string;
    kontenJson?: unknown;
    estimasiMenit?: number;
    urutan?: number;
    statusPublikasi?: string;
  }) {
    const [lesson] = await db
      .insert(lessons)
      .values({
        ...data,
        statusPublikasi: (data.statusPublikasi as any) ?? "TERBIT",
        estimasiMenit: data.estimasiMenit ?? 15,
        urutan: data.urutan ?? 1,
      })
      .returning();
    return lesson;
  },

  async updateLesson(
    id: string,
    data: {
      judul?: string;
      gambarUrl?: string;
      promptGambar?: string;
      statusPublikasi?: string;
      kontenJson?: unknown;
    },
  ) {
    const [lesson] = await db
      .update(lessons)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(lessons.id, id))
      .returning();
    return lesson;
  },
};
