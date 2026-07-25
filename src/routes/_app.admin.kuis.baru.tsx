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
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      { name: "description", content: "Generator prompt AI kuis dan pembuat kuis evaluasi baru tanpa modal." },
    ],
  }),
  component: KelolaKuisBaruPage,
});

function KelolaKuisBaruPage() {
  const { modulesList, chaptersList, lessonsList } = Route.useLoaderData();
  const navigate = useNavigate();

  // Tab State: Default to AI Generator Tab
  const [activeTab, setActiveTab] = useState("ai");

  // Form Fields (Manual)
  const [selectedModuleId, setSelectedModuleId] = useState<string>(modulesList[0]?.id || "UMUM");
  const [judulBaru, setJudulBaru] = useState("");
  const [deskripsiBaru, setDeskripsiBaru] = useState("");
  const [waktuBaru, setWaktuBaru] = useState("20");
  const [nilaiMinimum, setNilaiMinimum] = useState("70");
  const [tipeKuis, setTipeKuis] = useState<"LATIHAN" | "PENILAIAN" | "AKHIR_MODUL">("LATIHAN");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // AI Prompt Generator State
  const [aiSelectedModuleId, setAiSelectedModuleId] = useState<string>(modulesList[0]?.id || "");
  const [generatedPromptText, setGeneratedPromptText] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Claude JSON Import Fields
  const [jsonImportText, setJsonImportText] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Generate Ultimate Master Claude AI Quiz Prompt (Aggregates Module, Chapters, and Lessons)
  const handleGeneratePrompt = () => {
    const mod = modulesList.find((m: any) => m.id === aiSelectedModuleId) || modulesList[0];
    if (!mod) return;

    // Aggregate chapters & lessons for this module
    const modChapters = chaptersList.filter((c: any) => c.moduleId === mod.id);
    let hierarchyText = "";

    if (modChapters.length > 0) {
      modChapters.forEach((ch: any, cIdx: number) => {
        hierarchyText += `\nBab ${cIdx + 1}: ${ch.judul}\n`;
        if (ch.deskripsi) hierarchyText += `  Deskripsi Bab: ${ch.deskripsi}\n`;

        const chapLessons = lessonsList.filter((l: any) => l.chapterId === ch.id);
        chapLessons.forEach((l: any, lIdx: number) => {
          hierarchyText += `  - Materi ${lIdx + 1}: ${l.judul}\n`;
        });
      });
    } else {
      hierarchyText = "(Gunakan cakupan materi umum modul ini)";
    }

    const fullPrompt = `[SYSTEM INSTRUCTION & MASTER QUIZ PROMPT]
Anda adalah Ahli Pembuat Soal Ujian Perpajakan (Brevet A & B) dan Konsultan Pajak Senior di BrevetAI.

TUGAS UTAMA ANDA:
Lakukan analisis mendalam terhadap seluruh struktur kurikulum dan materi pembelajaran berikut:

MODUL PEMBELAJARAN:
Judul Modul: "${mod.judul}"
Deskripsi Modul: "${mod.deskripsi || 'Materi perpajakan resmi Brevet A & B sesuai UU HPP.'}"
Tingkat Kesulitan: ${mod.tingkatKesulitan || 'DASAR'}

DAFTAR BAB & MATERI DALAM MODUL INI:
${hierarchyText}

INSTRUKSI PENYUSUNAN SOAL UJIAN KUIS:
1. Susunlah 10 - 15 Soal Kuis Evaluasi Ujian Pilihan Ganda (4 Opsi: A, B, C, D) yang SANGAT MENDALAM dan BERKUALITAS TINGGI.
2. Soal harus mencakup studi kasus dunia nyata, perhitungan matematika pajak (seperti TER PPh 21, PPh Badan, PTKP, PPN 11%-12%), dan landasan hukum UU HPP No. 7/2021, PP 55/2022, PMK 168/2023, serta sistem Coretax DJP.
3. Setiap soal WAJIB memiliki kunci jawaban tepat 1 (isBenar: true) dan pembahasan teoretis/hukum yang jelas.

ATURAN KHUSUS DIAGRAM & GAMBAR VISUAL (PROMPT GAMBAR):
Jika suatu soal membutuhkan gambar/diagram pendukung (misalnya alur sistem Coretax, format e-Faktur, formulir SPT, atau alur pemotongan pajak), sertakan properti "promptGambar" yang berisi deskripsi prompt gambar bahasa Inggris yang detail agar admin dapat meng-generate gambar pendukung melalui AI Image Generator.

ATURAN WAJIB OUTPUT CLAUDE ARTIFACT / CANVAS:
1. Hasilkan seluruh output dalam bentuk **Claude Artifact / Canvas (JSON File)** agar pengguna dapat langsung mengunduhnya atau menyalinnya secara utuh.
2. Output WAJIB 100% VALID JSON MURNI tanpa teks pembuka atau penutup di luar JSON.

SKEMA STRUCTURE JSON ARTIFACT KUIS:
{
  "judul": "Kuis Evaluasi: ${mod.judul}",
  "deskripsi": "Ujian kompetensi perpajakan Brevet A/B untuk modul ${mod.judul}.",
  "batasWaktuMenit": 20,
  "nilaiMinimumLulus": 70,
  "pertanyaan": [
    {
      "teksPertanyaan": "Berapa PPh Pasal 21 terutang bulan Januari untuk Karyawan A jika...",
      "tipeSoal": "PILIHAN_GANDA",
      "pembahasan": "Sesuai PMK 168/2023 TER Kategori A tarif 1.5% x Rp 7.500.000 = Rp 112.500...",
      "promptGambar": "A detailed professional diagram showing tax withholding calculation flow for PPh 21 TER Category A in Indonesia",
      "urutan": 1,
      "opsi": [
        { "kode": "A", "teks": "Rp 112.500", "isBenar": true },
        { "kode": "B", "teks": "Rp 150.000", "isBenar": false },
        { "kode": "C", "teks": "Rp 200.000", "isBenar": false },
        { "kode": "D", "teks": "Rp 75.000", "isBenar": false }
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
    toast.success("Prompt Kuis berhasil disalin!");
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
          moduleId: aiSelectedModuleId,
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
        title="AI Generator & Kuis Baru"
        description="Pilih modul untuk menganalisis seluruh data materi dan hasilkan prompt Claude AI atau buat kuis manual."
        breadcrumb={[
          { label: "Admin", to: "/admin/dashboard" },
          { label: "Kuis", to: "/admin/kuis" },
          { label: "AI Generator & Kuis Baru" },
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
                <Sparkles className="mr-1.5 h-4 w-4 text-primary" /> 1. Generator Prompt AI Kuis (Riset Analisis Modul)
              </TabsTrigger>
              <TabsTrigger value="form" className="font-semibold text-xs py-2.5">
                <ClipboardList className="mr-1.5 h-4 w-4 text-primary" /> 2. Form Kuis Manual
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: AI GENERATOR PROMPT (ANALISIS DATABASES MODUL & MATERI) */}
            <TabsContent value="ai" className="space-y-6">
              <div className="rounded-xl border bg-muted/20 p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" /> Langkah 1: Pilih Modul Untuk Dianalisis AI
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sistem akan mengambil seluruh judul bab, deskripsi, dan materi dalam modul ini untuk disusun menjadi prompt analisis Claude AI.
                    </p>
                  </div>
                  <div className="w-72">
                    <select
                      value={aiSelectedModuleId}
                      onChange={(e) => setAiSelectedModuleId(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
                    >
                      {modulesList.length === 0 && <option value="">Belum ada modul terdaftar...</option>}
                      {modulesList.map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.judul}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button onClick={handleGeneratePrompt} className="font-bold text-xs shadow-sm bg-primary text-primary-foreground">
                  <Sparkles className="mr-1.5 h-4 w-4" /> ⚡ Generate Prompt Analisis Modul & Materi
                </Button>
              </div>

              {/* Prompt Result Output */}
              {generatedPromptText && (
                <div className="rounded-xl border bg-muted/30 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-success" /> Prompt Analisis Modul Siap Disalin ke Claude.ai:
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
                  {isImporting ? "Mengimpor Kuis..." : "⚡ Impor & Buat Kuis Evaluasi Otomatis"}
                </Button>
              </div>
            </TabsContent>

            {/* TAB 2: FORM MANUAL */}
            <TabsContent value="form" className="space-y-6 pt-2">
              <form onSubmit={handleSimpanManual} className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Judul Kuis Evaluasi *</Label>
                  <Input
                    value={judulBaru}
                    onChange={(e) => setJudulBaru(e.target.value)}
                    placeholder="Contoh: Ujian Kuis Evaluasi KUP & CoreTax System"
                    required
                    className="text-sm font-bold bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Deskripsi Kuis</Label>
                  <Textarea
                    value={deskripsiBaru}
                    onChange={(e) => setDeskripsiBaru(e.target.value)}
                    placeholder="Penjelasan ringkas cakupan materi ujian..."
                    rows={3}
                    className="text-sm bg-background"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Terikat Modul</Label>
                    <select
                      value={selectedModuleId}
                      onChange={(e) => setSelectedModuleId(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
                    >
                      <option value="UMUM">UMUM / LATIHAN MANDIRI (Tanpa Modul)</option>
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
                    Simpan Kuis Manual
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
