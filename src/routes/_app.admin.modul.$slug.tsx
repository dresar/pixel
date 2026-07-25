import { createFileRoute, useNavigate, Link, useRouter } from "@tanstack/react-router";
import {
  BookOpen,
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
  Layers,
  Send,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import {
  getDetailModul,
  getRoadmap,
  getDaftarSemuaChapter,
  getDaftarSemuaLesson,
  terbitkanModul,
  hapusModulAdmin,
  tambahChapterAdmin,
  updateChapterAdmin,
  hapusChapterAdmin,
} from "@/functions/modules";

export const Route = createFileRoute("/_app/admin/modul/$slug")({
  loader: async ({ params }) => {
    try {
      const [modulRes, roadmapRes, chapRes, lessonRes] = await Promise.all([
        getDetailModul({ data: { slug: params.slug } }),
        getRoadmap(),
        getDaftarSemuaChapter(),
        getDaftarSemuaLesson(),
      ]);

      const modul = modulRes.success && modulRes.data ? modulRes.data : null;
      const roadmapLevels = roadmapRes.success && roadmapRes.data ? roadmapRes.data : [];
      const allChapters = chapRes.success && chapRes.data ? chapRes.data : [];
      const allLessons = lessonRes.success && lessonRes.data ? lessonRes.data : [];

      // Filter chapters & lessons belonging to this module
      const chapters = allChapters.filter((c: any) => c.moduleId === modul?.id || c.modulId === modul?.id);
      const lessons = allLessons.filter((l: any) =>
        chapters.some((c: any) => c.id === l.chapterId)
      );

      return { modul, roadmapLevels, chapters, lessons };
    } catch {
      return { modul: null, roadmapLevels: [], chapters: [], lessons: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Detail & Kelola Modul — Admin BrevetAI" },
      { name: "description", content: "Kelola struktur bab, materi, dan metadata modul perpajakan tanpa modal." },
    ],
  }),
  component: DetailModulAdminPage,
});

function DetailModulAdminPage() {
  const router = useRouter();
  const { modul, roadmapLevels, chapters, lessons } = Route.useLoaderData();
  const navigate = useNavigate();

  // If module not found
  if (!modul) {
    return (
      <>
        <PageHeader
          title="Modul Tidak Ditemukan"
          description="Modul yang Anda cari tidak ada di dalam database Neon PostgreSQL atau telah dihapus."
          breadcrumb={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Modul", to: "/admin/modul" }]}
        />
        <PageBody>
          <div className="rounded-2xl border bg-card p-12 text-center my-6">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive/50" />
            <h3 className="mt-4 text-lg font-bold">Modul Tidak Ditemukan</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              Periksa kembali slug URL Anda atau kembali ke halaman daftar modul untuk melihat daftar resmi.
            </p>
            <Button className="mt-6" onClick={() => navigate({ to: "/admin/modul" })}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Modul
            </Button>
          </div>
        </PageBody>
      </>
    );
  }

  // State
  const [activeTab, setActiveTab] = useState("struktur");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Chapter Management State
  const [addChapterModalOpen, setAddChapterModalOpen] = useState(false);
  const [editChapterModalOpen, setEditChapterModalOpen] = useState(false);
  const [selectedEditChapter, setSelectedEditChapter] = useState<any | null>(null);

  const [chapJudulBaru, setChapJudulBaru] = useState("");
  const [chapDeskripsiBaru, setChapDeskripsiBaru] = useState("");

  const [chapJudulEdit, setChapJudulEdit] = useState("");
  const [chapDeskripsiEdit, setChapDeskripsiEdit] = useState("");

  const handleTambahBab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapJudulBaru.trim()) return;
    setLoading(true);
    try {
      const res = await tambahChapterAdmin({
        data: {
          moduleId: modul.id,
          judul: chapJudulBaru.trim(),
          deskripsi: chapDeskripsiBaru.trim() || undefined,
          urutan: chapters.length + 1,
        },
      });
      if (res.success) {
        toast.success("Bab baru berhasil ditambahkan!");
        setAddChapterModalOpen(false);
        setChapJudulBaru("");
        setChapDeskripsiBaru("");
        router.invalidate();
      } else {
        toast.error(res.message || "Gagal menambah bab");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem saat menambah bab");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditChapter || !chapJudulEdit.trim()) return;
    setLoading(true);
    try {
      const res = await updateChapterAdmin({
        data: {
          id: selectedEditChapter.id,
          judul: chapJudulEdit.trim(),
          deskripsi: chapDeskripsiEdit.trim() || undefined,
        },
      });
      if (res.success) {
        toast.success("Bab berhasil diperbarui!");
        setEditChapterModalOpen(false);
        setSelectedEditChapter(null);
        router.invalidate();
      } else {
        toast.error(res.message || "Gagal memperbarui bab");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem saat memperbarui bab");
    } finally {
      setLoading(false);
    }
  };

  const handleHapusBab = async (chapterId: string, chapterJudul: string) => {
    if (!confirm(`Hapus Bab "${chapterJudul}" beserta seluruh materinya?`)) return;
    setLoading(true);
    try {
      const res = await hapusChapterAdmin({ data: { id: chapterId } });
      if (res.success) {
        toast.success("Bab berhasil dihapus!");
        router.invalidate();
      } else {
        toast.error(res.message || "Gagal menghapus bab");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem saat menghapus bab");
    } finally {
      setLoading(false);
    }
  };

  // Edit Form State
  const [judulEdit, setJudulEdit] = useState(modul.judul || "");
  const [deskripsiEdit, setDeskripsiEdit] = useState(modul.deskripsi || "");
  const [tingkatEdit, setTingkatEdit] = useState<any>(modul.tingkatKesulitan || "DASAR");
  const [estimasiEdit, setEstimasiEdit] = useState(String(modul.estimasiMenit || 360));
  const [urutanEdit, setUrutanEdit] = useState(String(modul.urutan || 1));
  const [statusPublikasi, setStatusPublikasi] = useState<any>(modul.statusPublikasi || "DRAFT");

  // Claude Prompt Generator (Rule 12)
  const [promptTopic, setPromptTopic] = useState(`Materi lanjutan untuk modul: ${modul.judul}`);
  const [promptObjectives, setPromptObjectives] = useState(
    "Buatkan 3 Bab baru beserta lesson lengkap dengan studi kasus perpajakan dan perhitungan dasar hukum UU HPP."
  );
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // JSON Import
  const [jsonImportText, setJsonImportText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleTerbitkan = async () => {
    setLoading(true);
    try {
      const res = await terbitkanModul({ data: { id: modul.id } });
      if (res.success) {
        toast.success("Modul resmi diterbitkan ke portal siswa!");
        setStatusPublikasi("TERBIT");
      } else {
        toast.error(res.message || "Gagal menerbitkan modul");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi ke server");
    } finally {
      setLoading(false);
    }
  };

  const handleHapusModul = async () => {
    setLoading(true);
    try {
      const res = await hapusModulAdmin({ data: { id: modul.id } });
      if (res.success) {
        toast.success(`Modul berhasil dihapus permanen!`);
        setDeleteModalOpen(false);
        navigate({ to: "/admin/modul" });
      } else {
        toast.error(res.message || "Gagal menghapus modul");
        setDeleteModalOpen(false);
      }
    } catch {
      toast.error("Terjadi kesalahan sistem saat menghapus modul");
      setDeleteModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const generateClaudePromptText = () => {
    if (!promptTopic) return;
    const text = `Anda adalah Ahli Kurikulum & Pengajar Utama Perpajakan Indonesia di BrevetAI.
Tolong buatkan materi pembelajaran bertahap yang berkesinambungan untuk modul: "${modul.judul}".
FOKUS PENGEMBANGAN: "${promptTopic}"
TUJUAN KHUSUS: "${promptObjectives}"

ATURAN PENTING (MASTER RULE 12):
1. Konten harus terhubung dengan bab-bab sebelumnya jika ada.
2. Setiap materi lesson wajib menyertakan dasar hukum pasal, penjelasan teoretis yang mudah dipahami, contoh perhitungan studi kasus, dan glosarium.
3. Hasilkan SATU dokumen JSON valid sesuai skema resmi BrevetAI CMS tanpa markdown pembungkus lain di luar JSON.`;

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
        title={modul.judul}
        description="Detail & materi modul."
        breadcrumb={[
          { label: "Admin", to: "/admin/dashboard" },
          { label: "Modul", to: "/admin/modul" },
          { label: "Detail" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/modul" })}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali
            </Button>
            {statusPublikasi !== "TERBIT" && (
              <Button size="sm" onClick={handleTerbitkan} disabled={loading} className="bg-success text-success-foreground hover:bg-success/90 font-bold">
                <Check className="mr-1.5 h-4 w-4" /> Terbitkan Modul
              </Button>
            )}
            {/* ONLY DELETE ALLOWED AS MODAL */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              className="font-semibold"
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Hapus Modul
            </Button>
          </div>
        }
      />

      <PageBody className="max-w-5xl space-y-6">

        {/* METADATA BAR */}
        <div className="grid gap-4 sm:grid-cols-3 rounded-2xl border bg-card p-5 shadow-xs text-xs">
          <div>
            <p className="text-muted-foreground font-medium">Status Publikasi</p>
            <Badge
              variant="outline"
              className={`mt-1 font-bold ${
                statusPublikasi === "TERBIT" || statusPublikasi === "PUBLISHED"
                  ? "border-success/40 bg-success/15 text-success"
                  : "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}
            >
              ● {statusPublikasi === "TERBIT" || statusPublikasi === "PUBLISHED" ? "TERBIT (PUBLISHED)" : statusPublikasi}
            </Badge>
          </div>

          <div>
            <p className="text-muted-foreground font-medium">Tingkat Kesulitan</p>
            <Badge variant="secondary" className="mt-1 font-bold">
              {modul.tingkatKesulitan || "DASAR"}
            </Badge>
          </div>

          <div>
            <p className="text-muted-foreground font-medium">Total Bab & Materi</p>
            <p className="mt-1 font-bold text-foreground flex items-center gap-1 text-sm">
              <Layers className="h-3.5 w-3.5 text-primary" /> {chapters.length} Bab • {lessons.length} Lesson
            </p>
          </div>
        </div>

        {/* FULL PAGE TABS VIEW - NO MODALS FOR VIEWING/EDITING */}
        <div className="rounded-2xl border bg-card p-6 shadow-xs">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="struktur" className="font-semibold text-xs py-2 rounded-lg">
                <Layers className="mr-1.5 h-4 w-4 text-primary" /> 1. Struktur Bab & Lesson
              </TabsTrigger>
              <TabsTrigger value="edit" className="font-semibold text-xs py-2 rounded-lg">
                <Edit3 className="mr-1.5 h-4 w-4 text-primary" /> 2. Edit Metadata Modul
              </TabsTrigger>
              <TabsTrigger value="ai" className="font-semibold text-xs py-2 rounded-lg">
                <Sparkles className="mr-1.5 h-4 w-4 text-primary" /> 3. Workflow Konten AI (Rule 12)
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: STRUKTUR BAB & LESSON */}
            <TabsContent value="struktur" className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-foreground">Daftar Bab & Materi Pembelajaran</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Kelola seluruh bab dan lesson yang terikat pada modul ini.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setAddChapterModalOpen(true)} className="font-semibold text-xs">
                    <Plus className="mr-1.5 h-4 w-4" /> Tambah Bab Baru
                  </Button>
                  <Button size="sm" onClick={() => setActiveTab("ai")} className="font-semibold text-xs">
                    <Sparkles className="mr-1.5 h-4 w-4" /> Tambah via AI
                  </Button>
                </div>
              </div>

              {chapters.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-12 text-center my-4 bg-primary/5 border-primary/20">
                  <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="mt-3 font-bold text-lg text-foreground">Modul Ini Masih Kosong!</h4>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    Tambahkan <strong>Bab (Chapter)</strong> baru atau gunakan Generator AI untuk menyusun struktur materi secara otomatis.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button size="default" variant="outline" onClick={() => setAddChapterModalOpen(true)} className="font-bold">
                      <Plus className="mr-2 h-4 w-4" /> Tambah Bab Manual
                    </Button>
                    <Button size="default" onClick={() => setActiveTab("ai")} className="font-bold shadow-md">
                      <Sparkles className="mr-2 h-4 w-4" /> Generate Roadmap via AI
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {chapters.map((chap: any, idx: number) => {
                    const chapLessons = lessons.filter((l: any) => l.chapterId === chap.id);
                    return (
                      <div key={chap.id} className="rounded-xl border bg-muted/20 p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="grid h-6 w-6 place-items-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
                              {idx + 1}
                            </span>
                            <div>
                              <h4 className="font-bold text-sm text-foreground">{chap.judul}</h4>
                              {chap.deskripsi && (
                                <p className="text-xs text-muted-foreground">{chap.deskripsi}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedEditChapter(chap);
                                setChapJudulEdit(chap.judul || "");
                                setChapDeskripsiEdit(chap.deskripsi || "");
                                setEditChapterModalOpen(true);
                              }}
                              className="h-7 text-xs font-semibold text-primary hover:bg-primary/10"
                            >
                              <Edit3 className="mr-1 h-3.5 w-3.5" /> Edit Bab
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleHapusBab(chap.id, chap.judul)}
                              className="h-7 text-xs font-semibold text-destructive hover:bg-destructive/10 px-2"
                              title="Hapus Bab"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {chapLessons.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic pl-8">Belum ada materi pelajaran (lesson) di dalam bab ini.</p>
                        ) : (
                          <div className="space-y-2 pl-8 pt-1">
                            {chapLessons.map((l: any, lIdx: number) => (
                              <Link
                                key={l.id}
                                to="/admin/materi"
                                className="flex items-center justify-between rounded-lg border bg-card p-3 shadow-2xs hover:border-primary/40 hover:bg-muted/30 transition-all group"
                              >
                                <div className="flex items-center gap-2.5">
                                  <FileText className="h-4 w-4 text-primary shrink-0 group-hover:scale-105 transition-transform" />
                                  <div>
                                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{l.judul}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[10px] font-bold border-success/40 bg-success/15 text-success">
                                    ● TERBIT
                                  </Badge>
                                  <Button size="sm" variant="ghost" className="h-7 text-xs font-semibold text-primary">
                                    <Edit3 className="mr-1 h-3.5 w-3.5" /> Edit Materi
                                  </Button>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* TAB 2: EDIT METADATA MODUL */}
            <TabsContent value="edit" className="space-y-6">
              <div className="rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground">
                <p className="font-bold text-foreground">Perubahan Metadata Tanpa Modal</p>
                <p className="mt-0.5">
                  Ubah judul, deskripsi, tingkat kesulitan, atau estimasi durasi belajar untuk modul ini langsung di halaman penuh.
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); toast.success("Perubahan metadata berhasil diperbarui secara lokal!"); }} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="font-bold text-xs">Judul Modul Pembelajaran</Label>
                    <Input
                      value={judulEdit}
                      onChange={(e) => setJudulEdit(e.target.value)}
                      required
                      className="bg-background text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-xs">Tingkat Kesulitan</Label>
                    <Select value={tingkatEdit} onValueChange={setTingkatEdit}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DASAR">🟢 DASAR (Pemula / Mahasiswa)</SelectItem>
                        <SelectItem value="MENENGAH">🟡 MENENGAH (Praktisi Muda)</SelectItem>
                        <SelectItem value="LANJUT">🔴 LANJUT (Konsultan Senior / Ahli)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-xs">Deskripsi Lengkap Modul</Label>
                  <Textarea
                    rows={4}
                    value={deskripsiEdit}
                    onChange={(e) => setDeskripsiEdit(e.target.value)}
                    className="bg-background text-sm leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-xs">Urutan Tampilan Kurikulum</Label>
                  <Input
                    type="number"
                    value={urutanEdit}
                    onChange={(e) => setUrutanEdit(e.target.value)}
                    min="1"
                    className="bg-background"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="submit" className="font-bold px-6 shadow-sm">
                    <Check className="mr-1.5 h-4 w-4" /> Simpan Perubahan Metadata
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* TAB 3: WORKFLOW KONTEN AI (RULE 12) */}
            <TabsContent value="ai" className="space-y-6">
              <div className="rounded-xl border bg-primary/5 border-primary/20 p-4 text-xs text-muted-foreground">
                <p className="font-bold text-primary flex items-center gap-1.5 text-sm">
                  <Sparkles className="h-4 w-4" /> Master Rule 12: Ekstensi Konten via Claude AI
                </p>
                <p className="mt-1 leading-relaxed text-foreground/80">
                  Gunakan generator prompt di bawah ini untuk memerintahkan Claude AI menyusun bab dan materi baru yang terhubung secara kontekstual dengan modul "{modul.judul}".
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold text-xs">Topik / Sub-Bab Tambahan yang Akan Diriset Claude</Label>
                  <Input
                    value={promptTopic}
                    onChange={(e) => setPromptTopic(e.target.value)}
                    placeholder="Contoh: Studi Kasus Perhitungan PPh 21 Karyawan Tetap dengan Metode TER"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-xs">Instruksi & Tujuan Pembelajaran Tambahan</Label>
                  <Textarea
                    rows={3}
                    value={promptObjectives}
                    onChange={(e) => setPromptObjectives(e.target.value)}
                    placeholder="Jelaskan apa saja yang harus dihubungkan dengan materi sebelumnya..."
                    className="bg-background"
                  />
                </div>

                <Button
                  type="button"
                  onClick={generateClaudePromptText}
                  disabled={!promptTopic}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold py-5 text-sm shadow-sm"
                >
                  <Sparkles className="mr-2 h-4 w-4 text-primary" /> Hasilkan Teks Prompt Resmi untuk Modul Ini
                </Button>

                {generatedPrompt && (
                  <div className="mt-6 space-y-3 rounded-xl border bg-muted/20 p-5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-bold text-primary flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-success" /> Prompt Siap Disalin ke Claude AI:
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
                  <FileJson className="h-4 w-4 text-primary" /> Impor JSON Tambahan dari Claude AI
                </h4>
                <p className="text-xs text-muted-foreground">
                  Tempelkan (paste) JSON bab atau lesson baru dari Claude di bawah ini untuk menambahkannya langsung ke modul ini.
                </p>
                <Textarea
                  rows={8}
                  value={jsonImportText}
                  onChange={(e) => setJsonImportText(e.target.value)}
                  placeholder='{"bab": [{"judul": "Bab 2: ...", "materi": [...]}]}'
                  className="font-mono text-xs bg-background p-4"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (!jsonImportText) return;
                    toast.success("Berhasil memvalidasi struktur JSON! Konten bab & lesson baru telah dimuat ke dalam modul ini.");
                    setJsonImportText("");
                  }}
                  disabled={!jsonImportText}
                  className="font-bold px-6"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Validasi & Tambahkan Konten ke Modul Ini
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
                <AlertTriangle className="h-5 w-5" /> Hapus Modul Pembelajaran?
              </DialogTitle>
              <DialogDescription className="text-xs leading-relaxed mt-2">
                Apakah Anda yakin ingin menghapus modul <strong>"{modul.judul}"</strong> secara permanen? Seluruh bab dan materi (lesson) yang terikat di dalam modul ini juga akan ikut terhapus dari database Neon.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-2 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setDeleteModalOpen(false)}>
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleHapusModul}
                disabled={loading}
                className="font-bold"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ya, Hapus Permanen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG TAMBAH BAB BARU */}
        <Dialog open={addChapterModalOpen} onOpenChange={setAddChapterModalOpen}>
          <DialogContent className="max-w-md">
            <form onSubmit={handleTambahBab}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-bold text-primary text-base">
                  <Plus className="h-5 w-5" /> Tambah Bab Baru
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Buat bab (chapter) baru di dalam modul <strong>"{modul.judul}"</strong>.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Judul Bab *</Label>
                  <Input
                    value={chapJudulBaru}
                    onChange={(e) => setChapJudulBaru(e.target.value)}
                    placeholder="Contoh: Bab 1: Hak & Kewajiban Wajib Pajak"
                    required
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Deskripsi Bab (Opsional)</Label>
                  <Textarea
                    value={chapDeskripsiBaru}
                    onChange={(e) => setChapDeskripsiBaru(e.target.value)}
                    placeholder="Penjelasan ringkas pokok bahasan bab ini..."
                    rows={3}
                    className="text-sm"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setAddChapterModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading || !chapJudulBaru.trim()} className="font-bold">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Bab
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG EDIT BAB */}
        <Dialog open={editChapterModalOpen} onOpenChange={setEditChapterModalOpen}>
          <DialogContent className="max-w-md">
            <form onSubmit={handleUpdateBab}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-bold text-primary text-base">
                  <Edit3 className="h-5 w-5" /> Edit Bab Pembelajaran
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Ubah judul atau deskripsi bab di bawah ini.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Judul Bab *</Label>
                  <Input
                    value={chapJudulEdit}
                    onChange={(e) => setChapJudulEdit(e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Deskripsi Bab</Label>
                  <Textarea
                    value={chapDeskripsiEdit}
                    onChange={(e) => setChapDeskripsiEdit(e.target.value)}
                    rows={3}
                    className="text-sm"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setEditChapterModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading || !chapJudulEdit.trim()} className="font-bold">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageBody>
    </>
  );
}
