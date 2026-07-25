import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { recentLessons } from "@/lib/dummy";

export const Route = createFileRoute("/_app/admin/materi")({
  head: () => ({
    meta: [
      { title: "Materi — Admin BrevetAI" },
      { name: "description", content: "Kelola materi, bab, dan section." },
    ],
  }),
  component: AdminMateri,
});

function AdminMateri() {
  return (
    <>
      <PageHeader
        title="Materi"
        description="Kelola seluruh materi, bab, dan section."
        breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Materi" }]}
        actions={<Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Baru</Button>}
      />
      <PageBody>
        <div className="relative mb-4 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari materi..." className="pl-9" />
        </div>
        <div className="grid gap-3">
          {[...recentLessons, ...recentLessons].map((l, i) => (
            <div key={i} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border bg-card p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{l.module}</Badge>
                  <Badge variant="secondary" className="text-[10px]">Terbit</Badge>
                  <span className="text-[11px] text-muted-foreground">v1.2 · {l.duration}</span>
                </div>
                <p className="mt-1 truncate text-sm font-medium">{l.title}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost">Ubah</Button>
                <Button size="sm" variant="ghost">Pratinjau</Button>
                <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      </PageBody>
    </>
  );
}
