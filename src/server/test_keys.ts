import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "./config/database.js";
import { apiKeys } from "./database/schema/ai.schema.js";
import { dekripsi } from "./shared/utils/crypto.js";

async function main() {
  console.log("=== BREVET AI 2026 — GEMINI HEALTH CHECK ===");

  const envKey = process.env.GEMINI_API_KEY;
  if (envKey && envKey.startsWith("AIza")) {
    console.log(`[ENV KEY] Found valid API key starting with AIza... (len: ${envKey.length})`);
    try {
      const genAI = new GoogleGenerativeAI(envKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const res = await model.generateContent("Test connection");
      console.log(`[ENV KEY] Test Status: ✅ ACTIVE (${res.response.text().trim()})`);
    } catch (e: any) {
      console.log(`[ENV KEY] Test Status: ❌ FAILED (${e.message})`);
    }
  } else {
    console.log(`[ENV KEY] No raw AIza API key in .env`);
  }

  const allDbKeys = await db.select().from(apiKeys);
  const validDbKeys = allDbKeys.filter(k => {
    const dec = dekripsi(k.apiKeyTerenkripsi);
    return dec && dec.trim().startsWith("AIza");
  });

  console.log(`\n[DB KEYS STATS]`);
  console.log(`Total rows in DB: ${allDbKeys.length}`);
  console.log(`Valid Google API Keys (AIza...): ${validDbKeys.length}`);

  process.exit(0);
}

main().catch(console.error);
