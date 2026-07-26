import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Sparkles,
  Search,
  CheckCircle2,
  FileCode,
  Loader2,
  X,
  Upload,
  Copy,
  Check,
  Download,
  Bot,
  Wand2,
  Terminal,
  Cpu,
} from "lucide-react";
import { PageHeader, PageBody } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getGlosarium,
  tambahGlosarium,
  hapusGlosariumAdmin,
  imporBanyakGlosariumAdmin,
} from "@/functions/glossary";
import { getDaftarMateriSiswa } from "@/functions/modules";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/glosarium")({
  loader: async () => {
    try {
      const [glosariumRes, lessonsRes] = await Promise.all([
        getGlosarium({ data: {} }),
        getDaftarMateriSiswa().catch(() => ({ success: false, data: [] })),
      ]);
      return {
        items: glosariumRes.success && glosariumRes.data ? glosariumRes.data : [],
        lessonsList: lessonsRes.success && lessonsRes.data ? lessonsRes.data : [],
      };
    } catch {
      return { items: [], lessonsList: [] };
    }
  },
  head: () => ({
    meta: [{ title: "Kelola Glosarium — Admin BrevetAI" }],
  }),
  component: AdminGlosarium,
});

function AdminGlosarium() {
  const { items, lessonsList } = Route.useLoaderData();
  const router = useRouter();
  const [cari, setCari] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPromptStudio, setShowPromptStudio] = useState(false);

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [pastedAiJson, setPastedAiJson] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form tambah istilah
  const [form, setForm] = useState({
    istilah: "",
    definisi: "",
    contoh: "",
    referensiUndangUndang: "",
    kategori: "PPh",
  });

  // 🌲 FULL CURRICULUM TEXT CONTEXT (EXTRACTED ALL MODULES & LESSONS FROM DB)
  const fullCurriculumContext = useMemo(() => {
    if (!lessonsList || lessonsList.length === 0) {
      return "[DATABASE CONTEXT: Modul & Materi Pembelajaran BrevetAI]";
    }

    const groupedMap = new Map<string, any[]>();
    lessonsList.forEach((l: any) => {
      const groupKey = l.modulJudul || "Modul Perpajakan Brevet A/B";
      if (!groupedMap.has(groupKey)) groupedMap.set(groupKey, []);
      groupedMap.get(groupKey)!.push(l);
    });

    let resultText = "";
    let modCounter = 1;

    groupedMap.forEach((mLessons, mName) => {
      resultText += `=== MODUL ${modCounter}: ${mName.toUpperCase()} ===\n`;
      mLessons.forEach((l: any, lIdx: number) => {
        let fullContentText = "";
        if (l.kontenJson) {
          try {
            const pObj = typeof l.kontenJson === "string" ? JSON.parse(l.kontenJson) : l.kontenJson;
            const bList = pObj.blok_konten || pObj.blocks || (Array.isArray(pObj) ? pObj : []);
            if (Array.isArray(bList)) {
              fullContentText = bList.map((b: any) => {
                if (b.tipe === "PARAGRAF") return `• ${b.data?.teks || b.data?.narasi || ""}`;
                if (b.tipe === "PASAL_HUKUM") return `• PASAL: ${b.data?.undang_undang || ""} ${b.data?.pasal || ""} ("${b.data?.bunyi_pasal || ""}")`;
                if (b.tipe === "GLOSARIUM") return `• GLOSARIUM: ${b.data?.istilah || ""}: ${b.data?.definisi || ""}`;
                if (b.tipe === "CONTOH_KASUS") return `• KASUS: ${b.data?.judul_kasus || ""}`;
                return "";
              }).filter(Boolean).join("\n");
            }
          } catch {
            fullContentText = "";
          }
        }
        resultText += `  Materi ${modCounter}.${lIdx + 1}: ${l.judul}\n${fullContentText}\n`;
      });
      modCounter++;
    });

    return resultText;
  }, [lessonsList]);

  // 🚀 MASTER PROMPT GENERATOR FOR GLOSARIUM (EMBEDS ALL MODULES & LESSONS FROM DB)
  const masterGlosariumPrompt = useMemo(() => {
    return `[SYSTEM PROMPT MASTER EXHAUSTIVE: GENERATOR GLOSARIUM PERPAJAKAN BREVET A & B]

Anda adalah Lead Tax Curriculum Architect dan Konsultan Pajak Senior di BrevetAI.

TUGAS UTAMA ANDA:
Analisislah SELURUH MATERI & MODUL PEMBELAJARAN PERPAJAKAN di bawah ini, lalu ekstraksilah SEMUA ISTILAH TEKNIS PERPAJAKAN (Glosarium) yang ada maupun yang relevan secara komprehensif.

================================================================================
PETA LENGKAP KONTEN MATERI & MODUL PERPAJAKAN DATABASE NEON BREVETAI:
================================================================================
${fullCurriculumContext}

================================================================================
REGULASI PERPAJAKAN INDONESIA TERBARU WAJIB DIRUJUK:
1. UU No. 7 Tahun 2021 tentang Harmonisasi Peraturan Perpajakan (UU HPP).
2. PMK No. 168/2023 tentang Pemotongan PPh Pasal 21/26 (TER Kategori A, B, C).
3. PP No. 55 Tahun 2022 tentang Penyesuaian Pengaturan PPh.
4. PER-16/PJ/2016 tentang Pedoman Teknis Pemotongan PPh.
5. Integrasi Sistem Coretax DJP & E-Bupot 21/26.

================================================================================
INSTRUKSI STRUKTUR OUTPUT (MUST BE PURE VALID JSON ARRAY):
================================================================================
Hasilkan keluaran HANYA berupa array objek JSON valid (tanpa teks pembuka/penutup) dengan format sebagai berikut:

\`\`\`json
[
  {
    "istilah": "PPh Pasal 21 TER",
    "definisi": "Pemotongan Pajak Penghasilan Pasal 21 yang menggunakan Tarif Efektif Rata-Rata berdasarkan PMK 168/2023.",
    "contoh": "Pemotongan PPh 21 bulanan karyawan dengan Kategori TER A, B, atau C.",
    "referensiUndangUndang": "PMK No. 168/2023",
    "kategori": "PPh"
  },
  {
    "istilah": "Coretax DJP",
    "definisi": "Sistem Inti Administrasi Perpajakan terpadu Direktorat Jenderal Pajak.",
    "contoh": "Pendaftaran NPWP NIK 16 digit dan pelaporan SPT Tahunan melalui portal Coretax.",
    "referensiUndangUndang": "UU No. 7 Tahun 2021",
    "kategori": "KUP"
  }
]
\`\`\`

MOHON HASILKAN SEBANYAK MUNGKIN ISTILAH GLOSARIUM PENTING LENGKAP TANPA ADA YANG DIPOTONG!`;
  }, [fullCurriculumContext]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(masterGlosariumPrompt);
    setCopiedPrompt(true);
    toast.success("Master Prompt Glosarium berhasil disalin! Siap dipaste ke Claude 3.5 Sonnet / ChatGPT.");
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleDownloadPrompt = (format: "txt" | "md") => {
    const content = format === "md"
      ? `# Master Prompt Glosarium Perpajakan BrevetAI\n\n> Ditulis: ${new Date().toLocaleString("id-ID")}\n\n---\n\n\`\`\`xml\n${masterGlosariumPrompt}\n\`\`\``
      : masterGlosariumPrompt;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `master-prompt-glosarium.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`File Master Prompt Glosarium berhasil diunduh (.${format})`);
  };

  const handleApplyPastedJson = async () => {
    if (!pastedAiJson.trim()) {
      toast.error("Tempelkan hasil JSON dari Claude / ChatGPT terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      let cleanJson = pastedAiJson.trim();
      if (cleanJson.startsWith("```json")) cleanJson = cleanJson.replace(/^```json/, "").replace(/```$/, "").trim();
      if (cleanJson.startsWith("```")) cleanJson = cleanJson.replace(/^```/, "").replace(/```$/, "").trim();

      const parsed = JSON.parse(cleanJson);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        toast.error("Format JSON tidak valid! Wajib berupa Array Objek Glosarium [ { ... } ].");
        return;
      }

      const res = await imporBanyakGlosariumAdmin({ data: { items: parsed } });
      if (res.success) {
        toast.success(`Berhasil mengimpor ${parsed.length} Istilah Glosarium baru ke database Neon!`);
        setShowPromptStudio(false);
        setPastedAiJson("");
        router.invalidate();
      } else {
        toast.error(res.message || "Gagal mengimpor data glosarium");
      }
    } catch {
      toast.error("Format JSON tidak valid. Pastikan format JSON berupa Array Objek.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimpanBaru = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.istilah || !form.definisi) return;
    setLoading(true);
    try {
      const res = await tambahGlosarium({ data: form });
      if (res.success) {
        setShowAddForm(false);
        setForm({ istilah: "", definisi: "", contoh: "", referensiUndangUndang: "", kategori: "PPh" });
        toast.success(`Istilah "${form.istilah}" berhasil ditambahkan!`);
        router.invalidate();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHapusConfirm = async () => {
    if (!deleteTargetId) return;
    setLoading(true);
    try {
      await hapusGlosariumAdmin({ data: { id: deleteTargetId } });
      setDeleteTargetId(null);
      toast.success("Istilah glosarium berhasil dihapus!");
      router.invalidate();
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(
    (item: any) =>
      item.istilah.toLowerCase().includes(cari.toLowerCase()) ||
      item.definisi.toLowerCase().includes(cari.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Kelola Glosarium Perpajakan"
        description="Kelola istilah perpajakan resmi, definisi, contoh, dan referensi pasal UU."
        breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Glosarium" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* SHORT BUTTON TEXT: ✨ Generate */}
            <Button
              onClick={() => setShowPromptStudio(!showPromptStudio)}
              variant="outline"
              className="font-bold text-xs rounded-xl gap-1.5 border-primary/40 text-primary hover:bg-primary/10 shadow-2xs"
            >
              <Sparkles className="h-4 w-4" /> Generate
            </Button>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="font-bold text-xs rounded-xl gap-1.5 shadow-md">
              <Plus className="h-4 w-4" /> {showAddForm ? "Tutup Formulir" : "Tambah Istilah Baru"}
            </Button>
          </div>
        }
      />

      <PageBody className="space-y-6">
        {/* IN-PAGE MASTER EXTERNAL PROMPT STUDIO PANEL FOR GLOSARIUM (FULL MODULES & LESSONS EMBEDDED) */}
        {showPromptStudio && (
          <div className="rounded-2xl border-2 border-primary/40 bg-card p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between border-b pb-3 gap-2">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" /> Master Prompt Generator Glosarium (Claude 3.5 Sonnet / ChatGPT)
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Mengelompokkan <strong>100% Seluruh Modul & Materi Kurikulum Database Neon DB</strong> untuk mengekstrak glosarium resmi.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button size="xs" variant="outline" onClick={() => handleDownloadPrompt("txt")}>
                  <Download className="mr-1 h-3.5 w-3.5" /> .TXT
                </Button>
                <Button size="xs" variant="outline" onClick={() => handleDownloadPrompt("md")}>
                  <Download className="mr-1 h-3.5 w-3.5" /> .MD
                </Button>
                <Button size="xs" onClick={handleCopyPrompt} className="font-bold">
                  {copiedPrompt ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
                  Salin Master Prompt Glosarium
                </Button>
                <Button size="xs" variant="ghost" onClick={() => setShowPromptStudio(false)} className="text-muted-foreground">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Textarea
              rows={14}
              value={masterGlosariumPrompt}
              readOnly
              className="font-mono text-xs leading-relaxed bg-background p-4 border rounded-xl"
            />

            {/* PASTE BOX FOR AI RESULT */}
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Bot className="h-4 w-4 text-emerald-500" /> Tempelkan Hasil Array JSON Glosarium dari Claude / ChatGPT di sini:
              </span>
              <Textarea
                rows={5}
                placeholder={`[
  {
    "istilah": "PPh Pasal 21 TER",
    "definisi": "...",
    "referensiUndangUndang": "PMK 168/2023",
    "kategori": "PPh"
  }
]`}
                value={pastedAiJson}
                onChange={(e) => setPastedAiJson(e.target.value)}
                className="font-mono text-xs bg-background"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleApplyPastedJson}
                  disabled={loading || !pastedAiJson.trim()}
                  className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />}
                  🚀 Terapkan & Impor Glosarium ke Database Neon
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* IN-PAGE FORM CREATION (STRICT NO MODAL FOR CREATE/UPDATE) */}
        {showAddForm && (
          <div className="rounded-2xl border border-primary/30 bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Tambah Istilah Glosarium Baru
              </h3>
              <Button size="icon" variant="ghost" onClick={() => setShowAddForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSimpanBaru} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Istilah Pajak *</label>
                  <Input
                    required
                    placeholder="Contoh: PPh Pasal 21 TER"
                    value={form.istilah}
                    onChange={(e) => setForm({ ...form, istilah: e.target.value })}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Kategori</label>
                  <Input
                    placeholder="Contoh: PPh, PPN, KUP"
                    value={form.kategori}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold">Definisi Resmi *</label>
                <Textarea
                  required
                  rows={3}
                  placeholder="Jelaskan definisi istilah perpajakan..."
                  value={form.definisi}
                  onChange={(e) => setForm({ ...form, definisi: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Contoh Penerapan Nyata</label>
                  <Input
                    placeholder="Contoh penerapan dalam lapangan..."
                    value={form.contoh}
                    onChange={(e) => setForm({ ...form, contoh: e.target.value })}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Referensi Undang-Undang / PMK</label>
                  <Input
                    placeholder="Contoh: PMK 168/2023 Pasal 5"
                    value={form.referensiUndangUndang}
                    onChange={(e) => setForm({ ...form, referensiUndangUndang: e.target.value })}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="rounded-xl text-xs">
                  Batal
                </Button>
                <Button type="submit" disabled={loading} className="rounded-xl text-xs font-bold">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Istilah Baru"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari istilah atau definisi glosarium..."
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            className="pl-10 rounded-xl text-xs bg-card"
          />
        </div>

        {/* Table List */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Istilah & Kategori</th>
                  <th className="p-4">Definisi</th>
                  <th className="p-4">Referensi UU</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      Belum ada istilah glosarium. Silakan tambah istilah baru atau gunakan Prompt Generator Glosarium.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-all">
                      <td className="p-4 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <span>{item.istilah}</span>
                          <Badge variant="secondary" className="text-[10px] rounded-md font-mono">
                            {item.kategori || "UMUM"}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground leading-relaxed max-w-md">{item.definisi}</td>
                      <td className="p-4 font-mono text-primary font-semibold">{item.referensiUndangUndang || "-"}</td>
                      <td className="p-4 text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteTargetId(item.id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Konfirmasi Hapus */}
        {deleteTargetId && (
          <Dialog open={!!deleteTargetId} onOpenChange={() => setDeleteTargetId(null)}>
            <DialogContent className="rounded-2xl max-w-sm">
              <DialogHeader>
                <DialogTitle>Konfirmasi Hapus Istilah</DialogTitle>
                <DialogDescription>
                  Apakah Anda yakin ingin menghapus istilah glosarium ini dari database? Tindakan ini tidak dapat dibatalkan.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setDeleteTargetId(null)} className="rounded-xl text-xs">
                  Batal
                </Button>
                <Button variant="destructive" onClick={handleHapusConfirm} disabled={loading} className="rounded-xl text-xs font-bold">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hapus Permanen"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </PageBody>
    </>
  );
}
