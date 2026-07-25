import { createFileRoute } from "@tanstack/react-router";
import { Bell, Palette, Shield, Save, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getProfilPengguna, updateProfilPengguna } from "@/functions/users";

export const Route = createFileRoute("/_app/pengaturan")({
  loader: async () => {
    try {
      const res = await getProfilPengguna();
      return { profile: res.success ? res.data : null };
    } catch {
      return { profile: null };
    }
  },
  head: () => ({
    meta: [
      { title: "Pengaturan — BrevetAI" },
      { name: "description", content: "Atur preferensi akun, tampilan, notifikasi, dan keamanan." },
    ],
  }),
  component: Pengaturan,
});

function Section({ icon: Icon, title, desc, children }: any) {
  return (
    <section className="rounded-2xl border bg-card">
      <div className="border-b p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">{title}</p>
            {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Row({ label, hint, control }: any) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function Pengaturan() {
  const { profile } = Route.useLoaderData();
  const [namaLengkap, setNamaLengkap] = useState(profile?.namaLengkap || profile?.name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSimpanProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await updateProfilPengguna({ data: { namaLengkap, bio } });
      if (res.success) {
        setStatus("Profil berhasil diperbarui!");
      } else {
        setStatus(`Gagal: ${res.message}`);
      }
    } catch {
      setStatus("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Pengaturan Akun" description="Kelola profil, tampilan, dan preferensi belajarmu." />
      <PageBody className="max-w-3xl space-y-5">
        <form onSubmit={handleSimpanProfil}>
          <Section icon={Shield} title="Informasi Profil" desc="Perbarui nama lengkap dan bio profil Anda.">
            <div className="space-y-4">
              <div>
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile?.email || ""} disabled className="mt-1 bg-muted" />
                <p className="mt-1 text-[11px] text-muted-foreground">Email terikat pada akun autentikasi.</p>
              </div>
              <div>
                <Label htmlFor="bio">Bio Singkat</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ceritakan sedikit tentang latar belakang atau target belajarmu..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              {status && (
                <div className="rounded-lg bg-primary/10 p-3 text-xs font-medium text-primary flex items-center gap-2">
                  <Check className="h-4 w-4" /> {status}
                </div>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Simpan Perubahan
              </Button>
            </div>
          </Section>
        </form>

        <Section icon={Palette} title="Tampilan & Preferensi" desc="Atur pengalaman visual.">
          <Row label="Mode gelap" hint="Tampilan gelap aktif secara default." control={<Switch defaultChecked disabled />} />
          <Row label="Animasi halus" hint="Aktifkan transisi mikro pada UI." control={<Switch defaultChecked />} />
        </Section>

        <Section icon={Bell} title="Notifikasi" desc="Kelola pemberitahuan email dan sistem.">
          <Row label="Email pengingat belajar" hint="Kirim rangkuman pengingat mingguan." control={<Switch defaultChecked />} />
          <Row label="Notifikasi kuis baru" hint="Beri tahu saat kuis baru dirilis." control={<Switch defaultChecked />} />
        </Section>
      </PageBody>
    </>
  );
}
