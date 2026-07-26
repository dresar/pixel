/**
 * AI Engine Service — BrevetAI 2026
 * Menangani logika proses prompt, rotasi chat AI, dan multi-modal image analysis
 */

import { eq, desc, asc } from "drizzle-orm";
import { db } from "../../config/database.js";
import { aiConversations, aiMessages } from "../../database/schema/ai.schema.js";
import { users } from "../../database/schema/users.schema.js";
import { panggilGemini } from "./gemini.provider.js";
import { logger } from "../../shared/utils/logger.js";

const SYSTEM_INSTRUCTION = `Kamu adalah Asisten BrevetAI, tutor pajak digital interaktif Brevet A & B yang sangat pintar, ramah, dan solutif.
Prinsip jawabanmu:
1. Menggunakan Bahasa Indonesia yang santai, akrab, tidak kaku, dan mudah dipahami oleh mahasiswa/praktisi.
2. Mengacu pada regulasi perpajakan Indonesia terbaru: UU HPP No. 7/2021, PMK 168/2023 (TER PPh 21), UU KUP, UU PPN, dan integrasi Coretax DJP (NIK sebagai NPWP).
3. Berikan penafsiran yang jelas, sertakan contoh perhitungan sederhana jika diminta, dan berikan poin-poin langkah praktis.
4. Jika pengguna memberikan gambar/dokumen (misal Bukti Potong, Faktur Pajak, Form SPT, atau Soal Kuis), analisis gambar tersebut secara cermat dan berikan penjelasan mendalam.`;

export const aiService = {
  /**
   * Proses permintaan tunggal (Prompt Studio / Fitur AI sekali panggil)
   */
  async prosesPermintaan(
    prompt: string,
    tipe: "PENJELASAN" | "KUIS" | "RINGKASAN" | "ANALISIS" = "PENJELASAN",
    sistemInstruksi?: string
  ) {
    const hasil = await panggilGemini({
      systemInstruction: sistemInstruksi || SYSTEM_INSTRUCTION,
      prompt,
    });

    return { teks: hasil.teks, tipe };
  },

  /**
   * Lanjutkan percakapan chat AI (Multi-turn chat & Multi-modal Image)
   */
  async lanjutkanChat(
    conversationId: string | null,
    pesan: string,
    userId: string,
    gambarBase64?: string,
    mimeType?: string
  ) {
    let convId = conversationId;

    // Pastikan userId valid di tabel users untuk menghindari FK violation error
    let targetUserId = userId;
    try {
      if (userId) {
        const userCheck = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (userCheck.length === 0) {
          const firstUser = await db.select({ id: users.id }).from(users).limit(1);
          if (firstUser.length > 0) {
            targetUserId = firstUser[0].id;
          }
        }
      }
    } catch (err) {
      logger.warn("Gagal mengecek validasi userId", err);
    }

    // Buat conversation baru jika belum ada
    if (!convId) {
      try {
        const [conv] = await db
          .insert(aiConversations)
          .values({
            userId: targetUserId,
            judul: pesan.slice(0, 60),
            konteks: "CHAT",
          })
          .returning();

        if (conv && conv.id) {
          convId = conv.id;
        }
      } catch (err) {
        logger.warn("Gagal membuat aiConversations di database, percakapan dilanjutkan secara in-memory", err);
        convId = `temp_${Date.now()}`;
      }
    }

    // Simpan pesan user (opsional jika convId real)
    if (convId && !convId.startsWith("temp_")) {
      try {
        await db.insert(aiMessages).values({
          conversationId: convId,
          peran: "USER",
          konten: pesan,
        });
      } catch {
        // ignore db message insert error
      }
    }

    // Ambil riwayat untuk konteks
    let konteksPesan = pesan;
    if (convId && !convId.startsWith("temp_")) {
      try {
        const riwayat = await db
          .select()
          .from(aiMessages)
          .where(eq(aiMessages.conversationId, convId))
          .orderBy(desc(aiMessages.createdAt))
          .limit(10);

        if (riwayat.length > 0) {
          konteksPesan = riwayat
            .reverse()
            .map((m) => `${m.peran === "USER" ? "Pengguna" : "Asisten BrevetAI"}: ${m.konten}`)
            .join("\n");
        }
      } catch {
        // ignore
      }
    }

    // Panggil Gemini Engine (dengan rotasi API key & dukungan gambar)
    const hasil = await panggilGemini({
      systemInstruction: SYSTEM_INSTRUCTION,
      prompt: `${konteksPesan}\n\nAsisten BrevetAI:`,
      gambarBase64,
      mimeType,
    });

    // Simpan respons AI (opsional jika convId real)
    if (convId && !convId.startsWith("temp_")) {
      try {
        await db.insert(aiMessages).values({
          conversationId: convId,
          peran: "ASSISTANT",
          konten: hasil.teks,
        });
      } catch {
        // ignore
      }
    }

    return {
      conversationId: convId || `temp_${Date.now()}`,
      balasan: hasil.teks,
    };
  },

  /**
   * Ambil riwayat percakapan pengguna
   */
  async riwayatPercakapan(userId: string) {
    try {
      return await db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.userId, userId))
        .orderBy(desc(aiConversations.updatedAt));
    } catch {
      return [];
    }
  },

  /**
   * Detail percakapan beserta daftar pesan
   */
  async detailPercakapan(conversationId: string, userId: string) {
    try {
      const [conv] = await db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.id, conversationId));

      if (!conv) return null;

      const daftarPesan = await db
        .select()
        .from(aiMessages)
        .where(eq(aiMessages.conversationId, conversationId))
        .orderBy(asc(aiMessages.createdAt));

      return { ...conv, pesan: daftarPesan };
    } catch {
      return null;
    }
  },
};
