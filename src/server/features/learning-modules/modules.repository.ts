import { db } from "../../config/database";
import { modules, lessons, chapters, roadmaps, levels } from "../../database/schema";
import { eq, and, isNull, asc, desc, ilike, sql } from "drizzle-orm";
import type { Module, NewModule, Lesson, NewLesson, Chapter } from "../../database/schema";

export const modulesRepository = {
  async daftarModul(filter?: { levelId?: string; status?: string; cari?: string; limit?: number; offset?: number }) {
    let query = db
      .select()
      .from(modules)
      .where(and(isNull(modules.deletedAt)))
      .orderBy(asc(modules.urutan))
      .$dynamic();

    if (filter?.levelId) {
      query = query.where(and(isNull(modules.deletedAt), eq(modules.levelId, filter.levelId)));
    }
    if (filter?.status) {
      query = query.where(and(isNull(modules.deletedAt), eq(modules.statusPublikasi, filter.status as any)));
    }
    if (filter?.cari) {
      query = query.where(and(isNull(modules.deletedAt), ilike(modules.judul, `%${filter.cari}%`)));
    }
    if (filter?.limit) query = query.limit(filter.limit);
    if (filter?.offset) query = query.offset(filter.offset);

    return query;
  },

  async hitungModul(filter?: { levelId?: string; status?: string }): Promise<number> {
    const [hasil] = await db
      .select({ count: sql<number>`count(*)` })
      .from(modules)
      .where(and(isNull(modules.deletedAt)));
    return Number(hasil?.count ?? 0);
  },

  async ambilModulBySlug(slug: string): Promise<Module | null> {
    const [hasil] = await db
      .select()
      .from(modules)
      .where(and(eq(modules.slug, slug), isNull(modules.deletedAt)))
      .limit(1);
    return hasil ?? null;
  },

  async ambilModulById(id: string): Promise<Module | null> {
    const [hasil] = await db
      .select()
      .from(modules)
      .where(and(eq(modules.id, id), isNull(modules.deletedAt)))
      .limit(1);
    return hasil ?? null;
  },

  async simpanModul(data: NewModule): Promise<Module> {
    const [hasil] = await db.insert(modules).values(data).returning();
    return hasil;
  },

  async updateModul(id: string, data: Partial<NewModule>): Promise<Module | null> {
    const [hasil] = await db
      .update(modules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(modules.id, id))
      .returning();
    return hasil ?? null;
  },

  async softDeleteModul(id: string): Promise<void> {
    await db.update(modules).set({ deletedAt: new Date() }).where(eq(modules.id, id));
  },

  async ambilLessonBySlug(slug: string): Promise<Lesson | null> {
    const [hasil] = await db.select().from(lessons).where(eq(lessons.slug, slug)).limit(1);
    return hasil ?? null;
  },

  async ambilLessonsByChapter(chapterId: string): Promise<Lesson[]> {
    return db.select().from(lessons).where(eq(lessons.chapterId, chapterId)).orderBy(asc(lessons.urutan));
  },

  async simpanLesson(data: NewLesson): Promise<Lesson> {
    const [hasil] = await db.insert(lessons).values(data).returning();
    return hasil;
  },

  async updateLesson(id: string, data: Partial<NewLesson>): Promise<Lesson | null> {
    const [hasil] = await db
      .update(lessons)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(lessons.id, id))
      .returning();
    return hasil ?? null;
  },

  async daftarRoadmap() {
    return db.select().from(roadmaps).where(eq(roadmaps.status, "TERBIT")).orderBy(asc(roadmaps.urutan));
  },

  async daftarSemuaLesson(): Promise<Lesson[]> {
    return db.select().from(lessons).orderBy(desc(lessons.createdAt)).limit(100);
  },

  async daftarSemuaChapter(): Promise<Chapter[]> {
    return db.select().from(chapters).orderBy(asc(chapters.urutan)).limit(100);
  },

  async simpanChapter(data: { moduleId: string; judul: string; deskripsi?: string; urutan?: number }): Promise<Chapter> {
    const [hasil] = await db.insert(chapters).values({ ...data, urutan: data.urutan || 1 }).returning();
    return hasil;
  },

  async updateChapter(id: string, data: { judul?: string; deskripsi?: string; urutan?: number }): Promise<Chapter | null> {
    const [hasil] = await db.update(chapters).set(data).where(eq(chapters.id, id)).returning();
    return hasil ?? null;
  },

  async hapusChapter(id: string): Promise<boolean> {
    await db.delete(lessons).where(eq(lessons.chapterId, id));
    const [hasil] = await db.delete(chapters).where(eq(chapters.id, id)).returning();
    return !!hasil;
  },

  async ambilLevelPertama() {
    const [level] = await db.select().from(levels).limit(1);
    return level ?? null;
  },

  async hapusModul(id: string): Promise<boolean> {
    const chaps = await db.select().from(chapters).where(eq(chapters.moduleId, id));
    for (const c of chaps) {
      await db.delete(lessons).where(eq(lessons.chapterId, c.id));
    }
    await db.delete(chapters).where(eq(chapters.moduleId, id));
    const [hasil] = await db.delete(modules).where(eq(modules.id, id)).returning();
    return !!hasil;
  },
};
