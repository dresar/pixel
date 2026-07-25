import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/kalender")({
  head: () => ({
    meta: [
      { title: "Kalender — BrevetAI" },
      { name: "description", content: "Jadwal belajar dan kuis dalam tampilan kalender bulanan." },
    ],
  }),
  component: Kalender,
});

function Kalender() {
  const days = Array.from({ length: 35 }, (_, i) => i - 2);
  const events: Record<number, { label: string; kind: string }[]> = {
    5: [{ label: "Kuis KUP", kind: "kuis" }],
    9: [{ label: "PPh OP Bab 2", kind: "materi" }],
    12: [{ label: "Simulasi SPT", kind: "kasus" }],
    18: [{ label: "Kuis PPN", kind: "kuis" }],
    22: [{ label: "Sesi AI", kind: "ai" }],
    27: [{ label: "Review mingguan", kind: "review" }],
  };
  return (
    <>
      <PageHeader
        title="Kalender"
        description="Jadwal belajar dan agenda kuismu."
        actions={
          <>
            <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
            <div className="rounded-md border bg-card px-3 py-1.5 text-sm font-medium">Juli 2026</div>
            <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
            <Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Baru</Button>
          </>
        }
      />
      <PageBody>
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="grid grid-cols-7 border-b bg-muted/30 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {["Sen","Sel","Rab","Kam","Jum","Sab","Min"].map((d) => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((d, i) => {
              const inMonth = d > 0 && d <= 31;
              const ev = events[d] || [];
              return (
                <div key={i} className={"min-h-[92px] border-b border-r p-1.5 text-xs sm:p-2 " + (inMonth ? "" : "bg-muted/20 text-muted-foreground")}>
                  <div className="text-right">{inMonth ? d : ""}</div>
                  <div className="mt-1 space-y-1">
                    {ev.map((e, j) => (
                      <div key={j} className="truncate rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        {e.label}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-[10px]">Kuis</Badge>
          <Badge variant="secondary" className="text-[10px]">Materi</Badge>
          <Badge variant="secondary" className="text-[10px]">Studi kasus</Badge>
          <Badge variant="secondary" className="text-[10px]">Sesi AI</Badge>
        </div>
      </PageBody>
    </>
  );
}
