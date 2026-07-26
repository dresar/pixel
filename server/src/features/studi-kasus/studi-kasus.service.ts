/**
 * Studi Kasus Service — Business logic & Database Queries
 */

import { db } from "../../config/database.js";
import { studiKasus } from "../../database/schema/studi-kasus.schema.js";
import { eq, desc, sql } from "drizzle-orm";

const DUMMY_CASES = [
  {
    id: "dummy-1",
    judul: "SPT 1770 pegawai swasta dengan tambahan usaha",
    slug: "spt-1770-pegawai-swasta-dengan-tambahan-usaha",
    deskripsi: "Studi kasus penghitungan PPh Pasal 25/29 untuk WPOP yang memiliki gaji pokok dan omset toko kelontong.",
    level: "MENENGAH",
    tag: "PPh OP",
    durasiMenit: 45,
    skenarioTeks: "Bapak Budi bekerja sebagai Manajer Keuangan di PT Nusantara dengan gaji Rp 15.000.000/bulan (PPh 21 dipotong pemberi kerja). Selain itu, istri Bapak Budi memiliki toko usaha UMKM dengan omset Rp 400.000.000 per tahun. Hitung kewajiban SPT 1770 keluarga Bapak Budi berdasarkan PP 55 Tahun 2022.",
    terbit: true,
  },
  {
    id: "dummy-2",
    judul: "Rekonsiliasi fiskal PT Maju Jaya",
    slug: "rekonsiliasi-fiskal-pt-maju-jaya",
    deskripsi: "Simulasi penyesuaian koreksi positif dan negatif laporan keuangan komersial PT Maju Jaya.",
    level: "LANJUT",
    tag: "PPh Badan",
    durasiMenit: 60,
    skenarioTeks: "PT Maju Jaya mencatat Laba Komersial sebesar Rp 2.500.000.000. Dalam laporan rincian biaya terdapat: Biaya jamuan tanpa daftar nominatif (Rp 50.000.000), Sanksi denda pajak (Rp 15.000.000), dan Pendapatan Bunga Deposito (Rp 30.000.000). Hitung Laba Fiskal dan PPh Badan terutang.",
    terbit: true,
  },
  {
    id: "dummy-3",
    judul: "Faktur Pajak keliru dan pembetulannya",
    slug: "faktur-pajak-keliru-dan-pembetulannya",
    deskripsi: "Tata cara penerbitan Faktur Pajak Pengganti e-Faktur 4.0 sesuai regulasi PER-03/PJ/2022.",
    level: "MENENGAH",
    tag: "PPN",
    durasiMenit: 30,
    skenarioTeks: "PKP PT Cahaya Terang menerbitkan Faktur Pajak dengan NPWP pembeli yang salah ketik. Jelaskan langkah pembetulan faktur pengganti, tanggal jatah nomor seri faktur pajak (NSFP), dan konsekuensi sanksi keterlambatan.",
    terbit: true,
  },
  {
    id: "dummy-4",
    judul: "Keberatan atas SKP kurang bayar",
    slug: "keberatan-atas-skp-kurang-bayar",
    deskripsi: "Prosedur pengajuan surat keberatan pajak dan simulasi sanksi Pasal 25 UU KUP jika ditolak.",
    level: "LANJUT",
    tag: "Sengketa",
    durasiMenit: 50,
    skenarioTeks: "DJP menerbitkan SKPKB sebesar Rp 500.000.000 kepada Wajib Pajak. Wajib Pajak hanya menyetujui Rp 100.000.000 dan telah melunasinya. Hitung sanksi denda 30% atau 60% jika pengajuan keberatan atau banding kemudian ditolak.",
    terbit: true,
  },
];

async function pastikanTabelAda() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS studi_kasus (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        judul TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        deskripsi TEXT,
        level TEXT DEFAULT 'MENENGAH',
        tag TEXT DEFAULT 'PPh OP',
        durasi_menit INTEGER DEFAULT 45,
        skenario_teks TEXT,
        soal_json JSONB,
        terbit BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
  } catch (err) {
    console.error("Gagal auto-create tabel studi_kasus:", err);
  }
}

export async function ambilSemuaStudiKasus() {
  try {
    await pastikanTabelAda();
    let list = await db.select().from(studiKasus).orderBy(desc(studiKasus.createdAt));

    // Seed dummy jika kosong
    if (!Array.isArray(list) || list.length === 0) {
      for (const item of DUMMY_CASES) {
        try {
          await db.insert(studiKasus).values({
            judul: item.judul,
            slug: item.slug,
            deskripsi: item.deskripsi,
            level: item.level,
            tag: item.tag,
            durasiMenit: item.durasiMenit,
            skenarioTeks: item.skenarioTeks,
            terbit: item.terbit,
          }).onConflictDoNothing();
        } catch {}
      }
      list = await db.select().from(studiKasus).orderBy(desc(studiKasus.createdAt));
    }

    return Array.isArray(list) && list.length > 0 ? list : DUMMY_CASES;
  } catch (err) {
    console.error("Gagal mengambil daftar studi kasus, menggunakan fallback:", err);
    return DUMMY_CASES;
  }
}

export async function ambilStudiKasusBySlug(slug: string) {
  try {
    await pastikanTabelAda();
    const res = await db.select().from(studiKasus).where(eq(studiKasus.slug, slug)).limit(1);
    if (res[0]) return res[0];
  } catch {}
  return DUMMY_CASES.find((c) => c.slug === slug || c.id === slug) || DUMMY_CASES[0];
}

export async function ambilStudiKasusById(id: string) {
  try {
    await pastikanTabelAda();
    const res = await db.select().from(studiKasus).where(eq(studiKasus.id, id)).limit(1);
    if (res[0]) return res[0];
  } catch {}
  return DUMMY_CASES.find((c) => c.id === id || c.slug === id) || DUMMY_CASES[0];
}

export async function tambahStudiKasus(data: {
  judul: string;
  slug?: string;
  deskripsi?: string;
  level?: string;
  tag?: string;
  durasiMenit?: number;
  skenarioTeks?: string;
  terbit?: boolean;
}) {
  await pastikanTabelAda();
  const generatedSlug = data.slug?.trim() || data.judul.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const [baru] = await db
    .insert(studiKasus)
    .values({
      judul: data.judul,
      slug: generatedSlug,
      deskripsi: data.deskripsi || "",
      level: data.level || "MENENGAH",
      tag: data.tag || "PPh OP",
      durasiMenit: Number(data.durasiMenit) || 45,
      skenarioTeks: data.skenarioTeks || "",
      terbit: data.terbit !== undefined ? data.terbit : true,
    })
    .returning();

  return baru;
}

export async function updateStudiKasus(
  id: string,
  data: {
    judul?: string;
    slug?: string;
    deskripsi?: string;
    level?: string;
    tag?: string;
    durasiMenit?: number;
    skenarioTeks?: string;
    terbit?: boolean;
  }
) {
  await pastikanTabelAda();
  const updateData: any = { updatedAt: new Date() };

  if (data.judul !== undefined) updateData.judul = data.judul;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.deskripsi !== undefined) updateData.deskripsi = data.deskripsi;
  if (data.level !== undefined) updateData.level = data.level;
  if (data.tag !== undefined) updateData.tag = data.tag;
  if (data.durasiMenit !== undefined) updateData.durasiMenit = Number(data.durasiMenit);
  if (data.skenarioTeks !== undefined) updateData.skenarioTeks = data.skenarioTeks;
  if (data.terbit !== undefined) updateData.terbit = data.terbit;

  const [hasil] = await db
    .update(studiKasus)
    .set(updateData)
    .where(eq(studiKasus.id, id))
    .returning();

  return hasil;
}

export async function hapusStudiKasus(id: string) {
  await pastikanTabelAda();
  await db.delete(studiKasus).where(eq(studiKasus.id, id));
  return true;
}
