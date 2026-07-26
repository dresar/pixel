import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  Upload,
  Search,
  Grid3x3,
  List as ListIcon,
  ImageIcon,
  Cloud,
  Trash2,
  Copy,
  Eye,
  Loader2,
  FileImage,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDaftarMediaAdmin, unggahMediaAdmin, hapusMediaAdmin } from "@/functions/media";

export const Route = createFileRoute("/_app/admin/gambar")({
  loader: async () => {
    try {
      const res = await getDaftarMediaAdmin();
      return { mediaList: res.success && res.data ? res.data : [] };
    } catch {
      return { mediaList: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Gambar & Media — Admin BrevetAI" },
      { name: "description", content: "Pustaka media Cloudinary & manajemen ilustrasi perpajakan." },
    ],
  }),
  component: AdminGambar,
});

function AdminGambar() {
  const router = useRouter();
  const { mediaList: initialMediaList } = Route.useLoaderData();
  const [mediaList, setMediaList] = useState<any[]>(initialMediaList);
  const [cari, setCari] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("Semua");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Form & Selection State
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [namaTampilan, setNamaTampilan] = useState("");
  const [kategoriFolder, setKategoriFolder] = useState("ILUSTRASI");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!namaTampilan) {
        setNamaTampilan(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Pilih file gambar terlebih dahulu!");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await unggahMediaAdmin({
          data: {
            fileBase64: base64,
            namaFile: selectedFile.name,
            namaTampilan: namaTampilan || selectedFile.name,
            folder: `brevetai/${kategoriFolder.toLowerCase()}`,
            entitasTipe: kategoriFolder,
          },
        });

        if (res.success) {
          toast.success(res.message);
          setUploadModalOpen(false);
          setSelectedFile(null);
          setNamaTampilan("");
          router.invalidate();
        } else {
          toast.error(res.message || "Gagal mengunggah gambar");
        }
      } catch {
        toast.error("Terjadi kesalahan pengunggahan file ke Cloudinary.");
      } finally {
        setUploading(false);
      }
    };
  };

  const handleHapusMedia = async () => {
    if (!selectedMedia) return;
    setDeleting(true);
    try {
      const res = await hapusMediaAdmin({
        data: {
          id: selectedMedia.id,
          cloudinaryPublicId: selectedMedia.cloudinaryPublicId,
        },
      });

      if (res.success) {
        toast.success(res.message);
        setMediaList(mediaList.filter((m) => m.id !== selectedMedia.id));
        setDeleteModalOpen(false);
        setSelectedMedia(null);
        router.invalidate();
      } else {
        toast.error(res.message || "Gagal menghapus gambar");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi saat menghapus media");
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL Gambar Cloudinary berhasil disalin!");
  };

  // Filtered List
  const filtered = mediaList.filter((item) => {
    const matchCari =
      (item.namaTampilan || item.namaFile || "").toLowerCase().includes(cari.toLowerCase()) ||
      (item.cloudinaryPublicId || "").toLowerCase().includes(cari.toLowerCase());
    if (!matchCari) return false;

    if (selectedFolder === "Semua") return true;
    return (item.entitasTipe || item.folder || "").toUpperCase().includes(selectedFolder.toUpperCase());
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <>
      <PageHeader
        title="Pustaka Media & Cloudinary Storage"
        description="Kelola ilustrasi, diagram, flowchart, dan aset media BrevetAI."
        breadcrumb={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Gambar" }]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-medium text-xs py-1.5 px-3 rounded-full">
              <Cloud className="mr-1.5 h-3.5 w-3.5" /> Cloudinary CDN Active ({filtered.length} Media)
            </Badge>
            <div className="flex items-center gap-1 border border-border/80 rounded-xl p-1 bg-card shadow-xs">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-lg transition-all"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-lg transition-all"
                onClick={() => setViewMode("list")}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
            <Button size="sm" onClick={() => setUploadModalOpen(true)} className="font-semibold text-xs rounded-xl shadow-md">
              <Upload className="mr-1.5 h-3.5 w-3.5" /> Unggah Media
            </Button>
          </div>
        }
      />

      <PageBody className="space-y-6">
        {/* Toolbar Pencarian & Filter Kategori */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/80 backdrop-blur-md p-4 rounded-2xl border border-border/70 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari nama gambar atau Public ID..."
              className="pl-9 text-xs bg-background/50 rounded-xl border-border/80 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {["Semua", "ILUSTRASI", "DIAGRAM", "FLOWCHART", "INFOGRAFIS"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFolder(cat)}
                className={
                  "rounded-xl border px-3.5 py-1.5 font-medium transition-all shrink-0 text-xs " +
                  (selectedFolder === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                    : "bg-background/60 text-muted-foreground hover:text-foreground hover:bg-accent/60 border-border/60")
                }
              >
                {cat === "Semua" ? "Semua Media" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Card Grid Modern Visual (Rounded Corners & Smooth Shadows) */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border/80 bg-card p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 grid place-items-center text-primary">
              <FolderOpen className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">Media Tidak Ditemukan</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Belum ada gambar yang tersimpan atau sesuai dengan filter pencarian kamu.
              </p>
            </div>
            <Button size="sm" onClick={() => setUploadModalOpen(true)} className="font-semibold text-xs rounded-xl shadow-xs">
              <Upload className="mr-1.5 h-3.5 w-3.5" /> Unggah Gambar Baru
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs hover:shadow-md hover:border-primary/50 transition-all duration-300 flex flex-col justify-between"
              >
                {/* 1. Preview Gambar */}
                <div className="relative aspect-16/10 w-full overflow-hidden bg-muted/20 grid place-items-center border-b border-border/60">
                  <img
                    src={item.secureUrl}
                    alt={item.namaTampilan || item.namaFile}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-background/90 backdrop-blur-md text-foreground border-border/80 text-[10px] px-2 py-0.5 rounded-full font-mono shadow-xs">
                      {item.entitasTipe || "MEDIA"}
                    </Badge>
                  </div>
                </div>

                {/* 2. Informasi Meta */}
                <div className="p-4 space-y-2">
                  <p className="truncate text-xs font-semibold text-foreground leading-snug group-hover:text-primary transition-colors" title={item.namaTampilan || item.namaFile}>
                    {item.namaTampilan || item.namaFile}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[120px]" title={item.cloudinaryPublicId}>
                      {item.cloudinaryPublicId}
                    </span>
                    <span className="font-mono text-xs font-medium">{formatFileSize(item.ukuranByte)}</span>
                  </div>
                </div>

                {/* 3. Baris Tombol Aksi */}
                <div className="grid grid-cols-3 border-t border-border/60 bg-muted/10 divide-x divide-border/60">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10 rounded-none text-[11px] font-medium hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center gap-1"
                    onClick={() => copyToClipboard(item.secureUrl)}
                  >
                    <Copy className="h-3.5 w-3.5" /> Salin URL
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10 rounded-none text-[11px] font-medium hover:bg-accent transition-colors flex items-center justify-center gap-1"
                    onClick={() => {
                      setSelectedMedia(item);
                      setDetailModalOpen(true);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" /> Detail
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10 rounded-none text-[11px] font-medium text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-1"
                    onClick={() => {
                      setSelectedMedia(item);
                      setDeleteModalOpen(true);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-card divide-y overflow-hidden shadow-xs">
            {filtered.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 hover:bg-accent/40 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-14 w-20 rounded-xl bg-muted overflow-hidden shrink-0 border border-border/80">
                    <img src={item.secureUrl} alt={item.namaFile} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-semibold text-foreground truncate">{item.namaTampilan || item.namaFile}</p>
                    <p className="text-[11px] font-mono text-muted-foreground truncate">{item.cloudinaryPublicId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px] font-mono rounded-full hidden sm:inline-flex px-2.5">
                    {formatFileSize(item.ukuranByte)}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-medium rounded-xl"
                    onClick={() => copyToClipboard(item.secureUrl)}
                  >
                    <Copy className="mr-1 h-3.5 w-3.5" /> Salin URL
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-xl"
                    onClick={() => {
                      setSelectedMedia(item);
                      setDetailModalOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-xl"
                    onClick={() => {
                      setSelectedMedia(item);
                      setDeleteModalOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageBody>

      {/* 1. MODAL UPLOAD MEDIA */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Upload className="h-5 w-5 text-primary" /> Unggah Gambar ke Cloudinary
            </DialogTitle>
            <DialogDescription className="text-xs">
              Pilih file gambar dari komputer kamu untuk diunggah ke storage Cloudinary.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Pilih File Gambar</Label>
              <Input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="text-xs cursor-pointer bg-muted/20 rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nama Tampilan Media</Label>
              <Input
                value={namaTampilan}
                onChange={(e) => setNamaTampilan(e.target.value)}
                placeholder="Contoh: Skema Flowchart Coretax DJP"
                className="text-xs bg-muted/20 rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Kategori Folder Cloudinary</Label>
              <Select value={kategoriFolder} onValueChange={setKategoriFolder}>
                <SelectTrigger className="text-xs bg-muted/20 rounded-xl">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ILUSTRASI">ILUSTRASI (Materi Pembelajaran)</SelectItem>
                  <SelectItem value="DIAGRAM">DIAGRAM (Struktur & Alur)</SelectItem>
                  <SelectItem value="FLOWCHART">FLOWCHART (Prosedur Pajak)</SelectItem>
                  <SelectItem value="INFOGRAFIS">INFOGRAFIS (Tabel & Ringkasan)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setUploadModalOpen(false)} className="rounded-xl">
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={uploading || !selectedFile} className="font-bold rounded-xl shadow-sm">
                {uploading ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload className="mr-1.5 h-4 w-4" /> Unggah Sekarang
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. MODAL DETAIL MEDIA */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileImage className="h-5 w-5 text-primary" /> Detail Asset Cloudinary
            </DialogTitle>
          </DialogHeader>

          {selectedMedia && (
            <div className="space-y-4 py-2">
              <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-muted/30 border border-border/80 grid place-items-center">
                <img
                  src={selectedMedia.secureUrl}
                  alt={selectedMedia.namaTampilan || selectedMedia.namaFile}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="grid gap-2 text-xs border rounded-xl p-4 bg-card border-border/80">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Nama Media:</span>
                  <span className="font-semibold text-foreground">{selectedMedia.namaTampilan || selectedMedia.namaFile}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Cloudinary Public ID:</span>
                  <span className="font-mono text-primary font-semibold">{selectedMedia.cloudinaryPublicId}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Dimensi Gambar:</span>
                  <span className="font-mono">{selectedMedia.lebar || 0} x {selectedMedia.tinggi || 0} px</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Ukuran File:</span>
                  <span className="font-mono">{formatFileSize(selectedMedia.ukuranByte)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Direct CDN URL:</span>
                  <span className="font-mono text-[11px] truncate max-w-[280px] text-primary">{selectedMedia.secureUrl}</span>
                </div>
              </div>

              <DialogFooter className="pt-2 flex justify-between sm:justify-between items-center">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(selectedMedia.secureUrl)}
                  className="font-semibold text-xs rounded-xl"
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Salin Direct URL
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setDetailModalOpen(false)} className="rounded-xl">
                  Tutup
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 3. MODAL HAPUS MEDIA */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive font-bold">
              <Trash2 className="h-5 w-5" /> Hapus Asset dari Cloudinary
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus gambar <strong>"{selectedMedia?.namaTampilan || selectedMedia?.namaFile}"</strong> secara permanen? Asset akan dihapus dari Cloudinary & database.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)} className="rounded-xl">
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={handleHapusMedia}
              className="font-bold rounded-xl shadow-xs"
            >
              {deleting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1.5 h-4 w-4" />}
              {deleting ? "Menghapus..." : "Hapus Permanen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
