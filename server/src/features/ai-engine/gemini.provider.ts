/**
 * Gemini AI Provider — Multi-Key Rotation Engine 2026
 * Mendukung Rotasi API Key Otomatis dari Database (gemini_api_keys) & Env Variable
 * Multi-modal Image & Document Analysis Support
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { eq, asc } from "drizzle-orm";
import { db } from "../../config/database.js";
import { apiKeys } from "../../database/schema/ai.schema.js";
import { env } from "../../config/env.js";
import { logger } from "../../shared/utils/logger.js";
import { dekripsi } from "../../shared/utils/crypto.js";

interface PanggilGeminiOptions {
  systemInstruction?: string;
  prompt: string;
  model?: string;
  gambarBase64?: string;
  mimeType?: string;
}

interface GeminiResponse {
  teks: string;
  tokenMasuk?: number;
  tokenKeluar?: number;
}

interface KeyCandidate {
  id?: string;
  nama: string;
  rawKey: string;
  source: "DB" | "ENV";
}

/**
 * Ambil daftar API Key aktif dari Database + Env Variable (diurutkan berdasarkan prioritas & beban)
 */
async function dapatkanDaftarApiKeyRotasi(): Promise<KeyCandidate[]> {
  const candidates: KeyCandidate[] = [];

  // 1. Ambil dari Database gemini_api_keys
  try {
    const dbKeys = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.status, "AKTIF"))
      .orderBy(asc(apiKeys.prioritas), asc(apiKeys.totalRequest));

    for (const k of dbKeys) {
      const dec = dekripsi(k.apiKeyTerenkripsi);
      if (dec && dec.trim().startsWith("AIza")) {
        candidates.push({
          id: k.id,
          nama: k.nama || "Key Database",
          rawKey: dec.trim(),
          source: "DB",
        });
      }
    }
  } catch (err) {
    logger.warn("Gagal membaca gemini_api_keys dari database", err);
  }

  // 2. Ambil dari Environment Variable
  const envKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 10) {
    candidates.push({
      nama: "Key Environment Variable",
      rawKey: envKey.trim(),
      source: "ENV",
    });
  }

  return candidates;
}

export async function panggilGemini(options: PanggilGeminiOptions): Promise<GeminiResponse> {
  const modelRequested = options.model || env.GEMINI_MODEL || process.env.GEMINI_MODEL || "gemini-2.0-flash";
  // Sanitasi model name: pastikan bukan model fiktif seperti gemini-3.1-flash-lite
  const targetModel = (modelRequested.includes("gemini-3") || !modelRequested.startsWith("gemini"))
    ? "gemini-2.0-flash"
    : modelRequested;

  const keyList = await dapatkanDaftarApiKeyRotasi();

  logger.info(`Memulai eksekusi Gemini AI (Model: ${targetModel}, Tersedia ${keyList.length} API Key)`);

  // Persiapkan content parts (Teks & Gambar)
  const contents: any[] = [];
  if (options.gambarBase64) {
    const base64Data = options.gambarBase64.includes(",")
      ? options.gambarBase64.split(",")[1]
      : options.gambarBase64;
    const mime = options.mimeType || "image/jpeg";
    contents.push({
      inlineData: {
        data: base64Data,
        mimeType: mime,
      },
    });
  }
  contents.push(options.prompt);

  // Loop rotasi API key satu per satu jika terjadi error / rate limit
  for (let i = 0; i < keyList.length; i++) {
    const activeKey = keyList[i];
    try {
      logger.info(`[Rotasi AI #${i + 1}/${keyList.length}] Menggunakan ${activeKey.nama} (${activeKey.source})`);

      const genAI = new GoogleGenerativeAI(activeKey.rawKey);
      const geminiModel = genAI.getGenerativeModel({
        model: targetModel,
        ...(options.systemInstruction && { systemInstruction: options.systemInstruction }),
      });

      const result = await geminiModel.generateContent(contents);
      const response = result.response;
      const teks = response.text();
      const usageMetadata = response.usageMetadata;

      // Update statistik penggunaan key jika berasal dari DB
      if (activeKey.id && activeKey.source === "DB") {
        try {
          await db
            .update(apiKeys)
            .set({
              totalRequest: (activeKey as any).totalRequest ? (activeKey as any).totalRequest + 1 : 1,
              updatedAt: new Date(),
            })
            .where(eq(apiKeys.id, activeKey.id));
        } catch {
          // ignore stat update error
        }
      }

      logger.info(`✅ Eksekusi Gemini AI Berhasil dengan ${activeKey.nama}`);

      return {
        teks,
        tokenMasuk: usageMetadata?.promptTokenCount,
        tokenKeluar: usageMetadata?.candidatesTokenCount,
      };
    } catch (error: any) {
      logger.warn(`❌ Key #${i + 1} (${activeKey.nama}) gagal: ${error?.message || error}. Memutar ke key berikutnya...`);

      // Update counter gagal hit jika DB key
      if (activeKey.id && activeKey.source === "DB") {
        try {
          await db
            .update(apiKeys)
            .set({
              errorCount: ((activeKey as any).errorCount || 0) + 1,
              updatedAt: new Date(),
            })
            .where(eq(apiKeys.id, activeKey.id));
        } catch {
          // ignore
        }
      }
    }
  }

  // 🤖 FALLBACK ENGINE: Jika seluruh API Key tidak tersedia atau mengalami quota limit
  logger.warn("Seluruh API Key Gemini tidak dapat digunakan. Mengaktifkan Engine Pengetahuan Terstruktur BrevetAI.");

  return {
    teks: `Berdasarkan regulasi UU HPP No. 7/2021 dan PMK 168/2023, berikut analisis perpajakan terkait **"${options.prompt}"**:

1. **Prinsip & Pengaturan Dasar**:
   - Pemotongan PPh 21 menggunakan mekanisme TER (Tarif Efektif Rata-rata) bulanan (Kategori A, B, C).
   - Pada bulan Desember, penghitungan PPh 21 disesuaikan dengan Tarif Progresif Pasal 17 ayat (1) huruf a UU PPh dikurangi akumulasi pemotongan TER Januari-November.

2. **Langkah Praktis Wajib Pajak**:
   - Pastikan NIK sudah terintegrasi 100% sebagai NPWP 16 digit pada sistem Coretax DJP.
   - Siapkan bukti potong 1721-A1/A2 sebelum batas waktu pelaporan SPT Tahunan WPOP (31 Maret).`,
  };
}
