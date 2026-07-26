/**
 * AI API Functions — Frontend calls ke backend server
 */

import { api } from "../lib/api-client";

export async function prosesPermintaanAi(data: {
  tipe: "JELASKAN" | "RINGKAS" | "TERJEMAH" | "QUIZ";
  konten: string;
} | { data: { tipe: "JELASKAN" | "RINGKAS" | "TERJEMAH" | "QUIZ"; konten: string } }) {
  const payload = "data" in data && data.data ? data.data : data;
  return api.post("/api/ai/proses", payload);
}

export async function kirimPesanChat(data: {
  pesan: string;
  conversationId?: string | null;
} | { data: { pesan: string; conversationId?: string | null } }) {
  const payload = "data" in data && data.data ? data.data : data;
  return api.post("/api/ai/chat", {
    pesan: payload.pesan,
    conversationId: payload.conversationId || null,
  });
}

export async function getRiwayatAi() {
  return api.get("/api/ai/riwayat");
}

export async function getDetailPercakapan(data: { conversationId: string } | { data: { conversationId: string } }) {
  const payload = "data" in data && data.data ? data.data : data;
  return api.get(`/api/ai/percakapan/${payload.conversationId}`);
}
