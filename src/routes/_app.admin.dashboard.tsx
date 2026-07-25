import { createFileRoute } from "@tanstack/react-router";
import { Users, Boxes, ClipboardList, Sparkles, TrendingUp, Activity, CheckCircle2 } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getDaftarModul } from "@/functions/modules";
import { getDaftarPenggunaAdmin } from "@/functions/users";
import { getDaftarKuis } from "@/functions/quiz";

export const Route = createFileRoute("/_app/admin/dashboard")({
  loader: async () => {
    try {
      const [modulRes, userRes, kuisRes] = await Promise.all([
        getDaftarModul({ data: { halaman: 1, per_halaman: 50 } }),
        getDaftarPenggunaAdmin(),
        getDaftarKuis(),
      ]);

      const modulCount = modulRes.success && modulRes.data ? modulRes.data.length : 0;
      const userCount = userRes.success && userRes.data ? userRes.data.length : 0;
      const kuisCount = kuisRes.success && kuisRes.data ? kuisRes.data.length : 0;

      return {
        modulCount,
        userCount,
        kuisCount,
        modulList: modulRes.success && modulRes.data ? modulRes.data.slice(0, 5) : [],
        userList: userRes.success && userRes.data ? userRes.data.slice(0, 5) : [],
      };
    } catch {
      return { modulCount: 0, userCount: 0, kuisCount: 0, modulList: [], userList: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Dashboard Admin — BrevetAI" },
      { name: "description", content: "Ringkasan metrik dan aktivitas nyata platform BrevetAI." },
    ],
  }),
  component: AdminDashboard,
});

function StatCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: number | string; hint: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
        <CheckCircle2 className="h-3 w-3 text-success" />
        <span>{hint}</span>
      </p>
    </div>
  );
}

function AdminDashboard() {
  const { modulCount, userCount, kuisCount, modulList, userList } = Route.useLoaderData();

  return (
    <>
      <PageHeader
        title="Dashboard Admin BrevetAI"
        description="Ringkasan statistik nyata dan pemantauan aktivitas ekosistem pembelajaran perpajakan."
        breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Dashboard" }]}
      />
      <PageBody className="space-y-6">
        {/* Real Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Total Pengguna" value={userCount} hint="Terdaftar di database Neon" />
          <StatCard icon={Boxes} label="Modul Edukasi" value={modulCount} hint="Modul kurikulum aktif" />
          <StatCard icon={ClipboardList} label="Kuis Evaluasi" value={kuisCount} hint="Bank soal kuis evaluasi" />
          <StatCard icon={Sparkles} label="Engine AI" value="Claude & Gemini" hint="AI Content Engine resmi" />
        </div>

        {/* Real Activity & Modules Showcase */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-base font-semibold">Modul Pembelajaran Terbaru</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Daftar modul perpajakan yang tersimpan di dalam database platform.</p>
              </div>
              <Boxes className="h-5 w-5 text-muted-foreground" />
            </div>

            {modulList.length === 0 ? (
              <div className="py-12 text-center">
                <Boxes className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-sm font-medium text-muted-foreground">Belum ada modul di database</p>
                <p className="text-xs text-muted-foreground">Silakan ke menu Kelola Modul untuk membuat modul baru via Claude.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {modulList.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between rounded-xl border bg-card/50 p-3.5 transition-colors hover:bg-accent/40">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{m.slug?.toUpperCase() || "MODUL"}</Badge>
                        <Badge variant={m.statusPublikasi === "PUBLISHED" ? "default" : "secondary"} className="text-[10px]">
                          {m.statusPublikasi || "DRAFT"}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-sm font-semibold">{m.title || m.judul}</p>
                      <p className="text-xs text-muted-foreground">Tingkat: {m.difficulty || m.tingkatKesulitan || "DASAR"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-base font-semibold">Pengguna Terbaru</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">5 akun pendaftar terakhir.</p>
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>

              {userList.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-2 text-sm font-medium text-muted-foreground">Belum ada data pengguna</p>
                </div>
              ) : (
                <ul className="mt-4 divide-y">
                  {userList.map((u: any, idx: number) => (
                    <li key={u.id || idx} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{u.name || u.namaLengkap || "Pengguna"}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] ml-2 shrink-0">{u.peran || "STUDENT"}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}
