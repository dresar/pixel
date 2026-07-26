import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { env } from "../../config/env.js";

const ALGORITHM = "aes-256-cbc";
const SECRET = env.API_KEY_ENCRYPTION_SECRET || "brevetai-fallback-secret-key-2026";
const KEY = scryptSync(SECRET, "salt-brevet-ai", 32);

export function enkripsi(text: string): string {
  if (!text) return "";
  try {
    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } catch {
    return text;
  }
}

export function dekripsi(text: string): string {
  if (!text) return "";
  if (!text.includes(":")) return text;
  try {
    const [ivHex, encryptedHex] = text.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return text;
  }
}
