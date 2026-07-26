import { createFileRoute } from "@tanstack/react-router";
import { Key, Upload, Wand2, Check, Loader2, Trash2, Plus, Zap, AlertTriangle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  daftarApiKeys,
  tambahApiKey,
  importBanyakApiKey,
  hapusApiKey,
  tesApiKeyServer,
  tesSemuaApiKeyServer,
} from "@/functions/api-keys";

export const Route = createFileRoute("/_app/admin/key")({
  head: () => ({
    meta: [
      { title: "Gemini API Keys — Admin BrevetAI" },
      { name: "description", content: "Manajemen rotasi ratusan API key Gemini untuk platform BrevetAI." },
    ],
  }),
  component: AdminKeyPage,
});

function AdminKeyPage() {
  const [keysList, setKeysList] = useState<any[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
  const [testingAll, setTestingAll] = useState(false);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteKey, setSelectedDeleteKey] = useState<any | null>(null);

  // Form states
  const [singleKeyName, setSingleKeyName] = useState("");
  const [singleKeyValue, setSingleKeyValue] = useState("");
  const [batchText, setBatchText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const memuatKeys = async () => {
    setLoadingKeys(true);
    try {
      const res = await daftarApiKeys();
      if (res.success && res.data) setKeysList(res.data);
    } catch {
      /* ignore */
    } finally {
      setLoadingKeys(false);
    }
  };

  useEffect(() => {
    memuatKeys();
  }, []);

  const handleTambahSatu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleKeyName || !singleKeyValue) return;
    setIsSubmitting(true);
    try {
      const res = await tambahApiKey({ data: { nama: singleKeyName, apiKey: singleKeyValue, prioritas: 0 } });
      if (res.success) {
        toast.success("Gemini API key berhasil disimpan!");
        setSingleKeyName("");
        setSingleKeyValue("");
        setAddModalOpen(false);
        memuatKeys();
      } else {
        toast.error(res.message || "Gagal menyimpan key");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchText.trim()) return;
    const baris = batchText.split("\n").filter((b) => b.trim());
    const items = baris.map((b, i) => {
      const [nama, key] = b.includes("=") ? b.split("=") : [`Key-${i + 1}`, b];
      return { nama: nama.trim(), apiKey: key.trim(), prioritas: 0 };
    });
    setIsSubmitting(true);
    try {
      const res = await importBanyakApiKey({ data: { keys: items } });
      if (res.success) {
        toast.success(res.message || "Berhasil import batch key!");
        setBatchText("");
        setImportModalOpen(false);
        memuatKeys();
      } else {
        toast.error(res.message || "Gagal import batch key");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTesKey = async (id: string) => {
    setTestingKeyId(id);
    try {
      const res = await tesApiKeyServer({ data: { id } });
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
      memuatKeys();
    } catch {
      toast.error("Gagal menguji key");
    } finally {
      setTestingKeyId(null);
    }
  };

  const handleTesSemuaKey = async () => {
    setTestingAll(true);
    try {
      const res = await tesSemuaApiKeyServer();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message || "Gagal menguji semua key");
      }
      memuatKeys();
    } catch {
      toast.error("Terjadi kesalahan saat menguji rotasi key");
    } finally {
      setTestingAll(false);
    }
  };

  const handleHapusKey = async () => {
    if (!selectedDeleteKey) return;
    setIsSubmitting(true);
    try {
      const res = await hapusApiKey({ data: { id: selectedDeleteKey.id } });
      if (res.success) {
        toast.success(`Key "${selectedDeleteKey.nama}" berhasil dihapus.`);
        setDeleteModalOpen(false);
        memuatKeys();
      } else {
        toast.error(res.message || "Gagal menghapus key");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Gemini API Keys"
        description={`${keysList.length} key terdaftar di database Neon`}
        breadcrumb={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Gemini Keys" }]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={handleTesSemuaKey}
              disabled={testingAll || keysList.length === 0}
              className="font-bold shadow-2xs text-xs"
            >
              {testingAll ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Zap className="mr-1.5 h-3.5 w-3.5 text-amber-500" />}
              Tes Semua Rotasi
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setImportModalOpen(true)}
              className="font-bold shadow-2xs text-xs"
            >
              <Upload className="mr-1.5 h-3.5 w-3.5 text-primary" /> Import Batch
            </Button>
            <Button
              size="sm"
              onClick={() => setAddModalOpen(true)}
              className="font-bold shadow-sm text-xs"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Key Baru
            </Button>
          </div>
        }
      />

      <PageBody className="space-y-6">
        {/* Full-Width Keys List Table */}
        <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3.5">
            <span className="font-bold text-sm flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" /> Daftar API Keys Rotasi ({keysList.length})
            </span>
            <Button size="sm" variant="ghost" onClick={memuatKeys} className="h-8 text-xs font-semibold">
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loadingKeys ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          {loadingKeys ? (
            <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" /> Memuat daftar API key...
            </div>
          ) : keysList.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Key className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">Belum ada API key terdaftar di database Neon.</p>
              <Button size="sm" onClick={() => setAddModalOpen(true)} className="font-bold text-xs">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Tambah Key Pertama
              </Button>
            </div>
          ) : (
            <div className="divide-y text-xs">
              {keysList.map((k, index) => {
                const isError = k.status === "ERROR";
                const isLimit = k.status === "LIMIT";
                const isTesting = testingKeyId === k.id;
                return (
                  <div
                    key={k.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 px-2 rounded-lg transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">{k.nama}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            isError
                              ? "border-destructive/40 bg-destructive/15 text-destructive"
                              : isLimit
                              ? "border-amber-500/40 bg-amber-500/15 text-amber-500"
                              : "border-success/40 bg-success/15 text-success"
                          }`}
                        >
                          ● {k.status}
                        </Badge>
                        <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          Urutan #{index + 1} (Prioritas: {k.prioritas})
                        </span>
                      </div>
                      <p className="text-muted-foreground font-mono text-[11px] truncate">{k.apiKeyAman}</p>
                      {k.pesanError && (
                        <p className="text-[10px] font-semibold text-destructive truncate">
                          ⚠️ Error: {k.pesanError}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTesKey(k.id)}
                        disabled={isTesting}
                        className="h-8 text-xs font-semibold"
                        title="Tes koneksi Gemini API"
                      >
                        {isTesting ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Zap className="mr-1 h-3.5 w-3.5 text-amber-500" />
                        )}
                        {isTesting ? "Menguji..." : "Tes Key"}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedDeleteKey(k);
                          setDeleteModalOpen(true);
                        }}
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                        title="Hapus Key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL 1: Tambah Satu Key */}
        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-bold text-foreground">
                <Wand2 className="h-5 w-5 text-primary" /> Tambah Gemini API Key
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Masukkan API Key Gemini resmi dari Google AI Studio. Key akan dienkripsi secara otomatis.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleTambahSatu} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Label / Nama Key *</Label>
                <Input
                  value={singleKeyName}
                  onChange={(e) => setSingleKeyName(e.target.value)}
                  placeholder="Contoh: Key Utama Dev 1"
                  className="text-xs bg-background"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">API Key Gemini *</Label>
                <Input
                  type="password"
                  value={singleKeyValue}
                  onChange={(e) => setSingleKeyValue(e.target.value)}
                  placeholder="AIzaSy..."
                  className="text-xs font-mono bg-background"
                  required
                />
              </div>
              <DialogFooter className="gap-2 sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting || !singleKeyName || !singleKeyValue} className="font-bold shadow-sm">
                  {isSubmitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Check className="mr-1.5 h-4 w-4" />}
                  Simpan Key
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL 2: Import Batch Keys */}
        <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-bold text-foreground">
                <Upload className="h-5 w-5 text-primary" /> Import Batch Gemini Keys
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Masukkan banyak API key sekaligus (1 key per baris). Format: <code className="bg-muted px-1 rounded font-mono">NamaKey=AIzaSy...</code>
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleImportBatch} className="space-y-4 py-2">
              <Textarea
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder={`Key-1=AIzaSyA...\nKey-2=AIzaSyB...`}
                rows={7}
                disabled={isSubmitting}
                className="font-mono text-[11px] bg-background"
                required
              />
              <DialogFooter className="gap-2 sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setImportModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting || !batchText.trim()} className="font-bold shadow-sm">
                  {isSubmitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />}
                  Import Sekaligus
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL 3: Konfirmasi Hapus Key */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive font-bold">
                <AlertTriangle className="h-5 w-5" /> Hapus Gemini API Key?
              </DialogTitle>
              <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
                Apakah Anda yakin ingin menghapus key <strong>"{selectedDeleteKey?.nama}"</strong>? Key ini tidak akan digunakan lagi dalam rotasi API.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setDeleteModalOpen(false)}>
                Batal
              </Button>
              <Button type="button" variant="destructive" onClick={handleHapusKey} disabled={isSubmitting} className="font-bold shadow-sm">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ya, Hapus Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageBody>
    </>
  );
}
