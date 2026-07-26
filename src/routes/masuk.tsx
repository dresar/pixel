import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldAlert, Sparkles, UserCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { signIn } from "@/lib/auth-client";

export const Route = createFileRoute("/masuk")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Masuk — BrevetAI" },
      { name: "description", content: "Masuk ke akun BrevetAI untuk melanjutkan belajar Brevet Pajak A & B." },
    ],
  }),
  component: MasukPage,
});

const devAccountsList = [
  {
    role: "SUPER_ADMIN",
    title: "Super Admin",
    email: "superadmin@brevetai.id",
    pass: "Password123!",
    badge: "bg-destructive/15 text-destructive border-destructive/20",
    icon: ShieldAlert,
    desc: "Akses penuh sistem, API Key & audit log",
  },
  {
    role: "ADMIN",
    title: "Admin Konten",
    email: "admin@brevetai.id",
    pass: "Password123!",
    badge: "bg-amber-500/15 text-amber-600 border-amber-500/20",
    icon: Sparkles,
    desc: "Kelola modul, materi & kuis",
  },
  {
    role: "STUDENT",
    title: "Siswa Brevet",
    email: "student@brevetai.id",
    pass: "Password123!",
    badge: "bg-primary/15 text-primary border-primary/20",
    icon: UserCheck,
    desc: "Belajar, Tanya AI, kuis & flashcards",
  },
];

function MasukPage() {
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ingatSaya, setIngatSaya] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMasuk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email || !password) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signIn.email({
        email,
        password,
        rememberMe: ingatSaya,
      });

      if (result?.error) {
        setError(result.error.message || "Gagal masuk. Periksa email dan kata sandi Anda.");
        setLoading(false);
        return;
      }

      // Login sukses — tentukan rute tujuan (utamakan parameter query search redirect jika ada)
      const defaultTarget = email.toLowerCase().includes("admin") ? "/admin/dashboard" : "/beranda";
      const targetPath = search.redirect || defaultTarget;
      window.location.href = targetPath;
    } catch (err: any) {
      console.error("Gagal login:", err);
      setError(err?.message || "Terjadi kesalahan koneksi. Silakan coba lagi.");
      setLoading(false);
    }
  };

  const handleSelectDevAccount = (acc: (typeof devAccountsList)[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError(null);
  };

  return (
    <AuthLayout
      title="Masuk ke akun"
      subtitle="Lanjutkan belajar Brevet Pajak-mu"
      footer={
        <span>
          Belum punya akun?{" "}
          <Link to="/daftar" className="font-medium text-primary hover:underline">
            Daftar
          </Link>
        </span>
      }
    >
      <form className="space-y-4" onSubmit={handleMasuk}>
        {error && (
          <div className="rounded-lg bg-destructive/15 p-3 text-xs text-destructive font-medium border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Kata sandi</Label>
            <Link to="/lupa-sandi" className="text-xs font-medium text-primary hover:underline">
              Lupa sandi?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan kata sandi"
              className="pl-9 pr-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              aria-label="Tampilkan kata sandi"
            >
              {showPassword ? <EyeOff className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <Checkbox
            checked={ingatSaya}
            onCheckedChange={(checked) => setIngatSaya(Boolean(checked))}
          />{" "}
          Ingat saya di perangkat ini
        </label>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
            </>
          ) : (
            "Masuk"
          )}
        </Button>

        {/* Section Login Dev In-Page (Tanpa Modal) */}
        <div className="pt-3 border-t border-border/60">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Akun Uji Coba (Dev Quick Fill)
            </span>
            <span className="text-[10px] text-muted-foreground">Klik untuk isi form</span>
          </div>

          <div className="grid gap-2">
            {devAccountsList.map((acc) => {
              const IconComponent = acc.icon;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleSelectDevAccount(acc)}
                  disabled={loading}
                  className="group flex items-center justify-between rounded-lg border border-border/80 p-2.5 text-left transition-all hover:border-primary/60 hover:bg-primary/5 active:scale-[0.99] disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <IconComponent className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold truncate">{acc.title}</span>
                        <Badge variant="outline" className={`text-[9px] px-1 py-0 ${acc.badge}`}>
                          {acc.role}
                        </Badge>
                      </div>
                      <p className="text-[11px] font-mono text-muted-foreground truncate">{acc.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                    Isi Form ✎
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
