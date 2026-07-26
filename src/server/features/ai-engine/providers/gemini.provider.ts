import { GoogleGenerativeAI } from "@google/generative-ai";
import { geminiKeyRotator } from "./key-rotator";
import { logger } from "../../../shared/logger/logger";
import { ExternalServiceError } from "../../../shared/errors/AppError";
import { env } from "../../../config/env";

const CANDIDATE_MODELS = [
  env.geminiModel || "gemini-3.1-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];
const MAX_RETRIES = 5;

type GeminiRequest = {
  prompt: string;
  systemInstruction?: string;
  maxOutputTokens?: number;
};

type GeminiResponse = {
  teks: string;
  keyIdDigunakan: string;
  tokenPerkiraan?: number;
};

export async function panggilGemini(request: GeminiRequest): Promise<GeminiResponse> {
  let percobaan = 0;

  while (percobaan < MAX_RETRIES) {
    const keySesi = await geminiKeyRotator.ambilKeyBerikutnya();
    const mulai = Date.now();
    const rawModel = CANDIDATE_MODELS[percobaan % CANDIDATE_MODELS.length];
    const targetModel = rawModel.toLowerCase().trim().replace(/\s+/g, "-");

    try {
      const client = new GoogleGenerativeAI(keySesi.apiKeyDecrypted);
      const model = client.getGenerativeModel({
        model: targetModel,
        systemInstruction: request.systemInstruction,
      });

      const result = await model.generateContent(request.prompt);
      const teks = result.response.text();
      const durasiMs = Date.now() - mulai;

      await geminiKeyRotator.laporkanSukses(keySesi.record.id);
      logger.ai("Gemini: permintaan berhasil", { keyId: keySesi.record.id, model: targetModel, durasiMs });

      return {
        teks,
        keyIdDigunakan: keySesi.record.id,
        tokenPerkiraan: Math.ceil(request.prompt.length / 4),
      };
    } catch (error: unknown) {
      const pesanError = error instanceof Error ? error.message : String(error);
      const adalahRateLimit =
        pesanError.includes("429") ||
        pesanError.includes("RESOURCE_EXHAUSTED") ||
        pesanError.toLowerCase().includes("quota");

      if (adalahRateLimit) {
        await geminiKeyRotator.laporkanLimit(keySesi.record.id);
        percobaan++;
        logger.ai("Gemini: rate limit terdeteksi, mencoba key berikutnya", {
          percobaan,
          keyId: keySesi.record.id,
        });
        continue;
      }

      await geminiKeyRotator.laporkanError(keySesi.record.id, pesanError);
      percobaan++;

      if (percobaan >= MAX_RETRIES) {
        throw new ExternalServiceError("Asisten AI sedang tidak tersedia. Silakan coba beberapa saat lagi.");
      }
    }
  }

  throw new ExternalServiceError("Semua API key Gemini sedang tidak tersedia. Silakan tambahkan key baru.");
}
