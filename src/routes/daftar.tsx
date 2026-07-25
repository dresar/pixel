import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { signUp } from "@/lib/auth-client";

export const Route = createFileRoute("/daftar")({
  head: () => ({
    meta: [
      { title: "Daftar — BrevetAI" },
      { name: "description", content: "Buat akun BrevetAI dan mulai belajar Brevet Pajak A & B secara gratis." },
    ],
  }),
  component: DaftarPage,
});

function DaftarPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setuju, setSetuju] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Semua bidang wajib diisi.");
      return;
    }
    if (!setuju) {
      setError("Anda harus menyetujui Syarat dan Kebijakan Privasi.");
      return;
    }
    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Gagal membuat akun. Silakan coba lagi.");
      } else {
        navigate({ to: "/beranda" });
      }
    } catch {
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Buat akun baru"
      subtitle="Gratis untuk 14 hari pertama, tanpa kartu kredit"
      footer={
        <span>
          Sudah punya akun?{" "}
          <Link to="/masuk" className="font-medium text-primary hover:underline">
            Masuk
          </Link>
        </span>
      }
    >
      <form className="space-y-4" onSubmit={handleDaftar}>
        {error && (
          <div className="rounded-lg bg-destructive/15 p-3 text-xs text-destructive font-medium border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="name">Nama lengkap</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              placeholder="Nama lengkap"
              className="pl-9"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

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
          <Label htmlFor="password">Kata sandi</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Minimal 8 karakter"
              className="pl-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
          <Checkbox
            className="mt-0.5"
            checked={setuju}
            onCheckedChange={(checked) => setSetuju(Boolean(checked))}
          />{" "}
          Saya setuju dengan syarat dan kebijakan privasi BrevetAI.
        </label>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
            </>
          ) : (
            "Daftar"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
