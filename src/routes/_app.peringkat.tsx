import { createFileRoute } from "@tanstack/react-router";
import { Users, Trophy, Medal, Crown } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { leaderboard } from "@/lib/dummy";

export const Route = createFileRoute("/_app/peringkat")({
  head: () => ({
    meta: [
      { title: "Peringkat — BrevetAI" },
      { name: "description", content: "Peringkat peserta belajar Brevet Pajak terbaik minggu ini." },
    ],
  }),
  component: Peringkat,
});

function Peringkat() {
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  return (
    <>
      <PageHeader title="Peringkat" description="Peserta paling aktif belajar minggu ini." />
      <PageBody className="max-w-4xl">
        <Tabs defaultValue="mingguan">
          <TabsList>
            <TabsTrigger value="mingguan">Mingguan</TabsTrigger>
            <TabsTrigger value="bulanan">Bulanan</TabsTrigger>
            <TabsTrigger value="semua">Sepanjang masa</TabsTrigger>
          </TabsList>
          <TabsContent value="mingguan" className="mt-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {top3.map((u, i) => (
                <div
                  key={u.rank}
                  className={
                    "rounded-2xl border p-5 text-center " +
                    (i === 0 ? "bg-gradient-to-br from-warning/20 to-transparent" :
                     i === 1 ? "bg-gradient-to-br from-muted to-transparent" :
                     "bg-gradient-to-br from-primary/10 to-transparent")
                  }
                >
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-card">
                    {i === 0 ? <Crown className="h-5 w-5 text-warning" /> : i === 1 ? <Medal className="h-5 w-5" /> : <Trophy className="h-5 w-5 text-primary" />}
                  </div>
                  <Avatar className="mx-auto mt-3 h-14 w-14">
                    <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                      {u.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <p className="mt-2 text-sm font-semibold">{u.name}</p>
                  <p className="text-[11px] text-muted-foreground">{u.city}</p>
                  <p className="mt-2 text-lg font-bold text-primary">{u.xp} XP</p>
                </div>
              ))}
            </div>
            <ul className="mt-6 divide-y rounded-2xl border bg-card">
              {rest.map((u) => (
                <li key={u.rank} className={"flex items-center gap-3 px-4 py-3 " + (u.self ? "bg-primary/5" : "")}>
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-muted text-xs font-semibold">
                    {u.rank}
                  </span>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {u.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.name} {u.self && <Badge variant="secondary" className="ml-1 text-[10px]">Kamu</Badge>}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{u.city}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">{u.xp} XP</span>
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="bulanan" className="mt-5 text-sm text-muted-foreground">Peringkat bulanan diperbarui setiap awal bulan.</TabsContent>
          <TabsContent value="semua" className="mt-5 text-sm text-muted-foreground">Peringkat sepanjang masa.</TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}
