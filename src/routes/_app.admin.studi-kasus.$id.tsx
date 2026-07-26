import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStudiKasusBySlug, updateStudiKasusAdmin } from "@/functions/studi-kasus";

export const Route = createFileRoute("/_app/admin/studi-kasus/$id")({
  loader: async ({ params }) => {
    try {
      const res = await getStudiKasusBySlug(params.id);
      return { caseData: res.success && res.data ? res.data : null };
    } catch {
      return { caseData: null };
    }
  },
  head: ({ params }) => ({
    meta: [
      { title: `Edit Studi Kasus ${params.id} — Admin BrevetAI` },
      { name: "description", content: "Formulir pengeditan studi kasus." },
    ],
  }),
  component: AdminStudiKasusEditPage,
});

function AdminStudiKasusEditPage() {
  const navigate = useNavigate();
  const params = useParams({ from: "/_app/admin/studi-kasus/$id" });
  const { caseData } = Route.useLoaderData();

  const [judul, setJudul] = useState("");
  const [slug, setSlug] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [level, setLevel] = useState("MENENGAH");
  const [tag, setTag] = useState("PPh OP");
  const [durasiMenit, setDurasiMenit] = useState(45);
  const [skenarioTeks, setSkenarioTeks] = useState("");
  const [terbit, setTerbit] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (caseData) {
      setJudul(caseData.judul || "");
      setSlug(caseData.slug || "");
      setDeskripsi(caseData.deskripsi || "");
      setLevel(caseData.level || "MENENGAH");
      setTag(caseData.tag || "PPh OP");
      setDurasiMenit(caseData.durasiMenit || 45);
      setSkenarioTeks(caseData.skenarioTeks || "");
      setTerbit(caseData.terbit !== undefined ? caseData.terbit : true);
    }
  }, [caseData]);

  if (!caseData) {
    return (
      <>
        <PageHeader title="Edit Studi Kasus" description="Pengeditan data studi kasus." />
        <PageBody className="text-center py-12">
          <p className="text-sm text-muted-foreground">Studi kasus tidak ditemukan.</p>
          <Button asChild size="sm" className="mt-4 rounded-xl font-bold text-xs">
            <Link to="/admin/studi-kasus">Kembali ke Daftar</Link>
          </Button>
        </PageBody>
      </>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) {
      toast.error("Judul studi kasus wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateStudiKasusAdmin(caseData.id, {
        judul,
        slug: slug.trim() || undefined,
        deskripsi,
        level,
        tag,
        durasiMenit: Number(durasiMenit) || 45,
        skenarioTeks,
        terbit,
      });

      if (res.success) {
        toast.success("Studi kasus berhasil diperbarui!");
        navigate({ to: "/admin/studi-kasus" });
      } else {
        toast.error("Gagal memperbarui studi kasus.");
      }
    } catch {
      toast.error("Terjadi kesalahan server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Edit Studi Kasus"
        description={`Mengedit skenario: ${caseData.judul}`}
        actions={
          <Button variant="outline" size="sm" asChild className="rounded-xl font-bold text-xs">
            <Link to="/admin/studi-kasus"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Kembali</Link>
          </Button>
        }
      />

      {/* STRICT IN-PAGE FULL VIEW FORM (NO MODAL AT ALL) */}
      <PageBody className="w-full max-w-4xl mx-auto space-y-6 py-4">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border/60 pb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-foreground">Edit Informasi Studi Kasus</h2>
              <p className="text-xs text-muted-foreground">Perbarui detail data skenario di bawah ini.</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-bold">Judul Studi Kasus *</Label>
              <Input
                placeholder="Judul Studi Kasus"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="rounded-xl text-xs sm:text-sm bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold">Slug URL</Label>
              <Input
                placeholder="slug-url"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="rounded-xl text-xs sm:text-sm bg-background font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold">Durasi Pengerjaan (Menit)</Label>
              <Input
                type="number"
                value={durasiMenit}
                onChange={(e) => setDurasiMenit(Number(e.target.value))}
                className="rounded-xl text-xs sm:text-sm bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold">Tingkat Kesulitan (Level)</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="rounded-xl text-xs sm:text-sm bg-background">
                  <SelectValue placeholder="Pilih Level" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="DASAR">DASAR (Pemula)</SelectItem>
                  <SelectItem value="MENENGAH">MENENGAH (Menengah)</SelectItem>
                  <SelectItem value="LANJUT">LANJUT (Mahir)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold">Kategori / Tag Regulasi</Label>
              <Select value={tag} onValueChange={setTag}>
                <SelectTrigger className="rounded-xl text-xs sm:text-sm bg-background">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="PPh OP">PPh Orang Pribadi (PPh OP)</SelectItem>
                  <SelectItem value="PPh Badan">PPh Badan & Rekonsiliasi</SelectItem>
                  <SelectItem value="PPN">PPN & Faktur Pajak</SelectItem>
                  <SelectItem value="PPh 21/26">PPh Pasal 21/26 & PMK 168</SelectItem>
                  <SelectItem value="Sengketa">Sengketa & Keberatan KUP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-bold">Deskripsi Singkat</Label>
              <Input
                placeholder="Penjelasan singkat studi kasus."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="rounded-xl text-xs sm:text-sm bg-background"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-bold">Skenario Lengkap & Cerita Kasus</Label>
              <Textarea
                rows={7}
                placeholder="Tuliskan cerita lengkap skenario kasus..."
                value={skenarioTeks}
                onChange={(e) => setSkenarioTeks(e.target.value)}
                className="rounded-xl text-xs sm:text-sm bg-background leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <div className="flex items-center gap-3">
              <Switch id="terbit" checked={terbit} onCheckedChange={setTerbit} />
              <Label htmlFor="terbit" className="text-xs font-bold cursor-pointer">
                Publikasikan Studi Kasus Ini (Tampil untuk Siswa)
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" asChild className="rounded-xl font-bold text-xs">
                <Link to="/admin/studi-kasus">Batal</Link>
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-xl font-bold text-xs gap-1.5 shadow-md">
                <Save className="h-4 w-4" /> {submitting ? "Memperbarui..." : "Perbarui Studi Kasus"}
              </Button>
            </div>
          </div>
        </form>
      </PageBody>
    </>
  );
}
