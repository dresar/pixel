import { db } from "../../config/database";
import { geminiApiKeys } from "../../database/schema";
import { eq, and, or, lt, asc } from "drizzle-orm";
import type { GeminiKeyRecord } from "./api-keys.types";

export const apiKeysRepository = {
  async ambilKeyAktif(): Promise<GeminiKeyRecord[]> {
    const hasil = await db
      .select()
      .from(geminiApiKeys)
      .where(eq(geminiApiKeys.status, "AKTIF"))
      .orderBy(asc(geminiApiKeys.prioritas));
    return hasil as GeminiKeyRecord[];
  },

  async ambilKeyUntukRotasi(): Promise<GeminiKeyRecord[]> {
    const sekarang = new Date();
    const hasil = await db
      .select()
      .from(geminiApiKeys)
      .where(
        or(
          eq(geminiApiKeys.status, "AKTIF"),
          and(
            eq(geminiApiKeys.status, "LIMIT"),
            lt(geminiApiKeys.limitResetPada, sekarang),
          ),
        ),
      )
      .orderBy(asc(geminiApiKeys.prioritas));
    return hasil as GeminiKeyRecord[];
  },

  async tandaiLimit(id: string, resetDalamMenit: number = 60): Promise<void> {
    const resetPada = new Date(Date.now() + resetDalamMenit * 60 * 1000);
    await db
      .update(geminiApiKeys)
      .set({ status: "LIMIT", limitResetPada: resetPada, updatedAt: new Date() })
      .where(eq(geminiApiKeys.id, id));
  },

  async tandaiError(id: string, pesanError: string): Promise<void> {
    await db
      .update(geminiApiKeys)
      .set({
        status: "ERROR",
        terakhirError: new Date(),
        pesanError,
        errorCount: db.$count(geminiApiKeys, eq(geminiApiKeys.id, id)),
        updatedAt: new Date(),
      })
      .where(eq(geminiApiKeys.id, id));
  },

  async catatPenggunaan(id: string): Promise<void> {
    await db
      .update(geminiApiKeys)
      .set({
        terakhirDigunakan: new Date(),
        status: "AKTIF",
        updatedAt: new Date(),
      })
      .where(eq(geminiApiKeys.id, id));
  },

  async simpanKey(data: typeof geminiApiKeys.$inferInsert): Promise<GeminiKeyRecord> {
    const [hasil] = await db.insert(geminiApiKeys).values(data).returning();
    return hasil as GeminiKeyRecord;
  },

  async daftarSemua(): Promise<GeminiKeyRecord[]> {
    return db.select().from(geminiApiKeys).orderBy(asc(geminiApiKeys.prioritas)) as Promise<GeminiKeyRecord[]>;
  },

  async ubahStatus(id: string, status: typeof geminiApiKeys.$inferInsert["status"]): Promise<void> {
    await db
      .update(geminiApiKeys)
      .set({ status, updatedAt: new Date() })
      .where(eq(geminiApiKeys.id, id));
  },

  async hapus(id: string): Promise<void> {
    await db.delete(geminiApiKeys).where(eq(geminiApiKeys.id, id));
  },

  async cekDuplikat(apiKeyTerenkripsi: string): Promise<boolean> {
    const hasil = await db
      .select({ id: geminiApiKeys.id })
      .from(geminiApiKeys)
      .where(eq(geminiApiKeys.apiKeyTerenkripsi, apiKeyTerenkripsi))
      .limit(1);
    return hasil.length > 0;
  },
};
