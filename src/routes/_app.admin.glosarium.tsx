import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
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
  generateGlosariumAiAdmin,
} from "@/functions/glossary";

export const Route = createFileRoute("/_app/admin/glosarium")({
  loader: async () => {
    try {
      const res = await getGlosarium({ data: {} });
      return { items: res.success && res.data ? res.data : [] };
    } catch {
      return { items: [] };
    }
  },
  head: () => ({
    meta: [{ title: "Kelola Glosarium — Admin BrevetAI" }],
  }),
  component: AdminGlosarium,
});

function AdminGlosarium() {
  const { items } = Route.useLoaderData();
  const router = useRouter();
  const [cari, setCari] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [topikAi, setTopikAi] = useState("PPh & PPN TER Terbaru");
  const [jsonImporText, setJsonImporText] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form tambah istilah
  const [form, setForm] = useState({
    istilah: "",
    definisi: "",
    contoh: "",
    referensiUndangUndang: "",
    kategori: "PPh",
  });

  const handleSimpanBaru = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.istilah || !form.definisi) return;
    setLoading(true);
    try {
      const res = await tambahGlosarium({ data: form });
      if (res.success) {
        setShowAddForm(false);
        setForm({ istilah: "", definisi: "", contoh: "", referensiUndangUndang: "", kategori: "PPh" });
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
      router.invalidate();
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAi = async () => {
    if (!topikAi.trim()) return;
    setLoading(true);
    try {
      const res = await generateGlosariumAiAdmin({ data: { topik: topikAi, jumlah: 10 } });
      if (res.success) {
        setShowAiModal(false);
        router.invalidate();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImporJsonManual = async () => {
    if (!jsonImporText.trim()) return;
    setLoading(true);
    try {
      const parsed = JSON.parse(jsonImporText);
      if (Array.isArray(parsed)) {
        await imporBanyakGlosariumAdmin({ data: { items: parsed } });
        setJsonImporText("");
        setShowAiModal(false);
        router.invalidate();
      }
    } catch {
      alert("Format JSON tidak valid! Pastikan format JSON array.");
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
            <Button onClick={() => setShowAiModal(true)} variant="outline" className="font-bold text-xs rounded-xl gap-1.5 border-primary/30 text-primary">
              <Sparkles className="h-4 w-4" /> Impor / Generate Claude JSON
            </Button>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="font-bold text-xs rounded-xl gap-1.5">
              <Plus className="h-4 w-4" /> {showAddForm ? "Tutup Formulir" : "Tambah Istilah Baru"}
            </Button>
          </div>
        }
      />

      <PageBody className="space-y-6">
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
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Istilah"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari istilah glosarium..."
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              className="pl-10 rounded-2xl text-xs h-10 bg-card border-border"
            />
          </div>
          <Badge variant="outline" className="h-10 px-3.5 rounded-2xl font-mono text-xs">
            Total {filteredItems.length} Istilah
          </Badge>
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
                      Belum ada istilah glosarium. Silakan tambah istilah baru atau gunakan AI Generator.
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

        {/* Modal Impor / Generate Claude JSON */}
        {showAiModal && (
          <Dialog open={showAiModal} onOpenChange={setShowAiModal}>
            <DialogContent className="max-w-xl rounded-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Impor / Generate Glosarium AI JSON
                </DialogTitle>
                <DialogDescription>
                  Generate istilah glosarium otomatis dengan Gemini AI atau tempel format JSON dari Claude AI.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2 border-b border-border pb-4">
                  <label className="text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> Generate Otomatis via AI
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Topik (Contoh: PPN & PPnBM Terbaru)"
                      value={topikAi}
                      onChange={(e) => setTopikAi(e.target.value)}
                      className="rounded-xl text-xs"
                    />
                    <Button onClick={handleGenerateAi} disabled={loading} className="rounded-xl text-xs font-bold shrink-0">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate 10 Istilah"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold flex items-center gap-1.5">
                    <FileCode className="h-3.5 w-3.5 text-primary" /> Salin & Tempel JSON dari Claude AI
                  </label>
                  <Textarea
                    rows={6}
                    placeholder={`[
  {
    "istilah": "KUP",
    "definisi": "Ketentuan Umum dan Tata Cara Perpajakan",
    "referensiUndangUndang": "UU No. 28 Tahun 2007",
    "kategori": "KUP"
  }
]`}
                    value={jsonImporText}
                    onChange={(e) => setJsonImporText(e.target.value)}
                    className="font-mono text-xs rounded-xl"
                  />
                  <Button onClick={handleImporJsonManual} disabled={loading || !jsonImporText.trim()} variant="outline" className="w-full rounded-xl text-xs font-bold">
                    <Upload className="mr-1.5 h-3.5 w-3.5" /> Impor Data JSON Manual
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

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
