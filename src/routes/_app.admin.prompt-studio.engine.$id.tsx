import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Save,
  Loader2,
  Clock,
  Eye,
  Edit3,
  RotateCcw,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getDetailPromptEngine,
  getRiwayatVersiEngine,
  updatePromptEngine,
  toggleAktifPromptEngine,
  pulihkanVersiEngine,
} from "@/functions/prompt-studio";

export const Route = createFileRoute("/_app/admin/prompt-studio/engine/$id")({
  loader: async ({ params }) => {
    try {
      const [engineRes, versiRes] = await Promise.all([
        getDetailPromptEngine({ data: { id: params.id } }),
        getRiwayatVersiEngine({ data: { engineId: params.id } }),
      ]);
      return {
        engine: engineRes.success && engineRes.data ? engineRes.data : null,
        riwayatVersi: versiRes.success && versiRes.data ? versiRes.data : [],
      };
    } catch {
      return { engine: null, riwayatVersi: [] };
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Edit ${(loaderData?.engine as any)?.nama || "Prompt Engine"} — Prompt Studio BrevetAI` },
    ],
  }),
  component: PromptEngineEditorPage,
});

function PromptEngineEditorPage() {
  const { engine, riwayatVersi } = Route.useLoaderData();
  const navigate = useNavigate();

  if (!engine) {
    return (
      <PageBody className="py-16 text-center space-y-4">
        <h3 className="text-base font-bold">Engine tidak ditemukan</h3>
        <Button size="sm" onClick={() => navigate({ to: "/admin/prompt-studio" })}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </PageBody>
    );
  }

  const [nama, setNama] = useState((engine as any).nama || "");
  const [deskripsi, setDeskripsi] = useState((engine as any).deskripsi || "");
  const [konten, setKonten] = useState((engine as any).kontenTemplate || "");
  const [urutanKompilasi, setUrutanKompilasi] = useState(String((engine as any).urutanKompilasi ?? 0));
  const [catatanRevisi, setCatatanRevisi] = useState("");
  const [aktif, setAktif] = useState<boolean>((engine as any).aktif ?? true);
  const [versi] = useState<number>((engine as any).versi ?? 1);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [previewVersi, setPreviewVersi] = useState<any | null>(null);

  const handleSimpan = async () => {
    setLoading(true);
    try {
      const res = await updatePromptEngine({
        data: {
          id: (engine as any).id,
          nama,
          deskripsi,
          kontenTemplate: konten,
          urutanKompilasi: parseInt(urutanKompilasi, 10),
          catatanRevisi: catatanRevisi || undefined,
        },
      });
      if (res.success) {
        toast.success("Prompt Engine berhasil diperbarui!");
        setCatatanRevisi("");
      } else {
        toast.error(res.message || "Gagal memperbarui engine");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAktif = async () => {
    try {
      const res = await toggleAktifPromptEngine({ data: { id: (engine as any).id } });
      if (res.success && res.data) {
        setAktif((res.data as any).aktif);
        toast.success(`Engine ${(res.data as any).aktif ? "diaktifkan" : "dinonaktifkan"}`);
      }
    } catch {
      toast.error("Gagal mengubah status engine");
    }
  };

  const handlePulihkan = async (nomorVersi: number) => {
    try {
      const res = await pulihkanVersiEngine({ data: { engineId: (engine as any).id, nomorVersi } });
      if (res.success && res.data) {
        setKonten((res.data as any).kontenTemplate || "");
        toast.success(`Engine dipulihkan ke Versi ${nomorVersi}`);
        setPreviewVersi(null);
      } else {
        toast.error(res.message || "Gagal memulihkan versi");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
  };

  const charCount = konten.length;
  const estimatedTokens = Math.ceil(charCount / 4);

  return (
    <>
      <PageHeader
        title={(engine as any).nama}
        description={`v${versi} · ${(engine as any).kodeEngine}`}
        breadcrumb={[
          { label: "Admin", to: "/admin/dashboard" },
          { label: "Prompt Studio", to: "/admin/prompt-studio" },
          { label: "Edit Engine" },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleToggleAktif}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                aktif
                  ? "text-success border-success/30 bg-success/10 hover:bg-success/20"
                  : "text-muted-foreground border-muted hover:bg-muted/30"
              }`}
            >
              {aktif ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              {aktif ? "Aktif" : "Nonaktif"}
            </button>
            <Button size="sm" variant="outline" onClick={() => navigate({ to: "/admin/prompt-studio" })}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali
            </Button>
            <Button size="sm" onClick={handleSimpan} disabled={loading} className="font-bold shadow-sm">
              {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              Simpan
            </Button>
          </div>
        }
      />

      <PageBody className="space-y-6">
        <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-5">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Nama Engine</Label>
              <Input value={nama} onChange={(e) => setNama(e.target.value)} className="text-xs font-bold bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Urutan Kompilasi</Label>
              <Input
                type="number"
                value={urutanKompilasi}
                onChange={(e) => setUrutanKompilasi(e.target.value)}
                className="text-xs font-mono bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Catatan Revisi (opsional)</Label>
              <Input
                value={catatanRevisi}
                onChange={(e) => setCatatanRevisi(e.target.value)}
                placeholder="Ringkas perubahan..."
                className="text-xs bg-background"
              />
            </div>
          </div>

          <div className="space-y-1.5 pb-4 border-b">
            <Label className="text-xs font-bold">Deskripsi</Label>
            <Input value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} className="text-xs bg-background" />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <TabsList className="bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="editor" className="text-xs px-3 py-1.5 font-semibold">
                  <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-xs px-3 py-1.5 font-semibold">
                  <Eye className="mr-1.5 h-3.5 w-3.5" /> Pratinjau
                </TabsTrigger>
                <TabsTrigger value="history" className="text-xs px-3 py-1.5 font-semibold">
                  <Clock className="mr-1.5 h-3.5 w-3.5" /> Riwayat ({riwayatVersi.length})
                </TabsTrigger>
              </TabsList>

              {/* Char/Token info */}
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                <span>{charCount.toLocaleString()} karakter</span>
                <span>~{estimatedTokens.toLocaleString()} token</span>
              </div>
            </div>

            <TabsContent value="editor">
              <Textarea
                rows={18}
                value={konten}
                onChange={(e) => setKonten(e.target.value)}
                className="font-mono text-xs bg-background p-4 leading-relaxed resize-y"
                placeholder="Tulis konten template prompt engine di sini..."
              />
            </TabsContent>

            <TabsContent value="preview">
              <div className="rounded-xl border bg-muted/20 p-5 min-h-40 whitespace-pre-wrap font-mono text-xs text-foreground leading-relaxed max-h-[450px] overflow-y-auto">
                {konten || <span className="text-muted-foreground italic">Konten template kosong.</span>}
              </div>
            </TabsContent>

            <TabsContent value="history">
              {riwayatVersi.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Belum ada riwayat versi.</div>
              ) : (
                <div className="space-y-3">
                  {[...riwayatVersi].reverse().map((v: any) => (
                    <div key={v.id} className="rounded-xl border bg-background p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-mono">v{v.nomorVersi}</Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(v.createdAt).toLocaleString("id-ID")}
                          </span>
                          {v.catatanRevisi && (
                            <span className="text-[11px] text-foreground">— {v.catatanRevisi}</span>
                          )}
                        </div>
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreviewVersi(previewVersi?.id === v.id ? null : v)}
                            className="h-7 text-xs px-2"
                          >
                            <Eye className="h-3 w-3 mr-1" /> {previewVersi?.id === v.id ? "Tutup" : "Lihat"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePulihkan(v.nomorVersi)}
                            className="h-7 text-xs px-2 text-primary border-primary/30"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" /> Pulihkan
                          </Button>
                        </div>
                      </div>
                      {previewVersi?.id === v.id && (
                        <div className="rounded-lg border bg-muted/10 p-3 font-mono text-xs whitespace-pre-wrap max-h-48 overflow-y-auto text-foreground">
                          {v.kontenTemplate}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="border-t pt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/prompt-studio" })}>
              Batal
            </Button>
            <Button size="sm" onClick={handleSimpan} disabled={loading} className="font-bold shadow-sm">
              {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </PageBody>
    </>
  );
}
