import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import {
  Plus,
  Search,
  ClipboardList,
  Check,
  Loader2,
  Clock,
  Eye,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Award,
  BookOpen,
  Sparkles,
  Copy,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDaftarKuis, hapusKuisAdmin, imporKuisLengkapAdmin, buatKuisUjiKompetensiRandom } from "@/functions/quiz";
import { getDaftarModul } from "@/functions/modules";

export const Route = createFileRoute("/_app/admin/kuis/")({
  loader: async () => {
    try {
      const [kuisRes, modulRes] = await Promise.all([
        getDaftarKuis(),
        getDaftarModul({ data: { halaman: 1, per_halaman: 50 } }),
      ]);
      return {
        initialQuizList: kuisRes.success && kuisRes.data ? kuisRes.data : [],
        modulesList: modulRes.success && modulRes.data ? modulRes.data : [],
      };
    } catch {
      return { initialQuizList: [], modulesList: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Kelola Kuis Evaluasi — Admin BrevetAI" },
      { name: "description", content: "Daftar kuis evaluasi perpajakan BrevetAI dengan kebijakan tanpa modal untuk CRUD." },
    ],
  }),
  component: AdminKuisListPage,
});

function AdminKuisListPage() {
  const router = useRouter();
  const { initialQuizList, modulesList } = Route.useLoaderData();
  const [quizList, setQuizList] = useState<any[]>(initialQuizList);
  const [cari, setCari] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState("semua");

  // Only Delete Modal is allowed (as per user instruction: "kecuali delete baru modals boleh")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteQuiz, setSelectedDeleteQuiz] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // AI Quiz Prompt Generator State (Strict In-Page)
  const [selectedModuleForAi, setSelectedModuleForAi] = useState<string>(modulesList[0]?.id || "");
  const [copiedQuizPrompt, setCopiedQuizPrompt] = useState(false);
  const [jsonQuizImportText, setJsonQuizImportText] = useState("");
  const [isImportingQuiz, setIsImportingQuiz] = useState(false);

  const getQuizPromptForModule = () => {
    const mod = modulesList.find((m: any) => m.id === selectedModuleForAi) || modulesList[0];
    const modJudul = mod?.judul || "Brevet Pajak A & B";
    const modDeskripsi = mod?.deskripsi || "Ketentuan dan tata cara perpajakan Indonesia.";

    return `[SYSTEM INSTRUCTION & QUIZ GENERATOR PROMPT]
Anda adalah Ahli Pembuat Soal Ujian Perpajakan Brevet A & B Indonesia di BrevetAI.

TUGAS UTAMA ANDA:
Lakukan analisis mendalam terhadap materi kurikulum perpajakan berikut:
MODUL: ${modJudul}
DESKRIPSI MATERI: ${modDeskripsi}

Susunlah 10-15 Soal Kuis Evaluasi Ujian yang terdiri dari KOMBINASI Pilihan Ganda (4 Opsi: A, B, C, D) dan SOAL ESAI (Siswa Mengetik Sendiri).
Setiap soal esai WAJIB memiliki "kunciJawabanEsai", "poinUtama" (Main Points acuan AI Gemini), dan "rentanNilai" (0-100).

ATURAN KHUSUS GAMBAR / DIAGRAM VISUAL:
Jika suatu soal membutuhkan visual pendukung (seperti alur Coretax, skema e-Faktur, form SPT, atau tabel perhitungan), sertakan field "promptGambar" yang berisi deskripsi prompt gambar detail agar admin dapat meng-generate gambar tersebut melalui AI Image Generator.

ATURAN WAJIB OUTPUT CLAUDE ARTIFACT / CANVAS:
1. Hasilkan seluruh output dalam bentuk **Claude Artifact / Canvas (JSON File)**.
2. Output WAJIB 100% VALID JSON MURNI tanpa teks pembuka atau penutup.

SKEMA JSON ARTIFACT KUIS (PILIHAN GANDA & ESAI):
{
  "judul": "Kuis Evaluasi: ${modJudul}",
  "deskripsi": "Ujian kompetensi perpajakan Brevet A/B untuk modul ${modJudul}.",
  "batasWaktuMenit": 25,
  "nilaiMinimumLulus": 70,
  "pertanyaan": [
    {
      "teksPertanyaan": "Berapa PPh Pasal 21 terutang bulan Januari untuk Karyawan A jika...",
      "tipeSoal": "PILIHAN_GANDA",
      "pembahasan": "Sesuai PMK 168/2023 TER Kategori A tarif 1.5% x Rp 7.500.000 = Rp 112.500...",
      "promptGambar": "Ilustrasi tabel tarif efektif TER PPh 21 Kategori A...",
      "urutan": 1,
      "opsi": [
        { "kode": "A", "teks": "Rp 112.500", "isBenar": true },
        { "kode": "B", "teks": "Rp 150.000", "isBenar": false },
        { "kode": "C", "teks": "Rp 200.000", "isBenar": false },
        { "kode": "D", "teks": "Rp 75.000", "isBenar": false }
      ]
    },
    {
      "teksPertanyaan": "Jelaskan secara analisis perbedaan mendasar mekanisme pemotongan PPh 21 sebelum dan sesudah PMK 168/2023 menggunakan kata-kata Anda sendiri...",
      "tipeSoal": "ESAI",
      "pembahasan": "Kunci jawaban acuan lengkap untuk penilaian evaluator AI Gemini.",
      "kunciJawabanEsai": "Mekanisme TER memotong bulanan berdasarkan tabel bruto, sedangkan masa pajak terakhir dihitung ulang secara tahunan.",
      "poinUtama": [
        "Penyederhanaan pemotongan bulanan dengan Tarif Efektif Rata-rata (TER)",
        "Pengelompokan status PTKP menjadi Kategori TER A, B, dan C",
        "Penghitungan ulang akhir tahun pajak tetap menggunakan tarif Pasal 17 ayat 1a UU PPh"
      ],
      "rentanNilai": { "skorMin": 0, "skorMax": 100, "nilaiLulus": 70 },
      "urutan": 2
    }
  ]
}`;
  };

  const handleImportQuizJson = async () => {
    if (!jsonQuizImportText.trim()) return;
    setIsImportingQuiz(true);
    try {
      const parsed = JSON.parse(jsonQuizImportText);
      const res = await imporKuisLengkapAdmin({
        data: {
          moduleId: selectedModuleForAi,
          judul: parsed.judul || "Kuis Evaluasi Brevet A/B",
          deskripsi: parsed.deskripsi,
          batasWaktuMenit: parsed.batasWaktuMenit || 20,
          nilaiMinimumLulus: parsed.nilaiMinimumLulus || 70,
          pertanyaan: parsed.pertanyaan || [],
        },
      });
      if (res.success) {
        toast.success(res.message);
        setJsonQuizImportText("");
        router.invalidate();
      } else {
        toast.error(res.message || "Gagal mengimpor kuis");
      }
    } catch {
      toast.error("Format JSON Kuis tidak valid. Pastikan menyalin dari Claude AI Artifact Canvas.");
    } finally {
      setIsImportingQuiz(false);
    }
  };

  const modulQuizList = quizList.filter((q: any) => Boolean(q.moduleId && q.moduleId !== "UMUM") || q.tipeKuis === "AKHIR_MODUL");
  const umumQuizList = quizList.filter((q: any) => !q.moduleId || q.moduleId === "UMUM" || q.tipeKuis === "LATIHAN" || q.tipeKuis === "PENILAIAN");

  // Filter list
  const filtered = quizList.filter((q: any) => {
    const matchCari = (q.judul || "").toLowerCase().includes(cari.toLowerCase()) ||
      (q.deskripsi || "").toLowerCase().includes(cari.toLowerCase());
    if (!matchCari) return false;

    if (activeFilterTab === "modul") {
      return Boolean(q.moduleId && q.moduleId !== "UMUM") || q.tipeKuis === "AKHIR_MODUL";
    }
    if (activeFilterTab === "umum") {
      return !q.moduleId || q.moduleId === "UMUM" || q.tipeKuis === "LATIHAN" || q.tipeKuis === "PENILAIAN";
    }
    return true;
  });

  const handleHapus = async () => {
    if (!selectedDeleteQuiz) return;
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await hapusKuisAdmin({ data: { id: selectedDeleteQuiz.id } });
      if (res.success) {
        setStatusMsg({ text: `Kuis "${selectedDeleteQuiz.judul}" berhasil dihapus permanen!`, type: "success" });
        setQuizList(quizList.filter((q) => q.id !== selectedDeleteQuiz.id));
        setDeleteModalOpen(false);
      } else {
        setStatusMsg({ text: res.message || "Gagal menghapus kuis", type: "error" });
      }
    } catch {
      setStatusMsg({ text: "Terjadi kesalahan koneksi ke server", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getModuleName = (modId: string | null) => {
    if (!modId || modId === "UMUM") return null;
    const mod = modulesList.find((m: any) => m.id === modId);
    return mod ? mod.judul || (mod as any).title : "Modul Terkait";
  };

  return (
    <>
      <PageHeader
        title="Kuis Evaluasi"
        description="Bank soal ujian perpajakan."
        breadcrumb={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Kuis" }]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await buatKuisUjiKompetensiRandom();
                  if (res.success) {
                    toast.success(res.message);
                    router.invalidate();
                  } else {
                    toast.error(res.message || "Gagal membuat kuis random");
                  }
                } catch {
                  toast.error("Terjadi kesalahan sistem");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="font-bold shadow-2xs text-xs"
            >
              {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Award className="mr-1.5 h-3.5 w-3.5 text-primary" />}
              Kuis Uji Kompetensi Random
            </Button>
            <Button size="sm" asChild className="font-bold shadow-sm text-xs">
              <Link to="/admin/kuis/baru">
                <Plus className="mr-1.5 h-4 w-4" /> Kuis Baru
              </Link>
            </Button>
          </div>
        }
      />

      <PageBody className="space-y-6">
        {statusMsg && (
          <div
            className={`flex items-center gap-2 rounded-xl p-4 text-sm font-semibold shadow-xs ${
              statusMsg.type === "success"
                ? "bg-success/15 text-success border border-success/30"
                : "bg-destructive/15 text-destructive border border-destructive/30"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 rounded-xl bg-muted/50 p-1 border w-fit">
            <button
              onClick={() => setActiveFilterTab("semua")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilterTab === "semua"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua Kuis ({quizList.length})
            </button>
            <button
              onClick={() => setActiveFilterTab("modul")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilterTab === "modul"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Ujian Modul ({modulQuizList.length})
            </button>
            <button
              onClick={() => setActiveFilterTab("umum")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilterTab === "umum"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Latihan Mandiri ({umumQuizList.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari judul kuis evaluasi..."
              className="pl-10 h-10 bg-card shadow-2xs"
            />
          </div>
        </div>

        {/* ZERO DUMMY POLICY: IF EMPTY SHOW CLEAN STATE */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border bg-card p-14 text-center my-6 shadow-xs">
            <ClipboardList className="mx-auto h-14 w-14 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-bold text-foreground">Belum Ada Kuis Evaluasi Terdaftar</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              {cari
                ? `Tidak ditemukan kuis dengan kata kunci "${cari}".`
                : "Database Neon saat ini belum memiliki kuis evaluasi aktif. Klik tombol di bawah untuk membuat kuis baru pada halaman khusus."}
            </p>
            <Button className="mt-6 font-bold shadow-sm" asChild>
              <Link to="/admin/kuis/baru">
                <Plus className="mr-1.5 h-4 w-4" /> Kelola Kuis Evaluasi Baru
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((q: any) => {
              const moduleName = getModuleName(q.moduleId);
              return (
                <div
                  key={q.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border bg-card shadow-xs transition-all hover:shadow-md hover:border-primary/40"
                >
                  <div>
                    {/* Header Top Badge */}
                    <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5 text-xs">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold tracking-wide ${
                          q.aktif !== false
                            ? "border-success/40 bg-success/15 text-success"
                            : "border-destructive/40 bg-destructive/15 text-destructive"
                        }`}
                      >
                        ● {q.aktif !== false ? "AKTIF" : "NONAKTIF"}
                      </Badge>
                      <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
                        <Award className="h-3 w-3 text-primary" /> Min. {q.nilaiMinimumLulus || 70}%
                      </span>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          {q.tipeKuis || "LATIHAN"}
                        </Badge>
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Clock className="h-3.5 w-3.5 text-primary" /> {q.batasWaktuMenit || 15} Menit
                        </span>
                      </div>

                      <h3 className="text-base font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {q.judul}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {q.deskripsi || "Ujian kompetensi perpajakan Brevet A/B berstandar resmi."}
                      </p>

                      {moduleName && (
                        <div className="pt-2 border-t flex items-center gap-1.5 text-[11px] text-primary font-semibold">
                          <BookOpen className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">Modul: {moduleName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="border-t bg-muted/20 p-3 flex items-center justify-between gap-1.5">
                    <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground shrink-0">
                      <ClipboardList className="mr-1 h-3 w-3 text-primary" /> Kuis
                    </Badge>

                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline" asChild className="font-semibold text-xs px-2 h-8">
                        <Link to="/admin/kuis/$id" params={{ id: q.id }}>
                          <Edit3 className="mr-1 h-3.5 w-3.5 text-primary" /> Edit
                        </Link>
                      </Button>

                      <Button size="sm" variant="secondary" asChild className="font-semibold text-xs px-2 h-8">
                        <Link to="/admin/kuis/$id" params={{ id: q.id }}>
                          <Eye className="mr-1 h-3.5 w-3.5 text-primary" /> Soal
                        </Link>
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedDeleteQuiz(q);
                          setDeleteModalOpen(true);
                        }}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive px-2 h-8"
                        title="Hapus Kuis Evaluasi"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ONLY DELETE MODAL IS ALLOWED (AS PER USER INSTRUCTION: "kecuali delete baru modals boleh") */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive font-bold">
                <AlertTriangle className="h-5 w-5" /> Hapus Kuis Evaluasi?
              </DialogTitle>
              <DialogDescription className="text-xs leading-relaxed mt-2 text-muted-foreground">
                Apakah Anda yakin ingin menghapus kuis <strong>"{selectedDeleteQuiz?.judul}"</strong> secara permanen dari database Neon PostgreSQL? Seluruh butir soal dan riwayat jawaban yang berada di bawah kuis ini juga akan ikut terhapus.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-2 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setDeleteModalOpen(false)}>
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleHapus}
                disabled={loading}
                className="font-bold shadow-sm"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ya, Hapus Permanen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageBody>
    </>
  );
}
