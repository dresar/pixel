/**
 * Glossary API Functions — Frontend calls ke backend server
 */

import { api } from "../lib/api-client";

export async function getGlosarium(data?: { cari?: string }) {
  return api.get("/api/glosarium", data);
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function tambahGlosariumAdmin(data: {
  istilah: string;
  slug?: string;
  definisi: string;
  contoh?: string;
  referensiUndangUndang?: string;
  kategori?: string;
}) {
  return api.post("/api/glosarium/admin", data);
}

export const tambahGlosarium = tambahGlosariumAdmin;

export async function hapusGlosariumAdmin(data: { id: string }) {
  return api.delete(`/api/glosarium/admin/${data.id}`);
}

export async function imporBanyakGlosariumAdmin(data: {
  items: Array<{
    istilah: string;
    definisi: string;
    contoh?: string;
    referensiUndangUndang?: string;
    kategori?: string;
  }>;
}) {
  return api.post("/api/glosarium/admin/impor", data);
}

export async function generateGlosariumAiAdmin(data: {
  topik: string;
  jumlah?: number;
}) {
  return api.post("/api/glosarium/admin/generate-ai", data);
}
