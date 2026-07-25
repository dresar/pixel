import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Trophy, Flame, Zap, Camera, Pencil } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { currentUser, modules, achievements } from "@/lib/dummy";

export const Route = createFileRoute("/_app/profil")({
  head: () => ({
    meta: [
      { title: "Profil — BrevetAI" },
      { name: "description", content: "Kelola profil, progres belajar, dan pencapaianmu di BrevetAI." },
    ],
  }),
  component: Profil,
});

function Profil() {
  return (
    <>
      <PageHeader title="Profil" description="Kelola profil dan pencapaian belajarmu." />
      <PageBody className="max-w-5xl">
        <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-7">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 sm:flex sm:items-center sm:gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarFallback className="bg-primary/15 text-2xl font-semibold text-primary">
                  {currentUser.avatarInitials}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full border bg-card shadow-sm">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold sm:text-xl">{currentUser.name}</h2>
                <Badge variant="secondary">Level {currentUser.level}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{currentUser.role}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {currentUser.email}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {currentUser.city}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="col-span-2 sm:col-span-1">
              <Pencil className="mr-1 h-3.5 w-3.5" /> Ubah
            </Button>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl border bg-card/70 p-3 text-center">
              <div className="mx-auto mb-1 grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <Zap className="h-4 w-4" />
              </div>
              <p className="text-lg font-semibold">{currentUser.xp.toLocaleString("id-ID")}</p>
              <p className="text-[10px] text-muted-foreground">XP</p>
            </div>
            <div className="rounded-xl border bg-card/70 p-3 text-center">
              <div className="mx-auto mb-1 grid h-7 w-7 place-items-center rounded-lg bg-warning/15 text-warning">
                <Flame className="h-4 w-4" />
              </div>
              <p className="text-lg font-semibold">{currentUser.streak}</p>
              <p className="text-[10px] text-muted-foreground">hari beruntun</p>
            </div>
            <div className="rounded-xl border bg-card/70 p-3 text-center">
              <div className="mx-auto mb-1 grid h-7 w-7 place-items-center rounded-lg bg-success/15 text-success">
                <Trophy className="h-4 w-4" />
              </div>
              <p className="text-lg font-semibold">6</p>
              <p className="text-[10px] text-muted-foreground">Pencapaian</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="progres" className="mt-6">
          <TabsList>
            <TabsTrigger value="progres">Progres</TabsTrigger>
            <TabsTrigger value="pencapaian">Pencapaian</TabsTrigger>
            <TabsTrigger value="aktivitas">Aktivitas</TabsTrigger>
          </TabsList>
          <TabsContent value="progres" className="mt-5 space-y-3">
            {modules.slice(0, 4).map((m) => (
              <div key={m.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{m.code}</Badge>
                  <p className="truncate text-sm font-medium">{m.title}</p>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <Progress value={m.progress} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">{m.progress}%</span>
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="pencapaian" className="mt-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {achievements.map((a) => (
                <div key={a.id} className={"rounded-xl border bg-card p-4 " + (a.earned ? "" : "opacity-60")}>
                  <div className="flex items-center gap-3">
                    <div className={"grid h-10 w-10 place-items-center rounded-lg " + (a.earned ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="aktivitas" className="mt-5">
            <ul className="space-y-2">
              {[
                "Menyelesaikan materi Tarif PPh Pasal 17",
                "Skor 90 pada kuis KUP",
                "Meraih pencapaian Rajin Belajar 🔥",
                "Menambah 3 sorotan baru",
              ].map((t, i) => (
                <li key={i} className="flex items-center gap-3 rounded-lg border bg-card p-3 text-sm">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="flex-1">{t}</span>
                  <span className="text-xs text-muted-foreground">Kemarin</span>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}
