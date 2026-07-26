import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Sparkles,
  ClipboardList,
  Copy,
  Check,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Save,
  Upload,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDaftarModul, getDaftarSemuaChapter, getDaftarSemuaLesson } from "@/functions/modules";
import { buatKuisAdmin, imporKuisLengkapAdmin } from "@/functions/quiz";

export const Route = createFileRoute("/_app/admin/kuis/baru")({
  loader: async () => {
    let modulesList: any[] = [];
    let chaptersList: any[] = [];
    let lessonsList: any[] = [];

    try {
      const mRes = await getDaftarModul({ data: { halaman: 1, per_halaman: 50 } });
      if (mRes && mRes.success && Array.isArray(mRes.data)) {
        modulesList = mRes.data;
      }
    } catch (e) {
      console.error("Gagal memuat modul:", e);
    }

    try {
      const cRes = await getDaftarSemuaChapter();
      if (cRes && cRes.success && Array.isArray(cRes.data)) {
        chaptersList = cRes.data;
      }
    } catch (e) {
      console.error("Gagal memuat chapter:", e);
    }

    try {
      const lRes = await getDaftarSemuaLesson();
      if (lRes && lRes.success && Array.isArray(lRes.data)) {
        lessonsList = lRes.data;
      }
    } catch (e) {
      console.error("Gagal memuat lesson:", e);
    }

    return { modulesList, chaptersList, lessonsList };
  },
  head: () => ({
    meta: [
      { title: "AI Generator & Kuis Baru — Admin BrevetAI" },
      { name: "description", content: "Generator prompt AI kuis berbasis Materi Pembelajaran tanpa modal." },
    ],
  }),
  component: KelolaKuisBaruPage,
});

function KelolaKuisBaruPage() {
  const { modulesList, chaptersList, lessonsList } = Route.useLoaderData();
  const navigate = useNavigate();

  // Tab State: Default to AI Generator Tab
  const [activeTab, setActiveTab] = useState("ai");

  // Selection: Focus on MATERI (Lesson)
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessonsList[0]?.id || "");
  const [selectedModuleId, setSelectedModuleId] = useState<string>(modulesList[0]?.id || "UMUM");

  // Form Fields (Manual)
  const [judulBaru, setJudulBaru] = useState("");
  const [deskripsiBaru, setDeskripsiBaru] = useState("");
  const [waktuBaru, setWaktuBaru] = useState("20");
  const [nilaiMinimum, setNilaiMinimum] = useState("70");
  const [tipeKuis, setTipeKuis] = useState<"LATIHAN" | "PENILAIAN" | "AKHIR_MODUL">("LATIHAN");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // AI Prompt Generator State
  const [generatedPromptText, setGeneratedPromptText] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Claude JSON Import Fields
  const [jsonImportText, setJsonImportText] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Handle select lesson and auto fill info
  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    const les = lessonsList.find((l: any) => l.id === lessonId);
    if (les) {
      setJudulBaru(`Kuis Evaluasi: ${les.judul}`);
      setDeskripsiBaru(`Kuis evaluasi pemahaman materi perpajakan: ${les.judul}`);
    }
  };

  // Generate Ultimate Master Claude AI Quiz Prompt (Full Module Context + Locked Target Lesson Focus)
  const handleGeneratePrompt = () => {
    const lesson = lessonsList.find((l: any) => l.id === selectedLessonId) || lessonsList[0];
    const chapter = lesson ? chaptersList.find((c: any) => c.id === lesson.chapterId) : null;
    const moduleItem = chapter ? modulesList.find((m: any) => m.id === chapter.moduleId) : modulesList[0];

    const lessonTitle = lesson?.judul || "Materi Perpajakan Brevet";
    const chapterTitle = chapter?.judul || "Bab Pelajaran";
    const moduleTitle = moduleItem?.judul || "Modul Brevet Pajak A & B";

    // Aggregasi seluruh Bab & Materi dalam Modul ini dari Database Neon untuk Konteks AI Utuh
    const modChapters = chaptersList.filter((c: any) => c.moduleId === moduleItem?.id);
    let fullModuleHierarchy = "";

    if (modChapters.length > 0) {
      modChapters.forEach((ch: any, cIdx: number) => {
        fullModuleHierarchy += `\n📌 BAB ${cIdx + 1}: ${ch.judul}\n`;
        if (ch.deskripsi) fullModuleHierarchy += `   Deskripsi Bab: ${ch.deskripsi}\n`;

        const chapLessons = lessonsList.filter((l: any) => l.chapterId === ch.id);
        chapLessons.forEach((l: any, lIdx: number) => {
          const isTarget = l.id === lesson?.id;
          fullModuleHierarchy += `   ${isTarget ? "🎯 [TARGET FOKUS KUIS SEKARANG] " : "  - "}Materi ${lIdx + 1}: ${l.judul}\n`;
        });
      });
    } else {
      fullModuleHierarchy = "(Seluruh cakupan materi dalam modul)";
    }

    const fullPrompt = `[SYSTEM INSTRUCTION & MASTER QUIZ PROMPT BERBASIS KONTEKS UTUH MODUL & KUNCI MATERI]
Anda adalah Ahli Pembuat Soal Ujian Perpajakan (Brevet A & B) dan Konsultan Pajak Senior di BrevetAI.

KONTEKS UTUH MODUL & BAB PEMBELAJARAN (UNTUK ACUAN PEMAHAMAN AI):
- Modul Utama: "${moduleTitle}" (${moduleItem?.deskripsi || 'Kurikulum Brevet Pajak A & B.'})
- Struktur Seluruh Bab & Materi dalam Modul Ini:
${fullModuleHierarchy}

🎯 TARGET KUNCI FOKUS SOAL (DILOCK KHUSUS UNTUK MATERI INI):
- TARGET MATERI FOKUS: "${lessonTitle}"
- BAB INDUK MATERI: "${chapterTitle}"

INSTRUKSI PENYUSUNAN SOAL UJIAN KUIS MATERI:
1. Pahami seluruh konteks alur modul di atas, namun KUNCI FOKUS PEMBUATAN SOAL HANYA UNTUK MATERI TERPILIH: "${lessonTitle}".
2. Susunlah 10 - 15 Soal Kuis Evaluasi Ujian Pilihan Ganda (4 Opsi: A, B, C, D) & Esai Perhitungan yang SANGAT MENDALAM tentang "${lessonTitle}".
3. Soal harus mencakup studi kasus perpajakan nyata, pasal-pasal UU HPP, PMK 168/2023, PP 55/2022, serta simulasi pemotongan pajak / Coretax DJP.
4. Setiap soal WAJIB memiliki kunci jawaban (isBenar: true) dan penjelasan teoretis/dasar hukum yang jelas.
5. Jika ada soal studi kasus perincian hitungan, sertakan "promptGambar" (deskripsi gambar bahasa Inggris) untuk menghasilkan grafik/tabel pendukung di DALL-E/ChatGPT.

ATURAN WAJIB OUTPUT CLAUDE ARTIFACT / CANVAS:
Hasilkan seluruh output dalam bentuk **Claude Artifact / Canvas (JSON File)** 100% VALID JSON MURNI tanpa teks di luar JSON.

SKEMA STRUCTURE JSON ARTIFACT KUIS MATERI:
{
  "judul": "Kuis Evaluasi: ${lessonTitle}",
  "deskripsi": "Ujian kompetensi materi ${lessonTitle} pada ${moduleTitle}.",
  "batasWaktuMenit": 20,
  "nilaiMinimumLulus": 70,
  "pertanyaan": [
    {
      "teksPertanyaan": "Berdasarkan materi ${lessonTitle}, tentukan besarnya PPh terutang jika...",
      "tipeSoal": "PILIHAN_GANDA",
      "pembahasan": "Penjelasan hukum dan perhitungan...",
      "promptGambar": "A clear taxation infographic diagram...",
      "urutan": 1,
      "opsi": [
        { "kode": "A", "teks": "Rp 500.000", "isBenar": true },
        { "kode": "B", "teks": "Rp 750.000", "isBenar": false },
        { "kode": "C", "teks": "Rp 1.000.000", "isBenar": false },
        { "kode": "D", "teks": "Rp 250.000", "isBenar": false }
      ]
    }
  ]
}`;

    setGeneratedPromptText(fullPrompt);
    setCopiedPrompt(false);
  };

  // Copy Prompt
  const handleCopyPromptText = () => {
    navigator.clipboard.writeText(generatedPromptText);
    setCopiedPrompt(true);
    toast.success("Prompt Kuis Materi berhasil disalin!");
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Import JSON & Save to DB
  const handleImportJsonAndSave = async () => {
    if (!jsonImportText.trim()) return;
    setIsImporting(true);
    setStatusMsg(null);

    try {
      const parsed = JSON.parse(jsonImportText.trim());
      if (!parsed.judul || !Array.isArray(parsed.pertanyaan || parsed.questions)) {
        throw new Error("Format JSON tidak valid: Properti 'judul' dan array 'pertanyaan' wajib ada.");
      }

      const questionsList = parsed.pertanyaan || parsed.questions;

      const res = await imporKuisLengkapAdmin({
        data: {
          lessonId: selectedLessonId,
          moduleId: selectedModuleId !== "UMUM" ? selectedModuleId : undefined,
          judul: parsed.judul,
          deskripsi: parsed.deskripsi || "Kuis evaluasi materi perpajakan resmi BrevetAI.",
          batasWaktuMenit: parsed.batasWaktuMenit || 20,
          nilaiMinimumLulus: parsed.nilaiMinimumLulus || 70,
          pertanyaan: questionsList.map((q: any) => ({
            teksPertanyaan: q.teksPertanyaan || q.pertanyaanTeks,
            pembahasan: q.pembahasan || q.penjelasan,
            promptGambar: q.promptGambar || q.chatGptImagePrompt,
            opsi: (q.opsi || q.options || []).map((o: any) => ({
              kode: o.kode,
              teks: o.teks || o.teksOpsi,
              isBenar: o.isBenar !== undefined ? o.isBenar : o.adalahBenar,
            })),
          })),
        },
      });

      if (res.success) {
        toast.success(`Berhasil membuat kuis "${parsed.judul}" beserta ${questionsList.length} soal ke database Neon!`);
        setTimeout(() => {
          navigate({ to: "/admin/kuis" });
        }, 1200);
      } else {
        toast.error(res.message || "Gagal mengimpor kuis.");
      }
    } catch (e: any) {
      toast.error(e.message || "Format JSON tidak valid. Pastikan menyalin dari Claude AI Canvas.");
    } finally {
      setIsImporting(false);
    }
  };

  // Manual Save Form Handler
  const handleSimpanManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judulBaru.trim()) return;
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await buatKuisAdmin({
        data: {
          judul: judulBaru.trim(),
          deskripsi: deskripsiBaru || "Kuis evaluasi materi perpajakan resmi BrevetAI.",
          batasWaktuMenit: parseInt(waktuBaru, 10) || 20,
          nilaiMinimumLulus: parseInt(nilaiMinimum, 10) || 70,
          lessonId: selectedLessonId,
          moduleId: selectedModuleId !== "UMUM" ? selectedModuleId : undefined,
          tipeKuis: selectedModuleId !== "UMUM" ? "AKHIR_MODUL" : tipeKuis,
          questions: [],
        },
      });

      if (res.success) {
        toast.success(`Kuis "${judulBaru}" berhasil dibuat! Silakan tambahkan soal.`);
        setTimeout(() => {
          navigate({ to: "/admin/kuis" });
        }, 1200);
      } else {
        toast.error(res.message || "Gagal membuat kuis");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem saat membuat kuis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="AI Generator & Buat Kuis Materi"
        description="Pilih Materi Pelajaran spesifik untuk di-generate kuisnya secara otomatis oleh AI atau dibuat secara manual."
        breadcrumb={[
          { label: "Admin", to: "/admin/dashboard" },
          { label: "Kuis", to: "/admin/kuis" },
          { label: "Buat Kuis Materi" },
        ]}
        actions={
          <Button size="sm" variant="outline" onClick={() => navigate({ to: "/admin/kuis" })} className="font-bold shadow-2xs">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke Daftar Kuis
          </Button>
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

        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 bg-muted/50 p-1 rounded-xl mb-6">
              <TabsTrigger value="ai" className="font-semibold text-xs py-2.5">
                <Sparkles className="mr-1.5 h-4 w-4 text-primary" /> 1. Generator Prompt AI Kuis Berbasis Materi
              </TabsTrigger>
              <TabsTrigger value="form" className="font-semibold text-xs py-2.5">
                <ClipboardList className="mr-1.5 h-4 w-4 text-primary" /> 2. Form Kuis Materi Manual
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: AI GENERATOR PROMPT (BERBASIS MATERI) */}
            <TabsContent value="ai" className="space-y-6">
              <div className="rounded-xl border bg-muted/20 p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" /> Langkah 1: Pilih Materi Pelajaran yang Ingin Dibuatkan Kuis
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sistem akan mengambil isi materi ini untuk disusun menjadi prompt analisis Claude AI.
                    </p>
                  </div>
                  <div className="w-80">
                    <select
                      value={selectedLessonId}
                      onChange={(e) => handleSelectLesson(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
                    >
                      {lessonsList.length === 0 && <option value="">Belum ada materi terdaftar...</option>}
                      {lessonsList.map((l: any) => (
                        <option key={l.id} value={l.id}>
                          📖 {l.judul}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button onClick={handleGeneratePrompt} className="font-bold text-xs shadow-sm bg-primary text-primary-foreground">
                  <Sparkles className="mr-1.5 h-4 w-4" /> ⚡ Generate Prompt Kuis dari Materi Ini
                </Button>
              </div>

              {/* Prompt Result Output */}
              {generatedPromptText && (
                <div className="rounded-xl border bg-muted/30 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-success" /> Prompt Kuis Materi Siap Disalin ke Claude.ai:
                    </Label>
                    <Button size="sm" variant="outline" onClick={handleCopyPromptText} className="font-bold text-xs">
                      {copiedPrompt ? <Check className="mr-1.5 h-4 w-4 text-success" /> : <Copy className="mr-1.5 h-4 w-4 text-primary" />}
                      {copiedPrompt ? "Tersalin!" : "Salin Prompt Kuis"}
                    </Button>
                  </div>
                  <Textarea
                    rows={10}
                    value={generatedPromptText}
                    readOnly
                    className="font-mono text-xs bg-background/90 p-4 leading-relaxed border-primary/20"
                  />
                </div>
              )}

              {/* JSON Importer */}
              <div className="border-t pt-6 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <FileJson className="h-4 w-4 text-primary" /> Langkah 2: Tempel Hasil JSON Canvas Claude AI
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Tempelkan balasan JSON Artifact Canvas dari Claude.ai di bawah ini untuk membuat kuis beserta seluruh soalnya secara otomatis.
                  </p>
                </div>
                <Textarea
                  rows={8}
                  value={jsonImportText}
                  onChange={(e) => setJsonImportText(e.target.value)}
                  placeholder='Tempelkan JSON Artifact Canvas hasil dari Claude.ai di sini...'
                  className="font-mono text-xs bg-background p-4"
                />
                <Button
                  onClick={handleImportJsonAndSave}
                  disabled={!jsonImportText.trim() || isImporting}
                  className="font-bold text-xs px-6 py-2.5 bg-primary text-primary-foreground shadow-md"
                >
                  {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {isImporting ? "Mengimpor Kuis..." : "⚡ Impor & Buat Kuis Materi Otomatis"}
                </Button>
              </div>
            </TabsContent>

            {/* TAB 2: FORM MANUAL */}
            <TabsContent value="form" className="space-y-6 pt-2">
              <form onSubmit={handleSimpanManual} className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Pilih Materi Pelajaran *</Label>
                  <select
                    value={selectedLessonId}
                    onChange={(e) => handleSelectLesson(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
                  >
                    {lessonsList.map((l: any) => (
                      <option key={l.id} value={l.id}>
                        📖 {l.judul}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Judul Kuis Evaluasi *</Label>
                  <Input
                    value={judulBaru}
                    onChange={(e) => setJudulBaru(e.target.value)}
                    placeholder="Contoh: Kuis Evaluasi Definisi Pajak & Ciri-Cirinya"
                    required
                    className="text-sm font-bold bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Deskripsi Kuis</Label>
                  <Textarea
                    value={deskripsiBaru}
                    onChange={(e) => setDeskripsiBaru(e.target.value)}
                    placeholder="Penjelasan ringkas pemahaman materi..."
                    rows={3}
                    className="text-sm bg-background"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Modul Induk</Label>
                    <select
                      value={selectedModuleId}
                      onChange={(e) => setSelectedModuleId(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
                    >
                      <option value="UMUM">UMUM (Tanpa Modul Spefik)</option>
                      {modulesList.map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.judul}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Batas Waktu (Menit)</Label>
                    <Input
                      type="number"
                      value={waktuBaru}
                      onChange={(e) => setWaktuBaru(e.target.value)}
                      className="text-xs font-bold bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Nilai Min. Lulus (%)</Label>
                    <Input
                      type="number"
                      value={nilaiMinimum}
                      onChange={(e) => setNilaiMinimum(e.target.value)}
                      className="text-xs font-bold bg-background"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => navigate({ to: "/admin/kuis" })}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={loading || !judulBaru.trim()} className="font-bold shadow-md">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan Kuis Materi
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </PageBody>
    </>
  );
}
