/**
 * Media API Functions — Frontend calls ke backend server
 */

import { api } from "../lib/api-client";

export async function getDaftarMediaAdmin() {
  return api.get("/api/media");
}

export async function unggahMediaAdmin(data: {
  fileBase64: string;
  namaFile: string;
  namaTampilan?: string;
  folder?: string;
  entitasTipe?: string;
}) {
  return api.post("/api/media/unggah", data);
}

export async function hapusMediaAdmin(data: {
  id: string;
  cloudinaryPublicId: string;
}) {
  return api.delete(`/api/media/${data.id}`, {
    cloudinaryPublicId: data.cloudinaryPublicId,
  });
}
