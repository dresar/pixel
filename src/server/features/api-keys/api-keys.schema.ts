import { z } from "zod";

export const TambahApiKeySchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi").max(100),
  apiKey: z.string().min(20, "API key tidak valid"),
  prioritas: z.number().int().min(0).max(999).default(0),
});

export const ImportBanyakApiKeySchema = z.object({
  keys: z
    .array(
      z.object({
        nama: z.string().min(1),
        apiKey: z.string().min(20),
        prioritas: z.number().int().min(0).default(0),
      }),
    )
    .min(1, "Minimal 1 API key harus disertakan")
    .max(500, "Maksimal 500 key per sekali import"),
});

export const UbahStatusApiKeySchema = z.object({
  status: z.enum(["AKTIF", "NONAKTIF"]),
});

export type TambahApiKeyInput = z.infer<typeof TambahApiKeySchema>;
export type ImportBanyakApiKeyInput = z.infer<typeof ImportBanyakApiKeySchema>;
