import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, Users, Activity, Sparkles, BookOpen, ClipboardList } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/admin/analitik")({
  head: () => ({
    meta: [
      { title: "Analitik — Admin BrevetAI" },
      { name: "description", content: "Analitik penggunaan platform dan performa konten." },
    ],
  }),
  component: AdminAnalitik,
});

function AdminAnalitik() {
  return (
    <>
      <PageHeader
        title="Analitik"
        description="Statistik pengguna, konten, dan AI."
        breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Analitik" }]}
      />
      <PageBody className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Users, label: "Pengguna baru", value: "1.284", trend: "+12%" },
            { icon: Activity, label: "Sesi aktif", value: "8.462", trend: "+6,4%" },
            { icon: BookOpen, label: "Materi dibaca", value: "42.108", trend: "+9%" },
            { icon: Sparkles, label: "Sesi AI", value: "24.930", trend: "+18%" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{s.value}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-success">
                <TrendingUp className="h-3 w-3" /> {s.trend}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm font-semibold">Pertumbuhan pengguna</p>
            <div className="mt-6 flex h-48 items-end gap-2">
              {[30, 42, 38, 55, 60, 72, 65, 80, 88, 92, 100, 108].map((h, i) => (
                <div key={i} className="flex-1">
                  <div className="rounded-t-md bg-gradient-to-t from-primary to-primary/60" style={{ height: h * 1.5 + "px" }} />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              {["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm font-semibold">Konten terpopuler</p>
            <ul className="mt-4 space-y-3">
              {[
                { name: "Tarif PPh Pasal 17", pct: 92 },
                { name: "SPT 1770 & 1770S", pct: 84 },
                { name: "Objek PPN", pct: 76 },
                { name: "PTKP terbaru", pct: 68 },
                { name: "Rekonsiliasi fiskal", pct: 55 },
              ].map((c) => (
                <li key={c.name}>
                  <div className="flex justify-between text-xs">
                    <span>{c.name}</span>
                    <span className="text-muted-foreground">{c.pct}%</span>
                  </div>
                  <Progress value={c.pct} className="mt-1.5 h-1.5" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageBody>
    </>
  );
}
