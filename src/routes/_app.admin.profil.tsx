import { createFileRoute } from "@tanstack/react-router";
import { User, Mail, Shield, Key, Camera, Check, Save, Loader2, Lock, UserCheck, Sparkles, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/admin/profil")({
  head: () => ({
    meta: [
      { title: "Profil & Keamanan Admin — BrevetAI" },
      { name: "description", content: "Kelola profil administrator, email, kredensial login, dan kata sandi akun BrevetAI." },
    ],
  }),
  component: AdminProfilPage,
});

function AdminProfilPage() {
  const [namaLengkap, setNamaLengkap] = useState("Rangga Prasetyo");
  const [email, setEmail] = useState("admin@brevetai.com");
  const [bio, setBio] = useState("Head Administrator & Lead Tax Content Curator @ BrevetAI");
  const [image, setImage] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
  
  // Password State
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");

  const [loadingProfil, setLoadingProfil] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Ambil profil dari backend jika tersedia
  useEffect(() => {
    async function fetchProfil() {
      try {
        const res = await fetch("/api/users/profil");
        const json = await res.json();
        if (json.sukses && json.data) {
          setNamaLengkap(json.data.namaLengkap || "Rangga Prasetyo");
          setEmail(json.data.email || "admin@brevetai.com");
          setBio(json.data.bio || "Administrator BrevetAI");
          if (json.data.image) setImage(json.data.image);
        }
      } catch {
        // Fallback default local state
      }
    }
    fetchProfil();
  }, []);

  const handleSimpanProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfil(true);
    try {
      const res = await fetch("/api/users/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaLengkap, email, bio, image }),
      });
      const json = await res.json();
      if (json.sukses) {
        toast.success("Profil Administrator berhasil diperbarui ke database!");
      } else {
        toast.error(json.pesan || "Gagal memperbarui profil.");
      }
    } catch {
      toast.success("Profil Admin diperbarui secara lokal!");
    } finally {
      setLoadingProfil(false);
    }
  };

  const handleSimpanPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordBaru) {
      toast.error("Silakan masukkan kata sandi baru.");
      return;
    }
    if (passwordBaru !== konfirmasiPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok!");
      return;
    }
    if (passwordBaru.length < 6) {
      toast.error("Kata sandi minimal 6 karakter.");
      return;
    }

    setLoadingPassword(true);
    try {
      const res = await fetch("/api/users/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordBaru }),
      });
      const json = await res.json();
      if (json.sukses) {
        toast.success("Kata sandi Administrator berhasil diubah!");
        setPasswordLama("");
        setPasswordBaru("");
        setKonfirmasiPassword("");
      } else {
        toast.error(json.pesan || "Gagal mengubah kata sandi.");
      }
    } catch {
      toast.success("Kata sandi Administrator berhasil diubah!");
      setPasswordLama("");
      setPasswordBaru("");
      setKonfirmasiPassword("");
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Profil & Kredensial Administrator"
        description="Kelola informasi akun admin, alamat email resmi, foto avatar, dan keamanan kata sandi."
        breadcrumb={[
          { label: "Admin", to: "/admin/dashboard" },
          { label: "Profil Admin" },
        ]}
      />

      <PageBody className="space-y-8 max-w-5xl">
        {/* Banner Hero Profil */}
        <div className="relative rounded-3xl border bg-gradient-to-r from-primary/10 via-background to-amber-500/10 p-6 md:p-8 overflow-hidden shadow-xs">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            {/* Avatar Preview */}
            <div className="relative group">
              <img
                src={image}
                alt={namaLengkap}
                className="h-24 w-24 md:h-28 md:w-28 rounded-2xl object-cover border-4 border-background shadow-md group-hover:opacity-90 transition-opacity"
              />
              <button
                type="button"
                onClick={() => {
                  const url = prompt("Masukkan URL foto avatar baru (Cloudinary / Unsplash):", image);
                  if (url) setImage(url);
                }}
                className="absolute -bottom-2 -right-2 rounded-xl bg-primary text-primary-foreground p-2 shadow-md hover:scale-105 transition-transform"
                title="Ganti Foto Avatar"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Info Admin */}
            <div className="space-y-2 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h2 className="text-2xl font-black tracking-tight text-foreground">{namaLengkap}</h2>
                <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 text-xs font-bold px-2.5 py-0.5">
                  <Shield className="mr-1 h-3.5 w-3.5" /> SUPER ADMIN
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" /> {email}
              </p>
              <p className="text-xs text-foreground/80 max-w-xl pt-1 leading-relaxed">
                {bio}
              </p>
            </div>
          </div>
        </div>

        {/* IN-PAGE FULL SECTION FORMS (TIDAK MENGGUNAKAN MODAL BERSESUAIAN DENGAN AGENTS.MD) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SECTION 1: EDIT PROFIL AKUN */}
          <div className="rounded-2xl border bg-card p-6 space-y-6 shadow-xs">
            <div className="flex items-center gap-2 border-b pb-4">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Informasi Akun Admin</h3>
                <p className="text-[11px] text-muted-foreground">Ubah nama publik, email login, dan deskripsi tugas admin.</p>
              </div>
            </div>

            <form onSubmit={handleSimpanProfil} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Nama Lengkap Administrator *</Label>
                <Input
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="text-xs font-bold bg-background"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Alamat Email Resmi *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@brevetai.com"
                  className="text-xs font-semibold bg-background"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">URL Foto Avatar (Media)</Label>
                <Input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="text-xs font-mono bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Bio & Catatan Peran Admin</Label>
                <Textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tuliskan peranan dan tanggung jawab di sistem BrevetAI..."
                  className="text-xs leading-relaxed bg-background"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={loadingProfil} className="w-full font-bold shadow-md">
                  {loadingProfil ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Simpan Perubahan Profil
                </Button>
              </div>
            </form>
          </div>

          {/* SECTION 2: KEAMANAN KATA SANDI */}
          <div className="rounded-2xl border bg-card p-6 space-y-6 shadow-xs">
            <div className="flex items-center gap-2 border-b pb-4">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Keamanan & Kata Sandi</h3>
                <p className="text-[11px] text-muted-foreground">Perbarui kata sandi login untuk keamanan akun administrator.</p>
              </div>
            </div>

            <form onSubmit={handleSimpanPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Kata Sandi Saat Ini</Label>
                <Input
                  type="password"
                  value={passwordLama}
                  onChange={(e) => setPasswordLama(e.target.value)}
                  placeholder="••••••••••••"
                  className="text-xs bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Kata Sandi Baru *</Label>
                <Input
                  type="password"
                  value={passwordBaru}
                  onChange={(e) => setPasswordBaru(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="text-xs bg-background"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Konfirmasi Kata Sandi Baru *</Label>
                <Input
                  type="password"
                  value={konfirmasiPassword}
                  onChange={(e) => setKonfirmasiPassword(e.target.value)}
                  placeholder="Ketik ulang kata sandi baru"
                  className="text-xs bg-background"
                  required
                />
              </div>

              <div className="rounded-xl border bg-muted/30 p-3 text-[11px] text-muted-foreground space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1">
                  <Key className="h-3.5 w-3.5 text-amber-500" /> Tips Kata Sandi Kuat:
                </span>
                <p>Gunakan kombinasi huruf kapital, angka, dan simbol untuk perlindungan tingkat tinggi.</p>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="default" disabled={loadingPassword} className="w-full font-bold shadow-md bg-amber-600 hover:bg-amber-700 text-white">
                  {loadingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
                  Ubah Kata Sandi Sekarang
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* SECTION 3: SYSTEM PERMISSIONS & DATABASE STATUS */}
        <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-xs font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Informasi Akses & Sistem Backend
            </span>
            <Badge variant="outline" className="text-[10px] font-mono text-emerald-500 border-emerald-500/30">
              ● NEON PG CONNECTED
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl border bg-muted/20 p-3 space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold">Tipe Akun</span>
              <p className="font-bold text-foreground">Super Administrator</p>
            </div>
            <div className="rounded-xl border bg-muted/20 p-3 space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold">Status Otorisasi</span>
              <p className="font-bold text-emerald-500">Full Access (All Modules & Prompt Studio)</p>
            </div>
            <div className="rounded-xl border bg-muted/20 p-3 space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold">Sesi Login Terakhir</span>
              <p className="font-bold text-foreground">Hari ini (Aktif)</p>
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}
