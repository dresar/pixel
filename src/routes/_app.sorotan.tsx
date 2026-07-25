import { createFileRoute } from "@tanstack/react-router";
import { Highlighter, StickyNote } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/sorotan")({
  head: () => ({
    meta: [
      { title: "Sorotan — BrevetAI" },
      { name: "description", content: "Kalimat penting yang kamu sorot dari materi belajar." },
    ],
  }),
  component: Sorotan,
});

const items = [
  { color: "bg-warning/40", quote: "Tarif PPh Pasal 17 bersifat progresif berlapis, bukan flat.", src: "PPh OP · Tarif & Perhitungan" },
  { color: "bg-primary/40", quote: "PTKP dikurangkan sebelum tarif Pasal 17 diterapkan.", src: "PPh OP · PTKP" },
  { color: "bg-success/40", quote: "SPT Tahunan OP dilaporkan paling lambat 31 Maret tahun berikutnya.", src: "KUP · SPT" },
  { color: "bg-warning/40", quote: "Ekspor jasa dikenai PPN dengan tarif 0%.", src: "PPN · Objek" },
];

function Sorotan() {
  return (
    <>
      <PageHeader title="Sorotan" description="Kutipan penting dari materi belajarmu." />
      <PageBody className="max-w-3xl">
        <ul className="space-y-3">
          {items.map((s, i) => (
            <li key={i} className="rounded-xl border bg-card p-4">
              <div className="flex items-start gap-3">
                <Highlighter className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed">
                    <span className={"rounded px-1 py-0.5 " + s.color}>{s.quote}</span>
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{s.src}</Badge>
                    <button className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
                      <StickyNote className="h-3 w-3" /> Tambah catatan
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </PageBody>
    </>
  );
}
