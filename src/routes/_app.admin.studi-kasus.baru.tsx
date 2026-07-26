import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save, Briefcase, Sparkles } from "lucide-react";
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
import { tambahStudiKasusAdmin } from "@/functions/studi-kasus";

export const Route = createFileRoute("/_app/admin/studi-kasus/baru")({
  head: () => ({
    meta: [
      { title: "Tambah Studi Kasus — Admin BrevetAI" },
      { name: "description", content: "Formulir penambahan studi kasus baru." },
    ],
  }),
  component: AdminStudiKasusBaruPage,
});

function AdminStudiKasusBaruPage() {
  const navigate = useNavigate();
  const [judul, setJudul] = useState("");
  const [slug, setSlug] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [level, setLevel] = useState("MENENGAH");
  const [tag, setTag] = useState("PPh OP");
  const [durasiMenit, setDurasiMenit] = useState(45);
  const [skenarioTeks, setSkenarioTeks] = useState("");
  const [terbit, setTerbit] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleJudulChange = (val: string) => {
    setJudul(val);
    if (!slug) {
      setSlug(val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) {
      toast.error("Judul studi kasus wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await tambahStudiKasusAdmin({
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
        toast.success("Studi kasus baru berhasil dibuat!");
        navigate({ to: "/admin/studi-kasus" });
      } else {
        toast.error("Gagal menambah studi kasus.");
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
        title="Tambah Studi Kasus Baru"
        description="Formulir lengkap pembuatan skenario simulasi studi kasus perpajakan."
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
              <h2 className="text-lg font-extrabold text-foreground">Detail Informasi Studi Kasus</h2>
              <p className="text-xs text-muted-foreground">Isi data skenario di bawah ini secara lengkap.</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-bold">Judul Studi Kasus *</Label>
              <Input
                placeholder="Contoh: Rekonsiliasi Fiskal PT Maju Jaya"
                value={judul}
                onChange={(e) => handleJudulChange(e.target.value)}
                className="rounded-xl text-xs sm:text-sm bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold">Slug URL (Opsional)</Label>
              <Input
                placeholder="rekonsiliasi-fiskal-pt-maju-jaya"
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
                placeholder="Penjelasan singkat mengenai ringkasan simulasi kasus."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="rounded-xl text-xs sm:text-sm bg-background"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-bold">Skenario Lengkap & Cerita Kasus</Label>
              <Textarea
                rows={7}
                placeholder="Tuliskan cerita lengkap skenario kasus, angka-angka keuangan, latar belakang transaksi, dan instruksi tugas..."
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
                <Save className="h-4 w-4" /> {submitting ? "Menyimpan..." : "Simpan Studi Kasus"}
              </Button>
            </div>
          </div>
        </form>
      </PageBody>
    </>
  );
}
