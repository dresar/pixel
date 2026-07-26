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

  async tesKey(id: string): Promise<{ success: boolean; message: string }> {
    const keys = await apiKeysRepository.daftarSemua();
    const target = keys.find((k) => k.id === id);
    if (!target) throw new NotFoundError("API key tidak ditemukan.");

    const rawKey = dekripsiApiKey(target.apiKeyTerenkripsi);
    try {
      // 1. Coba sebagai API Key biasa (?key=...)
      let res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${rawKey}`);

      // 2. Jika key bertipe OAuth token (diawali AQ. atau mengembalikan 400/401 OAuth error), coba dengan header Bearer
      if (!res.ok && (rawKey.startsWith("AQ.") || res.status === 400 || res.status === 401)) {
        const resBearer = await fetch(`https://generativelanguage.googleapis.com/v1beta/models`, {
          headers: { Authorization: `Bearer ${rawKey}` },
        });
        if (resBearer.ok) {
          res = resBearer;
        }
      }

      if (res.ok) {
        await apiKeysRepository.setValidKey(id);
        return { success: true, message: `Key "${target.nama}" AKTIF & berfungsi (200 OK)` };
      } else {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData?.error?.message || `HTTP ${res.status} ${res.statusText}`;
        await apiKeysRepository.demoteKey(id, msg);
        return { success: false, message: `Key "${target.nama}" GAGAL (${msg}) — dipindahkan ke urutan terakhir.` };
      }
    } catch (err: any) {
      const msg = err.message || "Koneksi error";
      await apiKeysRepository.demoteKey(id, msg);
      return { success: false, message: `Key "${target.nama}" GAGAL (${msg}) — dipindahkan ke urutan terakhir.` };
    }
  },

  async tesSemuaKey(): Promise<{ total: number; ok: number; error: number }> {
    const keys = await apiKeysRepository.daftarSemua();
    let ok = 0;
    let error = 0;
    for (const k of keys) {
      const res = await this.tesKey(k.id);
      if (res.success) ok++;
      else error++;
    }
    return { total: keys.length, ok, error };
  },
};
