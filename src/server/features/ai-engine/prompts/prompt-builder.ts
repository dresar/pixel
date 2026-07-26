const INSTRUKSI_SISTEM = `Kamu adalah Kakak Mentor Brevet Pajak Senior BrevetAI yang super akrab, asik, ramah, dan gaul tapi sangat ahli di bidang perpajakan Indonesia.

GAYA BAHASA & CARA MENJAWAB:
1. BAHASA NON-FORMAL & SANTAI BANGET: Gunakan bahasa obrolan santai yang akrab (panggil "kamu", gunakan kata penyambung santai seperti "nah", "gampangnya gini", "simpelnya", "jadi begini", "yuk kita bedah", "oiya"). DILARANG KERAS menggunakan bahasa kaku, baku, atau formal seperti surat dinas.
2. ISTILAH PAJAK DIBUAT GAMPANG DENGAN ANALOGI: Setiap ada istilah pajak (seperti PPh 21, TER, PKP, PTKP, KUP, PPN, Faktur), langsung jelaskan dengan analogi kehidupan sehari-hari (seperti jajan boba di mall, patungan uang kas, gajian bulanan, iuran RT, dll) supaya siswa LANGSUNG LOGIS & KONEK.
3. ALUR PENJELASAN ALAMI & NYAMBUNG: Susun alur pembicaraan dengan runtut (mulai dari konsep dasar -> kenapa aturan ini dibuat -> contoh riil sehari-hari -> tips praktis dari mentor).
4. TANPA FORMAT MARKDOWN BINTANG BANYAK: Berikan jawaban terstruktur dengan poin-poin yang bersih dan enak dibaca.`;

type AksiAi =
  | "JELASKAN" | "RINGKAS" | "SOROT" | "KUIS" | "KARTU"
  | "MINDMAP" | "VISUAL" | "CHAT" | "ANALOGI" | "STUDI_KASUS" | "RENCANA_BELAJAR";

type KonteksPrompt = {
  kontenUtama: string;
  konteksTambahan?: string;
  namaLengkap?: string;
  jumlahItem?: number;
};

function bangunPromptJelaskan(ctx: KonteksPrompt): string {
  return `${INSTRUKSI_SISTEM}

Jelaskan konsep berikut dengan bahasa yang mudah dipahami oleh pemula:

${ctx.kontenUtama}

${ctx.konteksTambahan ? `Konteks tambahan: ${ctx.konteksTambahan}` : ""}

Berikan penjelasan yang mencakup:
1. Definisi sederhana
2. Mengapa ini penting dalam perpajakan
3. Contoh nyata dalam kehidupan sehari-hari
4. Hal yang sering membingungkan pemula`;
}

function bangunPromptRingkas(ctx: KonteksPrompt): string {
  return `${INSTRUKSI_SISTEM}

Buat ringkasan singkat dan padat dari materi berikut:

${ctx.kontenUtama}

Format ringkasan:
- Poin-poin utama (maksimal 7 poin)
- Setiap poin maksimal 2 kalimat
- Gunakan bahasa yang mudah diingat`;
}

function bangunPromptKuis(ctx: KonteksPrompt): string {
  const jumlah = ctx.jumlahItem ?? 5;
  return `${INSTRUKSI_SISTEM}

Buat ${jumlah} soal latihan pilihan ganda tentang materi berikut:

${ctx.kontenUtama}

Format output JSON yang ketat (tidak ada teks lain di luar JSON):
{
  "soal": [
    {
      "pertanyaan": "teks pertanyaan",
      "pilihan": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "jawaban_benar": "A",
      "penjelasan": "penjelasan singkat mengapa jawaban ini benar"
    }
  ]
}`;
}

function bangunPromptKartu(ctx: KonteksPrompt): string {
  const jumlah = ctx.jumlahItem ?? 5;
  return `${INSTRUKSI_SISTEM}

Buat ${jumlah} kartu belajar (flashcard) dari materi berikut:

${ctx.kontenUtama}

Format output JSON yang ketat:
{
  "kartu": [
    {
      "depan": "istilah atau pertanyaan singkat",
      "belakang": "definisi atau jawaban lengkap"
    }
  ]
}`;
}

function bangunPromptMindmap(ctx: KonteksPrompt): string {
  return `${INSTRUKSI_SISTEM}

Buat struktur mind map dari materi berikut:

${ctx.kontenUtama}

Format output JSON:
{
  "topik_utama": "nama topik",
  "cabang": [
    {
      "nama": "nama cabang",
      "sub_cabang": ["item 1", "item 2"]
    }
  ]
}`;
}

function bangunPromptAnalogi(ctx: KonteksPrompt): string {
  return `${INSTRUKSI_SISTEM}

Buat 3 analogi yang kreatif dan mudah dipahami untuk konsep berikut:

${ctx.kontenUtama}

Setiap analogi harus:
- Menggunakan situasi kehidupan sehari-hari di Indonesia
- Sangat mudah dipahami orang awam
- Menjelaskan mengapa analoginya tepat`;
}

function bangunPromptStudiKasus(ctx: KonteksPrompt): string {
  return `${INSTRUKSI_SISTEM}

Buat 1 studi kasus nyata berdasarkan materi berikut:

${ctx.kontenUtama}

Studi kasus harus mencakup:
1. Profil wajib pajak (fiktif tapi realistis)
2. Situasi perpajakan yang dihadapi
3. Langkah-langkah penyelesaian
4. Perhitungan jika relevan
5. Kesimpulan dan pelajaran yang bisa diambil`;
}

function bangunPromptChat(ctx: KonteksPrompt): string {
  return `${INSTRUKSI_SISTEM}

${ctx.konteksTambahan ? `Konteks materi yang sedang dipelajari:\n${ctx.konteksTambahan}\n\n` : ""}Pertanyaan dari siswa:
${ctx.kontenUtama}

Jawab dengan ramah, jelas, dan berikan contoh jika perlu.`;
}

function bangunPromptRencanaBelajar(ctx: KonteksPrompt): string {
  return `${INSTRUKSI_SISTEM}

Buat rencana belajar yang terstruktur untuk topik berikut:

${ctx.kontenUtama}

Rencana belajar harus mencakup:
1. Durasi total yang direkomendasikan
2. Jadwal belajar per hari/minggu
3. Urutan materi yang logis
4. Tips belajar yang efektif untuk perpajakan
5. Cara mengukur pemahaman`;
}

export function bangunPrompt(aksi: AksiAi, konteks: KonteksPrompt): string {
  const pembangun: Record<AksiAi, (ctx: KonteksPrompt) => string> = {
    JELASKAN: bangunPromptJelaskan,
    RINGKAS: bangunPromptRingkas,
    SOROT: bangunPromptJelaskan,
    KUIS: bangunPromptKuis,
    KARTU: bangunPromptKartu,
    MINDMAP: bangunPromptMindmap,
    VISUAL: bangunPromptMindmap,
    CHAT: bangunPromptChat,
    ANALOGI: bangunPromptAnalogi,
    STUDI_KASUS: bangunPromptStudiKasus,
    RENCANA_BELAJAR: bangunPromptRencanaBelajar,
  };
  return pembangun[aksi](konteks);
}
