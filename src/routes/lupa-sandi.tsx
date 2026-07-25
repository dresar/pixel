import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/lupa-sandi")({
  head: () => ({
    meta: [
      { title: "Lupa sandi — BrevetAI" },
      { name: "description", content: "Reset kata sandi akun BrevetAI kamu." },
    ],
  }),
  component: LupaSandi,
});

function LupaSandi() {
  return (
    <AuthLayout
      title="Lupa kata sandi"
      subtitle="Kirim tautan reset ke emailmu"
      footer={
        <Link to="/masuk" className="font-medium text-primary hover:underline">
          Kembali ke masuk
        </Link>
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
        <Button asChild className="w-full" size="lg">
          <Link to="/reset-sandi">Kirim tautan</Link>
        </Button>
      </form>
    </AuthLayout>
  );
}
