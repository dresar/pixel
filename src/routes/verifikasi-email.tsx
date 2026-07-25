import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/verifikasi-email")({
  head: () => ({
    meta: [
      { title: "Verifikasi email — BrevetAI" },
      { name: "description", content: "Verifikasi email untuk mengaktifkan akun BrevetAI." },
    ],
  }),
  component: Verifikasi,
});

function Verifikasi() {
  return (
    <AuthLayout
      title="Verifikasi email"
      subtitle="Kami mengirim tautan aktivasi ke emailmu"
      footer={
        <span>
          Salah alamat?{" "}
          <Link to="/daftar" className="font-medium text-primary hover:underline">
            Daftar ulang
          </Link>
        </span>
      }
    >
      <div className="flex flex-col items-center py-2 text-center">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Mail className="h-6 w-6" />
        </div>
        <p className="text-sm text-muted-foreground">
          Cek kotak masuk emailmu dan klik tautan verifikasi untuk mengaktifkan akun.
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-success">
          <CheckCircle2 className="h-3.5 w-3.5" /> Email terkirim ke rangga.prasetyo@email.com
        </div>
        <div className="mt-6 flex w-full gap-2">
          <Button variant="outline" className="flex-1">
            Kirim ulang
          </Button>
          <Button asChild className="flex-1">
            <Link to="/beranda">Lanjut</Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
