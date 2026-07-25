import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/perawatan")({
  head: () => ({
    meta: [
      { title: "Sedang dalam pemeliharaan — BrevetAI" },
      { name: "description", content: "Kami sedang meningkatkan platform. Silakan kembali sebentar lagi." },
    ],
  }),
  component: Perawatan,
});

function Perawatan() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bp-dots opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bp-glow" />
      <div className="relative max-w-md text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Wrench className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Sedang dalam pemeliharaan</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Kami sedang meningkatkan BrevetAI agar semakin baik. Silakan kembali sebentar lagi.
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> Estimasi selesai dalam ± 30 menit
        </p>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link to="/">Kembali ke beranda</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
