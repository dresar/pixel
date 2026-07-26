import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Search, Edit3, Trash2, Briefcase, Clock, Tag, Eye, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDaftarStudiKasus, hapusStudiKasusAdmin } from "@/functions/studi-kasus";

export const Route = createFileRoute("/_app/admin/studi-kasus/")({
  head: () => ({
    meta: [
      { title: "Manajemen Studi Kasus — Admin BrevetAI" },
      { name: "description", content: "Kelola bank studi kasus dan simulasi kasus nyata perpajakan." },
    ],
  }),
  component: AdminStudiKasusIndexPage,
});

function AdminStudiKasusIndexPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("SEMUA");

  // Single exception allowed for modal: Delete confirmation dialog!
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const memuatData = async () => {
    setLoading(true);
    try {
      const res = await getDaftarStudiKasus();
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch {
      toast.error("Gagal memuat daftar studi kasus.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    memuatData();
  }, []);

  const handleKonfirmasiHapus = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      const res = await hapusStudiKasusAdmin(deletingItem.id);
      if (res.success) {
        toast.success(`Studi kasus "${deletingItem.judul}" berhasil dihapus.`);
        setItems(items.filter((i) => i.id !== deletingItem.id));
        setDeleteModalOpen(false);
      } else {
        toast.error("Gagal menghapus studi kasus.");
      }
    } catch {
      toast.error("Terjadi kesalahan server saat menghapus.");
    } finally {
      setIsDeleting(false);
      setDeletingItem(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchSearch = item.judul.toLowerCase().includes(search.toLowerCase()) || (item.deskripsi || "").toLowerCase().includes(search.toLowerCase());
    const matchTag = selectedTag === "SEMUA" || item.tag === selectedTag;
    return matchSearch && matchTag;
  });

  const availableTags = ["SEMUA", ...Array.from(new Set(items.map((i) => i.tag).filter(Boolean)))];

  return (
    <>
      <PageHeader
        title="Kelola Studi Kasus"
        description="Bank kasus & simulasi skenario perpajakan untuk siswa."
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-xl font-bold text-xs">
              <Link to="/admin/dashboard"><ArrowLeft className="mr-1 h-3.5 w-3.5" /> Dashboard</Link>
            </Button>
            {/* NO MODAL FOR CREATE: NAVIGATES FULLY TO IN-PAGE FORM ROUTE */}
            <Button asChild size="sm" className="rounded-xl font-bold text-xs gap-1.5 shadow-xs">
              <Link to="/admin/studi-kasus/baru">
                <Plus className="h-4 w-4" /> Tambah Studi Kasus Baru
              </Link>
            </Button>
          </div>
        }
      />

      <PageBody className="space-y-6">
        {/* Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari studi kasus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl text-xs sm:text-sm bg-card border-border"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {availableTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(tag)}
                className="rounded-xl text-xs font-bold shrink-0"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {/* List of Case Studies */}
        {loading ? (
          <div className="text-center py-12 text-sm text-muted-foreground">Memuat data studi kasus...</div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-12 text-center space-y-3">
            <Briefcase className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <h3 className="text-base font-bold text-foreground">Belum Ada Studi Kasus</h3>
            <p className="text-xs text-muted-foreground">Klik tombol "Tambah Studi Kasus Baru" untuk mulai membuat skenario simulasi.</p>
            <Button asChild size="sm" className="rounded-xl font-bold text-xs">
              <Link to="/admin/studi-kasus/baru"><Plus className="mr-1.5 h-4 w-4" /> Tambah Sekarang</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredItems.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono font-bold border-primary/40 text-primary bg-primary/10">
                        {item.tag || "Umum"}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] font-bold">
                        {item.level || "MENENGAH"}
                      </Badge>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary" /> {item.durasiMenit || 45} mnt
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground leading-snug">{item.judul}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{item.deskripsi || "Tidak ada deskripsi."}</p>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Badge variant={item.terbit ? "default" : "outline"} className="text-[9px] px-2 py-0">
                      {item.terbit ? "Dipublikasikan" : "Draft"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button asChild variant="outline" size="sm" className="h-8 rounded-xl text-xs font-bold px-2.5">
                      <Link to="/studi-kasus"><Eye className="h-3.5 w-3.5 mr-1" /> Pratinjau</Link>
                    </Button>

                    {/* NO MODAL FOR EDIT: NAVIGATES FULLY TO IN-PAGE FORM ROUTE */}
                    <Button asChild variant="outline" size="sm" className="h-8 rounded-xl text-xs font-bold px-2.5">
                      <Link to={`/admin/studi-kasus/$id`} params={{ id: item.id }}>
                        <Edit3 className="h-3.5 w-3.5 text-primary mr-1" /> Edit
                      </Link>
                    </Button>

                    {/* Delete Confirmation Button (Triggers Dialog Modal Exception) */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDeletingItem(item);
                        setDeleteModalOpen(true);
                      }}
                      className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Hapus Studi Kasus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL KONFIRMASI HAPUS (SATU-SATUNYA PENGECEUAN MODAL YANG DIPERBOLEHKAN ATURAN) */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" /> Konfirmasi Hapus Studi Kasus
              </DialogTitle>
              <DialogDescription className="text-xs pt-2">
                Apakah Anda yakin ingin menghapus studi kasus <strong>"{deletingItem?.judul}"</strong>? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 pt-3">
              <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)} className="rounded-xl text-xs font-bold">
                Batal
              </Button>
              <Button variant="destructive" size="sm" onClick={handleKonfirmasiHapus} disabled={isDeleting} className="rounded-xl text-xs font-bold">
                {isDeleting ? "Menghapus..." : "Ya, Hapus Data"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageBody>
    </>
  );
}
