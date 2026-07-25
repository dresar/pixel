import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Search, BookOpen, Play, Clock } from "lucide-react";
import { useState } from "react";
import { PageHeader, PageBody } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { modules as dummyModules, recentLessons } from "@/lib/dummy";
import { getDaftarModul } from "@/functions/modules";

export const Route = createFileRoute("/_app/belajar")({
  loader: async () => {
    try {
      const res = await getDaftarModul({ data: { halaman: 1, per_halaman: 20 } });
      return { modulList: res.success && res.data ? res.data : [] };
    } catch {
      return { modulList: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Belajar — BrevetAI" },
      { name: "description", content: "Jelajahi semua modul, materi, dan bab pembelajaran Brevet Pajak." },
    ],
  }),
  component: BelajarLayout,
});

function BelajarLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // If subroute is active, render Outlet!
  if (pathname !== "/belajar" && pathname !== "/belajar/") {
    return <Outlet />;
  }

  return <BelajarCatalog />;
}

function BelajarCatalog() {
  const { modulList } = Route.useLoaderData();
  const [cari, setCari] = useState("");

  const displayModules = modulList.length > 0 ? modulList : dummyModules;
  const filtered = displayModules.filter((m: any) => {
    const title = m.judul || m.title || "";
    return title.toLowerCase().includes(cari.toLowerCase());
  });

  return (
    <>
      <PageHeader
        title="Modul & Materi Belajar"
        description="Semua modul, materi, dan bab pembelajaran Brevet Pajak A & B."
        breadcrumb={[{ label: "Beranda", to: "/beranda" }, { label: "Belajar" }]}
      />
      <PageBody>
        <div className="relative mb-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari modul, bab, atau materi pajak..."
            className="pl-9"
          />
        </div>

        <Tabs defaultValue="modul">
          <TabsList>
            <TabsTrigger value="modul">Semua Modul ({filtered.length})</TabsTrigger>
            <TabsTrigger value="terakhir">Materi Terakhir</TabsTrigger>
          </TabsList>
          <TabsContent value="modul" className="mt-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((m: any) => {
                const targetSlug = m.slug || "tarif-pph-pasal-17-op";
                return (
                  <div key={m.id} className="rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{m.code || m.slug?.slice(0, 8).toUpperCase() || "MODUL"}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{m.difficulty || m.tingkatKesulitan || "DASAR"}</Badge>
                      </div>
                      <h3 className="mt-3 text-base font-semibold leading-snug">{m.title || m.judul}</h3>
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {m.lessons || 12} materi</span>
                        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {m.duration || `${m.estimasiMenit || 60} mnt`}</span>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <Progress value={m.progress || 35} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">{m.progress || 35}%</span>
                      </div>
                    </div>

                    {/* Direct Link to /belajar/materi/$slug */}
                    <Link
                      to="/belajar/materi/$slug"
                      params={{ slug: targetSlug }}
                      className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Play className="h-4 w-4 fill-current" /> Lanjutkan Belajar
                    </Link>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          <TabsContent value="terakhir" className="mt-5 space-y-3">
            {recentLessons.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-xl border bg-card p-4">
                <div>
                  <Badge variant="outline" className="text-[10px]">{l.module}</Badge>
                  <p className="mt-1 text-sm font-semibold">{l.title}</p>
                  <p className="text-xs text-muted-foreground">{l.duration}</p>
                </div>
                <Link
                  to="/belajar/materi/$slug"
                  params={{ slug: "tarif-pph-pasal-17-op" }}
                  className="flex h-8 items-center justify-center px-3 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
                >
                  Buka Materi
                </Link>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}
