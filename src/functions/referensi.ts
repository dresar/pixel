import { createServerFn } from "@tanstack/react-start";
import { db } from "../server/config/database";
import { referensiHukum } from "../server/database/schema";
import { ilike, or, asc, eq } from "drizzle-orm";
import { sukses, gagal } from "../server/shared/utils/response-builder";
import { isAppError } from "../server/shared/errors/AppError";
import { z } from "zod";
import { panggilGemini } from "../server/features/ai-engine/providers/gemini.provider";
import { buatSlug } from "../server/shared/utils/slug";

export const getReferensiHukum = createServerFn({ method: "GET" })
  .validator(z.object({ cari: z.string().optional(), kategori: z.string().optional() }))
  .handler(async ({ data }) => {
    try {
      let query = db.select().from(referensiHukum).orderBy(asc(referensiHukum.nomorPeraturan)).$dynamic();
      if (data.cari) {
        query = query.where(
          or(
            ilike(referensiHukum.nomorPeraturan, `%${data.cari}%`),
            ilike(referensiHukum.judul, `%${data.cari}%`),
            ilike(referensiHukum.ringkasan, `%${data.cari}%`)
          )
        );
      }
      const daftar = await query;
      return sukses("Data referensi hukum berhasil dimuat", daftar);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
    }
  });

export const tambahReferensiHukumAdmin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      nomorPeraturan: z.string().min(2),
      judul: z.string().min(2),
      kategori: z.string().default("UU"),
      tahun: z.string().optional(),
      ringkasan: z.string().min(5),
      kontenLengkap: z.string().optional(),
      urlDokumen: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const slug = buatSlug(`${data.kategori}-${data.nomorPeraturan}`) || `ref-${Date.now()}`;
      const [ref] = await db.insert(referensiHukum).values({ ...data, slug }).returning();
      return sukses("Referensi hukum berhasil ditambahkan!", ref);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal menambahkan referensi hukum", "INTERNAL_ERROR");
    }
  });

export const hapusReferensiHukumAdmin = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    try {
      await db.delete(referensiHukum).where(eq(referensiHukum.id, data.id));
      return sukses("Referensi hukum berhasil dihapus!", null);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal menghapus referensi hukum", "INTERNAL_ERROR");
    }
  });

export const imporBanyakReferensiAdmin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      items: z.array(
        z.object({
          nomorPeraturan: z.string(),
          judul: z.string(),
          kategori: z.string().optional(),
          tahun: z.string().optional(),
          ringkasan: z.string(),
          kontenLengkap: z.string().optional(),
          urlDokumen: z.string().optional(),
        })
      ),
    })
  )
  .handler(async ({ data }) => {
    try {
      let count = 0;
      for (const item of data.items) {
        const slug = buatSlug(`${item.kategori || "UU"}-${item.nomorPeraturan}`) || `ref-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
        try {
          await db.insert(referensiHukum).values({
            nomorPeraturan: item.nomorPeraturan,
            slug,
            judul: item.judul,
            kategori: item.kategori || "UU",
            tahun: item.tahun || "2024",
            ringkasan: item.ringkasan,
            kontenLengkap: item.kontenLengkap || null,
            urlDokumen: item.urlDokumen || null,
          });
          count++;
        } catch {
          // skip duplicate
        }
      }
      return sukses(`Berhasil mengimpor ${count} referensi hukum ke database!`, { count });
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal mengimpor JSON referensi hukum", "INTERNAL_ERROR");
    }
  });

export const generateReferensiAiAdmin = createServerFn({ method: "POST" })
  .validator(z.object({ topik: z.string().min(2), jumlah: z.number().optional().default(5) }))
  .handler(async ({ data }) => {
    try {
      const aiRes = await panggilGemini({
        systemInstruction:
          "Anda adalah Legal Specialist & Drafter Regulasi Perpajakan Indonesia. Tugas Anda adalah menyusun daftar Peraturan Undang-Undang, PMK, PER-PJ, dan PP perpajakan resmi. Kembalikan HANYA JSON array valid tanpa pembungkus markdown.",
        prompt: `Buatkan ${data.jumlah} peraturan undang-undang / PMK perpajakan resmi Indonesia seputar topik "${data.topik}".
Format JSON yang WAJIB dihasilkan:
[
  {
    "nomorPeraturan": "PMK No. 168 Tahun 2023",
    "judul": "Petunjuk Pelaksanaan Pemotongan Pajak atas Penghasilan Sehubungan dengan Pekerjaan",
    "kategori": "PMK",
    "tahun": "2023",
    "ringkasan": "Peraturan tentang penetapan tarif efektif rata-rata (TER) PPh Pasal 21 untuk skema potong bulanan dan harian.",
    "urlDokumen": "https://jdih.kemenkeu.go.id"
  }
]`,
      });

      let jsonArray: any[] = [];
      const cleanTeks = aiRes.teks.replace(/```json/g, "").replace(/```/g, "").trim();
      jsonArray = JSON.parse(cleanTeks);

      let imported = 0;
      for (const item of jsonArray) {
        if (item.nomorPeraturan && item.judul) {
          const slug = buatSlug(`${item.kategori || "UU"}-${item.nomorPeraturan}`) || `ref-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
          try {
            await db.insert(referensiHukum).values({
              nomorPeraturan: item.nomorPeraturan,
              slug,
              judul: item.judul,
              kategori: item.kategori || "UU",
              tahun: item.tahun || "2024",
              ringkasan: item.ringkasan,
              urlDokumen: item.urlDokumen || null,
            });
            imported++;
          } catch {
            // skip duplicate
          }
        }
      }

      return sukses(`AI berhasil membuat & menyimpan ${imported} referensi hukum baru!`, { count: imported });
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal menghasilkan referensi AI", "INTERNAL_ERROR");
    }
  });
