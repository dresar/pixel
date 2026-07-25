import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { env } from "../../config/env";

const ALGORITHM = "aes-256-gcm";

function buatKunci(): Buffer {
  return scryptSync(env.apiKeyEncryptionSecret, "brevetai-salt", 32);
}

export function enkripsiApiKey(apiKey: string): string {
  const kunci = buatKunci();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, kunci, iv);
  const terenkripsi = Buffer.concat([cipher.update(apiKey, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${terenkripsi.toString("hex")}`;
}

export function dekripsiApiKey(terenkripsi: string): string {
  const kunci = buatKunci();
  const [ivHex, authTagHex, datHex] = terenkripsi.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const dat = Buffer.from(datHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, kunci, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(dat) + decipher.final("utf8");
}
