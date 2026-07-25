import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldAlert, Sparkles, UserCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { AuthLayout } from "@/components/auth/AuthLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { signIn } from "@/lib/auth-client";

export const Route = createFileRoute("/masuk")({
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
    desc: "Akses penuh sistem, manajemen API key Gemini, & audit log.",
  },
  {
    role: "ADMIN",
    title: "Admin Konten",
    email: "admin@brevetai.id",
    pass: "Password123!",
    badge: "bg-amber-500/15 text-amber-600 border-amber-500/20",
    icon: Sparkles,
    desc: "Manajemen modul, materi, & kelola bank kuis.",
  },
  {
    role: "STUDENT",
    title: "Siswa Brevet",
    email: "student@brevetai.id",
    pass: "Password123!",
    badge: "bg-primary/15 text-primary border-primary/20",
    icon: UserCheck,
    desc: "Akses fitur belajar, Tanya AI, kuis, & flashcards.",
  },
];

function MasukPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ingatSaya, setIngatSaya] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleMasuk = async (e: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();

    const loginEmail = customEmail ?? email;
    const loginPass = customPass ?? password;

    if (!loginEmail || !loginPass) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signIn.email({
        email: loginEmail,
        password: loginPass,
        rememberMe: ingatSaya,
      });

      if (result.error) {
        setError(result.error.message || "Gagal masuk. Periksa email dan kata sandi Anda.");
      } else {
        setDialogOpen(false);
        if (loginEmail.toLowerCase().includes("admin")) {
          navigate({ to: "/admin" });
        } else {
          navigate({ to: "/beranda" });
        }
      }
    } catch {
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDevAccount = (acc: (typeof devAccountsList)[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    handleMasuk(null as any, acc.email, acc.pass);
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

        {/* Tombol Login Dev Modal */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full border-dashed border-primary/40 bg-primary/5 text-primary hover:bg-primary/10" size="lg" type="button">
              <Sparkles className="mr-2 h-4 w-4 text-primary" /> ⚡ Login Dev / Akun Uji Coba
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-5 w-5 text-primary" /> Pilih Akun Uji Coba (Dev Login)
              </DialogTitle>
              <DialogDescription className="text-xs">
                Klik salah satu akun di bawah untuk langsung login 1-klik sebagai peran tertentu.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              {devAccountsList.map((acc) => {
                const IconComponent = acc.icon;
                return (
                  <div
                    key={acc.role}
                    onClick={() => handleSelectDevAccount(acc)}
                    className="group flex cursor-pointer items-start justify-between rounded-xl border p-3.5 transition-all hover:border-primary hover:bg-accent/40"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{acc.title}</span>
                          <Badge variant="outline" className={`text-[10px] ${acc.badge}`}>
                            {acc.role}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs font-mono text-muted-foreground">{acc.email}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{acc.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </form>
    </AuthLayout>
  );
}
