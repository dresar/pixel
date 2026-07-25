// Dummy data in Bahasa Indonesia for the Brevet Pajak learning platform.

export const currentUser = {
  name: "Rangga Prasetyo",
  email: "rangga.prasetyo@brevetai.id",
  role: "Peserta Brevet A & B",
  city: "Jakarta",
  streak: 14,
  xp: 4820,
  level: 12,
  avatarInitials: "RP",
};

export const modules = [
  {
    id: "m1",
    code: "BRV-A-01",
    title: "Ketentuan Umum & Tata Cara Perpajakan",
    short: "KUP",
    progress: 78,
    lessons: 12,
    duration: "6 jam",
    difficulty: "Dasar",
    status: "Berjalan",
    color: "from-sky-500/20 to-indigo-500/10",
  },
  {
    id: "m2",
    code: "BRV-A-02",
    title: "Pajak Penghasilan Orang Pribadi",
    short: "PPh OP",
    progress: 45,
    lessons: 14,
    duration: "8 jam",
    difficulty: "Menengah",
    status: "Berjalan",
    color: "from-emerald-500/20 to-teal-500/10",
  },
  {
    id: "m3",
    code: "BRV-A-03",
    title: "PPN & PPnBM",
    short: "PPN",
    progress: 20,
    lessons: 10,
    duration: "5 jam",
    difficulty: "Menengah",
    status: "Belum mulai",
    color: "from-amber-500/20 to-orange-500/10",
  },
  {
    id: "m4",
    code: "BRV-B-01",
    title: "Pajak Penghasilan Badan",
    short: "PPh Badan",
    progress: 0,
    lessons: 16,
    duration: "10 jam",
    difficulty: "Lanjut",
    status: "Terkunci",
    color: "from-violet-500/20 to-fuchsia-500/10",
  },
  {
    id: "m5",
    code: "BRV-B-02",
    title: "Akuntansi Pajak",
    short: "Akun. Pajak",
    progress: 0,
    lessons: 12,
    duration: "7 jam",
    difficulty: "Lanjut",
    status: "Terkunci",
    color: "from-rose-500/20 to-pink-500/10",
  },
  {
    id: "m6",
    code: "BRV-B-03",
    title: "Pemeriksaan & Sengketa Pajak",
    short: "Sengketa",
    progress: 0,
    lessons: 9,
    duration: "6 jam",
    difficulty: "Lanjut",
    status: "Terkunci",
    color: "from-cyan-500/20 to-blue-500/10",
  },
];

export const recentLessons = [
  {
    id: "l1",
    title: "Definisi Wajib Pajak & NPWP",
    module: "KUP",
    duration: "12 menit",
    progress: 100,
  },
  {
    id: "l2",
    title: "Tarif PPh Pasal 17 untuk Orang Pribadi",
    module: "PPh OP",
    duration: "18 menit",
    progress: 65,
  },
  {
    id: "l3",
    title: "Objek & Bukan Objek PPN",
    module: "PPN",
    duration: "15 menit",
    progress: 30,
  },
  {
    id: "l4",
    title: "SPT Tahunan 1770 & Studi Kasus",
    module: "PPh OP",
    duration: "22 menit",
    progress: 12,
  },
];

export const achievements = [
  { id: "a1", title: "Awal Perjalanan", desc: "Selesaikan materi pertama", earned: true, icon: "sparkles" },
  { id: "a2", title: "Rajin Belajar", desc: "Belajar 7 hari beruntun", earned: true, icon: "flame" },
  { id: "a3", title: "Ahli KUP", desc: "Tuntas modul KUP", earned: false, icon: "shield" },
  { id: "a4", title: "Master Kuis", desc: "Skor 100 pada 5 kuis", earned: false, icon: "trophy" },
];

export const leaderboard = [
  { rank: 1, name: "Siti Nurhaliza", city: "Bandung", xp: 8420 },
  { rank: 2, name: "Budi Santoso", city: "Surabaya", xp: 7290 },
  { rank: 3, name: "Rangga Prasetyo", city: "Jakarta", xp: 4820, self: true },
  { rank: 4, name: "Dewi Kartika", city: "Yogyakarta", xp: 4610 },
  { rank: 5, name: "Andi Wijaya", city: "Medan", xp: 4380 },
];

export const notifications = [
  { id: "n1", title: "Materi baru: PPN atas Ekspor Jasa", time: "10 menit lalu", unread: true },
  { id: "n2", title: "Kuis mingguan siap dikerjakan", time: "2 jam lalu", unread: true },
  { id: "n3", title: "Pencapaian baru: Rajin Belajar 🔥", time: "Kemarin", unread: false },
  { id: "n4", title: "Pengingat rencana belajar hari ini", time: "Kemarin", unread: false },
];

export const glossary = [
  { term: "NPWP", def: "Nomor Pokok Wajib Pajak sebagai identitas wajib pajak dalam administrasi perpajakan." },
  { term: "PPh", def: "Pajak Penghasilan yang dikenakan atas penghasilan yang diterima atau diperoleh wajib pajak." },
  { term: "PPN", def: "Pajak Pertambahan Nilai yang dikenakan atas konsumsi barang dan jasa di dalam Daerah Pabean." },
  { term: "SPT", def: "Surat Pemberitahuan yang digunakan untuk melaporkan perhitungan dan pembayaran pajak." },
  { term: "PTKP", def: "Penghasilan Tidak Kena Pajak sebagai pengurang penghasilan neto orang pribadi." },
  { term: "DPP", def: "Dasar Pengenaan Pajak yang digunakan untuk menghitung besarnya pajak yang terutang." },
];

export const quizQuestion = {
  no: 3,
  total: 10,
  question:
    "Berapa tarif PPh Pasal 17 untuk penghasilan kena pajak orang pribadi antara Rp60.000.000 sampai Rp250.000.000?",
  options: [
    { key: "A", text: "5%" },
    { key: "B", text: "15%" },
    { key: "C", text: "25%" },
    { key: "D", text: "30%" },
  ],
  correct: "B",
};

export const lessonContent = {
  module: "PPh Orang Pribadi",
  chapter: "Bab 2 — Tarif & Perhitungan",
  title: "Tarif PPh Pasal 17 untuk Orang Pribadi",
  readingTime: "18 menit",
  difficulty: "Menengah",
  toc: [
    { id: "pengantar", label: "Pengantar" },
    { id: "lapisan-tarif", label: "Lapisan tarif progresif" },
    { id: "contoh", label: "Contoh perhitungan" },
    { id: "studi-kasus", label: "Studi kasus" },
    { id: "ringkasan", label: "Ringkasan" },
  ],
};
