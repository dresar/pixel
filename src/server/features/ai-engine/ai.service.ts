import { panggilGemini } from "./providers/gemini.provider";
import { bangunPrompt } from "./prompts/prompt-builder";
import { aiRepository } from "./ai.repository";
import { logger } from "../../shared/logger/logger";
import type { PermintaanAiInput, PesanChatInput } from "./ai.schema";

type HasilAi = {
  respons: string;
  conversationId: string;
};

import { db } from "../../config/database";
import { modules, chapters, lessons } from "../../database/schema";
import { eq, inArray } from "drizzle-orm";

export const aiService = {
  async prosesPermintaan(input: PermintaanAiInput, userId: string): Promise<HasilAi> {
    const mulai = Date.now();

    const percakapan = await aiRepository.buatPercakapan({
      userId,
      aksi: input.aksi,
      lessonId: input.lessonId,
      moduleId: input.moduleId,
      judul: `${input.aksi} - ${new Date().toLocaleDateString("id-ID")}`,
    });

    await aiRepository.simpanPesan({
      conversationId: percakapan.id,
      peran: "USER",
      konten: input.kontenUtama,
    });

    const prompt = bangunPrompt(input.aksi, {
      kontenUtama: input.kontenUtama,
      konteksTambahan: input.konteksTambahan,
      jumlahItem: input.jumlahItem,
    });

    const hasilGemini = await panggilGemini({ prompt });

    await aiRepository.simpanPesan({
      conversationId: percakapan.id,
      peran: "ASSISTANT",
      konten: hasilGemini.teks,
      tokenPerkiraan: hasilGemini.tokenPerkiraan,
    });

    await aiRepository.catatLog({
      userId,
      apiKeyId: hasilGemini.keyIdDigunakan,
      aksi: input.aksi,
      durasiMs: Date.now() - mulai,
      tokenPerkiraan: hasilGemini.tokenPerkiraan,
      sukses: "true",
      diCache: "false",
    });

    logger.ai("AI request selesai", { aksi: input.aksi, userId, conversationId: percakapan.id });

    return { respons: hasilGemini.teks, conversationId: percakapan.id };
  },

  async lanjutkanChat(input: PesanChatInput, userId: string): Promise<HasilAi> {
    let conversationId = input.conversationId;

    if (!conversationId) {
      const percakapan = await aiRepository.buatPercakapan({
        userId,
        aksi: "CHAT",
        lessonId: input.lessonId,
        moduleId: input.modulId,
        judul: `Chat - ${new Date().toLocaleDateString("id-ID")}`,
      });
      conversationId = percakapan.id;
    }

    const riwayatPesan = await aiRepository.ambilPesanPercakapan(conversationId);

    await aiRepository.simpanPesan({
      conversationId,
      peran: "USER",
      konten: input.pesan,
    });

    let konteksModul = "";
    if (input.modulId) {
      try {
        const [targetModul] = await db.select().from(modules).where(eq(modules.id, input.modulId)).limit(1);
        if (targetModul) {
          const chaps = await db.select().from(chapters).where(eq(chapters.moduleId, input.modulId));
          const chapIds = chaps.map((c) => c.id);
          if (chapIds.length > 0) {
            const mLessons = await db.select().from(lessons).where(inArray(lessons.chapterId, chapIds)).limit(10);
            const ringkasanPelajaran = mLessons
              .map((l) => `[Materi: ${l.judul}]\n${JSON.stringify(l.kontenJson).slice(0, 600)}`)
              .join("\n\n");
            konteksModul = `\n\nFOKUS MATERI UTAMA MODUL ("${targetModul.judul}"):\n${ringkasanPelajaran}`;
          }
        }
      } catch (err) {
        logger.error("Gagal memuat konteks modul untuk chat", err);
      }
    }

    const konteksRiwayat = riwayatPesan
      .slice(-6)
      .map((m) => `${m.peran === "USER" ? "Siswa" : "Instruktur"}: ${m.konten}`)
      .join("\n");

    const prompt = bangunPrompt("CHAT", {
      kontenUtama: input.pesan,
      konteksTambahan: `${konteksRiwayat}${konteksModul}`,
    });

    const hasilGemini = await panggilGemini({ prompt });

    await aiRepository.simpanPesan({
      conversationId,
      peran: "ASSISTANT",
      konten: hasilGemini.teks,
      tokenPerkiraan: hasilGemini.tokenPerkiraan,
    });

    return { respons: hasilGemini.teks, conversationId };
  },

  async riwayatPercakapan(userId: string) {
    return aiRepository.daftarPercakapanUser(userId);
  },

  async detailPercakapan(conversationId: string, userId: string) {
    const percakapan = await aiRepository.ambilPercakapan(conversationId);
    if (!percakapan || percakapan.userId !== userId) return null;
    const pesan = await aiRepository.ambilPesanPercakapan(conversationId);
    return { percakapan, pesan };
  },
};
