/**
 * Users API Functions — Frontend calls ke backend server
 */

import { api } from "../lib/api-client";

export async function getProfilPengguna() {
  return api.get("/api/users/profil");
}

export async function updateProfilPengguna(data: {
  namaLengkap?: string;
  bio?: string;
}) {
  return api.patch("/api/users/profil", data);
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function getDaftarPenggunaAdmin() {
  return api.get("/api/users/admin/daftar");
}

export async function updatePeranPenggunaAdmin(data: {
  userId: string;
  peran: "STUDENT" | "ADMIN" | "SUPER_ADMIN";
  statusAkun?: "AKTIF" | "NONAKTIF" | "DITANGGUHKAN";
}) {
  return api.patch(`/api/users/admin/${data.userId}/peran`, {
    peran: data.peran,
    statusAkun: data.statusAkun,
  });
}

export async function gantiSandiPenggunaAdmin(data: {
  userId: string;
  passwordBaru: string;
}) {
  return api.post("/api/users/admin/ganti-sandi", data);
}
