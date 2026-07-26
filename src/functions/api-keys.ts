/**
 * API Keys Management Functions — Frontend calls ke backend server
 * Note: Fitur ini membutuhkan endpoint /api/api-keys/* di backend
 */

import { api } from "../lib/api-client";

export async function daftarApiKeys() {
  return api.get("/api/api-keys");
}

export async function tambahApiKey(data: {
  nama: string;
  apiKey: string;
  prioritas?: number;
}) {
  return api.post("/api/api-keys", data);
}

export async function importBanyakApiKey(data: {
  keys: Array<{
    nama: string;
    apiKey: string;
    prioritas?: number;
  }>;
}) {
  return api.post("/api/api-keys/impor", data);
}

export async function ubahStatusApiKey(data: {
  id: string;
  status: string;
}) {
  return api.patch(`/api/api-keys/${data.id}/status`, { status: data.status });
}

export async function hapusApiKey(data: { id: string }) {
  return api.delete(`/api/api-keys/${data.id}`);
}

export async function tesApiKeyServer(data: { id: string }) {
  return api.post(`/api/api-keys/${data.id}/tes`);
}

export async function tesSemuaApiKeyServer() {
  return api.post("/api/api-keys/tes-semua");
}
