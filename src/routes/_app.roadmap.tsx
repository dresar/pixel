import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, CheckCircle2, Star } from "lucide-react";
import { PageHeader, PageBody } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getRoadmap } from "@/functions/modules";
import { modules as dummyModules } from "@/lib/dummy";

export const Route = createFileRoute("/_app/roadmap")({
  loader: async () => {
    try {
      const res = await getRoadmap();
      return { roadmaps: res.success ? res.data : [] };
    } catch {
      return { roadmaps: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Roadmap belajar — BrevetAI" },
      { name: "description", content: "Peta belajar Brevet Pajak A & B dengan progres, modul terkunci, dan pencapaian." },
    ],
  }),
  component: Roadmap,
});

function Roadmap() {
  const { roadmaps } = Route.useLoaderData();

  return (
    <>
      <PageHeader
        title="Roadmap belajar"
        description="Peta perjalanan belajar Brevet Pajak A & B — selesaikan modul untuk membuka level berikutnya."
        breadcrumb={[{ label: "Beranda", to: "/beranda" }, { label: "Roadmap" }]}
      />
      <PageBody>
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Modul selesai</p>
            <p className="mt-1 text-2xl font-semibold">2 / 6</p>
            <Progress value={33} className="mt-3 h-1.5" />
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">XP terkumpul</p>
            <p className="mt-1 text-2xl font-semibold">4.820 XP</p>
            <p className="mt-1 text-xs text-muted-foreground">Level 12 · 180 XP menuju Level 13</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Estimasi selesai</p>
            <p className="mt-1 text-2xl font-semibold">± 42 jam</p>
            <p className="mt-1 text-xs text-muted-foreground">Sekitar 6 minggu lagi</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-4 bottom-4 w-px bg-border sm:left-8" />
          <ol className="space-y-4">
            {dummyModules.map((m, i) => {
              const locked = m.status === "Terkunci";
              const done = m.progress === 100;
              return (
                <li key={m.id} className="relative pl-14 sm:pl-20">
                  <div
                    className={
                      "absolute left-2 top-4 grid h-9 w-9 place-items-center rounded-full border-2 sm:left-3 sm:h-11 sm:w-11 " +
                      (locked
                        ? "border-border bg-muted text-muted-foreground"
                        : done
                          ? "border-success bg-success/10 text-success"
                          : "border-primary bg-primary/10 text-primary")
                    }
                  >
                    {locked ? <Lock className="h-4 w-4" /> : done ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                  </div>
                  <div className={"rounded-2xl border bg-card p-4 sm:p-5 " + (locked ? "opacity-60" : "")}>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{m.code}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{m.difficulty}</Badge>
                      <span className="text-[11px] text-muted-foreground">{m.lessons} materi · {m.duration}</span>
                      {!locked && (
                        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-warning">
                          <Star className="h-3 w-3 fill-current" /> +{200 + i * 50} XP
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-base font-semibold">{m.title}</h3>
                    <div className="mt-3 flex items-center gap-3">
                      <Progress value={m.progress} className="h-1.5 flex-1" />
                      <span className="w-10 text-right text-xs text-muted-foreground">{m.progress}%</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      {locked ? (
                        <span className="text-xs text-muted-foreground">Selesaikan modul sebelumnya</span>
                      ) : (
                        <Button asChild size="sm">
                          <Link to="/belajar/materi">{done ? "Ulangi Modul" : "Lanjutkan"}</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </PageBody>
    </>
  );
}
