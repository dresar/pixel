import { apiKeysRepository } from "./api-keys.repository";
import { enkripsiApiKey, dekripsiApiKey } from "./api-keys.crypto";
import type { ImportApiKeyResult, ApiKeyImportItem, GeminiKeyRecord } from "./api-keys.types";
import { logger } from "../../shared/logger/logger";
import { NotFoundError } from "../../shared/errors/AppError";

type ApiKeyPublik = Omit<GeminiKeyRecord, "apiKeyTerenkripsi"> & { apiKeyAman: string };

export const apiKeysService = {
  async tambahSatuKey(input: ApiKeyImportItem, userId: string): Promise<{ id: string; nama: string }> {
    const terenkripsi = enkripsiApiKey(input.apiKey);
    const isDuplikat = await apiKeysRepository.cekDuplikat(terenkripsi);
    if (isDuplikat) throw new Error("API key ini sudah ada di sistem.");
    const hasil = await apiKeysRepository.simpanKey({
      nama: input.nama,
      apiKeyTerenkripsi: terenkripsi,
      prioritas: input.prioritas ?? 0,
      status: "AKTIF",
      ditambahkanOleh: userId,
    });
    logger.auth("API key baru ditambahkan", { nama: input.nama, userId });
    return { id: hasil.id, nama: hasil.nama };
  },

  async importBanyakKey(items: ApiKeyImportItem[], userId: string): Promise<ImportApiKeyResult> {
    const hasil: ImportApiKeyResult = { berhasil: 0, gagal: 0, duplikat: 0, detail: [] };
    for (const item of items) {
      try {
        const terenkripsi = enkripsiApiKey(item.apiKey);
        const isDuplikat = await apiKeysRepository.cekDuplikat(terenkripsi);
        if (isDuplikat) {
          hasil.duplikat++;
          hasil.detail.push({ nama: item.nama, status: "duplikat", pesan: "Key sudah ada" });
          continue;
        }
        await apiKeysRepository.simpanKey({
          nama: item.nama,
          apiKeyTerenkripsi: terenkripsi,
          prioritas: item.prioritas ?? 0,
          status: "AKTIF",
          ditambahkanOleh: userId,
        });
        hasil.berhasil++;
        hasil.detail.push({ nama: item.nama, status: "berhasil" });
      } catch {
        hasil.gagal++;
        hasil.detail.push({ nama: item.nama, status: "gagal", pesan: "Gagal disimpan" });
      }
    }
    logger.auth("Import batch API key selesai", { berhasil: hasil.berhasil, gagal: hasil.gagal, userId });
    return hasil;
  },

  async daftarSemua(): Promise<ApiKeyPublik[]> {
    const keys = await apiKeysRepository.daftarSemua();
    return keys.map((k) => {
      const { apiKeyTerenkripsi, ...rest } = k as GeminiKeyRecord & { apiKeyTerenkripsi: string };
      return { ...rest, apiKeyAman: `${dekripsiApiKey(apiKeyTerenkripsi).slice(0, 8)}...` };
    });
  },

  async ubahStatus(id: string, status: "AKTIF" | "NONAKTIF"): Promise<void> {
    const keys = await apiKeysRepository.daftarSemua();
    const key = keys.find((k) => k.id === id);
    if (!key) throw new NotFoundError("API key tidak ditemukan.");
    await apiKeysRepository.ubahStatus(id, status);
  },

  async hapus(id: string): Promise<void> {
    const keys = await apiKeysRepository.daftarSemua();
    const key = keys.find((k) => k.id === id);
    if (!key) throw new NotFoundError("API key tidak ditemukan.");
    await apiKeysRepository.hapus(id);
    logger.auth("API key dihapus", { id });
  },
};
