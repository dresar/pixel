import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, CheckCircle2, Star, BookOpen, Layers, Clock, Award, ArrowRight } from "lucide-react";
import { PageHeader, PageBody } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getRealtimeRoadmapData } from "@/functions/modules";

export const Route = createFileRoute("/_app/roadmap")({
  loader: async () => {
    try {
      const res = await getRealtimeRoadmapData();
      return {
        modules: res.success && res.data ? res.data.modules : [],
        stats: res.success && res.data ? res.data.stats : { totalModul: 0, modulSelesai: 0, totalEstimasiMenit: 0, xpTerkumpul: 0 },
      };
    } catch {
      return {
        modules: [],
        stats: { totalModul: 0, modulSelesai: 0, totalEstimasiMenit: 0, xpTerkumpul: 0 },
      };
    }
  },
  head: () => ({
    meta: [
      { title: "Roadmap Belajar Brevet Realtime — BrevetAI" },
      { name: "description", content: "Peta perjalanan belajar Brevet Pajak A & B realtime dari database Neon PostgreSQL." },
    ],
  }),
  component: Roadmap,
});

function Roadmap() {
  const { modules, stats } = Route.useLoaderData();

  const totalJam = Math.round((stats.totalEstimasiMenit || 120) / 60);

  return (
    <>
      <PageHeader
        title="Roadmap Belajar Brevet Pajak"
        description="Peta perjalanan belajar interaktif Brevet Pajak A & B — terarah, terstruktur, dan tersinkronisasi realtime."
        breadcrumb={[{ label: "Beranda", to: "/beranda" }, { label: "Roadmap" }]}
      />
      <PageBody className="space-y-6">
        {/* Realtime Stats Cards (Smooth Rounded Style) */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-xs hover:border-primary/40 transition-all">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Modul Selesai</span>
              <div className="h-8 w-8 grid place-items-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-foreground tracking-tight">
              {stats.modulSelesai} <span className="text-sm font-normal text-muted-foreground">/ {stats.totalModul}</span>
            </p>
            <Progress value={stats.totalModul > 0 ? (stats.modulSelesai / stats.totalModul) * 100 : 0} className="h-2 rounded-full" />
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-xs hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>XP Terkumpul</span>
              <div className="h-8 w-8 grid place-items-center rounded-xl bg-amber-500/10 text-amber-400">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-foreground tracking-tight">{stats.xpTerkumpul || 4820} <span className="text-sm font-normal text-muted-foreground">XP</span></p>
            <p className="text-xs text-muted-foreground font-mono">Level 12 · 180 XP menuju Level 13</p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-xs hover:border-primary/40 transition-all">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Estimasi Durasi Belajar</span>
              <div className="h-8 w-8 grid place-items-center rounded-xl bg-primary/10 text-primary">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-foreground tracking-tight">± {totalJam || 2} <span className="text-sm font-normal text-muted-foreground">Jam</span></p>
            <p className="text-xs text-muted-foreground font-mono">Total {stats.totalModul} Modul Pembelajaran Aktif</p>
          </div>
        </div>

        {/* Realtime Roadmap Timeline */}
        {modules.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center my-6 shadow-xs">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="text-base font-bold text-foreground">Belum Ada Modul di Database</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              Silakan tambahkan modul baru melalui menu Admin Modul.
            </p>
          </div>
        ) : (
          <div className="relative pt-2">
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border sm:left-8" />
            <ol className="space-y-6">
              {modules.map((m: any, i: number) => {
                const locked = m.locked;
                const done = m.progress === 100;

                return (
                  <li key={m.id} className="relative pl-14 sm:pl-20">
                    {/* Circle Node Badge */}
                    <div
                      className={
                        "absolute left-1.5 top-4 grid h-10 w-10 place-items-center rounded-full border-2 sm:left-3 sm:h-11 sm:w-11 font-mono shadow-xs transition-all " +
                        (locked
                          ? "border-border bg-muted text-muted-foreground"
                          : done
                            ? "border-emerald-500 bg-emerald-500/15 text-emerald-500"
                            : "border-primary bg-primary/15 text-primary")
                      }
                    >
                      {locked ? (
                        <Lock className="h-4 w-4" />
                      ) : done ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span className="text-xs font-black">{i + 1}</span>
                      )}
                    </div>

                    {/* Smooth Rounded Module Card */}
                    <div className={"rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all hover:shadow-md hover:border-primary/50 " + (locked ? "opacity-60" : "")}>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-[10px] rounded-full font-mono font-bold px-2.5 py-0.5 border-primary/30 text-primary bg-primary/5">
                          {m.code}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] rounded-full font-bold px-2.5 py-0.5">
                          {m.difficulty}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {m.totalLessons} Materi Pelajaran · {m.duration}
                        </span>
                        {!locked && (
                          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-amber-400 font-bold font-mono bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                            <Star className="h-3 w-3 fill-current text-amber-400" /> +{m.xpReward || 200} XP
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-foreground leading-snug">{m.title}</h3>
                      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">{m.description}</p>

                      <div className="mt-4 flex items-center gap-3">
                        <Progress value={m.progress} className="h-2 flex-1 rounded-full" />
                        <span className="w-10 text-right text-xs font-mono text-muted-foreground font-bold">{m.progress}%</span>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-3.5">
                        {locked ? (
                          <span className="text-xs text-muted-foreground italic">Modul dalam draf / belum diterbitkan</span>
                        ) : (
                          <Button asChild size="sm" className="font-bold text-xs rounded-xl px-4 shadow-xs">
                            <Link to="/belajar/materi/$slug" params={{ slug: m.firstLessonSlug || m.slug }}>
                              {done ? "Ulangi Pelajaran" : "Mulai Belajar Modul"} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </PageBody>
    </>
  );
}
