import { db } from "../config/database";
import { geminiApiKeys } from "../database/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { dekripsiApiKey } from "../features/api-keys/api-keys.crypto";
import { eq } from "drizzle-orm";

async function testAllGeminiKeys() {
  console.log("=== MEMULAI PENGUJIAN SEMUA API KEY GEMINI DAFTAR DATABASE ===");
  const keys = await db.select().from(geminiApiKeys).where(eq(geminiApiKeys.status, "AKTIF"));
  console.log(`Ditemukan ${keys.length} API key berstatus AKTIF di database.`);

  const testModels = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash", "gemini-1.5-pro"];
  let totalSukses = 0;
  let totalGagal = 0;

  for (let i = 0; i < keys.length; i++) {
    const keyRecord = keys[i];
    let keyDecrypted = "";
    try {
      keyDecrypted = dekripsiApiKey(keyRecord.apiKeyTerenkripsi);
    } catch (e: any) {
      console.log(`❌ [Key: ${keyRecord.nama}] Gagal dekripsi: ${e.message}`);
      totalGagal++;
      continue;
    }

    let sukses = false;
    let modelSukses = "";
    let responsTeks = "";

    for (const modelName of testModels) {
      try {
        const client = new GoogleGenerativeAI(keyDecrypted);
        const model = client.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Balas dengan kata 'OK' jika tes berhasil.");
        responsTeks = result.response.text().trim();
        sukses = true;
        modelSukses = modelName;
        break;
      } catch (err: any) {
        if (i < 5) console.log(`   └─ Model ${modelName} error: ${err.message?.slice(0, 150)}`);
      }
    }

    if (sukses) {
      console.log(`✅ [Key: ${keyRecord.nama}] SUKSES (${modelSukses}): "${responsTeks.slice(0, 30)}"`);
      totalSukses++;
    } else {
      console.log(`❌ [Key: ${keyRecord.nama}] GAGAL di semua model standard!`);
      totalGagal++;
      // Reset status error di db atau pindahkan ke urutan terakhir jika perlu
    }
  }

  console.log(`\n==================================================`);
  console.log(`HASIL AKHIR TEST ROTASI: ${totalSukses} SUKSES / ${totalGagal} GAGAL dari ${keys.length} Key.`);
  console.log(`==================================================\n`);
  process.exit(0);
}

testAllGeminiKeys();
