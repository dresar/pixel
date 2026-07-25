import { createFileRoute, Link } from "@tanstack/react-router";
import { ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/error-server")({
  head: () => ({
    meta: [
      { title: "Terjadi kesalahan — BrevetAI" },
      { name: "description", content: "Halaman kesalahan server 500." },
    ],
  }),
  component: ErrorServer,
});

function ErrorServer() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bp-dots opacity-40" />
      <div className="relative max-w-md text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <ServerCrash className="h-6 w-6" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-destructive">Kesalahan 500</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Terjadi kesalahan pada server</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Kami sudah diberitahu dan sedang memperbaikinya. Coba muat ulang halaman.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => location.reload()}>Coba lagi</Button>
          <Button asChild variant="outline">
            <Link to="/">Beranda</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
