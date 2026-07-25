import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Wand2,
  History,
  Copy,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getDaftarPromptEngine,
  toggleAktifPromptEngine,
  hapusPromptEngine,
  buatPromptEngine,
} from "@/functions/prompt-studio";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/admin/prompt-studio/")({
  loader: async () => {
    try {
      const res = await getDaftarPromptEngine();
      return { engines: res.success && res.data ? res.data : [] };
    } catch {
      return { engines: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Prompt Studio — Admin BrevetAI" },
      { name: "description", content: "Kelola seluruh Prompt Engine kurikulum perpajakan Brevet A/B." },
    ],
  }),
  component: PromptStudioIndexPage,
});

const KATEGORI_COLORS: Record<string, string> = {
  SYSTEM: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  RESEARCH: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  REASONING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  CURRICULUM: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  PEDAGOGY: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  OUTPUT_FORMAT: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  VISUAL: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  ASSESSMENT: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  QUALITY: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  SELF_REVIEW: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

function PromptStudioIndexPage() {
  const router = useRouter();
  const { engines } = Route.useLoaderData();
  const [engineList, setEngineList] = useState<any[]>(engines);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // New Engine quick-add state (in-page form section, no modal)
  const [showNewForm, setShowNewForm] = useState(false);
  const [newNama, setNewNama] = useState("");
  const [newKode, setNewKode] = useState("");
  const [newKategori, setNewKategori] = useState("SYSTEM");
  const [newDeskripsi, setNewDeskripsi] = useState("");
  const [newKonten, setNewKonten] = useState("");
  const [saving, setSaving] = useState(false);

  const handleToggle = async (id: string) => {
    try {
      const res = await toggleAktifPromptEngine({ data: { id } });
      if (res.success && res.data) {
        setEngineList((prev) =>
          prev.map((e) => (e.id === id ? { ...e, aktif: (res.data as any).aktif } : e))
        );
        toast.success(`Engine ${(res.data as any).aktif ? "diaktifkan" : "dinonaktifkan"}`);
      }
    } catch {
      toast.error("Gagal mengubah status engine");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await hapusPromptEngine({ data: { id: deleteTarget.id } });
      if (res.success) {
        setEngineList((prev) => prev.filter((e) => e.id !== deleteTarget.id));
        toast.success("Prompt Engine dihapus");
        setDeleteTarget(null);
      } else {
        toast.error(res.message || "Gagal menghapus engine");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleBuatBaru = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newKode || !newKonten) return;
    setSaving(true);
    try {
      const res = await buatPromptEngine({
        data: {
          nama: newNama,
          kodeEngine: newKode.toUpperCase(),
          kategoriEngine: newKategori,
          deskripsi: newDeskripsi,
          kontenTemplate: newKonten,
          urutanKompilasi: engineList.length + 1,
        },
      });
      if (res.success && res.data) {
        setEngineList((prev) => [...prev, res.data as any]);
        toast.success("Prompt Engine baru berhasil dibuat");
        setShowNewForm(false);
        setNewNama(""); setNewKode(""); setNewDeskripsi(""); setNewKonten("");
      } else {
        toast.error(res.message || "Gagal membuat engine baru");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const activeCount = engineList.filter((e) => e.aktif).length;

  return (
    <>
      <PageHeader
        title="Prompt Studio"
        description={`${activeCount} dari ${engineList.length} engine aktif`}
        breadcrumb={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Prompt Studio" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild className="font-bold shadow-2xs">
              <Link to="/admin/prompt-studio/compiler">
                <Wand2 className="mr-1.5 h-4 w-4 text-primary" /> Compiler
              </Link>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowNewForm(!showNewForm)}
              className="font-bold shadow-sm"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Engine Baru
            </Button>
          </div>
        }
      />

      <PageBody className="space-y-6">
        {/* IN-PAGE FORM: New Engine (No Modal) */}
        {showNewForm && (
          <form
            onSubmit={handleBuatBaru}
            className="rounded-2xl border-2 border-primary/30 bg-card p-5 shadow-md space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-bold text-sm text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" /> Engine Baru
              </span>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowNewForm(false)} className="text-xs">
                Tutup
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Nama Engine *</Label>
                <Input value={newNama} onChange={(e) => setNewNama(e.target.value)} className="text-xs bg-background" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Kode Engine (UPPERCASE) *</Label>
                <Input value={newKode} onChange={(e) => setNewKode(e.target.value.toUpperCase())} className="text-xs font-mono bg-background" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Kategori</Label>
                <select
                  value={newKategori}
                  onChange={(e) => setNewKategori(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {["SYSTEM","RESEARCH","REASONING","CURRICULUM","PEDAGOGY","OUTPUT_FORMAT","VISUAL","ASSESSMENT","QUALITY","SELF_REVIEW"].map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Deskripsi</Label>
                <Input value={newDeskripsi} onChange={(e) => setNewDeskripsi(e.target.value)} className="text-xs bg-background" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Konten Template *</Label>
              <Textarea value={newKonten} onChange={(e) => setNewKonten(e.target.value)} rows={5} className="font-mono text-xs bg-background" required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowNewForm(false)}>Batal</Button>
              <Button type="submit" size="sm" disabled={saving} className="font-bold">
                {saving ? "Menyimpan..." : "Simpan Engine"}
              </Button>
            </div>
          </form>
        )}

        {/* ENGINE GRID */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {engineList.map((engine) => (
            <div
              key={engine.id}
              className={`group flex flex-col justify-between rounded-2xl border bg-card p-4 shadow-xs transition-all hover:shadow-md hover:border-primary/30 ${!engine.aktif ? "opacity-60" : ""}`}
            >
              <div className="space-y-2.5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm text-foreground leading-tight">{engine.nama}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{engine.kodeEngine}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggle(engine.id)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title={engine.aktif ? "Nonaktifkan" : "Aktifkan"}
                    >
                      {engine.aktif ? (
                        <ToggleRight className="h-5 w-5 text-success" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold px-2 py-0.5 ${KATEGORI_COLORS[engine.kategoriEngine] || "bg-muted/30 text-muted-foreground"}`}
                  >
                    {engine.kategoriEngine}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                    v{engine.versi}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    #{engine.urutanKompilasi}
                  </Badge>
                </div>

                {/* Deskripsi */}
                {engine.deskripsi && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {engine.deskripsi}
                  </p>
                )}
              </div>

              {/* Footer Actions */}
              <div className="mt-4 pt-3 border-t flex items-center justify-between gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteTarget(engine)}
                  className="text-destructive hover:bg-destructive/10 h-8 px-2 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>

                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" asChild className="h-8 px-2.5 text-xs font-semibold">
                    <Link to="/admin/prompt-studio/engine/$id" params={{ id: engine.id }}>
                      <History className="mr-1 h-3.5 w-3.5" /> Riwayat
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="h-8 px-2.5 text-xs font-bold shadow-xs">
                    <Link to="/admin/prompt-studio/engine/$id" params={{ id: engine.id }}>
                      <Edit3 className="mr-1 h-3.5 w-3.5" /> Edit
                      <ChevronRight className="ml-0.5 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {engineList.length === 0 && (
          <div className="rounded-2xl border bg-card p-10 text-center shadow-xs">
            <Sparkles className="mx-auto h-10 w-10 text-primary/50 mb-3" />
            <h3 className="font-bold text-sm">Belum Ada Prompt Engine</h3>
            <p className="text-xs text-muted-foreground mt-1">Klik "Engine Baru" untuk mulai.</p>
          </div>
        )}
      </PageBody>

      {/* DELETE CONFIRMATION DIALOG (Only allowed modal for delete) */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Hapus Engine?</DialogTitle>
            <DialogDescription className="text-xs">
              <strong>"{deleteTarget?.nama}"</strong> akan dihapus permanen beserta seluruh riwayat versinya.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" size="sm" disabled={loading} onClick={handleDelete}>
              {loading ? "Menghapus..." : "Hapus Permanen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
