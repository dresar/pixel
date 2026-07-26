import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Lock, CheckCircle2, Star, BookOpen, Layers, Clock, Award, ArrowRight, ArrowLeft } from "lucide-react";
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
      { title: "Roadmap Belajar Brevet — BrevetAI" },
      { name: "description", content: "Peta perjalanan belajar Brevet Pajak A & B terstruktur dan resmi." },
    ],
  }),
  component: RoadmapLayout,
});

function RoadmapLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // If subroute (like /roadmap/materi/$slug) is active, render Outlet!
  if (pathname !== "/roadmap" && pathname !== "/roadmap/") {
    return <Outlet />;
  }

  return <RoadmapTimeline />;
}

function RoadmapTimeline() {
  const { modules, stats } = Route.useLoaderData();

  const totalJam = Math.round((stats.totalEstimasiMenit || 120) / 60);

  return (
    <>
      <PageHeader
        title="Roadmap Belajar"
        description="Kurikulum Brevet Pajak A/B Terstruktur"
        actions={
          <Button asChild variant="outline" size="sm" className="rounded-xl font-bold text-xs gap-1.5 border-border hover:bg-accent shrink-0 shadow-2xs">
            <Link to="/beranda">
              <ArrowLeft className="h-4 w-4 text-primary" /> Kembali ke Beranda
            </Link>
          </Button>
        }
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

          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-xs hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Estimasi Durasi Belajar</span>
              <div className="h-8 w-8 grid place-items-center rounded-xl bg-blue-500/10 text-blue-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-foreground tracking-tight">± {totalJam || 1} <span className="text-sm font-normal text-muted-foreground">Jam</span></p>
            <p className="text-xs text-muted-foreground font-mono">Total {stats.totalModul} Modul Pembelajaran Aktif</p>
          </div>
        </div>

        {/* Vertical Timeline Stepper Kurikulum Brevet */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Alur Perjalanan Kurikulum Brevet A/B
            </h2>
            <Badge variant="outline" className="font-mono text-xs px-3 py-1 rounded-full border-primary/30 text-primary">
              Kurikulum Resmi 2026
            </Badge>
          </div>

          <div className="relative border-l-2 border-primary/20 ml-4 pl-6 sm:pl-8 space-y-8">
            {modules.map((mod: any, index: number) => {
              const isFirst = index === 0;
              const slug = mod.slug || (mod.title ? mod.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") : mod.id);

              return (
                <div key={mod.id || index} className="relative group">
                  {/* Stepper Dot Circle Indicator */}
                  <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-background border-2 border-primary text-primary font-bold text-xs shadow-xs group-hover:scale-110 transition-transform">
                    {isFirst ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <span className="font-mono text-[11px]">{index + 1}</span>
                    )}
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-2xs hover:border-primary/50 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-full text-xs font-mono font-bold border-primary/40 text-primary bg-primary/10 px-3 py-1">
                          {mod.code || `MODUL-${index + 1}`}
                        </Badge>
                        <Badge variant="secondary" className="rounded-full text-xs font-bold px-3 py-1">
                          {mod.difficulty || "DASAR"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" /> {mod.duration || "45 menit"}</span>
                        <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-amber-500" /> +{mod.xpReward || 200} XP</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-foreground group-hover:text-primary transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-border/50">
                      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span>{mod.totalLessons || 14} Materi Pelajaran</span>
                      </div>

                      <Button asChild size="sm" className="rounded-xl font-bold text-xs h-9 px-5 shadow-xs">
                        <Link to="/roadmap/materi/$slug" params={{ slug }}>
                          {isFirst ? "Ulangi Pelajaran Modul" : "Mulai Belajar Modul"} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PageBody>
    </>
  );
}
