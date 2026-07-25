export type GeminiApiKeyStatus = "AKTIF" | "NONAKTIF" | "LIMIT" | "ERROR";

export type GeminiKeyRecord = {
  id: string;
  nama: string;
  apiKeyTerenkripsi: string;
  status: GeminiApiKeyStatus;
  prioritas: number;
  totalRequest: number;
  errorCount: number;
  limitResetPada: Date | null;
  terakhirDigunakan: Date | null;
};

export type ApiKeyImportItem = {
  nama: string;
  apiKey: string;
  prioritas?: number;
};

export type ImportApiKeyResult = {
  berhasil: number;
  gagal: number;
  duplikat: number;
  detail: Array<{ nama: string; status: "berhasil" | "gagal" | "duplikat"; pesan?: string }>;
};
