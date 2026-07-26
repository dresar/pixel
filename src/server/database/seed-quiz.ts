import { db } from "../config/database";
import { quizzes, quizQuestions, quizOptions } from "./schema";

async function seedQuiz() {
  console.log("🌱 Seeding Brevet Pajak Quizzes into Neon PostgreSQL...");

  // Create main evaluation quiz
  const [quiz] = await db
    .insert(quizzes)
    .values({
      judul: "Kuis Evaluasi Brevet Pajak A & B",
      slug: "kuis-evaluasi-brevet-pajak-ab",
      deskripsi: "Evaluasi pemahaman Ketentuan Umum Perpajakan (KUP), PPh Orang Pribadi, PPN, dan PPh 21 TER.",
      tipeKuis: "PENILAIAN",
      batasWaktuMenit: 15,
      nilaiMinimumLulus: 70,
      aktif: true,
    })
    .returning();

  console.log(`✅ Created Quiz: ${quiz.judul} (${quiz.id})`);

  const questionsData = [
    {
      teks: "Berapakah besarnya Penghasilan Tidak Kena Pajak (PTKP) untuk Wajib Pajak Orang Pribadi lajang (TK/0) sesuai UU HPP terbaru?",
      penjelasan: "Sesuai UU HPP / UU PPh, PTKP dasar untuk Wajib Pajak Orang Pribadi (TK/0) adalah Rp 54.000.000 per tahun.",
      urutan: 1,
      options: [
        { teks: "Rp 36.000.000 / tahun", benar: false, urutan: 1 },
        { teks: "Rp 54.000.000 / tahun", benar: true, urutan: 2 },
        { teks: "Rp 63.000.000 / tahun", benar: false, urutan: 3 },
        { teks: "Rp 72.000.000 / tahun", benar: false, urutan: 4 },
      ],
    },
    {
      teks: "Berapa persen tarif Pajak Pertambahan Nilai (PPN) yang berlaku umum saat ini di Indonesia berdasarkan UU HPP?",
      penjelasan: "Tarif PPN yang berlaku sejak 1 April 2022 adalah sebesar 11%.",
      urutan: 2,
      options: [
        { teks: "10%", benar: false, urutan: 1 },
        { teks: "11%", benar: true, urutan: 2 },
        { teks: "12%", benar: false, urutan: 3 },
        { teks: "15%", benar: false, urutan: 4 },
      ],
    },
    {
      teks: "Batas waktu pelaporan SPT Tahunan PPh Orang Pribadi sesuai Pasal 3 UU KUP adalah paling lambat...",
      penjelasan: "Batas waktu pelaporan SPT Tahunan PPh OP adalah paling lama 3 bulan setelah akhir tahun pajak (31 Maret).",
      urutan: 3,
      options: [
        { teks: "2 bulan setelah akhir Tahun Pajak", benar: false, urutan: 1 },
        { teks: "3 bulan setelah akhir Tahun Pajak (31 Maret)", benar: true, urutan: 2 },
        { teks: "4 bulan setelah akhir Tahun Pajak", benar: false, urutan: 3 },
        { teks: "6 bulan setelah akhir Tahun Pajak", benar: false, urutan: 4 },
      ],
    },
    {
      teks: "Skema pemotongan PPh Pasal 21 bulanan mulai 1 Januari 2024 (PMK 168/2023) menggunakan mekanisme...",
      penjelasan: "Pemotongan PPh 21 bulanan menggunakan Tarif Efektif Rata-Rata (TER) Kategori A, B, dan C.",
      urutan: 4,
      options: [
        { teks: "Tarif Efektif Rata-Rata (TER) Kategori A, B, C", benar: true, urutan: 1 },
        { teks: "Tarif PPh Badan 22% Final", benar: false, urutan: 2 },
        { teks: "Nett Method 15%", benar: false, urutan: 3 },
        { teks: "Norma Penghitungan Penghasilan Netto", benar: false, urutan: 4 },
      ],
    },
    {
      teks: "Berapakah tarif PPh Badan umum bagi Wajib Pajak Badan Dalam Negeri untuk Tahun Pajak 2022 dan seterusnya?",
      penjelasan: "Berdasarkan UU HPP, tarif PPh Badan umum bagi Wajib Pajak Badan Dalam Negeri adalah 22%.",
      urutan: 5,
      options: [
        { teks: "20%", benar: false, urutan: 1 },
        { teks: "22%", benar: true, urutan: 2 },
        { teks: "25%", benar: false, urutan: 3 },
        { teks: "30%", benar: false, urutan: 4 },
      ],
    },
  ];

  for (const qData of questionsData) {
    const [question] = await db
      .insert(quizQuestions)
      .values({
        quizId: quiz.id,
        pertanyaanTeks: qData.teks,
        penjelasan: qData.penjelasan,
        urutan: qData.urutan,
        poin: 20,
      })
      .returning();

    for (const opt of qData.options) {
      await db.insert(quizOptions).values({
        questionId: question.id,
        teksOpsi: opt.teks,
        adalahBenar: opt.benar,
        urutan: opt.urutan,
      });
    }
  }

  console.log("🎉 Quizzes and Questions successfully seeded into Neon DB!");
}

seedQuiz().catch(console.error);
