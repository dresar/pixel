import { createFileRoute } from "@tanstack/react-router";
import { Upload, Search, Grid3x3, List as ListIcon, Image as ImageIcon } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/admin/gambar")({
  head: () => ({
    meta: [
      { title: "Gambar — Admin BrevetAI" },
      { name: "description", content: "Pustaka gambar, diagram, dan ilustrasi." },
    ],
  }),
  component: AdminGambar,
});

function AdminGambar() {
  return (
    <>
      <PageHeader
        title="Gambar"
        description="Pustaka ilustrasi, diagram, dan media."
        breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Gambar" }]}
        actions={
          <>
            <Button variant="outline" size="icon"><Grid3x3 className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon"><ListIcon className="h-4 w-4" /></Button>
            <Button size="sm"><Upload className="mr-1 h-3.5 w-3.5" /> Unggah</Button>
          </>
        }
      />
      <PageBody>
        <div className="relative mb-5 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari gambar..." className="pl-9" />
        </div>
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          {["Semua","Ilustrasi","Diagram","Flowchart","Infografis"].map((c, i) => (
            <button key={c} className={"rounded-full border px-3 py-1 " + (i === 0 ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent")}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-muted to-transparent">
              <div className="grid aspect-square place-items-center">
                <ImageIcon className="h-6 w-6 text-muted-foreground/60" />
              </div>
              <div className="border-t bg-card p-2">
                <p className="truncate text-[11px] font-medium">ilustrasi-{i + 1}.svg</p>
                <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                  <Badge variant="secondary" className="text-[9px]">Diagram</Badge>
                  <span>240 KB</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageBody>
    </>
  );
}
