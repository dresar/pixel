import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/reset-sandi")({
  head: () => ({
    meta: [
      { title: "Atur sandi baru — BrevetAI" },
      { name: "description", content: "Buat kata sandi baru untuk akun BrevetAI kamu." },
    ],
  }),
  component: ResetSandi,
});

function ResetSandi() {
  return (
    <AuthLayout title="Atur kata sandi baru" subtitle="Gunakan minimal 8 karakter">
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1.5">
          <Label htmlFor="p1">Kata sandi baru</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="p1" type="password" className="pl-9" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p2">Ulangi kata sandi</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="p2" type="password" className="pl-9" />
          </div>
        </div>
        <Button asChild className="w-full" size="lg">
          <Link to="/masuk">Simpan</Link>
        </Button>
      </form>
    </AuthLayout>
  );
}
