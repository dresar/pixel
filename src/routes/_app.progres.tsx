import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, TrendingUp, Clock, Flame, Target, BookOpen } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Progress } from "@/components/ui/progress";
import { modules as dummyModules } from "@/lib/dummy";
import { getDaftarModul } from "@/functions/modules";

export const Route = createFileRoute("/_app/progres")({
  loader: async () => {
    try {
      const res = await getDaftarModul({ data: { halaman: 1, per_halaman: 10 } });
      return { modulList: res.success && res.data ? res.data : [] };
    } catch {
      return { modulList: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Progres — BrevetAI" },
      { name: "description", content: "Statistik lengkap progres belajar Brevet Pajakmu." },
    ],
  }),
  component: Progres,
});

function Progres() {
  const { modulList } = Route.useLoaderData();
  const displayModules = modulList.length > 0 ? modulList : dummyModules;

  return (
    <>
      <PageHeader title="Progres belajar" description="Ringkasan performa dan aktivitas belajarmu." />
      <PageBody>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Jam belajar", value: "42 jam", hint: "+5 jam minggu ini", icon: Clock },
            { label: "Streak Belajar", value: "14 hari", hint: "Aktif setiap hari!", icon: Flame },
            { label: "Materi selesai", value: "24 materi", hint: "dari total 73", icon: BookOpen },
            { label: "Target Mingguan", value: "80%", hint: "8 dari 10 jam", icon: Target },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{s.value}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{s.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border bg-card p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Aktivitas 7 hari terakhir</p>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div className="mt-6 flex h-40 items-end gap-2">
              {[40, 55, 70, 60, 82, 90, 65].map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t-md bg-primary/70" style={{ height: h + "%" }} />
                  <span className="text-[10px] text-muted-foreground">
                    {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm font-semibold">Progres Modul Pembelajaran</p>
            <ul className="mt-3 space-y-3">
              {displayModules.slice(0, 5).map((m: any) => (
                <li key={m.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate font-medium">{m.judul || m.title}</span>
                    <span className="text-muted-foreground">{m.progress || 35}%</span>
                  </div>
                  <Progress value={m.progress || 35} className="mt-1.5 h-1.5" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageBody>
    </>
  );
}
