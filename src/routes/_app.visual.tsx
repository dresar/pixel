import { createFileRoute } from "@tanstack/react-router";
import { GitBranch, Layers, PieChart, Workflow } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/visual")({
  head: () => ({
    meta: [
      { title: "Visual belajar — BrevetAI" },
      { name: "description", content: "Diagram, timeline, dan infografis untuk memahami konsep pajak." },
    ],
  }),
  component: Visual,
});

const items = [
  { icon: GitBranch, title: "Diagram alur SPT Tahunan", tag: "Flow" },
  { icon: Workflow, title: "Proses keberatan & banding", tag: "Proses" },
  { icon: Layers, title: "Lapisan tarif PPh Pasal 17", tag: "Tabel" },
  { icon: PieChart, title: "Komposisi penerimaan pajak 2025", tag: "Grafik" },
];

function Visual() {
  return (
    <>
      <PageHeader title="Visual belajar" description="Belajar konsep pajak lewat diagram dan visualisasi." />
      <PageBody>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <div key={i.title} className="group overflow-hidden rounded-2xl border bg-card">
              <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary/15 to-transparent">
                <i.icon className="h-10 w-10 text-primary/70" />
              </div>
              <div className="p-4">
                <Badge variant="secondary" className="text-[10px]">{i.tag}</Badge>
                <p className="mt-2 text-sm font-semibold">{i.title}</p>
              </div>
            </div>
          ))}
        </div>
      </PageBody>
    </>
  );
}
