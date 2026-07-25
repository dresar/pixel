import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Flame,
  ArrowRight,
  Play,
  Trophy,
  Clock,
  BookOpen,
  ChevronRight,
  Zap,
} from "lucide-react";
import { PageBody } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { currentUser, modules, recentLessons, achievements, leaderboard } from "@/lib/dummy";

export const Route = createFileRoute("/_app/beranda")({
  head: () => ({
    meta: [
      { title: "Beranda — BrevetAI" },
      { name: "description", content: "Ringkasan progres belajar, materi terakhir, dan rekomendasi AI." },
    ],
  }),
  component: Beranda,
});

function StatCard({ label, value, hint, icon: Icon }: any) {
  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Beranda() {
  const hour = new Date().getHours();
  const greet = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 19 ? "Selamat sore" : "Selamat malam";

  return (
    <PageBody className="space-y-6">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{greet},</p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{currentUser.name} 👋</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Lanjutkan modul <span className="font-medium text-foreground">PPh Orang Pribadi</span> — 6 menit lagi
              selesai.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button asChild size="sm">
                <Link to="/belajar/materi">Lanjut</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/ai/chat">
                  <Sparkles className="mr-1 h-3.5 w-3.5" /> Tanya AI
                </Link>
              </Button>
            </div>
          </div>
          <div className="shrink-0 rounded-xl border bg-card px-3 py-2 text-right">
            <p className="text-[10px] text-muted-foreground">Streak</p>
            <p className="flex items-center justify-end gap-1 text-lg font-semibold">
              <Flame className="h-4 w-4 text-warning" /> {currentUser.streak}
            </p>
            <p className="text-[10px] text-muted-foreground">hari</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="XP total" value={currentUser.xp.toLocaleString("id-ID")} hint={`Level ${currentUser.level}`} icon={Zap} />
        <StatCard label="Materi tuntas" value="24" hint="dari 73 materi" icon={BookOpen} />
        <StatCard label="Kuis lulus" value="18" hint="rata-rata skor 82" icon={Trophy} />
        <StatCard label="Jam belajar" value="42j" hint="minggu ini 5j" icon={Clock} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Continue learning */}
        <section className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Lanjut belajar</h2>
            <Link to="/belajar" className="text-xs font-medium text-primary hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="space-y-3">
            {recentLessons.map((l) => (
              <Link
                key={l.id}
                to="/belajar/materi"
                className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/40"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{l.module}</Badge>
                    <span className="text-[11px] text-muted-foreground">{l.duration}</span>
                  </div>
                  <p className="mt-1 truncate text-sm font-medium">{l.title}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress value={l.progress} className="h-1.5" />
                    <span className="w-10 shrink-0 text-right text-[11px] text-muted-foreground">{l.progress}%</span>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="shrink-0">
                  <Play className="h-4 w-4" />
                </Button>
              </Link>
            ))}
          </div>

          {/* Modules */}
          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-base font-semibold">Modul kamu</h2>
            <Link to="/roadmap" className="text-xs font-medium text-primary hover:underline">
              Roadmap
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {modules.slice(0, 4).map((m) => (
              <div key={m.id} className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${m.color} p-4`}>
                <div className="rounded-lg bg-card/70 p-3 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">{m.code}</Badge>
                    <span className="text-[10px] text-muted-foreground">{m.difficulty}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold">{m.title}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Progress value={m.progress} className="h-1.5 flex-1" />
                    <span className="text-[11px] text-muted-foreground">{m.progress}%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{m.lessons} materi · {m.duration}</span>
                    <Button asChild size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs">
                      <Link to="/belajar">
                        Buka <ChevronRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sidebar column */}
        <aside className="space-y-6">
          <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Rekomendasi AI</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Kamu terlihat kuat di KUP. Waktunya menantang diri dengan kuis PPh OP tingkat menengah.
            </p>
            <Button asChild size="sm" className="mt-3">
              <Link to="/kuis">
                Mulai kuis <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Pencapaian</p>
              <Link to="/pencapaian" className="text-xs text-primary hover:underline">Semua</Link>
            </div>
            <ul className="mt-3 space-y-3">
              {achievements.slice(0, 3).map((a) => (
                <li key={a.id} className="flex items-center gap-3">
                  <div
                    className={
                      "grid h-9 w-9 shrink-0 place-items-center rounded-lg " +
                      (a.earned ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")
                    }
                  >
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{a.desc}</p>
                  </div>
                  {a.earned && <Badge variant="secondary" className="ml-auto">Dapat</Badge>}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Peringkat</p>
              <Link to="/peringkat" className="text-xs text-primary hover:underline">Lihat</Link>
            </div>
            <ul className="mt-3 space-y-2">
              {leaderboard.slice(0, 5).map((u) => (
                <li
                  key={u.rank}
                  className={
                    "flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm " +
                    (u.self ? "bg-primary/5" : "")
                  }
                >
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-muted text-[11px] font-semibold">
                    {u.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{u.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{u.city}</p>
                  </div>
                  <span className="text-xs font-semibold text-primary">{u.xp} XP</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </PageBody>
  );
}
