/**
 * Modules API Functions — Frontend calls ke backend server
 * Semua fungsi ini memanggil backend di VITE_API_URL/api/...
 */

import { api, type ApiResponse } from "../lib/api-client";

// ── Types ─────────────────────────────────────────────────────────────────────
export const BuatModulSchema_Types = {
  levelId: "",
  judul: "",
  deskripsi: "",
  tingkatKesulitan: "DASAR" as "DASAR" | "MENENGAH" | "LANJUT",
  estimasiMenit: 0,
  urutan: 0,
};

// ── Roadmap ───────────────────────────────────────────────────────────────────

export async function getRoadmap() {
  return api.get("/api/roadmap");
}

export async function getRealtimeRoadmapData() {
  return api.get("/api/roadmap/realtime");
}

// ── Materi Siswa ──────────────────────────────────────────────────────────────

export async function getDaftarMateriSiswa() {
  return api.get("/api/materi");
}

export async function getKontenPelajaran(data: { slug: string }) {
  return api.get(`/api/materi/${data.slug}`);
}

// ── Modul ─────────────────────────────────────────────────────────────────────

export async function getDaftarModul(data?: {
  levelId?: string;
  status?: string;
  cari?: string;
  halaman?: number;
  per_halaman?: number;
}) {
  return api.get("/api/modules", data as any);
}

export async function getDetailModul(data: { slug: string }) {
  return api.get(`/api/modules/${data.slug}`);
}

export async function getDaftarSemuaLesson() {
  return api.get("/api/materi");
}

export async function getDaftarSemuaChapter() {
  return api.get("/api/modules");
}

// ── Admin: Modul ──────────────────────────────────────────────────────────────

export async function buatModulBaru(data: {
  levelId: string;
  judul: string;
  deskripsi?: string;
  tingkatKesulitan: "DASAR" | "MENENGAH" | "LANJUT";
  estimasiMenit: number;
  urutan: number;
}) {
  return api.post("/api/admin/modules", data);
}

export async function terbitkanModul(data: { id: string }) {
  return api.post(`/api/admin/modules/${data.id}/terbitkan`);
}

export async function hapusModulAdmin(data: { id: string }) {
  return api.delete(`/api/admin/modules/${data.id}`);
}

export async function imporBanyakModulAdmin(data: {
  modulList: Array<{
    judul: string;
    deskripsi?: string;
    tingkatKesulitan?: string;
    urutan?: number;
    bab?: Array<{
      judul: string;
      deskripsi?: string;
      urutan?: number;
      materi?: Array<{ judul: string; slug?: string; kontenJson?: unknown }>;
    }>;
  }>;
}) {
  return api.post("/api/admin/modules/impor", data);
}

// ── Admin: Chapter ────────────────────────────────────────────────────────────

export async function tambahChapterAdmin(data: {
  moduleId: string;
  judul: string;
  deskripsi?: string;
  urutan?: number;
}) {
  return api.post("/api/admin/chapters", data);
}

export async function updateChapterAdmin(data: {
  id: string;
  judul?: string;
  deskripsi?: string;
  urutan?: number;
}) {
  const { id, ...body } = data;
  return api.patch(`/api/admin/chapters/${id}`, body);
}

export async function hapusChapterAdmin(data: { id: string }) {
  return api.delete(`/api/admin/chapters/${data.id}`);
}

// ── Admin: Lesson/Materi ──────────────────────────────────────────────────────

export async function updateLessonAdmin(data: {
  id: string;
  judul?: string;
  gambarUrl?: string;
  promptGambar?: string;
  statusPublikasi?: string;
  kontenJson?: unknown;
}) {
  const { id, ...body } = data;
  return api.patch(`/api/admin/materi/${id}`, body);
}

export async function generatePromptGambarMateriAdmin(data: { id: string }) {
  return api.post(`/api/admin/materi/${data.id}/prompt-gambar`);
}
