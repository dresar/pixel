import { db } from "../../config/database";
import { aiConversations, aiMessages, aiUsageLogs } from "../../database/schema";
import { eq, desc, asc } from "drizzle-orm";
import type { AiConversation, AiMessage } from "../../database/schema";

export const aiRepository = {
  async buatPercakapan(data: typeof aiConversations.$inferInsert): Promise<AiConversation> {
    const [hasil] = await db.insert(aiConversations).values(data).returning();
    return hasil;
  },

  async ambilPercakapan(id: string): Promise<AiConversation | null> {
    const [hasil] = await db.select().from(aiConversations).where(eq(aiConversations.id, id)).limit(1);
    return hasil ?? null;
  },

  async daftarPercakapanUser(userId: string, limit: number = 20): Promise<AiConversation[]> {
    return db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.userId, userId))
      .orderBy(desc(aiConversations.updatedAt))
      .limit(limit);
  },

  async simpanPesan(data: typeof aiMessages.$inferInsert): Promise<AiMessage> {
    const [hasil] = await db.insert(aiMessages).values(data).returning();
    return hasil;
  },

  async ambilPesanPercakapan(conversationId: string): Promise<AiMessage[]> {
    return db
      .select()
      .from(aiMessages)
      .where(eq(aiMessages.conversationId, conversationId))
      .orderBy(asc(aiMessages.createdAt));
  },

  async catatLog(data: typeof aiUsageLogs.$inferInsert): Promise<void> {
    await db.insert(aiUsageLogs).values(data);
  },
};
