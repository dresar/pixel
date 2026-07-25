import { createFileRoute } from "@tanstack/react-router";
import { History } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/riwayat")({
  head: () => ({
    meta: [
      { title: "Riwayat — BrevetAI" },
      { name: "description", content: "Riwayat aktivitas belajar, kuis, dan sesi AI." },
    ],
  }),
  component: Riwayat,
});

const days = [
  {
    label: "Hari ini",
    items: [
      { time: "09:12", title: "Membaca Tarif PPh Pasal 17", tag: "Materi" },
      { time: "10:04", title: "Sesi AI: Perhitungan PPh terutang", tag: "AI" },
      { time: "11:20", title: "Menyelesaikan 5 kartu PTKP", tag: "Kartu" },
    ],
  },
  {
    label: "Kemarin",
    items: [
      { time: "19:30", title: "Kuis KUP — skor 90", tag: "Kuis" },
      { time: "20:12", title: "Menambah 3 sorotan", tag: "Sorotan" },
    ],
  },
  {
    label: "24 Jul",
    items: [{ time: "07:45", title: "Meraih pencapaian Rajin Belajar", tag: "Pencapaian" }],
  },
];

function Riwayat() {
  return (
    <>
      <PageHeader title="Riwayat" description="Timeline aktivitas belajarmu." />
      <PageBody className="max-w-3xl">
        <div className="space-y-6">
          {days.map((d) => (
            <section key={d.label}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{d.label}</p>
              <ul className="relative space-y-3 border-l pl-6">
                {d.items.map((it, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[26px] top-1.5 grid h-4 w-4 place-items-center rounded-full border-2 border-primary bg-background">
                      <History className="h-2 w-2 text-primary" />
                    </span>
                    <div className="rounded-xl border bg-card p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] tabular-nums text-muted-foreground">{it.time}</span>
                        <Badge variant="secondary" className="text-[10px]">{it.tag}</Badge>
                      </div>
                      <p className="mt-1 text-sm">{it.title}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </PageBody>
    </>
  );
}
