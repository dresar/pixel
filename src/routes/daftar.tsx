import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthLayout } from "@/components/auth/AuthLayout";

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
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama lengkap</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="name" placeholder="Nama lengkap" className="pl-9" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="nama@email.com" className="pl-9" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Kata sandi</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type="password" placeholder="Minimal 8 karakter" className="pl-9" />
          </div>
        </div>
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <Checkbox className="mt-0.5" /> Saya setuju dengan syarat dan kebijakan privasi BrevetAI.
        </label>
        <Button asChild className="w-full" size="lg">
          <Link to="/verifikasi-email">Daftar</Link>
        </Button>
      </form>
    </AuthLayout>
  );
}
