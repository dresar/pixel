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
  Info,
  Boxes,
} from "lucide-react";
import { PageBody } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getProfilPengguna } from "@/functions/users";
import { getDaftarModul } from "@/functions/modules";

export const Route = createFileRoute("/_app/beranda")({
  loader: async () => {
    try {
      const [userRes, modulRes] = await Promise.all([
        getProfilPengguna(),
        getDaftarModul({ data: { halaman: 1, per_halaman: 10 } }),
      ]);
      return {
        profile: userRes.success ? userRes.data : null,
        modulList: modulRes.success && modulRes.data ? modulRes.data : [],
      };
    } catch {
      return { profile: null, modulList: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Beranda — BrevetAI" },
      { name: "description", content: "Ringkasan progres belajar, modul aktif, dan rekomendasi AI." },
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
  const { profile, modulList } = Route.useLoaderData();
  const hour = new Date().getHours();
  const greet = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 19 ? "Selamat sore" : "Selamat malam";
  const userName = profile?.namaLengkap || profile?.name || "Siswa Brevet";
  const userRole = profile?.peran === "SUPER_ADMIN" ? "Super Admin" : profile?.peran === "ADMIN" ? "Admin Konten" : "Siswa Brevet A & B";

  const activeModule = modulList.length > 0 ? modulList[0] : null;

  return (
    <PageBody className="space-y-6 max-w-7xl">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-7 shadow-xs">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{greet},</p>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{userName} 👋</h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              {userRole} · Siap melanjutkan kurikulum pembelajaran Brevet Pajak A & B?
            </p>
          </div>
          <Button asChild size="lg" className="h-10 shadow-sm">
            <Link to="/belajar">
              <Play className="mr-2 h-4 w-4 fill-current" /> Mulai Belajar
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Rentetan Belajar" value="14 Hari" hint="Aktif setiap hari!" icon={Flame} />
        <StatCard label="Poin XP Terkumpul" value="1.450 XP" hint="Level 3 · Pembelajar Aktif" icon={Zap} />
        <StatCard label="Modul Tersedia" value={`${modulList.length} Modul`} hint="Kurikulum Brevet A & B" icon={BookOpen} />
        <StatCard label="Waktu Belajar" value="14,5 Jam" hint="Total sesi pengerjaan" icon={Clock} />
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Span) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Active Module Card */}
          {activeModule ? (
            <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline" className="text-[10px]">Modul Aktif Saat Ini</Badge>
                  <h2 className="mt-1 text-base font-semibold">{activeModule.judul}</h2>
                </div>
                <span className="text-xs text-muted-foreground">35% Selesai</span>
              </div>
              <Progress value={35} className="mt-3 h-2" />
              <div className="mt-4 rounded-xl border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Topik Pelajaran Berikutnya:</p>
                <p className="mt-1 text-sm font-semibold">Pengenalan Dasar & Ketentuan Umum Perpajakan</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Estimasi {activeModule.estimasiMenit || 60} menit</span>
                  <Link
                    to="/belajar/materi/$slug"
                    params={{ slug: activeModule.slug || "tarif-pph-pasal-17-op" }}
                    className="flex h-8 items-center gap-1.5 px-3 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors"
                  >
                    Lanjutkan <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border bg-card p-6 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground">
                <Boxes className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-semibold">Belum Ada Modul Aktif</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Modul pembelajaran belum tersedia di database.
              </p>
            </div>
          )}

          {/* Module List Grid */}
          <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Semua Modul Pembelajaran</h2>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/belajar">Lihat Semua <ChevronRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            {modulList.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {modulList.map((m: any) => (
                  <div key={m.id} className="rounded-xl border p-4 transition-all hover:border-primary/50">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">
                        {m.code || m.slug?.slice(0, 8).toUpperCase() || "MODUL"}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {m.tingkatKesulitan || m.difficulty || "DASAR"}
                      </Badge>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold">{m.judul}</h3>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{m.estimasiMenit || 60} menit</span>
                      <Button asChild size="sm" variant="ghost" className="h-6 text-[11px] px-2">
                        <Link to="/belajar/materi">Buka Materi</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
                Belum ada modul yang dipublikasikan di database.
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* AI Recommendation */}
          <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Tanya AI Brevet</h3>
                <p className="text-[11px] text-muted-foreground">Asisten Pajak Cerdas 24/7</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Punya pertanyaan seputar aturan PPh 21 TER, kalkulasi PPN 11%, atau PTKP terbaru? Tanyakan langsung ke AI.
            </p>
            <Button asChild size="sm" className="mt-4 w-full">
              <Link to="/ai/chat">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Konsultasi AI Sekarang
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </PageBody>
  );
}
