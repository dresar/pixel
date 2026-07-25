import { db } from "../config/database";
import {
  users,
  roadmaps,
  levels,
  modules,
  chapters,
  lessons,
  glossaryEntries,
} from "./schema";
import { auth } from "../features/auth/auth.config";
import { buatSlug } from "../shared/utils/slug";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Dev Accounts via Better Auth
  const devAccounts = [
    {
      name: "Super Admin BrevetAI",
      email: "superadmin@brevetai.id",
      password: "Password123!",
      role: "SUPER_ADMIN" as const,
    },
    {
      name: "Admin Konten Pajak",
      email: "admin@brevetai.id",
      password: "Password123!",
      role: "ADMIN" as const,
    },
    {
      name: "Siswa Brevet Uji Coba",
      email: "student@brevetai.id",
      password: "Password123!",
      role: "STUDENT" as const,
    },
  ];

  for (const acc of devAccounts) {
    try {
      const res = await auth.api.signUpEmail({
        body: {
          name: acc.name,
          email: acc.email,
          password: acc.password,
        },
      });

      if (res?.user?.id) {
        await db
          .update(users)
          .set({
            namaLengkap: acc.name,
            peran: acc.role,
            statusAkun: "AKTIF",
          })
          .where(eq(users.id, res.user.id));

        console.log(`✅ Created dev account: ${acc.email} (${acc.role})`);
      }
    } catch (e) {
      console.log(`ℹ️ Account ${acc.email} processed or already exists`);
    }
  }

  // 2. Seed Roadmap
  const [roadmap] = await db
    .insert(roadmaps)
    .values({
      judul: "Roadmap Kurikulum Brevet Pajak A & B",
      deskripsi: "Kurikulum komprehensif perpajakan Indonesia berdasarkan UU KUP, PPh, PPN, dan peraturan terbaru.",
      slug: "brevet-pajak-ab",
      urutan: 1,
      status: "TERBIT",
    })
    .onConflictDoNothing()
    .returning();

  const rId = roadmap?.id;
  if (rId) {
    // 3. Seed Levels
    const [levelA] = await db
      .insert(levels)
      .values({
        roadmapId: rId,
        kodeLevel: "BREVET_A",
        judul: "Brevet A — Perpajakan Orang Pribadi",
        deskripsi: "Menguasai ketentuan umum perpajakan, PPh Orang Pribadi, PPN, & SPT 1770.",
        urutan: 1,
      })
      .returning();

    const [levelB] = await db
      .insert(levels)
      .values({
        roadmapId: rId,
        kodeLevel: "BREVET_B",
        judul: "Brevet B — Perpajakan Badan & Akuntansi Pajak",
        deskripsi: "Menguasai PPh Badan, Akuntansi Pajak, Pemeriksaan, & Sengketa Pajak.",
        urutan: 2,
      })
      .returning();

    // 4. Seed Modules
    const sampleModules = [
      {
        levelId: levelA.id,
        judul: "Ketentuan Umum & Tata Cara Perpajakan (KUP)",
        deskripsi: "Memahami fondasi hukum perpajakan Indonesia, NPWP, NIK, dan hak serta kewajiban wajib pajak.",
        slug: "kup-dasar",
        statusPublikasi: "TERBIT" as const,
        tingkatKesulitan: "DASAR" as const,
        estimasiMenit: 360,
        urutan: 1,
      },
      {
        levelId: levelA.id,
        judul: "Pajak Penghasilan (PPh) Orang Pribadi",
        deskripsi: "Penghitungan PPh Pasal 21, Pasal 17 progresif, PTKP, dan pengisian SPT 1770 / 1770 S / 1770 SS.",
        slug: "pph-orang-pribadi",
        statusPublikasi: "TERBIT" as const,
        tingkatKesulitan: "MENENGAH" as const,
        estimasiMenit: 480,
        urutan: 2,
      },
      {
        levelId: levelA.id,
        judul: "Pajak Pertambahan Nilai (PPN) & PPnBM",
        deskripsi: "Mekanisme Pajak Keluaran, Pajak Masukan, Faktur Pajak e-Faktur, dan barang/jasa kena pajak.",
        slug: "ppn-ppnbm",
        statusPublikasi: "TERBIT" as const,
        tingkatKesulitan: "MENENGAH" as const,
        estimasiMenit: 300,
        urutan: 3,
      },
      {
        levelId: levelB.id,
        judul: "Pajak Penghasilan (PPh) Badan",
        deskripsi: "Penghitungan PPh Badan tarif 22%, rekonsiliasi fiskal positif/negatif, dan SPT 1771.",
        slug: "pph-badan",
        statusPublikasi: "TERBIT" as const,
        tingkatKesulitan: "LANJUT" as const,
        estimasiMenit: 600,
        urutan: 4,
      },
    ];

    for (const mod of sampleModules) {
      const [mRecord] = await db
        .insert(modules)
        .values(mod)
        .onConflictDoNothing()
        .returning();

      if (mRecord) {
        const [chap] = await db
          .insert(chapters)
          .values({
            moduleId: mRecord.id,
            judul: `Bab 1 — Pendahuluan ${mRecord.judul}`,
            deskripsi: "Konsep dasar dan landasan peraturan hukum.",
            urutan: 1,
          })
          .returning();

        if (chap) {
          const lessonData = {
            chapterId: chap.id,
            judul: `Pengantar ${mRecord.judul}`,
            slug: buatSlug(`Pengantar ${mRecord.judul}`),
            kontenJson: {
              versi: "1.0",
              metadata: {
                judul: `Pengantar ${mRecord.judul}`,
                deskripsi: `Materi pengantar untuk ${mRecord.judul}`,
              },
              blok_konten: [
                {
                  id: "b1",
                  tipe: "JUDUL",
                  data: { teks: `Memahami dasar ${mRecord.judul}` },
                },
                {
                  id: "b2",
                  tipe: "PARAGRAF",
                  data: {
                    teks: `Perpajakan Indonesia diatur secara spesifik dalam undang-undang nasional. Dalam modul ini Anda akan mempelajari mekanisme praktis dan studi kasus perhitungan nyata.`,
                  },
                },
                {
                  id: "b3",
                  tipe: "PERINGATAN",
                  data: {
                    teks: "Selalu pastikan mengacu pada peraturan PMK atau PER-DJP terbaru yang berlaku saat pelaporan pajak.",
                  },
                },
              ],
            },
            estimasiMenit: 15,
            statusPublikasi: "TERBIT" as const,
            urutan: 1,
          };

          await db.insert(lessons).values(lessonData).onConflictDoNothing();
        }
      }
    }
    console.log("✅ Seeded Roadmaps, Levels, Modules, Chapters & Lessons");
  }

  // 5. Seed Glossary Entries
  const glossaryItems = [
    {
      istilah: "NPWP",
      slug: "npwp",
      definisi: "Nomor Pokok Wajib Pajak sebagai identitas wajib pajak dalam administrasi perpajakan Indonesia.",
      referensiUndangUndang: "UU KUP Pasal 2",
      kategori: "KUP",
    },
    {
      istilah: "PPh",
      slug: "pph",
      definisi: "Pajak Penghasilan yang dikenakan atas penghasilan yang diterima atau diperoleh wajib pajak.",
      referensiUndangUndang: "UU PPh No. 36 Tahun 2008",
      kategori: "PPh",
    },
    {
      istilah: "PPN",
      slug: "ppn",
      definisi: "Pajak Pertambahan Nilai yang dikenakan atas konsumsi barang dan jasa di dalam Daerah Pabean.",
      referensiUndangUndang: "UU PPN No. 42 Tahun 2009 / UU HPP",
      kategori: "PPN",
    },
    {
      istilah: "SPT",
      slug: "spt",
      definisi: "Surat Pemberitahuan yang digunakan wajib pajak untuk melaporkan perhitungan dan pembayaran pajak terutang.",
      referensiUndangUndang: "UU KUP Pasal 3",
      kategori: "KUP",
    },
    {
      istilah: "PTKP",
      slug: "ptkp",
      definisi: "Penghasilan Tidak Kena Pajak sebagai pengurang penghasilan neto untuk menghitung PPh Orang Pribadi.",
      referensiUndangUndang: "PMK No. 101/PMK.010/2016",
      kategori: "PPh OP",
    },
    {
      istilah: "DPP",
      slug: "dpp",
      definisi: "Dasar Pengenaan Pajak yaitu jumlah harga jual, nilai penggantian, atau impor yang digunakan untuk menghitung pajak terutang.",
      referensiUndangUndang: "UU PPN Pasal 1 angka 17",
      kategori: "PPN",
    },
  ];

  for (const item of glossaryItems) {
    await db.insert(glossaryEntries).values(item).onConflictDoNothing();
  }
  console.log("✅ Seeded Glossary Entries");

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
