/**
 * Centralized Environment Configuration
 * Semua akses env variable WAJIB melalui file ini — jangan akses process.env langsung di modul lain
 */

import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),

  // Auth
  BETTER_AUTH_SECRET: z.string().min(16, "BETTER_AUTH_SECRET minimal 16 karakter"),
  BASE_URL: z.string().url().default("http://localhost:3001"),

  // CORS — Frontend URL
  FRONTEND_URL: z.string().default("http://localhost:3000"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME wajib diisi"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY wajib diisi"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET wajib diisi"),

  // Gemini AI
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.0-flash"),

  // Security
  API_KEY_ENCRYPTION_SECRET: z.string().min(16).default("brevetai-fallback-secret-key-2026"),

  // Server
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errorMessages = result.error.errors
      .map((err) => `  [${err.path.join(".")}] ${err.message}`)
      .join("\n");
    console.error("❌ Konfigurasi environment tidak valid:\n" + errorMessages);
    // Di Vercel serverless, process.exit tidak bekerja — throw agar error terlihat di logs
    throw new Error("Invalid environment configuration:\n" + errorMessages);
  }
  return result.data;
}

export const env = loadEnv();
