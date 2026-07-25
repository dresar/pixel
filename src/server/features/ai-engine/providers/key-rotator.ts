import { apiKeysRepository } from "../../api-keys/api-keys.repository";
import { dekripsiApiKey } from "../../api-keys/api-keys.crypto";
import type { GeminiKeyRecord } from "../../api-keys/api-keys.types";
import { logger } from "../../../shared/logger/logger";
import { ExternalServiceError } from "../../../shared/errors/AppError";

type KeySesi = {
  record: GeminiKeyRecord;
  apiKeyDecrypted: string;
};

class GeminiKeyRotator {
  private indeksRotasi: number = 0;
  private cacheKey: KeySesi[] = [];
  private cacheKadarluarsaPada: number = 0;
  private readonly CACHE_DURASI_MS = 5 * 60 * 1000;

  private async muatKeys(): Promise<KeySesi[]> {
    const sekarang = Date.now();
    if (this.cacheKey.length > 0 && sekarang < this.cacheKadarluarsaPada) {
      return this.cacheKey;
    }

    const records = await apiKeysRepository.ambilKeyUntukRotasi();
    if (records.length === 0) {
      throw new ExternalServiceError("Tidak ada API key Gemini yang aktif. Tambahkan key melalui menu Admin.");
    }

    this.cacheKey = records.map((r: GeminiKeyRecord) => ({
      record: r,
      apiKeyDecrypted: dekripsiApiKey(r.apiKeyTerenkripsi),
    }));
    this.cacheKadarluarsaPada = sekarang + this.CACHE_DURASI_MS;
    this.indeksRotasi = 0;

    logger.ai("Key Rotator: memuat ulang daftar API key", { jumlah: records.length });
    return this.cacheKey;
  }

  private invalidasiCache(): void {
    this.cacheKey = [];
    this.cacheKadarluarsaPada = 0;
  }

  async ambilKeyBerikutnya(): Promise<KeySesi> {
    const keys = await this.muatKeys();
    const key = keys[this.indeksRotasi % keys.length];
    this.indeksRotasi = (this.indeksRotasi + 1) % keys.length;
    return key;
  }

  async laporkanLimit(keyId: string): Promise<void> {
    logger.ai("Key Rotator: API key terkena rate limit, rotasi ke key berikutnya", { keyId });
    await apiKeysRepository.tandaiLimit(keyId, 60);
    this.invalidasiCache();
  }

  async laporkanError(keyId: string, pesan: string): Promise<void> {
    logger.ai("Key Rotator: API key mengalami error", { keyId, pesan });
    await apiKeysRepository.tandaiError(keyId, pesan);
    this.invalidasiCache();
  }

  async laporkanSukses(keyId: string): Promise<void> {
    await apiKeysRepository.catatPenggunaan(keyId);
  }
}

export const geminiKeyRotator = new GeminiKeyRotator();
