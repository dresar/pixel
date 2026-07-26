import { z } from "zod";

export const AksiAiEnum = z.enum([
  "JELASKAN", "RINGKAS", "SOROT", "KUIS", "KARTU",
  "MINDMAP", "VISUAL", "CHAT", "ANALOGI", "STUDI_KASUS", "RENCANA_BELAJAR",
]);

export const PermintaanAiSchema = z.object({
  aksi: AksiAiEnum,
  kontenUtama: z.string().min(1, "Konten tidak boleh kosong").max(10000),
  konteksTambahan: z.string().optional(),
  lessonId: z.string().uuid().optional(),
  moduleId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
  jumlahItem: z.number().int().min(1).max(20).optional(),
});

export const PesanChatSchema = z.object({
  pesan: z.string().min(1).max(5000),
  conversationId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
  modulId: z.string().optional(),
});

export type PermintaanAiInput = z.infer<typeof PermintaanAiSchema>;
export type PesanChatInput = z.infer<typeof PesanChatSchema>;
