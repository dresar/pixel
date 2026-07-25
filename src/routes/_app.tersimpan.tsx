import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Search, Play, Folder } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { recentLessons } from "@/lib/dummy";

export const Route = createFileRoute("/_app/tersimpan")({
  head: () => ({
    meta: [
      { title: "Tersimpan — BrevetAI" },
      { name: "description", content: "Materi, kartu, dan kuis yang kamu simpan untuk dibaca kembali." },
    ],
  }),
  component: Tersimpan,
});

function Tersimpan() {
  return (
    <>
      <PageHeader title="Tersimpan" description="Materi dan konten yang kamu simpan." />
      <PageBody className="max-w-5xl">
        <div className="mb-5 grid gap-2 sm:flex sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari tersimpan..." className="pl-9" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {["Semua","Materi","Kartu","Kuis","Catatan"].map((f, i) => (
              <button key={f} className={"shrink-0 rounded-full border px-3 py-1.5 text-xs " + (i === 0 ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent")}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {recentLessons.concat(recentLessons).map((l, i) => (
            <Link key={i} to="/belajar/materi" className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border bg-card p-4 hover:bg-accent/40">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{l.module}</Badge>
                  <span className="text-[11px] text-muted-foreground">{l.duration}</span>
                </div>
                <p className="mt-1 truncate text-sm font-medium">{l.title}</p>
                <div className="mt-2 flex items-center gap-3">
                  <Progress value={l.progress} className="h-1.5 flex-1" />
                  <span className="text-[11px] text-muted-foreground">{l.progress}%</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" aria-label="Simpan"><Bookmark className="h-4 w-4 fill-current text-primary" /></Button>
                <Button size="icon" variant="ghost" aria-label="Buka"><Play className="h-4 w-4" /></Button>
              </div>
            </Link>
          ))}
        </div>
      </PageBody>
    </>
  );
}
