import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Scale,
  Plus,
  Trash2,
  Sparkles,
  Search,
  FileCode,
  Loader2,
  X,
  Upload,
  ExternalLink,
  Copy,
  Check,
  Download,
  Bot,
  Wand2,
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
  getReferensiHukum,
  tambahReferensiHukumAdmin,
  hapusReferensiHukumAdmin,
  imporBanyakReferensiAdmin,
} from "@/functions/referensi";
import { getDaftarMateriSiswa } from "@/functions/modules";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/referensi")({
  loader: async () => {
    try {
      const [referensiRes, lessonsRes] = await Promise.all([
        getReferensiHukum({ data: {} }),
        getDaftarMateriSiswa().catch(() => ({ success: false, data: [] })),
      ]);
      return {
        items: referensiRes.success && referensiRes.data ? referensiRes.data : [],
        lessonsList: lessonsRes.success && lessonsRes.data ? lessonsRes.data : [],
      };
    } catch {
      return { items: [], lessonsList: [] };
    }
  },
  head: () => ({
    meta: [{ title: "Kelola Referensi Hukum — Admin BrevetAI" }],
  }),
  component: AdminReferensi,
});

function AdminReferensi() {
  const { items, lessonsList } = Route.useLoaderData();
  const router = useRouter();
  const [cari, setCari] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPromptStudio, setShowPromptStudio] = useState(false);

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [pastedAiJson, setPastedAiJson] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form tambah referensi
  const [form, setForm] = useState({
    nomorPeraturan: "",
    judul: "",
    kategori: "UU",
    tahun: "2024",
    ringkasan: "",
    urlDokumen: "",
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
                if (b.tipe === "PASAL_HUKUM") return `• PASAL HUKUM: ${b.data?.undang_undang || ""} ${b.data?.pasal || ""} ("${b.data?.bunyi_pasal || ""}")`;
                if (b.tipe === "PARAGRAF") return `• TEKS: ${b.data?.teks || ""}`;
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

  // 🚀 MASTER PROMPT GENERATOR FOR REFERENSI HUKUM (EMBEDS ALL MODULES & LESSONS FROM DB)
  const masterReferensiPrompt = useMemo(() => {
    return `[SYSTEM PROMPT MASTER EXHAUSTIVE: GENERATOR REFERENSI HUKUM PERPAJAKAN BREVET A & B]

Anda adalah Lead Tax Legal Expert dan Konsultan Pajak Senior di BrevetAI.

TUGAS UTAMA ANDA:
Analisislah SELURUH MATERI & MODUL PEMBELAJARAN PERPAJAKAN di bawah ini, lalu ekstraksilah SEMUA PERATURAN & REFERENSI HUKUM PERPAJAKAN RESMI (UU, PMK, PP, PER DJP, SE DJP) yang menjadi landasan hukum kurikulum Brevet A & B.

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
    "nomorPeraturan": "PMK No. 168/2023",
    "judul": "Petunjuk Pelaksanaan Pemotongan Pajak atas Penghasilan Sehubungan dengan Pekerjaan, Jasa, atau Kegiatan Orang Pribadi",
    "kategori": "PMK",
    "tahun": "2023",
    "ringkasan": "Mengatur skema pemotongan PPh Pasal 21 bulanan menggunakan Tarif Efektif Rata-Rata (TER) Kategori A, B, dan C.",
    "urlDokumen": "https://pajak.go.id"
  },
  {
    "nomorPeraturan": "UU No. 7 Tahun 2021",
    "judul": "Undang-Undang tentang Harmonisasi Peraturan Perpajakan (UU HPP)",
    "kategori": "UU",
    "tahun": "2021",
    "ringkasan": "Mengubah tarif PPh Orang Pribadi Pasal 17, PPN 11%, integrasi NIK-NPWP Coretax, dan Program Pengungkapan Sukarela.",
    "urlDokumen": "https://pajak.go.id"
  }
]
\`\`\`

MOHON HASILKAN SEBANYAK MUNGKIN REFERENSI PERATURAN HUKUM PENTING LENGKAP TANPA ADA YANG DIPOTONG!`;
  }, [fullCurriculumContext]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(masterReferensiPrompt);
    setCopiedPrompt(true);
    toast.success("Master Prompt Referensi Hukum berhasil disalin! Siap dipaste ke Claude 3.5 Sonnet / ChatGPT.");
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleDownloadPrompt = (format: "txt" | "md") => {
    const content = format === "md"
      ? `# Master Prompt Referensi Hukum Perpajakan BrevetAI\n\n> Ditulis: ${new Date().toLocaleString("id-ID")}\n\n---\n\n\`\`\`xml\n${masterReferensiPrompt}\n\`\`\``
      : masterReferensiPrompt;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `master-prompt-referensi-hukum.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`File Master Prompt Referensi berhasil diunduh (.${format})`);
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
        toast.error("Format JSON tidak valid! Wajib berupa Array Objek Referensi [ { ... } ].");
        return;
      }

      const res = await imporBanyakReferensiAdmin({ data: { items: parsed } });
      if (res.success) {
        toast.success(`Berhasil mengimpor ${parsed.length} Referensi Hukum baru ke database Neon!`);
        setShowPromptStudio(false);
        setPastedAiJson("");
        router.invalidate();
      } else {
        toast.error(res.message || "Gagal mengimpor data referensi");
      }
    } catch {
      toast.error("Format JSON tidak valid. Pastikan format JSON berupa Array Objek.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimpanBaru = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nomorPeraturan || !form.judul || !form.ringkasan) return;
    setLoading(true);
    try {
      const res = await tambahReferensiHukumAdmin({ data: form });
      if (res.success) {
        setShowAddForm(false);
        setForm({ nomorPeraturan: "", judul: "", kategori: "UU", tahun: "2024", ringkasan: "", urlDokumen: "" });
        toast.success(`Referensi "${form.nomorPeraturan}" berhasil ditambahkan!`);
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
      await hapusReferensiHukumAdmin({ data: { id: deleteTargetId } });
      setDeleteTargetId(null);
      toast.success("Referensi hukum berhasil dihapus!");
      router.invalidate();
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(
    (item: any) =>
      item.nomorPeraturan.toLowerCase().includes(cari.toLowerCase()) ||
      item.judul.toLowerCase().includes(cari.toLowerCase()) ||
      item.ringkasan.toLowerCase().includes(cari.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Kelola Referensi Peraturan Hukum"
        description="Kelola Undang-Undang, PMK, PER DJP, dan regulasi resmi perpajakan."
        breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Referensi Hukum" }]}
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
              <Plus className="h-4 w-4" /> {showAddForm ? "Tutup Formulir" : "Tambah Peraturan Baru"}
            </Button>
          </div>
        }
      />

      <PageBody className="space-y-6">
        {/* IN-PAGE MASTER EXTERNAL PROMPT STUDIO PANEL FOR REFERENSI (FULL MODULES & LESSONS EMBEDDED) */}
        {showPromptStudio && (
          <div className="rounded-2xl border-2 border-primary/40 bg-card p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between border-b pb-3 gap-2">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" /> Master Prompt Generator Referensi Hukum (Claude 3.5 Sonnet / ChatGPT)
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Mengelompokkan <strong>100% Seluruh Modul & Materi Kurikulum Database Neon DB</strong> untuk mengekstrak dasar hukum resmi.
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
                  Salin Master Prompt Referensi
                </Button>
                <Button size="xs" variant="ghost" onClick={() => setShowPromptStudio(false)} className="text-muted-foreground">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Textarea
              rows={14}
              value={masterReferensiPrompt}
              readOnly
              className="font-mono text-xs leading-relaxed bg-background p-4 border rounded-xl"
            />

            {/* PASTE BOX FOR AI RESULT */}
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Bot className="h-4 w-4 text-emerald-500" /> Tempelkan Hasil Array JSON Referensi Hukum dari Claude / ChatGPT di sini:
              </span>
              <Textarea
                rows={5}
                placeholder={`[
  {
    "nomorPeraturan": "PMK No. 168/2023",
    "judul": "...",
    "kategori": "PMK",
    "tahun": "2023",
    "ringkasan": "...",
    "urlDokumen": "https://pajak.go.id"
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
                  🚀 Terapkan & Impor Referensi Hukum ke Database Neon
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
                <Scale className="h-5 w-5 text-primary" /> Tambah Referensi Peraturan Baru
              </h3>
              <Button size="icon" variant="ghost" onClick={() => setShowAddForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSimpanBaru} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Nomor Peraturan *</label>
                  <Input
                    required
                    placeholder="Contoh: PMK No. 168/2023"
                    value={form.nomorPeraturan}
                    onChange={(e) => setForm({ ...form, nomorPeraturan: e.target.value })}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold">Kategori</label>
                    <Input
                      placeholder="UU / PMK / PP / PER"
                      value={form.kategori}
                      onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold">Tahun</label>
                    <Input
                      placeholder="Contoh: 2024"
                      value={form.tahun}
                      onChange={(e) => setForm({ ...form, tahun: e.target.value })}
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold">Judul Peraturan *</label>
                <Input
                  required
                  placeholder="Judul resmi peraturan perundang-undangan..."
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold">Ringkasan / Subtansi Pokok *</label>
                <Textarea
                  required
                  rows={3}
                  placeholder="Ringkasan poin-poin penting isi peraturan..."
                  value={form.ringkasan}
                  onChange={(e) => setForm({ ...form, ringkasan: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold">URL Tautan Dokumen Resmi (Opsional)</label>
                <Input
                  placeholder="https://pajak.go.id/peraturan/..."
                  value={form.urlDokumen}
                  onChange={(e) => setForm({ ...form, urlDokumen: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="rounded-xl text-xs">
                  Batal
                </Button>
                <Button type="submit" disabled={loading} className="rounded-xl text-xs font-bold">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Peraturan Baru"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nomor peraturan, judul, atau ringkasan..."
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
                  <th className="p-4">Nomor & Kategori</th>
                  <th className="p-4">Judul & Ringkasan</th>
                  <th className="p-4">Tahun</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      Belum ada referensi hukum. Silakan tambah peraturan baru atau gunakan Prompt Generator Referensi.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-all">
                      <td className="p-4 font-bold text-foreground">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-primary font-mono">{item.nomorPeraturan}</span>
                            <Badge variant="secondary" className="text-[10px] rounded-md font-mono">
                              {item.kategori || "PERATURAN"}
                            </Badge>
                          </div>
                          {item.urlDokumen && (
                            <a
                              href={item.urlDokumen}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-blue-500 hover:underline flex items-center gap-1 font-normal"
                            >
                              <ExternalLink className="h-3 w-3" /> Tautan Dokumen
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground leading-relaxed max-w-md">
                        <strong className="text-foreground block mb-0.5">{item.judul}</strong>
                        <span>{item.ringkasan}</span>
                      </td>
                      <td className="p-4 font-mono font-semibold">{item.tahun || "-"}</td>
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
                <DialogTitle>Konfirmasi Hapus Referensi</DialogTitle>
                <DialogDescription>
                  Apakah Anda yakin ingin menghapus referensi hukum ini dari database? Tindakan ini tidak dapat dibatalkan.
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
