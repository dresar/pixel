const required = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "API_KEY_ENCRYPTION_SECRET",
  "BASE_URL",
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`[Config] Variabel lingkungan wajib tidak ditemukan: ${key}`);
  }
}

export const env = {
  databaseUrl: process.env.DATABASE_URL!,
  betterAuthSecret: process.env.BETTER_AUTH_SECRET!,
  baseUrl: process.env.BASE_URL!,
  apiKeyEncryptionSecret: process.env.API_KEY_ENCRYPTION_SECRET!,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "demo",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "1234567890",
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? "secret",
  },
  nodeEnv: (process.env.NODE_ENV ?? "development") as "development" | "production" | "test",
  isDev: process.env.NODE_ENV !== "production",
} as const;
