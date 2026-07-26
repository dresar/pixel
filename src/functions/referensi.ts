/**
 * Referensi Hukum API Functions — Frontend calls ke backend server
 */

import { api } from "../lib/api-client";

export async function getReferensiHukum(data?: {
  cari?: string;
  kategori?: string;
}) {
  return api.get("/api/referensi", data);
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function tambahReferensiHukumAdmin(data: {
  nomorPeraturan: string;
  judul: string;
  kategori?: string;
  tahun?: string;
  ringkasan: string;
  kontenLengkap?: string;
  urlDokumen?: string;
}) {
  return api.post("/api/referensi/admin", data);
}

export async function hapusReferensiHukumAdmin(data: { id: string }) {
  return api.delete(`/api/referensi/admin/${data.id}`);
}

export async function imporBanyakReferensiAdmin(data: {
  items: Array<{
    nomorPeraturan: string;
    judul: string;
    kategori?: string;
    tahun?: string;
    ringkasan: string;
    kontenLengkap?: string;
    urlDokumen?: string;
  }>;
}) {
  return api.post("/api/referensi/admin/impor", data);
}

export async function generateReferensiAiAdmin(data: {
  topik: string;
  jumlah?: number;
}) {
  return api.post("/api/referensi/admin/generate-ai", data);
}
