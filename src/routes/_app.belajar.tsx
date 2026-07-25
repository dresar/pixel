import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Filter, BookOpen, Play, Clock } from "lucide-react";
import { PageHeader, PageBody } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { modules, recentLessons } from "@/lib/dummy";

export const Route = createFileRoute("/_app/belajar")({
  head: () => ({
    meta: [
      { title: "Belajar — BrevetAI" },
      { name: "description", content: "Jelajahi semua modul, materi, dan bab pembelajaran Brevet Pajak." },
    ],
  }),
  component: Belajar,
});

function Belajar() {
  return (
    <>
      <PageHeader
        title="Belajar"
        description="Semua modul, materi, dan bab pembelajaran dalam satu tempat."
        breadcrumb={[{ label: "Beranda", to: "/beranda" }, { label: "Belajar" }]}
        actions={
          <Button variant="outline" size="sm">
            <Filter className="mr-1 h-3.5 w-3.5" /> Filter
          </Button>
        }
      />
      <PageBody>
        <div className="relative mb-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari materi, bab, atau istilah..." className="pl-9" />
        </div>

        <Tabs defaultValue="modul">
          <TabsList>
            <TabsTrigger value="modul">Modul</TabsTrigger>
            <TabsTrigger value="materi">Materi</TabsTrigger>
            <TabsTrigger value="terakhir">Terakhir</TabsTrigger>
          </TabsList>
          <TabsContent value="modul" className="mt-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((m) => (
                <div key={m.id} className="rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{m.code}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{m.difficulty}</Badge>
                  </div>
                  <h3 className="mt-3 text-base font-semibold leading-snug">{m.title}</h3>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {m.lessons} materi</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {m.duration}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Progress value={m.progress} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground">{m.progress}%</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link to="/belajar/materi">{m.progress === 0 ? "Mulai" : "Lanjut"}</Link>
                    </Button>
                    <Button size="sm" variant="outline">Kuis</Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="materi" className="mt-5">
            <div className="space-y-2">
              {recentLessons.concat(recentLessons).map((l, i) => (
                <Link
                  key={i}
                  to="/belajar/materi"
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border bg-card p-4 hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{l.module}</Badge>
                      <span className="text-[11px] text-muted-foreground">{l.duration}</span>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium">{l.title}</p>
                  </div>
                  <Button size="icon" variant="ghost">
                    <Play className="h-4 w-4" />
                  </Button>
                </Link>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="terakhir" className="mt-5">
            <div className="space-y-2">
              {recentLessons.map((l) => (
                <div key={l.id} className="flex items-center gap-3 rounded-xl border bg-card p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{l.title}</p>
                    <p className="text-[11px] text-muted-foreground">{l.module} · Terakhir dibuka kemarin</p>
                  </div>
                  <Button size="sm" variant="ghost">Lanjut</Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}
