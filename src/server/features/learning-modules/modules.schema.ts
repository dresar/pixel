import { z } from "zod";

export const BuatModulSchema = z.object({
  levelId: z.string().uuid("Level ID tidak valid"),
  judul: z.string().min(3, "Judul minimal 3 karakter").max(255),
  deskripsi: z.string().optional(),
  tingkatKesulitan: z.enum(["DASAR", "MENENGAH", "LANJUT"]).default("DASAR"),
  estimasiMenit: z.number().int().min(0).default(0),
  urutan: z.number().int().min(0).default(0),
});

export const UpdateModulSchema = BuatModulSchema.partial().omit({ levelId: true });

export const BuatLessonSchema = z.object({
  chapterId: z.string().uuid(),
  judul: z.string().min(3).max(255),
  kontenJson: z.object({
    versi: z.string(),
    metadata: z.object({
      judul: z.string(),
      deskripsi: z.string().optional(),
      kata_kunci: z.array(z.string()).optional(),
      tujuan_pembelajaran: z.array(z.string()).optional(),
      tingkat_kesulitan: z.enum(["DASAR", "MENENGAH", "LANJUT"]).optional(),
      estimasi_menit: z.number().optional(),
    }),
    blok_konten: z.array(
      z.object({
        id: z.string(),
        tipe: z.enum([
          "PARAGRAF", "JUDUL", "GAMBAR", "CONTOH", "ANALOGI",
          "DIAGRAM", "KUIS", "KARTU", "GLOSARIUM", "RINGKASAN",
          "PERINGATAN", "CATATAN", "REFERENSI",
        ]),
        data: z.record(z.unknown()),
      }),
    ),
  }),
  estimasiMenit: z.number().int().min(0).default(0),
  urutan: z.number().int().min(0).default(0),
});

export const FilterModulSchema = z.object({
  levelId: z.string().uuid().optional(),
  status: z.enum(["DRAFT", "REVIEW", "DISETUJUI", "TERBIT", "ARSIP"]).optional(),
  cari: z.string().optional(),
  halaman: z.coerce.number().int().min(1).default(1),
  per_halaman: z.coerce.number().int().min(1).max(50).default(20),
});

export type BuatModulInput = z.infer<typeof BuatModulSchema>;
export type BuatLessonInput = z.infer<typeof BuatLessonSchema>;
export type FilterModulInput = z.infer<typeof FilterModulSchema>;
