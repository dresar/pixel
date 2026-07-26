import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
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
  generateReferensiAiAdmin,
} from "@/functions/referensi";

export const Route = createFileRoute("/_app/admin/referensi")({
  loader: async () => {
    try {
      const res = await getReferensiHukum({ data: {} });
      return { items: res.success && res.data ? res.data : [] };
    } catch {
      return { items: [] };
    }
  },
  head: () => ({
    meta: [{ title: "Kelola Referensi Hukum — Admin BrevetAI" }],
  }),
  component: AdminReferensi,
});

function AdminReferensi() {
  const { items } = Route.useLoaderData();
  const router = useRouter();
  const [cari, setCari] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [topikAi, setTopikAi] = useState("UU HPP & PMK PPh 21 TER");
  const [jsonImporText, setJsonImporText] = useState("");
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

  const handleSimpanBaru = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nomorPeraturan || !form.judul || !form.ringkasan) return;
    setLoading(true);
    try {
      const res = await tambahReferensiHukumAdmin({ data: form });
      if (res.success) {
        setShowAddForm(false);
        setForm({ nomorPeraturan: "", judul: "", kategori: "UU", tahun: "2024", ringkasan: "", urlDokumen: "" });
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
      router.invalidate();
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAi = async () => {
    if (!topikAi.trim()) return;
    setLoading(true);
    try {
      const res = await generateReferensiAiAdmin({ data: { topik: topikAi, jumlah: 5 } });
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
        await imporBanyakReferensiAdmin({ data: { items: parsed } });
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
            <Button onClick={() => setShowAiModal(true)} variant="outline" className="font-bold text-xs rounded-xl gap-1.5 border-primary/30 text-primary">
              <Sparkles className="h-4 w-4" /> Impor / Generate Claude JSON
            </Button>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="font-bold text-xs rounded-xl gap-1.5">
              <Plus className="h-4 w-4" /> {showAddForm ? "Tutup Formulir" : "Tambah Peraturan Baru"}
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
                <Scale className="h-5 w-5 text-primary" /> Tambah Peraturan Hukum Baru
              </h3>
              <Button size="icon" variant="ghost" onClick={() => setShowAddForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSimpanBaru} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
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
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Kategori *</label>
                  <Input
                    placeholder="Contoh: UU, PMK, PER, PP"
                    value={form.kategori}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Tahun Terbit</label>
                  <Input
                    placeholder="Contoh: 2024"
                    value={form.tahun}
                    onChange={(e) => setForm({ ...form, tahun: e.target.value })}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold">Judul Peraturan *</label>
                <Input
                  required
                  placeholder="Judul lengkap peraturan perpajakan..."
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold">Ringkasan Ketentuan *</label>
                <Textarea
                  required
                  rows={3}
                  placeholder="Ringkasan poin-poin utama regulasi..."
                  value={form.ringkasan}
                  onChange={(e) => setForm({ ...form, ringkasan: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold">URL Dokumen JDIH Kemenkeu (Opsional)</label>
                <Input
                  placeholder="https://jdih.kemenkeu.go.id/..."
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
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Peraturan"}
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
              placeholder="Cari peraturan atau nomor UU..."
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              className="pl-10 rounded-2xl text-xs h-10 bg-card border-border"
            />
          </div>
          <Badge variant="outline" className="h-10 px-3.5 rounded-2xl font-mono text-xs">
            Total {filteredItems.length} Peraturan
          </Badge>
        </div>

        {/* Table List */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Nomor & Kategori</th>
                  <th className="p-4">Judul Peraturan</th>
                  <th className="p-4">Ringkasan</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      Belum ada referensi hukum. Silakan tambah baru atau gunakan AI Generator.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-all">
                      <td className="p-4 font-bold text-foreground">
                        <div className="space-y-1">
                          <span className="text-primary font-mono">{item.nomorPeraturan}</span>
                          <div>
                            <Badge variant="secondary" className="text-[10px] rounded-md font-mono">
                              {item.kategori} {item.tahun ? `(${item.tahun})` : ""}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-foreground max-w-xs leading-snug">
                        {item.judul}
                        {item.urlDokumen && (
                          <a href={item.urlDokumen} target="_blank" rel="noreferrer" className="block text-[11px] text-primary hover:underline mt-1 font-normal">
                            Link Dokumen <ExternalLink className="inline h-3 w-3" />
                          </a>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground leading-relaxed max-w-md">{item.ringkasan}</td>
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
                  <Sparkles className="h-5 w-5 text-primary" /> Impor / Generate Referensi AI JSON
                </DialogTitle>
                <DialogDescription>
                  Generate peraturan perpajakan resmi dengan Gemini AI atau tempel format JSON dari Claude AI.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2 border-b border-border pb-4">
                  <label className="text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> Generate Otomatis via AI
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Topik (Contoh: UU HPP & PPh 21 TER)"
                      value={topikAi}
                      onChange={(e) => setTopikAi(e.target.value)}
                      className="rounded-xl text-xs"
                    />
                    <Button onClick={handleGenerateAi} disabled={loading} className="rounded-xl text-xs font-bold shrink-0">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate 5 Peraturan"}
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
    "nomorPeraturan": "PMK No. 168 Tahun 2023",
    "judul": "Petunjuk Pelaksanaan Pemotongan PPh 21",
    "kategori": "PMK",
    "tahun": "2023",
    "ringkasan": "Peraturan tentang penetapan tarif efektif rata-rata TER."
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
                <DialogTitle>Konfirmasi Hapus Peraturan</DialogTitle>
                <DialogDescription>
                  Apakah Anda yakin ingin menghapus referensi peraturan ini dari database? Tindakan ini tidak dapat dibatalkan.
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
