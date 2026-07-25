import { createFileRoute } from "@tanstack/react-router";
import { Mail, Trophy, Flame, Zap, Camera, Shield } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { currentUser as dummyUser, modules, achievements } from "@/lib/dummy";
import { getProfilPengguna } from "@/functions/users";

export const Route = createFileRoute("/_app/profil")({
  loader: async () => {
    try {
      const res = await getProfilPengguna();
      return { profile: res.success ? res.data : null };
    } catch {
      return { profile: null };
    }
  },
  head: () => ({
    meta: [
      { title: "Profil — BrevetAI" },
      { name: "description", content: "Kelola profil, progres belajar, dan pencapaianmu di BrevetAI." },
    ],
  }),
  component: Profil,
});

function Profil() {
  const { profile } = Route.useLoaderData();
  const userName = profile?.namaLengkap || profile?.name || dummyUser.name;
  const userEmail = profile?.email || dummyUser.email;
  const userRole = profile?.peran ? `Role: ${profile.peran}` : dummyUser.role;
  const initials = userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <PageHeader title="Profil Akun" description="Informasi akun dan progres belajarmu di platform BrevetAI." />
      <PageBody className="max-w-5xl">
        <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-7">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 sm:flex sm:items-center sm:gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarFallback className="bg-primary/15 text-2xl font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold sm:text-xl">{userName}</h2>
                <Badge variant="secondary">Level 12</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{userRole}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {userEmail}</span>
                <span className="inline-flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Status: {profile?.statusAkun || "AKTIF"}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl border bg-card/70 p-3 text-center">
              <div className="mx-auto mb-1 grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <Zap className="h-4 w-4" />
              </div>
              <p className="text-lg font-semibold">{dummyUser.xp.toLocaleString("id-ID")}</p>
              <p className="text-[10px] text-muted-foreground">XP Terkumpul</p>
            </div>
            <div className="rounded-xl border bg-card/70 p-3 text-center">
              <div className="mx-auto mb-1 grid h-7 w-7 place-items-center rounded-lg bg-warning/15 text-warning">
                <Flame className="h-4 w-4" />
              </div>
              <p className="text-lg font-semibold">{dummyUser.streak} Hari</p>
              <p className="text-[10px] text-muted-foreground">Rentetan Belajar</p>
            </div>
            <div className="rounded-xl border bg-card/70 p-3 text-center">
              <div className="mx-auto mb-1 grid h-7 w-7 place-items-center rounded-lg bg-success/15 text-success">
                <Trophy className="h-4 w-4" />
              </div>
              <p className="text-lg font-semibold">2 Modul</p>
              <p className="text-[10px] text-muted-foreground">Diselesaikan</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="modul" className="mt-6">
          <TabsList>
            <TabsTrigger value="modul">Modul Belajar</TabsTrigger>
            <TabsTrigger value="pencapaian">Pencapaian</TabsTrigger>
          </TabsList>
          <TabsContent value="modul" className="mt-4 space-y-3">
            {modules.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl border bg-card p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{m.code}</Badge>
                    <span className="text-sm font-semibold">{m.title}</span>
                  </div>
                  <Progress value={m.progress} className="mt-3 h-1.5 w-64" />
                </div>
                <span className="text-xs text-muted-foreground font-semibold">{m.progress}%</span>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="pencapaian" className="mt-4 grid gap-3 sm:grid-cols-2">
            {achievements.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border bg-card p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}
