/**
 * Frontend API functions for Studi Kasus & Simulasi
 */

import { api } from "../lib/api-client";

export async function getDaftarStudiKasus() {
  return api.get("/api/studi-kasus");
}

export async function getStudiKasusBySlug(slug: string) {
  return api.get(`/api/studi-kasus/${slug}`);
}

export async function tambahStudiKasusAdmin(data: {
  judul: string;
  slug?: string;
  deskripsi?: string;
  level?: string;
  tag?: string;
  durasiMenit?: number;
  skenarioTeks?: string;
  terbit?: boolean;
}) {
  return api.post("/api/studi-kasus/admin", data);
}

export async function updateStudiKasusAdmin(
  id: string,
  data: {
    judul?: string;
    slug?: string;
    deskripsi?: string;
    level?: string;
    tag?: string;
    durasiMenit?: number;
    skenarioTeks?: string;
    terbit?: boolean;
  }
) {
  return api.patch(`/api/studi-kasus/admin/${id}`, data);
}

export async function hapusStudiKasusAdmin(id: string) {
  return api.delete(`/api/studi-kasus/admin/${id}`);
}
