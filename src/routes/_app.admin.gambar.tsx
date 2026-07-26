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
        title="Gambar & Media Storage"
        description="Pustaka ilustrasi, diagram, dan asset media Cloudinary BrevetAI."
        breadcrumb={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Gambar" }]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-success/40 bg-success/15 text-success font-semibold text-xs py-1.5 px-3 rounded-none">
              <Cloud className="mr-1.5 h-3.5 w-3.5" /> Cloudinary: dnubzcde
            </Badge>
            <div className="flex items-center gap-1 border rounded-none p-0.5 bg-card">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7 rounded-none"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7 rounded-none"
                onClick={() => setViewMode("list")}
              >
                <ListIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button size="sm" onClick={() => setUploadModalOpen(true)} className="font-bold text-xs shadow-xs rounded-none">
              <Upload className="mr-1.5 h-3.5 w-3.5" /> Unggah Media
            </Button>
          </div>
        }
      />

      <PageBody className="space-y-6">
        {/* Search & Sharp Box Categories Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari berdasarkan nama file atau Public ID Cloudinary..."
              className="pl-9 text-xs bg-card rounded-none border-border"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {["Semua", "ILUSTRASI", "DIAGRAM", "FLOWCHART", "INFOGRAFIS"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFolder(cat)}
                className={
                  "rounded-none border px-4 py-2 font-semibold transition-all shrink-0 text-xs " +
                  (selectedFolder === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                    : "bg-card text-muted-foreground hover:text-foreground hover:bg-accent/50")
                }
              >
                {cat === "Semua" ? "Semua Media" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Large Media Grid (Sharp Box Style) */}
        {filtered.length === 0 ? (
          <div className="rounded-none border bg-card p-12 text-center max-w-md mx-auto space-y-3">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-sm font-semibold text-foreground">Belum Ada Gambar di Cloudinary</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pustaka media masih kosong. Klik tombol di bawah untuk mengunggah gambar atau ilustrasi perpajakan pertama kamu!
            </p>
            <Button size="sm" onClick={() => setUploadModalOpen(true)} className="font-bold text-xs mt-2 rounded-none">
              <Upload className="mr-1.5 h-3.5 w-3.5" /> Unggah Media Pertama
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-none border border-border bg-card shadow-xs hover:border-primary/60 transition-all flex flex-col justify-between"
              >
                {/* 1. Large Clean Picture Box (No Overlay Blocking) */}
                <div className="relative aspect-16/10 w-full overflow-hidden bg-muted/30 grid place-items-center border-b border-border">
                  <img
                    src={item.secureUrl}
                    alt={item.namaTampilan || item.namaFile}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* 2. Box Meta Info */}
                <div className="p-4 space-y-2.5 bg-card">
                  <p className="truncate text-xs font-bold text-foreground leading-snug" title={item.namaTampilan || item.namaFile}>
                    {item.namaTampilan || item.namaFile}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/40">
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-none font-mono font-bold">
                      {item.entitasTipe || "MEDIA"}
                    </Badge>
                    <span className="font-mono text-xs">{formatFileSize(item.ukuranByte)}</span>
                  </div>
                </div>

                {/* 3. Action Buttons Row (Strictly Below Image) */}
                <div className="grid grid-cols-3 border-t border-border bg-muted/20 divide-x divide-border">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 rounded-none text-xs font-bold hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                    onClick={() => copyToClipboard(item.secureUrl)}
                  >
                    <Copy className="h-3.5 w-3.5" /> Salin URL
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 rounded-none text-xs font-bold hover:bg-accent transition-colors flex items-center justify-center gap-1.5"
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
                    className="h-9 rounded-none text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-1.5"
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
          <div className="rounded-none border border-border bg-card divide-y overflow-hidden shadow-xs">
            {filtered.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 hover:bg-accent/40 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-16 w-20 rounded-none bg-muted overflow-hidden shrink-0 border border-border">
                    <img src={item.secureUrl} alt={item.namaFile} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-bold text-foreground truncate">{item.namaTampilan || item.namaFile}</p>
                    <p className="text-[11px] font-mono text-muted-foreground truncate">{item.cloudinaryPublicId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px] font-mono rounded-none hidden sm:inline-flex">
                    {formatFileSize(item.ukuranByte)}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold rounded-none"
                    onClick={() => copyToClipboard(item.secureUrl)}
                  >
                    <Copy className="mr-1 h-3.5 w-3.5" /> Salin URL
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-none"
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
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-none"
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

      {/* 1. MODAL DIALOG UPLOAD MEDIA TO CLOUDINARY (Sharp Box Style) */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-md rounded-none border-border">
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
              <Label className="text-xs font-bold">Pilih File Gambar</Label>
              <Input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="text-xs cursor-pointer bg-muted/20 rounded-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Nama Tampilan Media</Label>
              <Input
                value={namaTampilan}
                onChange={(e) => setNamaTampilan(e.target.value)}
                placeholder="Contoh: Skema Flowchart Coretax DJP"
                className="text-xs bg-muted/20 rounded-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Kategori Folder Cloudinary</Label>
              <Select value={kategoriFolder} onValueChange={setKategoriFolder}>
                <SelectTrigger className="text-xs bg-muted/20 rounded-none">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="ILUSTRASI">ILUSTRASI (Materi Pembelajaran)</SelectItem>
                  <SelectItem value="DIAGRAM">DIAGRAM (Struktur & Alur)</SelectItem>
                  <SelectItem value="FLOWCHART">FLOWCHART (Prosedur Pajak)</SelectItem>
                  <SelectItem value="INFOGRAFIS">INFOGRAFIS (Tabel & Ringkasan)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setUploadModalOpen(false)} className="rounded-none">
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={uploading || !selectedFile} className="font-bold rounded-none">
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

      {/* 2. MODAL DIALOG DETAIL MEDIA (Sharp Box Style) */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-none border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileImage className="h-5 w-5 text-primary" /> Detail Asset Cloudinary
            </DialogTitle>
          </DialogHeader>

          {selectedMedia && (
            <div className="space-y-4 py-2">
              <div className="relative aspect-16/9 rounded-none overflow-hidden bg-muted/30 border border-border grid place-items-center">
                <img
                  src={selectedMedia.secureUrl}
                  alt={selectedMedia.namaTampilan || selectedMedia.namaFile}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="grid gap-2 text-xs border rounded-none p-3.5 bg-card border-border">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Nama Media:</span>
                  <span className="font-bold text-foreground">{selectedMedia.namaTampilan || selectedMedia.namaFile}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Cloudinary Public ID:</span>
                  <span className="font-mono text-primary font-bold">{selectedMedia.cloudinaryPublicId}</span>
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
                  <span className="font-mono text-[11px] truncate max-w-[280px]">{selectedMedia.secureUrl}</span>
                </div>
              </div>

              <DialogFooter className="pt-2 flex justify-between sm:justify-between items-center">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(selectedMedia.secureUrl)}
                  className="font-bold text-xs rounded-none"
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Salin Direct URL
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setDetailModalOpen(false)} className="rounded-none">
                  Tutup
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 3. MODAL DIALOG HAPUS MEDIA (Sharp Box Style) */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md rounded-none border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive font-bold">
              <Trash2 className="h-5 w-5" /> Hapus Asset dari Cloudinary
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus gambar <strong>"{selectedMedia?.namaTampilan || selectedMedia?.namaFile}"</strong> secara permanen? Asset akan dihapus dari Cloudinary & database.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)} className="rounded-none">
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={handleHapusMedia}
              className="font-bold rounded-none"
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
