import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import {
  Plus,
  Search,
  Check,
  Edit3,
  Loader2,
  BookOpen,
  Trash2,
  AlertTriangle,
  Layers,
  Sparkles,
  FileJson,
  Upload,
  FlaskConical,
  ArrowRight,
  Copy,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDaftarModul, terbitkanModul, hapusModulAdmin, imporBanyakModulAdmin } from "@/functions/modules";
import { getDaftarPromptEngine } from "@/functions/prompt-studio";

export const Route = createFileRoute("/_app/admin/modul/")({
  loader: async () => {
    try {
      const [modulRes, engineRes] = await Promise.all([
        getDaftarModul({ data: { halaman: 1, per_halaman: 50 } }),
        getDaftarPromptEngine(),
      ]);
      return {
        initialModulList: modulRes.success && modulRes.data ? modulRes.data : [],
        promptEngineCount: engineRes.success && engineRes.data ? (engineRes.data as any[]).filter((e) => e.aktif).length : 0,
      };
    } catch {
      return { initialModulList: [], promptEngineCount: 0 };
    }
  },
  head: () => ({
    meta: [
      { title: "Kelola Modul Pembelajaran — Admin BrevetAI" },
      { name: "description", content: "Daftar kurikulum modul perpajakan BrevetAI dengan kebijakan tanpa modal untuk CRUD." },
    ],
  }),
  component: AdminModulListPage,
});

function AdminModulListPage() {
  const router = useRouter();
  const { initialModulList, promptEngineCount } = Route.useLoaderData();
  const [modulList, setModulList] = useState<any[]>(initialModulList);
  const [cari, setCari] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteModul, setSelectedDeleteModul] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // JSON Import State
  const [jsonImportText, setJsonImportText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [showImportPanel, setShowImportPanel] = useState(false);



  const handleImportJson = async () => {
    if (!jsonImportText.trim()) return;
    setIsImporting(true);
    try {
      let parsed = JSON.parse(jsonImportText.trim());
      if (!Array.isArray(parsed)) {
        if (parsed.modul || parsed.modules) parsed = parsed.modul || parsed.modules;
        else parsed = [parsed];
      }
      const res = await imporBanyakModulAdmin({ data: { modulList: parsed } });
      if (res.success) {
        toast.success(res.message || "Seluruh modul berhasil diimpor!");
        setJsonImportText("");
        router.invalidate();
      } else {
        toast.error(res.message || "Gagal mengimpor modul JSON");
      }
    } catch {
      toast.error("Format JSON tidak valid. Pastikan menyalin JSON valid dari Claude AI.");
    } finally {
      setIsImporting(false);
    }
  };

  const filtered = modulList.filter((m: any) =>
    (m.judul || m.title || "").toLowerCase().includes(cari.toLowerCase()) ||
    (m.deskripsi || "").toLowerCase().includes(cari.toLowerCase())
  );

  const handleTerbitkan = async (id: string) => {
    setLoading(true);
    try {
      const res = await terbitkanModul({ data: { id } });
      if (res.success) {
        toast.success("Modul berhasil diterbitkan ke portal siswa!");
        setModulList(modulList.map((m) => (m.id === id ? { ...m, statusPublikasi: "TERBIT" } : m)));
      } else {
        toast.error(res.message || "Gagal menerbitkan modul");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi ke server");
    } finally {
      setLoading(false);
    }
  };

  const handleHapus = async () => {
    if (!selectedDeleteModul) return;
    setLoading(true);
    try {
      const res = await hapusModulAdmin({ data: { id: selectedDeleteModul.id } });
      if (res.success) {
        toast.success(`Modul "${selectedDeleteModul.judul}" berhasil dihapus permanen!`);
        setModulList(modulList.filter((m) => m.id !== selectedDeleteModul.id));
        setDeleteModalOpen(false);
      } else {
        toast.error(res.message || "Gagal menghapus modul");
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
        title="Modul Pembelajaran"
        description={`${modulList.length} modul kurikulum Brevet A/B`}
        breadcrumb={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Modul" }]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="outline" asChild className="font-bold shadow-2xs">
              <Link to="/admin/prompt-studio/compiler">
                <FlaskConical className="mr-1.5 h-4 w-4 text-primary" />
                Compiler
                {promptEngineCount > 0 && (
                  <span className="ml-1.5 text-[10px] font-mono bg-primary/15 text-primary px-1.5 rounded">{promptEngineCount}</span>
                )}
              </Link>
            </Button>
            <Button size="sm" asChild className="font-bold shadow-sm">
              <Link to="/admin/modul/baru">
                <Plus className="mr-1.5 h-4 w-4" /> Modul Baru
              </Link>
            </Button>
          </div>
        }
      />

      <PageBody className="space-y-6">

        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari judul modul atau kata kunci kurikulum..."
            className="pl-10 h-10 bg-card shadow-2xs"
          />
        </div>

        {/* EMPTY STATE — Prompt Studio Integration */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="text-center max-w-lg mx-auto space-y-2">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Belum Ada Modul</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Gunakan <strong>Prompt Compiler</strong> untuk generate prompt kurikulum Brevet A/B, lalu impor JSON hasilnya.
              </p>
            </div>

            {/* Step 1: Go to Compiler */}
            <div className="flex flex-col sm:flex-row items-stretch gap-4">
              <div className="flex-1 rounded-xl border bg-muted/20 p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <FlaskConical className="h-4 w-4 text-primary" /> 1. Compile Prompt
                  </div>
                  <p className="text-[11px] text-muted-foreground">Buka Prompt Compiler, isi variabel topik & modul, compile Super Prompt lalu salin ke Claude.ai.</p>
                </div>
                <Button size="sm" asChild className="w-full font-bold shadow-sm">
                  <Link to="/admin/prompt-studio/compiler">
                    <FlaskConical className="mr-1.5 h-4 w-4" /> Buka Prompt Compiler
                    <ArrowRight className="ml-auto h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="flex-1 rounded-xl border bg-muted/20 p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <FileJson className="h-4 w-4 text-primary" /> 2. Impor JSON Claude
                  </div>
                  <p className="text-[11px] text-muted-foreground">Tempel hasil JSON dari Claude.ai lalu klik Impor untuk sync ke database.</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowImportPanel(!showImportPanel)} className="w-full font-semibold">
                  {showImportPanel ? "Tutup" : "Buka Panel Impor JSON"}
                </Button>
              </div>
            </div>

            {/* Import JSON Panel (in-page) */}
            {showImportPanel && (
              <div className="rounded-xl border bg-background p-4 space-y-3">
                <Textarea
                  value={jsonImportText}
                  onChange={(e) => setJsonImportText(e.target.value)}
                  placeholder='[{"judul": "KUP", "deskripsi": "...", "tingkatKesulitan": "DASAR", "urutan": 1, "bab": [...]}]'
                  rows={7}
                  className="font-mono text-[11px] bg-muted/20"
                />
                <Button
                  onClick={handleImportJson}
                  disabled={!jsonImportText.trim() || isImporting}
                  className="w-full font-bold shadow-sm"
                >
                  {isImporting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />}
                  {isImporting ? "Mengimpor..." : "⚡ Impor & Sync ke Database"}
                </Button>
              </div>
            )}

            <div className="border-t pt-3 text-center">
              <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground">
                <Link to="/admin/modul/baru">Atau buat modul manual →</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Import JSON Panel (in-page, shown when modul exist too) */}
            {showImportPanel && (
              <div className="rounded-2xl border-2 border-primary/30 bg-card p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-xs font-bold flex items-center gap-2"><FileJson className="h-4 w-4 text-primary" /> Impor JSON Claude</span>
                  <Button size="sm" variant="ghost" onClick={() => setShowImportPanel(false)} className="text-xs h-7">Tutup</Button>
                </div>
                <Textarea
                  value={jsonImportText}
                  onChange={(e) => setJsonImportText(e.target.value)}
                  placeholder='[{"judul": "...", ...}]'
                  rows={5}
                  className="font-mono text-[11px] bg-background"
                />
                <Button onClick={handleImportJson} disabled={!jsonImportText.trim() || isImporting} className="font-bold shadow-sm w-full sm:w-auto">
                  {isImporting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />}
                  {isImporting ? "Mengimpor..." : "⚡ Impor & Sync"}
                </Button>
              </div>
            )}

            {/* Modul Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((m: any) => {
                const isTerbit = m.statusPublikasi === "TERBIT" || m.statusPublikasi === "PUBLISHED";
                return (
                  <div
                    key={m.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border bg-card shadow-xs transition-all hover:shadow-md hover:border-primary/40"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            isTerbit
                              ? "border-success/40 bg-success/15 text-success"
                              : "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          ● {isTerbit ? "TERBIT" : m.statusPublikasi || "DRAFT"}
                        </Badge>
                        <span className="font-mono text-[10px] text-muted-foreground">#{m.urutan || 1}</span>
                      </div>

                      <div className="p-4 space-y-2">
                        <Badge variant="secondary" className="text-[10px] font-bold">{m.tingkatKesulitan || "DASAR"}</Badge>
                        <h3 className="text-sm font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {m.judul || m.title}
                        </h3>
                        {m.deskripsi && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{m.deskripsi}</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t bg-muted/20 p-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Layers className="h-3 w-3 text-primary" /> Modul
                      </span>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" asChild className="text-xs px-2.5 h-8 font-semibold">
                          <Link to="/admin/modul/$slug" params={{ slug: m.slug || m.id }}>
                            <Edit3 className="mr-1 h-3.5 w-3.5 text-primary" /> Kelola
                          </Link>
                        </Button>
                        {!isTerbit && (
                          <Button size="sm" onClick={() => handleTerbitkan(m.id)} disabled={loading}
                            className="bg-success text-success-foreground hover:bg-success/90 font-bold text-xs px-2.5 h-8">
                            <Check className="mr-1 h-3.5 w-3.5" /> Terbitkan
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedDeleteModul(m); setDeleteModalOpen(true); }}
                          className="text-destructive hover:bg-destructive/10 px-2 h-8">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Import JSON shortcut button */}
            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowImportPanel(!showImportPanel)} className="text-xs font-semibold">
                <Upload className="mr-1.5 h-3.5 w-3.5 text-primary" />
                {showImportPanel ? "Tutup" : "Impor JSON Claude"}
              </Button>
            </div>
          </>
        )}

        {/* ONLY DELETE MODAL IS ALLOWED (AS PER USER INSTRUCTION: "kecuali delete baru modals boleh") */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive font-bold">
                <AlertTriangle className="h-5 w-5" /> Hapus Modul Pembelajaran?
              </DialogTitle>
              <DialogDescription className="text-xs leading-relaxed mt-2 text-muted-foreground">
                Apakah Anda yakin ingin menghapus modul <strong>"{selectedDeleteModul?.judul}"</strong> secara permanen dari database Neon PostgreSQL? Seluruh bab dan materi yang berada di bawah modul ini juga akan ikut terhapus.
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
