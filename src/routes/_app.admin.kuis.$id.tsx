import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  ClipboardList,
  ArrowLeft,
  Clock,
  Check,
  Edit3,
  Trash2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Copy,
  FileJson,
  CheckCircle2,
  AlertCircle,
  FileText,
  Award,
  HelpCircle,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import { useState } from "react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDetailKuis, updateKuisAdmin, hapusKuisAdmin, buatKuisAdmin } from "@/functions/quiz";
import { getDaftarModul } from "@/functions/modules";

export const Route = createFileRoute("/_app/admin/kuis/$id")({
  loader: async ({ params }) => {
    try {
      const [detailRes, modulRes] = await Promise.all([
        getDetailKuis({ data: { id: params.id } }),
        getDaftarModul({ data: { halaman: 1, per_halaman: 50 } }),
      ]);

      const data = detailRes.success && detailRes.data ? detailRes.data : null;
      const modulesList = modulRes.success && modulRes.data ? modulRes.data : [];

      return {
        quiz: data?.quiz || null,
        questions: data?.questions || [],
        modulesList,
      };
    } catch {
      return { quiz: null, questions: [], modulesList: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Detail & Kelola Soal Kuis — Admin BrevetAI" },
      { name: "description", content: "Kelola butir soal, opsi jawaban, dan spesifikasi kuis evaluasi tanpa modal." },
    ],
  }),
  component: DetailKuisAdminPage,
});

function DetailKuisAdminPage() {
  const { quiz, questions: initialQuestions, modulesList } = Route.useLoaderData();
  const navigate = useNavigate();

  if (!quiz) {
    return (
      <>
        <PageHeader
          title="Kuis Tidak Ditemukan"
          description="Kuis yang Anda cari tidak ada di dalam database Neon PostgreSQL atau telah dihapus."
          breadcrumb={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Kuis", to: "/admin/kuis" }]}
        />
        <PageBody>
          <div className="rounded-2xl border bg-card p-12 text-center my-6">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive/50" />
            <h3 className="mt-4 text-lg font-bold">Kuis Tidak Ditemukan</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              Periksa kembali ID URL Anda atau kembali ke halaman daftar kuis untuk melihat daftar resmi.
            </p>
            <Button className="mt-6 font-bold" onClick={() => navigate({ to: "/admin/kuis" })}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Kuis
            </Button>
          </div>
        </PageBody>
      </>
    );
  }

  // State
  const [questions, setQuestions] = useState<any[]>(initialQuestions);
  const [activeTab, setActiveTab] = useState("soal");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // Only delete modal allowed
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Edit Metadata State
  const [judulEdit, setJudulEdit] = useState(quiz.judul || "");
  const [deskripsiEdit, setDeskripsiEdit] = useState(quiz.deskripsi || "");
  const [waktuEdit, setWaktuEdit] = useState(String(quiz.batasWaktuMenit || 15));
  const [nilaiEdit, setNilaiEdit] = useState(String(quiz.nilaiMinimumLulus || 70));
  const [tipeEdit, setTipeEdit] = useState<any>(quiz.tipeKuis || "LATIHAN");
  const [aktifEdit, setAktifEdit] = useState<boolean>(quiz.aktif ?? true);

  // Claude Prompt Generator (Rule 12 + Anti-Duplicate)
  const [promptTopic, setPromptTopic] = useState(`Soal evaluasi tambahan untuk kuis: ${quiz.judul}`);
  const [promptCount, setPromptCount] = useState("5");
  const [includeVisualPrompt, setIncludeVisualPrompt] = useState(true);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // JSON Import
  const [jsonImportText, setJsonImportText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleSimpanMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await updateKuisAdmin({
        data: {
          id: quiz.id,
          judul: judulEdit,
          deskripsi: deskripsiEdit,
          batasWaktuMenit: parseInt(waktuEdit, 10) || 15,
          nilaiMinimumLulus: parseInt(nilaiEdit, 10) || 70,
          tipeKuis: tipeEdit,
          aktif: aktifEdit,
        },
      });

      if (res.success) {
        setStatusMsg({ text: "Perubahan metadata kuis berhasil diperbarui di database Neon!", type: "success" });
      } else {
        setStatusMsg({ text: res.message || "Gagal memperbarui kuis", type: "error" });
      }
    } catch {
      setStatusMsg({ text: "Terjadi kesalahan koneksi ke server", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleHapusKuis = async () => {
    setLoading(true);
    try {
      const res = await hapusKuisAdmin({ data: { id: quiz.id } });
      if (res.success) {
        setDeleteModalOpen(false);
        navigate({ to: "/admin/kuis" });
      } else {
        setStatusMsg({ text: res.message || "Gagal menghapus kuis", type: "error" });
        setDeleteModalOpen(false);
      }
    } catch {
      setStatusMsg({ text: "Terjadi kesalahan sistem saat menghapus kuis", type: "error" });
      setDeleteModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const generateClaudePromptText = () => {
    if (!promptTopic) return;
    const existingQuestionsText = questions
      .map((q, idx) => `${idx + 1}. ${q.pertanyaanTeks}`)
      .join("\n");

    const text = `Anda adalah Ahli Pembuat Soal Ujian Perpajakan (Brevet A & B) di BrevetAI.
Tolong buatkan ${promptCount} soal kuis tambahan pilihan ganda berkualitas tinggi untuk kuis: "${quiz.judul}".
TOPIK SOAL: "${promptTopic}"

ATURAN PENTING GENERASI SOAL (MASTER RULE 12 & ANTI-DUPLIKASI):
1. Setiap soal harus memiliki 4 opsi jawaban (A, B, C, D) dengan tepat 1 jawaban benar.
2. Sertakan dasar hukum pasal dan penjelasan teoretis pada setiap jawaban benar.
${
  existingQuestionsText
    ? `3. PENTING (ANTI-DUPLIKASI): Berikut adalah ${questions.length} soal kuis yang SUDAH ADA di dalam kuis ini. JANGAN MEMBUAT SOAL YANG SAMA ATAU MIRIP DENGAN DAFTAR INI:\n---\n${existingQuestionsText}\n---\nBuat soal yang sepenuhnya baru dan belum pernah ditanyakan di atas!`
    : "3. Buat variasi soal dari tingkat konseptual hingga studi kasus perhitungan nyata."
}
${
  includeVisualPrompt
    ? '4. PROMPT VISUAL CHATGPT (OPSIONAL): Jika ada soal studi kasus yang membutuhkan ilustrasi tabel atau grafik perpajakan, sertakan properti "chatGptImagePrompt" berisi perintah bahasa Inggris detail untuk menghasilkan gambar pendukung di ChatGPT/DALL-E.'
    : ""
}
5. Hasilkan SATU dokumen JSON valid dengan skema resmi berikut:
{
  "judul": "${quiz.judul}",
  "questions": [
    {
      "pertanyaanTeks": "...",
      "penjelasan": "...",
      "poin": 1,
      "chatGptImagePrompt": "A clean tax calculation infographic table...",
      "options": [
        { "teksOpsi": "...", "adalahBenar": true },
        { "teksOpsi": "...", "adalahBenar": false }
      ]
    }
  ]
}
Pastikan hanya mengembalikan JSON murni tanpa markdown pembungkus lain agar dapat langsung diimpor ke dalam sistem BrevetAI CMS.`;

    setGeneratedPrompt(text);
    setCopiedPrompt(false);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <>
      <PageHeader
        title={quiz.judul}
        description="Kelola soal evaluasi."
        breadcrumb={[
          { label: "Admin", to: "/admin/dashboard" },
          { label: "Kuis", to: "/admin/kuis" },
          { label: "Detail" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/kuis" })}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali
            </Button>
            {/* ONLY DELETE ALLOWED AS MODAL */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              className="font-semibold"
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Hapus Kuis
            </Button>
          </div>
        }
      />

      <PageBody className="max-w-5xl space-y-6">
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

        {/* METADATA BAR */}
        <div className="grid gap-4 sm:grid-cols-4 rounded-2xl border bg-card p-5 shadow-xs text-xs">
          <div>
            <p className="text-muted-foreground font-medium">Status Kuis</p>
            <Badge
              variant="outline"
              className={`mt-1 font-bold ${
                aktifEdit
                  ? "border-success/40 bg-success/15 text-success"
                  : "border-destructive/40 bg-destructive/15 text-destructive"
              }`}
            >
              ● {aktifEdit ? "AKTIF" : "NONAKTIF (DRAFT)"}
            </Badge>
          </div>

          <div>
            <p className="text-muted-foreground font-medium">Tipe Kuis Evaluasi</p>
            <Badge variant="secondary" className="mt-1 font-bold">
              {tipeEdit}
            </Badge>
          </div>

          <div>
            <p className="text-muted-foreground font-medium">Batas Waktu & Lulus</p>
            <p className="mt-1 font-bold text-foreground flex items-center gap-1 text-sm">
              <Clock className="h-3.5 w-3.5 text-primary" /> {waktuEdit} Mnt • Min. {nilaiEdit}%
            </p>
          </div>

          <div>
            <p className="text-muted-foreground font-medium">Total Butir Soal</p>
            <p className="mt-1 font-bold text-foreground flex items-center gap-1 text-sm">
              <ClipboardList className="h-3.5 w-3.5 text-primary" /> {questions.length} Soal Tersedia
            </p>
          </div>
        </div>

        {/* FULL PAGE TABS VIEW - NO MODALS FOR VIEWING/EDITING */}
        <div className="rounded-2xl border bg-card p-6 shadow-xs">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="soal" className="font-semibold text-xs py-2 rounded-lg">
                <ClipboardList className="mr-1.5 h-4 w-4 text-primary" /> 1. Butir Soal & Kunci Jawaban
              </TabsTrigger>
              <TabsTrigger value="edit" className="font-semibold text-xs py-2 rounded-lg">
                <Edit3 className="mr-1.5 h-4 w-4 text-primary" /> 2. Edit Metadata Kuis
              </TabsTrigger>
              <TabsTrigger value="ai" className="font-semibold text-xs py-2 rounded-lg">
                <Sparkles className="mr-1.5 h-4 w-4 text-primary" /> 3. Tambah Soal via AI (Rule 12)
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: DAFTAR SOAL */}
            <TabsContent value="soal" className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">Daftar Soal Evaluasi & Kunci Jawaban</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Seluruh butir soal pilihan ganda yang tersimpan di database Neon PostgreSQL untuk kuis ini.
                  </p>
                </div>
                <Button size="sm" onClick={() => setActiveTab("ai")} className="font-bold shadow-2xs">
                  <Plus className="mr-1.5 h-4 w-4" /> Tambah Soal Baru
                </Button>
              </div>

              {questions.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-12 text-center my-4 bg-muted/10">
                  <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/40" />
                  <h4 className="mt-3 font-bold text-sm">Belum Ada Soal di dalam Kuis Ini</h4>
                  <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                    Gunakan Tab ke-3 (Tambah Soal via AI) untuk memerintahkan Claude AI membuatkan 10 soal acak sesuai materi kurikulum.
                  </p>
                  <Button className="mt-5 font-bold" onClick={() => setActiveTab("ai")}>
                    <Sparkles className="mr-1.5 h-4 w-4 text-primary" /> Generate Soal dengan Claude AI
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((q: any, idx: number) => (
                    <div key={q.id || idx} className="rounded-xl border bg-card p-5 space-y-4 shadow-2xs">
                      <div className="flex items-start justify-between gap-4 border-b pb-3">
                        <div className="flex items-start gap-3">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-sm font-bold leading-snug text-foreground">{q.pertanyaanTeks}</p>
                            {q.penjelasan && (
                              <p className="mt-1.5 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border leading-relaxed">
                                💡 <strong>Penjelasan Hukum / Teori:</strong> {q.penjelasan}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="font-mono text-[11px] shrink-0">
                          {q.poin || 1} Poin
                        </Badge>
                      </div>

                      {/* Opsi Jawaban */}
                      <div className="grid gap-2 sm:grid-cols-2 pl-10">
                        {q.options && q.options.map((opt: any, optIdx: number) => {
                          const huruf = ["A", "B", "C", "D"][optIdx] || "•";
                          const isBenar = opt.adalahBenar;
                          return (
                            <div
                              key={opt.id || optIdx}
                              className={`flex items-center gap-2.5 rounded-lg border p-3 text-xs font-medium transition-colors ${
                                isBenar
                                  ? "border-success/60 bg-success/10 text-success-foreground font-bold shadow-2xs"
                                  : "border-border/60 bg-muted/10 text-muted-foreground"
                              }`}
                            >
                              <span
                                className={`grid h-5 w-5 shrink-0 place-items-center rounded text-[10px] font-bold ${
                                  isBenar ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {huruf}
                              </span>
                              <span className="flex-1 leading-snug text-foreground">{opt.teksOpsi}</span>
                              {isBenar && <Check className="h-4 w-4 text-success shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Visual Prompt ChatGPT Notice if any */}
                      {q.chatGptImagePrompt && (
                        <div className="ml-10 rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <ImageIcon className="h-4 w-4 text-primary shrink-0" />
                            <span><strong>Prompt Gambar ChatGPT:</strong> "{q.chatGptImagePrompt}"</span>
                          </span>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(q.chatGptImagePrompt);
                              alert("Prompt gambar ChatGPT tersalin! Tempelkan di DALL-E / ChatGPT untuk membuat ilustrasi.");
                            }}
                            className="text-[10px] h-7 px-2 shrink-0 ml-2"
                          >
                            <Copy className="mr-1 h-3 w-3" /> Salin Prompt Gambar
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 2: EDIT METADATA KUIS */}
            <TabsContent value="edit" className="space-y-6">
              <div className="rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground">
                <p className="font-bold text-foreground">Perubahan Metadata Tanpa Modal</p>
                <p className="mt-0.5">
                  Ubah judul kuis, batas waktu, syarat kelulusan, atau status aktif langsung di halaman penuh.
                </p>
              </div>

              <form onSubmit={handleSimpanMetadata} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="font-bold text-xs">Tipe Kuis Evaluasi</Label>
                    <Select value={tipeEdit} onValueChange={setTipeEdit}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LATIHAN">🟢 LATIHAN MANDIRI (Bisa Diulang Kapan Saja)</SelectItem>
                        <SelectItem value="PENILAIAN">🟡 PENILAIAN KOMPETENSI (Ujian Resmi)</SelectItem>
                        <SelectItem value="AKHIR_MODUL">🔴 UJIAN AKHIR MODUL (Kelulusan Modul)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-xs">Status Aktif Kuis</Label>
                    <Select value={aktifEdit ? "true" : "false"} onValueChange={(v) => setAktifEdit(v === "true")}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">✅ AKTIF (Dapat Dikerjakan Siswa)</SelectItem>
                        <SelectItem value="false">⏸️ NONAKTIF (Draft / Disembunyikan)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-xs">Judul Kuis Evaluasi</Label>
                  <Input
                    value={judulEdit}
                    onChange={(e) => setJudulEdit(e.target.value)}
                    required
                    className="bg-background text-sm font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-xs">Deskripsi Kuis</Label>
                  <Textarea
                    rows={3}
                    value={deskripsiEdit}
                    onChange={(e) => setDeskripsiEdit(e.target.value)}
                    className="bg-background text-sm leading-relaxed"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="font-bold text-xs">Batas Waktu Mengerjakan (Menit)</Label>
                    <Input
                      type="number"
                      value={waktuEdit}
                      onChange={(e) => setWaktuEdit(e.target.value)}
                      min="1"
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-xs">Nilai Minimum Kelulusan (%)</Label>
                    <Input
                      type="number"
                      value={nilaiEdit}
                      onChange={(e) => setNilaiEdit(e.target.value)}
                      min="1"
                      max="100"
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="submit" disabled={loading} className="font-bold px-6 shadow-sm">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Check className="mr-1.5 h-4 w-4" /> Simpan Perubahan Metadata
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* TAB 3: TAMBAH SOAL VIA AI (RULE 12 + ANTI DUPLIKASI) */}
            <TabsContent value="ai" className="space-y-6">
              <div className="rounded-xl border bg-primary/5 border-primary/20 p-4 text-xs text-muted-foreground">
                <p className="font-bold text-primary flex items-center gap-1.5 text-sm">
                  <Sparkles className="h-4 w-4" /> Generator Soal Tambahan via Claude AI (Anti-Duplikasi Otomatis)
                </p>
                <p className="mt-1 leading-relaxed text-foreground/80">
                  Sistem telah otomatis mengenali {questions.length} butir soal yang saat ini ada di dalam kuis "{quiz.judul}". Saat Anda menekan tombol di bawah, prompt akan menginstruksikan Claude AI untuk tidak membuat soal yang duplikat dengan soal yang sudah ada!
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="font-bold text-xs">Topik / Subjek Tambahan yang Ingin Diuji</Label>
                    <Input
                      value={promptTopic}
                      onChange={(e) => setPromptTopic(e.target.value)}
                      placeholder="Contoh: Studi Kasus Perhitungan PPh Pasal 21 Terbaru"
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-xs">Jumlah Soal Tambahan</Label>
                    <Input
                      type="number"
                      value={promptCount}
                      onChange={(e) => setPromptCount(e.target.value)}
                      min="1"
                      max="30"
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="visualPromptDetail"
                    checked={includeVisualPrompt}
                    onChange={(e) => setIncludeVisualPrompt(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <label htmlFor="visualPromptDetail" className="text-xs font-medium cursor-pointer text-foreground">
                    Sertakan instruksi pembuatan <strong>Prompt Gambar untuk ChatGPT/DALL-E</strong> pada studi kasus yang memerlukan ilustrasi visual.
                  </label>
                </div>

                <Button
                  type="button"
                  onClick={generateClaudePromptText}
                  disabled={!promptTopic}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold py-5 text-sm shadow-sm"
                >
                  <Sparkles className="mr-2 h-4 w-4 text-primary" /> Hasilkan Teks Prompt Soal Baru (Anti-Duplikasi)
                </Button>

                {generatedPrompt && (
                  <div className="mt-6 space-y-3 rounded-xl border bg-muted/20 p-5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-bold text-primary flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-success" /> Prompt Soal Tambahan Siap Disalin:
                      </Label>
                      <Button size="sm" variant="outline" onClick={handleCopyPrompt} className="font-semibold shadow-xs">
                        {copiedPrompt ? <Check className="mr-1.5 h-4 w-4 text-success" /> : <Copy className="mr-1.5 h-4 w-4" />}
                        {copiedPrompt ? "Berhasil Disalin!" : "Salin Prompt Sekarang"}
                      </Button>
                    </div>
                    <Textarea
                      rows={10}
                      value={generatedPrompt}
                      readOnly
                      className="font-mono text-xs bg-background/80 leading-relaxed p-4 rounded-lg border-primary/20"
                    />
                  </div>
                )}
              </div>

              <div className="border-t pt-6 space-y-4">
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  <FileJson className="h-4 w-4 text-primary" /> Impor & Simpan Soal Tambahan dari Claude AI
                </h4>
                <p className="text-xs text-muted-foreground">
                  Tempelkan (paste) JSON soal baru dari Claude di bawah ini untuk menambahkannya secara langsung ke dalam kuis ini.
                </p>
                <Textarea
                  rows={8}
                  value={jsonImportText}
                  onChange={(e) => setJsonImportText(e.target.value)}
                  placeholder='{"questions": [{"pertanyaanTeks": "...", "options": [...]}]}'
                  className="font-mono text-xs bg-background p-4 leading-relaxed"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (!jsonImportText) return;
                    try {
                      const parsed = JSON.parse(jsonImportText.trim());
                      const newQs = parsed.questions || [];
                      if (newQs.length === 0) throw new Error("Tidak ada array 'questions' di dalam JSON.");
                      setQuestions([...questions, ...newQs]);
                      setJsonImportText("");
                      setStatusMsg({
                        text: `Berhasil menambahkan ${newQs.length} butir soal baru ke dalam kuis!`,
                        type: "success",
                      });
                      setActiveTab("soal");
                    } catch (err: any) {
                      setJsonError(err.message || "Format JSON tidak valid.");
                    }
                  }}
                  disabled={!jsonImportText}
                  className="font-bold px-6 bg-success text-success-foreground hover:bg-success/90"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Validasi & Tambahkan Soal Baru ke Kuis Ini
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ONLY DELETE MODAL IS ALLOWED (AS PER USER INSTRUCTION: "kecuali delete baru modals boleh") */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" /> Hapus Kuis Evaluasi?
              </DialogTitle>
              <DialogDescription className="text-xs leading-relaxed mt-2">
                Apakah Anda yakin ingin menghapus kuis <strong>"{quiz.judul}"</strong> secara permanen? Seluruh butir soal dan riwayat pengerjaan siswa pada kuis ini juga akan terhapus dari database Neon.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-2 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setDeleteModalOpen(false)}>
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleHapusKuis}
                disabled={loading}
                className="font-bold"
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
