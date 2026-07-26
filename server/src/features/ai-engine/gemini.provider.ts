/**
 * Gemini AI Provider — Multi-Key Rotation Engine 2026
 * Mendukung Rotasi API Key Otomatis dari Database (gemini_api_keys) & Env Variable
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
      if (dec && dec.trim().length > 10) {
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
  const targetModel = options.model || env.GEMINI_MODEL || "gemini-3.1-flash-lite";
  const keyList = await dapatkanDaftarApiKeyRotasi();

  logger.info(`Memulai eksekusi Gemini AI (Model: ${targetModel}, Tersedia ${keyList.length} API Key)`);

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

      const result = await geminiModel.generateContent(options.prompt);
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
              terakhirDigunakan: new Date(),
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
              gagalHit: ((activeKey as any).gagalHit || 0) + 1,
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
  const fallbackAnswer = hasilkanFallbackJawaban(options.prompt);

  return {
    teks: fallbackAnswer,
  };
}

/**
 * Engine Pengetahuan Internal BrevetAI 2026 (UU HPP, PMK 168/2023 TER, Coretax DJP)
 */
function hasilkanFallbackJawaban(prompt: string): string {
  const p = prompt.toLowerCase();

  if (p.includes("pasal 17") || p.includes("progresif") || p.includes("tarif")) {
    return `Berdasarkan UU HPP No. 7/2021, tarif PPh Pasal 17 Orang Pribadi terbagi menjadi 5 lapisan progresif:\n\n` +
      `1. PKP s.d Rp 60 Juta: **5%**\n` +
      `2. PKP > Rp 60 Juta - Rp 250 Juta: **15%**\n` +
      `3. PKP > Rp 250 Juta - Rp 500 Juta: **25%**\n` +
      `4. PKP > Rp 500 Juta - Rp 5 Miliar: **30%**\n` +
      `5. PKP > Rp 5 Miliar: **35%**\n\n` +
      `Sistem ini membuat pemotongan pajak lebih adil. Semakin tinggi penghasilan kena pajakmu, persentase yang dikenakan pada lapisan atasnya akan meningkat secara berlapis.`;
  }

  if (p.includes("ter") || p.includes("pmk 168") || p.includes("21")) {
    return `Berdasarkan PMK 168/2023 yang berlaku mulai 1 Januari 2024, pemotongan PPh 21 menggunakan skema **Tarif Efektif Rata-rata (TER)**:\n\n` +
      `• **TER Bulanan**: Terbagi menjadi Kategori A, B, dan C (tergantung status PTKP karyawan).\n` +
      `• **Masa Desember**: Dihitung kembali menggunakan tarif progresif Pasal 17 UU PPh dikurangi total TER yang sudah dipotong Januari-November.\n\n` +
      `Dengan skema TER ini, perhitungan PPh 21 bulanan karyawan jauh lebih praktis dan tidak membingungkan!`;
  }

  if (p.includes("coretax") || p.includes("nik") || p.includes("npwp")) {
    return `Mulai 2026, sistem Coretax DJP mengintegrasikan **NIK sebagai NPWP** secara penuh bagi Wajib Pajak Orang Pribadi.\n\n` +
      `Semua layanan perpajakan, mulai dari pembuatan bukti potong hingga pelaporan SPT Tahunan, dapat dilakukan secara terpadu melalui portal Coretax DJP dengan autentikasi NIK 16 digit.`;
  }

  if (p.includes("definisi") || p.includes("apa itu pajak") || p.includes("ciri")) {
    return `Berdasarkan UU KUP No. 28/2007, **Pajak** adalah kontribusi wajib kepada negara yang bersifat memaksa tanpa imbalan langsung.\n\n` +
      `Ciri utama pajak:\n` +
      `1. **Wajib & Memaksa** berdasarkan UU.\n` +
      `2. **Non-kontraprestasi**: Kamu tidak mendapat imbalan langsung saat itu juga.\n` +
      `3. **Guna Publik**: Dana dialokasikan untuk pembangunan jalan, sekolah, rumah sakit, dan fasilitas negara.`;
  }

  return `Tentu! Berdasarkan ketentuan perpajakan Indonesia terbaru (UU HPP No. 7/2021 dan PMK 168/2023):\n\n` +
    `Setiap transaksi perpajakan selalu mengacu pada prinsip kepastian hukum, keadilan, dan kemudahan administrasi. ` +
    `Jika kamu ingin menghitung contoh kasus tertentu atau mengecek dasar hukumnya, silakan sebutkan angka atau topik yang ingin kamu simulasikan bersama!`;
}
