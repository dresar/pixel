import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Lock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/masuk")({
  head: () => ({
    meta: [
      { title: "Masuk — BrevetAI" },
      { name: "description", content: "Masuk ke akun BrevetAI untuk melanjutkan belajar Brevet Pajak A & B." },
    ],
  }),
  component: MasukPage,
});

function MasukPage() {
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
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="nama@email.com" className="pl-9" />
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
            <Input id="password" type="password" placeholder="Masukkan kata sandi" className="pl-9 pr-9" />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Tampilkan kata sandi"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox /> Ingat saya di perangkat ini
        </label>
        <Button asChild className="w-full" size="lg">
          <Link to="/beranda">Masuk</Link>
        </Button>
        <div className="relative py-2">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            atau
          </span>
        </div>
        <Button variant="outline" className="w-full" size="lg" type="button">
          Masuk dengan Google
        </Button>
      </form>
    </AuthLayout>
  );
}
