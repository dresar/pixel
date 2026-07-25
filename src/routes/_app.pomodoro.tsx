import { createFileRoute } from "@tanstack/react-router";
import { Play, Pause, RotateCcw, Coffee, Timer } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/pomodoro")({
  head: () => ({
    meta: [
      { title: "Pomodoro — BrevetAI" },
      { name: "description", content: "Fokus belajar dengan sesi pomodoro 25 menit." },
    ],
  }),
  component: Pomodoro,
});

function Pomodoro() {
  return (
    <>
      <PageHeader title="Pomodoro" description="Fokus belajar 25 menit dan istirahat 5 menit." />
      <PageBody className="max-w-xl">
        <div className="rounded-3xl border bg-gradient-to-br from-primary/10 via-card to-card p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Timer className="h-6 w-6" />
          </div>
          <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Fokus</p>
          <p className="mt-2 text-6xl font-semibold tabular-nums tracking-tight">18:42</p>
          <Progress value={30} className="mx-auto mt-6 h-2 max-w-xs" />
          <div className="mt-6 flex justify-center gap-2">
            <Button size="lg"><Play className="mr-1 h-4 w-4" /> Mulai</Button>
            <Button size="lg" variant="outline"><Pause className="mr-1 h-4 w-4" /> Jeda</Button>
            <Button size="lg" variant="ghost"><RotateCcw className="mr-1 h-4 w-4" /> Ulang</Button>
          </div>
          <div className="mt-6 flex justify-center gap-2 text-xs">
            <span className="rounded-full border bg-card px-3 py-1">Fokus 25m</span>
            <span className="rounded-full border bg-card px-3 py-1">Istirahat 5m</span>
            <span className="rounded-full border bg-card px-3 py-1">Panjang 15m</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
          {["#1","#2","#3","#4"].map((s, i) => (
            <div key={s} className={"rounded-lg border p-3 " + (i < 2 ? "bg-primary/10 text-primary" : "bg-card text-muted-foreground")}>
              <Coffee className="mx-auto h-4 w-4" />
              <p className="mt-1">{s}</p>
            </div>
          ))}
        </div>
      </PageBody>
    </>
  );
}
