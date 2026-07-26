import fs from "fs";
import path from "path";
import { db } from "../config/database";
import { geminiApiKeys } from "./schema/api-keys.schema";
import { enkripsiApiKey } from "../features/api-keys/api-keys.crypto";
import { eq } from "drizzle-orm";

async function seedGeminiKeysFromFile() {
  console.log("🔑 Membaca file onekeyhub_export_all_1785002741204.txt...");

  const filePath = path.join(process.cwd(), "onekeyhub_export_all_1785002741204.txt");
  if (!fs.existsSync(filePath)) {
    console.error("❌ File tidak ditemukan:", filePath);
    return;
  }

  const rawContent = fs.readFileSync(filePath, "utf-8");
  const lines = rawContent.split("\n");

  const extractedKeys: { nama: string; apiKey: string }[] = [];

  let count = 1;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Filter key khusus gemini
    if (trimmed.toLowerCase().includes("(gemini)")) {
      const parts = trimmed.split("#");
      const keyOnly = parts[0].trim();
      if (keyOnly && keyOnly.length > 5) {
        extractedKeys.push({
          nama: `Gemini Key #${count.toString().padStart(2, "0")}`,
          apiKey: keyOnly,
        });
        count++;
      }
    }
  }

  console.log(`📌 Ditemukan ${extractedKeys.length} Gemini API Key dari file export.`);

  let berhasil = 0;
  let duplikat = 0;
  let gagal = 0;

  for (const item of extractedKeys) {
    try {
      const terenkripsi = enkripsiApiKey(item.apiKey);

      // Cek apakah key sudah ada
      const existing = await db
        .select()
        .from(geminiApiKeys)
        .where(eq(geminiApiKeys.apiKeyTerenkripsi, terenkripsi))
        .limit(1);

      if (existing.length > 0) {
        duplikat++;
        console.log(`  ⚠️  Skip duplikat: ${item.nama}`);
        continue;
      }

      await db.insert(geminiApiKeys).values({
        nama: item.nama,
        apiKeyTerenkripsi: terenkripsi,
        status: "AKTIF",
        prioritas: 0,
      });

      berhasil++;
      console.log(`  ✅ Berhasil menyimpan ${item.nama} (${item.apiKey.slice(0, 15)}...)`);
    } catch (err: any) {
      gagal++;
      console.error(`  ❌ Gagal menyimpan ${item.nama}:`, err.message);
    }
  }

  console.log("\n=============================================");
  console.log(`🎉 Proses Import Gemini Keys Selesai!`);
  console.log(`   - Berhasil Diimpor: ${berhasil} Key`);
  console.log(`   - Duplikat/Lewati: ${duplikat} Key`);
  console.log(`   - Gagal: ${gagal} Key`);
  console.log("=============================================\n");
}

seedGeminiKeysFromFile().catch(console.error);
