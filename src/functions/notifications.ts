/**
 * Notifications API Functions — Frontend calls ke backend server
 */

import { api } from "../lib/api-client";

export async function getNotifikasi() {
  return api.get("/api/notifikasi");
}

export async function tandaiNotifikasiDibaca(data?: { id?: string }) {
  return api.patch("/api/notifikasi/baca", data ?? {});
}
