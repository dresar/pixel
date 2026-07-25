import { createFileRoute } from "@tanstack/react-router";
import { Users, Boxes, ClipboardList, Sparkles, TrendingUp, Activity } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/admin/")({
  head: () => ({
    meta: [
      { title: "Admin — BrevetAI" },
      { name: "description", content: "Ringkasan admin BrevetAI." },
    ],
  }),
  component: AdminDash,
});

function Stat({ icon: Icon, label, value, hint, trend }: any) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-success">
        <TrendingUp className="h-3 w-3" /> {trend}
        <span className="text-muted-foreground">· {hint}</span>
      </p>
    </div>
  );
}

function AdminDash() {
  return (
    <>
      <PageHeader
        title="Admin dashboard"
        description="Ringkasan platform BrevetAI."
        breadcrumb={[{ label: "Admin" }]}
      />
      <PageBody>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={Users} label="Pengguna aktif" value="12.480" trend="+8,2%" hint="minggu ini" />
          <Stat icon={Boxes} label="Modul terbit" value="42" trend="+3" hint="bulan ini" />
          <Stat icon={ClipboardList} label="Kuis dikerjakan" value="86.210" trend="+12%" hint="minggu ini" />
          <Stat icon={Sparkles} label="Sesi AI" value="24.930" trend="+18%" hint="minggu ini" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border bg-card p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Aktivitas 30 hari</p>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-6 flex h-48 items-end gap-1.5">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="flex-1 rounded-t-md bg-primary/70" style={{ height: 20 + Math.abs(Math.sin(i / 2)) * 80 + "%" }} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm font-semibold">Modul terpopuler</p>
            <ul className="mt-3 space-y-3">
              {[
                { name: "PPh OP", pct: 92 },
                { name: "KUP", pct: 84 },
                { name: "PPN", pct: 71 },
                { name: "PPh Badan", pct: 58 },
              ].map((m) => (
                <li key={m.name}>
                  <div className="flex justify-between text-xs">
                    <span>{m.name}</span>
                    <span className="text-muted-foreground">{m.pct}%</span>
                  </div>
                  <Progress value={m.pct} className="mt-1.5 h-1.5" />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border bg-card p-5">
          <p className="text-sm font-semibold">Aktivitas terbaru</p>
          <ul className="mt-3 divide-y">
            {[
              { u: "Admin Rina", act: "menerbitkan modul PPN Bab 3", t: "5 menit lalu" },
              { u: "Admin Doni", act: "mengunggah 12 ilustrasi PPh OP", t: "1 jam lalu" },
              { u: "Sistem", act: "otomatisasi audit prompt selesai", t: "3 jam lalu" },
              { u: "Admin Rina", act: "menambahkan 6 istilah pada glosarium", t: "Kemarin" },
            ].map((a, i) => (
              <li key={i} className="flex items-center gap-3 py-2.5 text-sm">
                <Badge variant="secondary" className="text-[10px]">{a.u}</Badge>
                <span className="flex-1">{a.act}</span>
                <span className="text-[11px] text-muted-foreground">{a.t}</span>
              </li>
            ))}
          </ul>
        </div>
      </PageBody>
    </>
  );
}
