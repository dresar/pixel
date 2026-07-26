/**
 * Quiz API Functions — Frontend calls ke backend server
 */

import { api } from "../lib/api-client";

// ── Kuis ──────────────────────────────────────────────────────────────────────

export async function getDaftarKuis() {
  return api.get("/api/kuis");
}

export async function getDetailKuis(data: { slug: string }) {
  return api.get(`/api/kuis/${data.slug}`);
}

export const getKuisBySlug = getDetailKuis;

export async function kirimHasilKuis(data: {
  quizId: string;
  skor: number;
  nilaiPersen: number;
  lulus: boolean;
  durasiDetik: number;
}) {
  return api.post("/api/kuis/hasil", data);
}

export async function evaluasiJawabanEsaiAI(data: {
  questionId: string;
  jawabanSiswa: string;
}) {
  return api.post("/api/kuis/esai/evaluasi", data);
}

// ── Admin: Kuis ───────────────────────────────────────────────────────────────

export async function tambahKuisAdmin(data: {
  judul: string;
  deskripsi?: string;
  durasi?: number;
  nilaiLulus?: number;
  lessonId?: string;
}) {
  return api.post("/api/kuis/admin", data);
}

export const buatKuisAdmin = tambahKuisAdmin;

export async function updateKuisAdmin(data: {
  id: string;
  judul: string;
  deskripsi?: string;
  batasWaktuMenit?: number;
  nilaiMinimumLulus?: number;
  aktif?: boolean;
}) {
  const { id, ...body } = data;
  return api.patch(`/api/kuis/admin/${id}`, body);
}

export async function hapusKuisAdmin(data: { id: string }) {
  return api.delete(`/api/kuis/admin/${data.id}`);
}

export async function imporKuisLengkapAdmin(data: {
  moduleId?: string;
  judul: string;
  deskripsi?: string;
  batasWaktuMenit?: number;
  nilaiMinimumLulus?: number;
  pertanyaan: Array<{
    teksPertanyaan: string;
    tipeSoal?: string;
    pembahasan?: string;
    kunciJawabanEsai?: string;
    urutan?: number;
    opsi?: Array<{ kode?: string; teks: string; isBenar: boolean }>;
  }>;
}) {
  return api.post("/api/kuis/admin/impor", data);
}

export async function buatKuisUjiKompetensiRandom(data?: {
  judul?: string;
  deskripsi?: string;
}) {
  return api.post("/api/kuis/admin/random", data);
}

export async function generateSoalAiAdmin(data: { quizId: string }) {
  return api.post(`/api/kuis/admin/${data.quizId}/generate-ai`);
}
