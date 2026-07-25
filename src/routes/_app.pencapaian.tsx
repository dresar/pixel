import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Lock } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { achievements } from "@/lib/dummy";

export const Route = createFileRoute("/_app/pencapaian")({
  head: () => ({
    meta: [
      { title: "Pencapaian — BrevetAI" },
      { name: "description", content: "Kumpulan lencana pencapaian belajarmu." },
    ],
  }),
  component: Pencapaian,
});

const all = [
  ...achievements,
  { id: "a5", title: "Ahli PPN", desc: "Tuntas modul PPN", earned: false, icon: "shield" },
  { id: "a6", title: "Sang Konsisten", desc: "Belajar 30 hari beruntun", earned: false, icon: "flame" },
  { id: "a7", title: "Perencana Pajak", desc: "Selesaikan 3 studi kasus", earned: false, icon: "trophy" },
  { id: "a8", title: "Master Brevet A", desc: "Tuntas semua modul Brevet A", earned: false, icon: "trophy" },
];

function Pencapaian() {
  const earned = all.filter((a) => a.earned).length;
  return (
    <>
      <PageHeader title="Pencapaian" description={`${earned} dari ${all.length} lencana telah kamu dapatkan.`} />
      <PageBody>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {all.map((a) => (
            <div
              key={a.id}
              className={
                "rounded-2xl border p-5 " +
                (a.earned ? "bg-gradient-to-br from-primary/10 to-transparent" : "bg-card opacity-70")
              }
            >
              <div className={"grid h-12 w-12 place-items-center rounded-2xl " + (a.earned ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                {a.earned ? <Trophy className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              </div>
              <p className="mt-3 text-sm font-semibold">{a.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{a.desc}</p>
              {a.earned && <Badge className="mt-3">Diraih</Badge>}
            </div>
          ))}
        </div>
      </PageBody>
    </>
  );
}
