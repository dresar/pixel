/**
 * Prompt Studio Management Functions — Frontend calls ke backend server
 * Note: Fitur ini memanggil /api/prompt-studio/* di backend
 */

import { api } from "../lib/api-client";

export async function getDaftarPromptEngine() {
  return api.get("/api/prompt-studio");
}

export async function getDetailPromptEngine(data: { id: string }) {
  return api.get(`/api/prompt-studio/${data.id}`);
}

export async function buatPromptEngine(data: {
  nama: string;
  kodeEngine: string;
  kategoriEngine: string;
  deskripsi?: string;
  kontenTemplate: string;
  urutanKompilasi?: number;
  aktif?: boolean;
  tag?: string[];
}) {
  return api.post("/api/prompt-studio", data);
}

export async function updatePromptEngine(data: {
  id: string;
  nama?: string;
  deskripsi?: string;
  kontenTemplate?: string;
  urutanKompilasi?: number;
  aktif?: boolean;
  tag?: string[];
  catatanRevisi?: string;
}) {
  const { id, ...body } = data;
  return api.patch(`/api/prompt-studio/${id}`, body);
}

export async function toggleAktifPromptEngine(data: { id: string }) {
  return api.patch(`/api/prompt-studio/${data.id}/toggle-aktif`);
}

export async function hapusPromptEngine(data: { id: string }) {
  return api.delete(`/api/prompt-studio/${data.id}`);
}

export async function getRiwayatVersiEngine(data: { engineId: string }) {
  return api.get(`/api/prompt-studio/${data.engineId}/versi`);
}

export async function pulihkanVersiEngine(data: { engineId: string; nomorVersi: number }) {
  return api.post(`/api/prompt-studio/${data.engineId}/pulihkan`, { nomorVersi: data.nomorVersi });
}
