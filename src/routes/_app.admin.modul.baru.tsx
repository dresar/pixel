import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Sparkles,
  BookOpen,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buatModulBaru, getDaftarModul, getRoadmap, imporBanyakModulAdmin } from "@/functions/modules";

export const Route = createFileRoute("/_app/admin/modul/baru")({
  loader: async () => {
    try {
      const [roadmapRes, modulRes] = await Promise.all([
        getRoadmap(),
        getDaftarModul({ data: { halaman: 1, per_halaman: 50 } }),
      ]);
      return {
        roadmapLevels: roadmapRes.success && roadmapRes.data ? roadmapRes.data : [],
        existingModules: modulRes.success && modulRes.data ? modulRes.data : [],
      };
    } catch {
      return { roadmapLevels: [], existingModules: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "AI Generator & Modul Baru — Admin BrevetAI" },
      { name: "description", content: "Generator prompt AI modul lanjutan dan pembuat modul kurikulum baru tanpa modal." },
    ],
  }),
  component: KelolaModulBaruPage,
});

function KelolaModulBaruPage() {
  const { roadmapLevels, existingModules } = Route.useLoaderData();
  const navigate = useNavigate();

  // Tab State: Default to AI Generator Tab
  const [activeTab, setActiveTab] = useState("ai");

  // Form Fields (Manual)
  const [levelId, setLevelId] = useState(roadmapLevels[0]?.id || "00000000-0000-0000-0000-000000000001");
  const [judulBaru, setJudulBaru] = useState("");
  const [deskripsiBaru, setDeskripsiBaru] = useState("");
  const [tingkatBaru, setTingkatBaru] = useState<"DASAR" | "MENENGAH" | "LANJUT">("DASAR");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // AI Prompt Continuity Fields
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [jsonImportText, setJsonImportText] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Generate Ultimate Continuity Curriculum Prompt
  const getContinuityPromptText = () => {
    const existingListText =
      existingModules.length > 0
        ? existingModules.map((m: any, i: number) => `${i + 1}. ${m.judul}: ${m.deskripsi || "-"}`).join("\n")
        : "(Belum ada modul di database)";

    return `Anda adalah Ahli Kurikulum & Pengajar Utama Brevet Pajak A & B Indonesia di BrevetAI.

Daftar modul yang SUDAH TERSEDIA di database BrevetAI saat ini adalah:
${existingListText}

TUGAS UTAMA ANDA (KONTINUITAS KURIKULUM):
1. Analisis modul-modul di atas agar materi tidak tumpang tindih atau berulang.
2. Buatkan MODUL LANJUTAN BERIKUTNYA (Modul Ke-${existingModules.length + 1}) beserta Bab (Chapters) dan Materi (Lessons) lengkap secara mendalam.
3. Setiap materi WAJIB berisi penjelasan teoretis, landasan hukum pasal UU HPP/PPh/PPN terbaru, contoh kasus perhitungan nyata, dan glosarium istilah.

ATURAN WAJIB OUTPUT CLAUDE ARTIFACT / CANVAS:
1. Hasilkan seluruh output dalam bentuk **Claude Artifact / Canvas (JSON File)**.
2. Output WAJIB berupa SATU ARRAY JSON MURNI 3-level (Modul -> Bab -> Materi -> kontenJson) tanpa menyertakan key "estimasiMenit".

SKEMA STRUCTURE JSON ARTIFACT MODUL:
[
  {
    "judul": "Judul Modul Lanjutan Kebijakan Perpajakan...",
    "deskripsi": "Deskripsi lengkap modul lanjutan...",
    "tingkatKesulitan": "MENENGAH",
    "urutan": ${existingModules.length + 1},
    "levelKode": "BREVET_A",
    "bab": [
      {
        "judul": "Bab 1: Scope & Subjek Pajak...",
        "deskripsi": "Deskripsi bab...",
        "urutan": 1,
        "materi": [
          {
            "judul": "Materi 1.1: Pemotongan & Pemungutan...",
            "slug": "materi-1-1-pemotongan",
            "kontenJson": {
              "versi": "2.0",
              "metadata": { "tipe": "EDUKASI_TEKS" },
              "blok_konten": [
                {
                  "tipe": "PARAGRAF",
                  "data": { "teks": "Penjelasan mendalam..." }
                },
                {
                  "tipe": "PASAL_HUKUM",
                  "data": {
                    "undang_undang": "UU HPP No. 7/2021",
                    "pasal": "Pasal 17",
                    "bunyi_pasal": "Tarif PPh Pasal 21..."
                  }
                }
              ]
            }
          }
        ]
      }
    ]
  }
]`;
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(getContinuityPromptText());
    setCopiedPrompt(true);
    toast.success("Prompt Kontinuitas Kurikulum berhasil disalin!");
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleImportJsonAndSave = async () => {
    if (!jsonImportText.trim()) return;
    setIsImporting(true);
    setStatusMsg(null);

    try {
      let parsed = JSON.parse(jsonImportText.trim());
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }

      const res = await imporBanyakModulAdmin({
        data: {
          modulList: parsed,
        },
      });

      if (res.success) {
        toast.success(res.message);
        setTimeout(() => {
          navigate({ to: "/admin/modul" });
        }, 1200);
      } else {
        toast.error(res.message || "Gagal mengimpor modul.");
      }
    } catch (e: any) {
      toast.error(e.message || "Format JSON tidak valid. Pastikan menyalin dari Claude AI Canvas.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleSimpanManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judulBaru) return;
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await buatModulBaru({
        data: {
          levelId,
          judul: judulBaru,
          deskripsi: deskripsiBaru || undefined,
          tingkatKesulitan: tingkatBaru,
          estimasiMenit: 0,
          urutan: existingModules.length + 1,
        },
      });

      if (res.success) {
        toast.success("Modul baru berhasil disimpan di database Neon!");
        setTimeout(() => {
          navigate({ to: "/admin/modul" });
        }, 1200);
      } else {
        toast.error(res.message || "Gagal membuat modul");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="AI Generator & Modul Baru"
        description="Fitur pembuat modul baru dan Generator Prompt AI Modul Lanjutan dengan kontinuitas kurikulum berkelanjutan (In-Page View, Tanpa Modal)."
        breadcrumb={[
          { label: "Admin", to: "/admin/dashboard" },
          { label: "Modul", to: "/admin/modul" },
          { label: "AI Generator & Modul Baru" },
        ]}
        actions={
          <Button size="sm" variant="outline" onClick={() => navigate({ to: "/admin/modul" })} className="font-bold shadow-2xs">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke Daftar Modul
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
                <Sparkles className="mr-1.5 h-4 w-4 text-primary" /> 1. Generator Prompt AI Modul Lanjutan (Kontinuitas Kurikulum)
              </TabsTrigger>
              <TabsTrigger value="form" className="font-semibold text-xs py-2.5">
                <BookOpen className="mr-1.5 h-4 w-4 text-primary" /> 2. Form Modul Baru Manual
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: AI GENERATOR MODUL LANJUTAN (KONTINUITAS KURIKULUM) */}
            <TabsContent value="ai" className="space-y-6">
              <div className="rounded-xl border bg-muted/20 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" /> Langkah 1: Salin Prompt Kontinuitas Kurikulum
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Sistem secara otomatis telah merangkum {existingModules.length} modul yang sudah ada di database saat ini agar Claude AI membuat Modul Lanjutan Ke-{existingModules.length + 1} tanpa duplikasi.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleCopyPrompt} className="font-bold text-xs">
                    {copiedPrompt ? <Check className="mr-1.5 h-4 w-4 text-success" /> : <Copy className="mr-1.5 h-4 w-4 text-primary" />}
                    {copiedPrompt ? "Tersalin!" : "Salin Prompt Lanjutan"}
                  </Button>
                </div>

                <Textarea
                  readOnly
                  rows={8}
                  value={getContinuityPromptText()}
                  className="font-mono text-xs bg-background p-4 leading-relaxed border-primary/20"
                />
              </div>

              {/* JSON Importer */}
              <div className="border-t pt-6 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <FileJson className="h-4 w-4 text-primary" /> Langkah 2: Tempel Hasil JSON Canvas Claude AI
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Tempelkan JSON hasil dari Claude AI di bawah ini untuk menambahkan modul lanjutan beserta bab dan materinya secara otomatis ke database.
                  </p>
                </div>

                <Textarea
                  rows={8}
                  value={jsonImportText}
                  onChange={(e) => setJsonImportText(e.target.value)}
                  placeholder='Tempelkan JSON hasil balasan Claude AI di sini...'
                  className="font-mono text-xs bg-background p-4"
                />

                <Button
                  onClick={handleImportJsonAndSave}
                  disabled={!jsonImportText.trim() || isImporting}
                  className="font-bold text-xs px-6 py-2.5 bg-primary text-primary-foreground shadow-md"
                >
                  {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {isImporting ? "Mengimpor Ke Database..." : "⚡ Impor & Tambahkan Modul Lanjutan Ke Database"}
                </Button>
              </div>
            </TabsContent>

            {/* TAB 2: FORM MANUAL MODUL BARU */}
            <TabsContent value="form" className="space-y-6 pt-2">
              <form onSubmit={handleSimpanManual} className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Judul Modul Pembelajaran *</Label>
                  <Input
                    value={judulBaru}
                    onChange={(e) => setJudulBaru(e.target.value)}
                    placeholder="Contoh: Akuntansi Perpajakan & Laporan Keuangan Fiskal"
                    required
                    className="text-sm font-bold bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Deskripsi Modul</Label>
                  <Textarea
                    value={deskripsiBaru}
                    onChange={(e) => setDeskripsiBaru(e.target.value)}
                    placeholder="Cakupan materi dan pembahasan modul..."
                    rows={3}
                    className="text-sm bg-background"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold font-mono">Tingkat Kesulitan</Label>
                    <select
                      value={tingkatBaru}
                      onChange={(e) => setTingkatBaru(e.target.value as any)}
                      className="w-full h-10 px-3.5 rounded-xl border bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
                    >
                      <option value="DASAR">DASAR</option>
                      <option value="MENENGAH">MENENGAH</option>
                      <option value="LANJUT">LANJUT</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Tingkat Level Kurikulum</Label>
                    <select
                      value={levelId}
                      onChange={(e) => setLevelId(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
                    >
                      {roadmapLevels.map((lvl: any) => (
                        <option key={lvl.id} value={lvl.id}>
                          {lvl.judul} ({lvl.kodeLevel})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => navigate({ to: "/admin/modul" })}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={loading || !judulBaru.trim()} className="font-bold shadow-md">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan Modul Manual
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
