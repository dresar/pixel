import { db } from "../../config/database";
import { promptEngines, promptEngineVersions } from "../../database/schema";
import { eq, asc } from "drizzle-orm";
import type { PromptEngine, NewPromptEngine } from "../../database/schema";

export const promptStudioRepository = {
  async daftarEngines(): Promise<PromptEngine[]> {
    return db.select().from(promptEngines).orderBy(asc(promptEngines.urutanKompilasi));
  },

  async ambilEngineById(id: string): Promise<PromptEngine | null> {
    const [hasil] = await db.select().from(promptEngines).where(eq(promptEngines.id, id)).limit(1);
    return hasil ?? null;
  },

  async ambilEngineByKode(kode: string): Promise<PromptEngine | null> {
    const [hasil] = await db.select().from(promptEngines).where(eq(promptEngines.kodeEngine, kode)).limit(1);
    return hasil ?? null;
  },

  async buatEngine(data: NewPromptEngine): Promise<PromptEngine> {
    const [hasil] = await db.insert(promptEngines).values(data).returning();
    return hasil;
  },

  async updateEngine(id: string, data: Partial<NewPromptEngine>): Promise<PromptEngine | null> {
    const [hasil] = await db
      .update(promptEngines)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(promptEngines.id, id))
      .returning();
    return hasil ?? null;
  },

  async hapusEngine(id: string): Promise<void> {
    await db.delete(promptEngines).where(eq(promptEngines.id, id));
  },

  async simpanVersi(data: {
    engineId: string;
    nomorVersi: number;
    kontenTemplate: string;
    catatanRevisi?: string;
    dibuatOleh?: string | null;
  }) {
    const [hasil] = await db.insert(promptEngineVersions).values(data).returning();
    return hasil;
  },

  async daftarVersiEngine(engineId: string) {
    return db
      .select()
      .from(promptEngineVersions)
      .where(eq(promptEngineVersions.engineId, engineId))
      .orderBy(asc(promptEngineVersions.nomorVersi));
  },
};
