import { createFileRoute } from "@tanstack/react-router";
import { Key, Upload, Wand2, Check, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { daftarApiKeys, tambahApiKey, importBanyakApiKey } from "@/functions/api-keys";

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
  const [singleKeyName, setSingleKeyName] = useState("");
  const [singleKeyValue, setSingleKeyValue] = useState("");
  const [batchText, setBatchText] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const memuatKeys = async () => {
    setLoadingKeys(true);
    try {
      const res = await daftarApiKeys();
      if (res.success && res.data) setKeysList(res.data);
    } catch { /* ignore */ }
    finally { setLoadingKeys(false); }
  };

  useEffect(() => { memuatKeys(); }, []);

  const handleTambahSatu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleKeyName || !singleKeyValue) return;
    setIsSubmitting(true);
    setImportStatus(null);
    try {
      const res = await tambahApiKey({ data: { nama: singleKeyName, apiKey: singleKeyValue, prioritas: 0 } });
      if (res.success) {
        toast.success("Gemini API key berhasil disimpan!");
        setSingleKeyName(""); setSingleKeyValue("");
        memuatKeys();
      } else {
        toast.error(res.message || "Gagal menyimpan key");
      }
    } catch { toast.error("Terjadi kesalahan sistem"); }
    finally { setIsSubmitting(false); }
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
        memuatKeys();
      } else {
        toast.error(res.message || "Gagal import batch key");
      }
    } catch { toast.error("Terjadi kesalahan sistem"); }
    finally { setIsSubmitting(false); }
  };

  return (
    <>
      <PageHeader
        title="Gemini API Keys"
        description={`${keysList.length} key terdaftar di database`}
        breadcrumb={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Gemini Keys" }]}
      />

      <PageBody className="space-y-6">
        {/* Add Keys */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Tambah Satu */}
          <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Wand2 className="h-4 w-4 text-primary" />
              <span className="font-bold text-sm">Tambah Satu Key</span>
            </div>
            <form onSubmit={handleTambahSatu} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Label / Nama</Label>
                <Input value={singleKeyName} onChange={(e) => setSingleKeyName(e.target.value)} placeholder="Key Utama Dev 1" className="text-xs bg-background" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Gemini API Key</Label>
                <Input type="password" value={singleKeyValue} onChange={(e) => setSingleKeyValue(e.target.value)} placeholder="AIzaSy..." className="text-xs font-mono bg-background" required />
              </div>
              <Button type="submit" size="sm" disabled={isSubmitting || !singleKeyName || !singleKeyValue} className="font-bold shadow-sm w-full">
                {isSubmitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Key className="mr-1.5 h-4 w-4" />}
                Simpan Key
              </Button>
            </form>
          </div>

          {/* Import Batch */}
          <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Upload className="h-4 w-4 text-primary" />
              <span className="font-bold text-sm">Import Batch Keys</span>
            </div>
            <form onSubmit={handleImportBatch} className="space-y-3">
              <p className="text-[11px] text-muted-foreground">1 key per baris: <code className="bg-muted px-1 rounded">NamaKey=AIzaSy...</code></p>
              <Textarea
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder={`Key-1=AIzaSyA...\nKey-2=AIzaSyB...`}
                rows={5}
                disabled={isSubmitting}
                className="font-mono text-[11px] bg-background"
              />
              <Button type="submit" size="sm" disabled={isSubmitting || !batchText.trim()} className="font-bold shadow-sm w-full">
                {isSubmitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />}
                Import Sekaligus
              </Button>
            </form>
          </div>
        </div>

        {importStatus && (
          <div className="rounded-xl bg-success/10 border border-success/30 px-4 py-2.5 text-xs font-semibold text-success flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" /> {importStatus}
          </div>
        )}

        {/* Keys List */}
        <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="font-bold text-sm flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" /> Daftar API Keys ({keysList.length})
            </span>
            <Button size="sm" variant="outline" onClick={memuatKeys} className="h-7 text-xs">
              {loadingKeys ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Refresh"}
            </Button>
          </div>

          {loadingKeys ? (
            <div className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
            </div>
          ) : keysList.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">Belum ada API key terdaftar.</p>
          ) : (
            <div className="divide-y text-xs">
              {keysList.map((k) => (
                <div key={k.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{k.nama}</p>
                    <p className="text-muted-foreground font-mono text-[11px] truncate">{k.apiKeyAman}</p>
                  </div>
                  <Badge variant={k.status === "AKTIF" ? "default" : "destructive"} className="text-[10px] shrink-0">
                    {k.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageBody>
    </>
  );
}
