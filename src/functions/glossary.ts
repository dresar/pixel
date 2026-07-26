import { createServerFn } from "@tanstack/react-start";
import { db } from "../server/config/database";
import { glossaryEntries } from "../server/database/schema";
import { ilike, or, asc, eq } from "drizzle-orm";
import { sukses, gagal } from "../server/shared/utils/response-builder";
import { isAppError } from "../server/shared/errors/AppError";
import { z } from "zod";

export const getGlosarium = createServerFn({ method: "GET" })
  .validator(z.object({ cari: z.string().optional() }))
  .handler(async ({ data }) => {
    try {
      let query = db.select().from(glossaryEntries).orderBy(asc(glossaryEntries.istilah)).$dynamic();
      if (data.cari) {
        query = query.where(
          or(
            ilike(glossaryEntries.istilah, `%${data.cari}%`),
            ilike(glossaryEntries.definisi, `%${data.cari}%`),
          ),
        );
      }
      const daftar = await query;
      return sukses("Data glosarium berhasil dimuat", daftar);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
    }
  });

import { panggilGemini } from "../server/features/ai-engine/providers/gemini.provider";
import { buatSlug } from "../server/shared/utils/slug";

export const tambahGlosarium = createServerFn({ method: "POST" })
  .validator(
    z.object({
      istilah: z.string().min(2),
      slug: z.string().optional(),
      definisi: z.string().min(5),
      contoh: z.string().optional(),
      referensiUndangUndang: z.string().optional(),
      kategori: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const slugFixed = data.slug || buatSlug(data.istilah);
      const [entry] = await db.insert(glossaryEntries).values({ ...data, slug: slugFixed }).returning();
      return sukses("Istilah glosarium berhasil ditambahkan", entry);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
    }
  });

export const hapusGlosariumAdmin = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    try {
      await db.delete(glossaryEntries).where(eq(glossaryEntries.id, data.id));
      return sukses("Istilah glosarium berhasil dihapus!", null);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal menghapus glosarium", "INTERNAL_ERROR");
    }
  });

export const imporBanyakGlosariumAdmin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      items: z.array(
        z.object({
          istilah: z.string(),
          definisi: z.string(),
          contoh: z.string().optional(),
          referensiUndangUndang: z.string().optional(),
          kategori: z.string().optional(),
        })
      ),
    })
  )
  .handler(async ({ data }) => {
    try {
      let suksesCount = 0;
      for (const item of data.items) {
        const slug = buatSlug(item.istilah) || `istilah-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
        try {
          await db.insert(glossaryEntries).values({
            istilah: item.istilah,
            slug,
            definisi: item.definisi,
            contoh: item.contoh || null,
            referensiUndangUndang: item.referensiUndangUndang || null,
            kategori: item.kategori || "UMUM",
          });
          suksesCount++;
        } catch {
          // ignore duplicate
        }
      }
      return sukses(`Berhasil mengimpor ${suksesCount} istilah glosarium ke database!`, { count: suksesCount });
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal mengimpor glosarium JSON", "INTERNAL_ERROR");
    }
  });

export const generateGlosariumAiAdmin = createServerFn({ method: "POST" })
  .validator(z.object({ topik: z.string().min(2), jumlah: z.number().optional().default(10) }))
  .handler(async ({ data }) => {
    try {
      const aiRes = await panggilGemini({
        systemInstruction:
          "Anda adalah Pakar Glosarium Perpajakan Brevet. Tugas Anda adalah merancang istilah-istilah glosarium perpajakan yang akurat dan lengkap. Kembalikan HANYA JSON array valid tanpa pembungkus markdown.",
        prompt: `Buatkan ${data.jumlah} istilah glosarium perpajakan seputar topik "${data.topik}".
Format JSON yang WAJIB dihasilkan:
[
  {
    "istilah": "PPh Pasal 21 TER",
    "definisi": "Tarif Efektif Rata-Rata pemotongan PPh 21 berdasarkan kategori PTKP Wajib Pajak.",
    "contoh": "Penerapan tabel TER A untuk karyawan berstatus TK/0.",
    "referensiUndangUndang": "PMK 168/2023 & PER-2/PJ/2024",
    "kategori": "PPh"
  }
]`,
      });

      let jsonArray: any[] = [];
      const cleanTeks = aiRes.teks.replace(/```json/g, "").replace(/```/g, "").trim();
      jsonArray = JSON.parse(cleanTeks);

      let imported = 0;
      for (const item of jsonArray) {
        if (item.istilah && item.definisi) {
          const slug = buatSlug(item.istilah) || `glos-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
          try {
            await db.insert(glossaryEntries).values({
              istilah: item.istilah,
              slug,
              definisi: item.definisi,
              contoh: item.contoh || null,
              referensiUndangUndang: item.referensiUndangUndang || null,
              kategori: item.kategori || "UMUM",
            });
            imported++;
          } catch {
            // skip duplicate
          }
        }
      }

      return sukses(`AI berhasil membuat & menyimpan ${imported} istilah glosarium baru!`, {
        count: imported,
        rawJson: cleanTeks,
      });
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal menghasilkan glosarium AI", "INTERNAL_ERROR");
    }
  });
