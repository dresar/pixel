import { panggilGemini } from "./providers/gemini.provider";
import { bangunPrompt } from "./prompts/prompt-builder";
import { aiRepository } from "./ai.repository";
import { logger } from "../../shared/logger/logger";
import type { PermintaanAiInput, PesanChatInput } from "./ai.schema";

type HasilAi = {
  respons: string;
  conversationId: string;
};

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

    const konteksRiwayat = riwayatPesan
      .slice(-6)
      .map((m) => `${m.peran === "USER" ? "Siswa" : "Instruktur"}: ${m.konten}`)
      .join("\n");

    const prompt = bangunPrompt("CHAT", {
      kontenUtama: input.pesan,
      konteksTambahan: konteksRiwayat,
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
