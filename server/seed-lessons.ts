import { db } from "./src/config/database.js";
import { lessons, modules, chapters } from "./src/database/schema/modules.schema.js";
import { eq } from "drizzle-orm";

async function seed() {
  const allLessons = await db.select().from(lessons);
  console.log("Current lessons count in DB:", allLessons.length);

  // Ambil atau buat chapter pertama
  let allChapters = await db.select().from(chapters);
  let chapterId = "";
  if (allChapters.length === 0) {
    const allMods = await db.select().from(modules);
    let moduleId = "";
    if (allMods.length === 0) {
      const [newMod] = await db
        .insert(modules)
        .values({
          judul: "Modul 1: Konsep Dasar Perpajakan (Brevet A)",
          slug: "konsep-dasar-perpajakan",
          deskripsi: "Fondasi pemahaman konsep dasar pajak, KUP, dan PPh Orang Pribadi.",
          statusPublikasi: "TERBIT",
        })
        .returning();
      moduleId = newMod.id;
    } else {
      moduleId = allMods[0].id;
    }

    const [newChap] = await db
      .insert(chapters)
      .values({
        moduleId,
        judul: "Bab 1: Pengantar Perpajakan",
        deskripsi: "Konsep dasar, subjek, objek, dan tarif pajak.",
        urutan: 1,
      })
      .returning();
    chapterId = newChap.id;
  } else {
    chapterId = allChapters[0].id;
  }

  const apaItuPajakContent = {
    versi: "4.0",
    metadata: { tipe: "EDUKASI_TEKS" },
    blok_konten: [
      {
        tipe: "STORY_HOOK",
        data: {
          narasi: "Bayangkan sebuah negara tanpa jalan raya, tanpa rumah sakit umum, dan tanpa sekolah gratis. Dari mana negara memperoleh dana ratusan triliun untuk membangun semua fasilitas tersebut? Jawabannya: Pajak.",
        },
      },
      {
        tipe: "PARAGRAF",
        data: {
          teks: "Pajak adalah kontribusi wajib kepada negara yang terutang oleh orang pribadi atau badan yang bersifat memaksa berdasarkan Undang-Undang, dengan tidak mendapatkan imbalan secara langsung dan digunakan untuk keperluan negara bagi sebesar-besarnya kemakmuran rakyat.",
        },
      },
      {
        tipe: "POIN_KUNCI",
        data: {
          teks: "Pajak memiliki 4 ciri utama:\n1. Kontribusi Wajib kepada Negara\n2. Bersifat Memaksa Berdasarkan UU\n3. Tanpa Imbalan/Kontraprestasi Langsung\n4. Digunakan untuk Pembangunan & Kesejahteraan Rakyat",
        },
      },
      {
        tipe: "PASAL_HUKUM",
        data: {
          undang_undang: "UU KUP No. 28 Tahun 2007",
          pasal: "Pasal 1 Angka 1",
          bunyi_pasal: "Pajak adalah kontribusi wajib kepada negara yang terutang oleh orang pribadi atau badan yang bersifat memaksa berdasarkan Undang-Undang, dengan tidak mendapatkan imbalan secara langsung dan digunakan untuk keperluan negara bagi sebesar-besarnya kemakmuran rakyat.",
        },
      },
      {
        tipe: "CONTOH_KASUS",
        data: {
          judul_kasus: "Simulasi Fungsi Anggaran (Budgetair) & Regulasi (Regulerend)",
          skenario: "PT Nusa Sejahtera menghasilkan laba bersih Rp 1.000.000.000 pada tahun berjalan. Berdasarkan tarif PPh Badan 22%, pajak yang terutang disetorkan ke Kas Negara untuk membiayai fasilitas publik.",
          perhitungan: "Laba Kena Pajak = Rp 1.000.000.000\nTarif PPh Badan = 22%\nPPh Terutang = 22% x Rp 1.000.000.000 = Rp 220.000.000\nFungsi Pajak: Budgetair (Sumber Penerimaan Kas Negara)",
        },
      },
      {
        tipe: "GLOSARIUM",
        data: {
          istilah: "Subjek Pajak vs Objek Pajak",
          definisi: "Subjek Pajak adalah orang pribadi atau badan yang dituju oleh Undang-Undang untuk dikenakan pajak. Objek Pajak adalah penghasilan, transaksi, atau barang yang dikenai pajak.",
        },
      },
    ],
  };

  const pph17Content = {
    versi: "4.0",
    metadata: { tipe: "EDUKASI_TEKS" },
    blok_konten: [
      {
        tipe: "STORY_HOOK",
        data: {
          narasi: "Pernahkah Anda bertanya mengapa orang berpenghasilan Rp 1 Miliar membayar persentase pajak yang lebih tinggi dibandingkan orang berpenghasilan Rp 60 Juta? Inilah yang disebut Tarif Progresif PPh Pasal 17.",
        },
      },
      {
        tipe: "PARAGRAF",
        data: {
          teks: "Pasal 17 Undang-Undang Pajak Penghasilan (UU PPh) sebagaimana diubah dalam UU HPP No. 7/2021 mengatur lapisan tarif progresif untuk Wajib Pajak Orang Pribadi Dalam Negeri. Sistem ini menjamin keadilan horizontal dan vertikal dalam pemungutan pajak.",
        },
      },
      {
        tipe: "POIN_KUNCI",
        data: {
          teks: "Lapisan Tarif Progresif PPh OP Terbaru (UU HPP No. 7/2021):\n• s.d Rp 60.000.000: 5%\n• > Rp 60.000.000 s.d Rp 250.000.000: 15%\n• > Rp 250.000.000 s.d Rp 500.000.000: 25%\n• > Rp 500.000.000 s.d Rp 5.000.000.000: 30%\n• > Rp 5.000.000.000: 35%",
        },
      },
      {
        tipe: "PASAL_HUKUM",
        data: {
          undang_undang: "UU HPP No. 7 Tahun 2021",
          pasal: "Pasal 17 Ayat (1) Huruf a",
          bunyi_pasal: "Tarif pajak yang dikenakan atas Penghasilan Kena Pajak bagi Wajib Pajak Orang Pribadi dalam negeri adalah 5% s.d 35% berdasarkan 5 lapisan Penghasilan Kena Pajak.",
        },
      },
      {
        tipe: "CONTOH_KASUS",
        data: {
          judul_kasus: "Studi Kasus Perhitungan Progresif PPh Orang Pribadi",
          skenario: "Bapak Rangga memiliki Penghasilan Kena Pajak (PKP) senilai Rp 300.000.000 dalam satu tahun pajak.",
          perhitungan: "Perhitungan Berlapis PPh Pasal 17:\n• Lapis 1 (5% x Rp 60.000.000) = Rp 3.000.000\n• Lapis 2 (15% x Rp 190.000.000) = Rp 28.500.000\n• Lapis 3 (25% x Rp 50.000.000) = Rp 12.500.000\n---------------------------------------------\nTotal PPh Terutang = Rp 44.000.000",
        },
      },
      {
        tipe: "GLOSARIUM",
        data: {
          istilah: "PKP (Penghasilan Kena Pajak)",
          definisi: "Penghasilan neto dikurangi PTKP (Penghasilan Tidak Kena Pajak) yang menjadi dasar pengalian tarif PPh Pasal 17.",
        },
      },
    ],
  };

  // 1. Upsert 'apa-itu-pajak'
  const existingPajak = allLessons.find((l) => l.slug === "apa-itu-pajak");
  if (existingPajak) {
    await db
      .update(lessons)
      .set({
        judul: "Apa Itu Pajak? Konsep Dasar & Dasar Hukum",
        deskripsi: "Modul pengantar yang membangun fondasi pemahaman konsep dasar pajak, fungsi budgetair & regulerend, serta klasifikasi pajak.",
        kontenJson: apaItuPajakContent,
      })
      .where(eq(lessons.id, existingPajak.id));
    console.log("✅ Updated apa-itu-pajak in DB");
  } else {
    await db.insert(lessons).values({
      chapterId,
      judul: "Apa Itu Pajak? Konsep Dasar & Dasar Hukum",
      slug: "apa-itu-pajak",
      deskripsi: "Modul pengantar yang membangun fondasi pemahaman konsep dasar pajak, fungsi budgetair & regulerend, serta klasifikasi pajak.",
      estimasiMenit: 15,
      urutan: 1,
      statusPublikasi: "TERBIT",
      kontenJson: apaItuPajakContent,
    });
    console.log("✅ Inserted apa-itu-pajak in DB");
  }

  // 2. Upsert 'tarif-pph-pasal-17-op'
  const existingPph = allLessons.find((l) => l.slug === "tarif-pph-pasal-17-op");
  if (existingPph) {
    await db
      .update(lessons)
      .set({
        judul: "Tarif PPh Pasal 17 untuk Wajib Pajak Orang Pribadi",
        deskripsi: "Panduan lengkap lapisan tarif progresif PPh Orang Pribadi berdasarkan UU HPP No. 7/2021 & simulasi hitungan.",
        kontenJson: pph17Content,
      })
      .where(eq(lessons.id, existingPph.id));
    console.log("✅ Updated tarif-pph-pasal-17-op in DB");
  } else {
    await db.insert(lessons).values({
      chapterId,
      judul: "Tarif PPh Pasal 17 untuk Wajib Pajak Orang Pribadi",
      slug: "tarif-pph-pasal-17-op",
      deskripsi: "Panduan lengkap lapisan tarif progresif PPh Orang Pribadi berdasarkan UU HPP No. 7/2021 & simulasi hitungan.",
      estimasiMenit: 15,
      urutan: 2,
      statusPublikasi: "TERBIT",
      kontenJson: pph17Content,
    });
    console.log("✅ Inserted tarif-pph-pasal-17-op in DB");
  }

  // 3. Clean up any broken lessons without proper kontenJson
  for (const l of allLessons) {
    if (l.slug !== "apa-itu-pajak" && l.slug !== "tarif-pph-pasal-17-op") {
      if (!l.kontenJson || typeof l.kontenJson === "string" || (typeof l.kontenJson === "object" && !Array.isArray((l.kontenJson as any)?.blok_konten))) {
        await db.update(lessons).set({
          kontenJson: {
            versi: "4.0",
            metadata: { tipe: "EDUKASI_TEKS" },
            blok_konten: [
              {
                tipe: "STORY_HOOK",
                data: { narasi: `Materi ${l.judul} memberikan pemahaman teknis Brevet Pajak A/B secara sistematis.` },
              },
              {
                tipe: "PARAGRAF",
                data: { teks: l.deskripsi || `${l.judul} membahas ketentuan perpajakan Indonesia berdasarkan regulasi UU HPP dan PMK terbaru.` },
              },
              {
                tipe: "POIN_KUNCI",
                data: { teks: `Poin utama dalam ${l.judul}: 1) Landasan Hukum, 2) Tata Cara Administrasi, 3) Contoh Perhitungan Terutang.` },
              },
              {
                tipe: "PASAL_HUKUM",
                data: { undang_undang: "UU Perpajakan Indonesia", pasal: "Ketentuan Utama", bunyi_pasal: "Setiap Wajib Pajak wajib memenuhi kewajiban perpajakannya sesuai dengan UU." },
              },
            ],
          },
        }).where(eq(lessons.id, l.id));
        console.log(`✅ Updated fallback content for lesson: ${l.slug}`);
      }
    }
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
