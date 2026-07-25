import { createFileRoute } from "@tanstack/react-router";
import { ImageIcon, ZoomIn, Download, X } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/gambar")({
  head: () => ({
    meta: [
      { title: "Gambar — BrevetAI" },
      { name: "description", content: "Galeri ilustrasi dan diagram materi pajak." },
    ],
  }),
  component: Gambar,
});

function Gambar() {
  return (
    <>
      <PageHeader title="Gambar" description="Galeri ilustrasi dan diagram pembelajaran." />
      <PageBody>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-muted to-transparent">
              <div className="grid h-full place-items-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <div className="absolute inset-x-2 bottom-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button size="icon" variant="secondary" className="h-8 w-8"><ZoomIn className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="secondary" className="h-8 w-8"><Download className="h-3.5 w-3.5" /></Button>
              </div>
              <Badge className="absolute left-2 top-2 text-[10px]" variant="secondary">Ilustrasi</Badge>
            </div>
          ))}
        </div>
      </PageBody>
    </>
  );
}
