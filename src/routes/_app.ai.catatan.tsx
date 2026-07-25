import { createFileRoute } from "@tanstack/react-router";
import { StickyNote, Plus, Pin, Search } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/ai/catatan")({
  head: () => ({
    meta: [
      { title: "Catatan AI — BrevetAI" },
      { name: "description", content: "Catatan yang dihasilkan atau disimpan dari sesi AI." },
    ],
  }),
  component: CatatanAI,
});

const notes = [
  { title: "Ringkasan PPh Pasal 17", body: "Tarif progresif 5–35% dengan lima lapisan penghasilan.", tag: "PPh OP", pinned: true },
  { title: "Rumus PPh terutang", body: "PPh terutang = Σ (tarif × selisih lapisan PKP).", tag: "Rumus", pinned: true },
  { title: "PTKP status K/2", body: "Rp67.500.000 per tahun (UU HPP terbaru).", tag: "PTKP", pinned: false },
  { title: "Kata kunci UU KUP", body: "SPT, NPWP, Pemeriksaan, Keberatan, Banding.", tag: "KUP", pinned: false },
];

function CatatanAI() {
  return (
    <>
      <PageHeader
        title="Catatan AI"
        description="Catatan hasil percakapan dan ringkasan AI."
        breadcrumb={[{ label: "AI", to: "/ai/chat" }, { label: "Catatan" }]}
        actions={<Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Baru</Button>}
      />
      <PageBody>
        <div className="relative mb-5 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari catatan..." className="pl-9" />
        </div>
        <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
          {notes.map((n, i) => (
            <div key={i} className="mb-3 break-inside-avoid rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-primary" />
                  <Badge variant="secondary" className="text-[10px]">{n.tag}</Badge>
                </div>
                {n.pinned && <Pin className="h-3.5 w-3.5 text-warning" />}
              </div>
              <p className="mt-2 text-sm font-semibold">{n.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
            </div>
          ))}
        </div>
      </PageBody>
    </>
  );
}
