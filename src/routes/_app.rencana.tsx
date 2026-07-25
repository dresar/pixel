import { createFileRoute } from "@tanstack/react-router";
import { Target, Flame, Plus, Check } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_app/rencana")({
  head: () => ({
    meta: [
      { title: "Rencana belajar — BrevetAI" },
      { name: "description", content: "Rencana belajar harian dan mingguan lengkap dengan target." },
    ],
  }),
  component: Rencana,
});

function Rencana() {
  return (
    <>
      <PageHeader
        title="Rencana belajar"
        description="Target harian dan mingguan agar kamu tetap konsisten."
        actions={<Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Tambah</Button>}
      />
      <PageBody className="max-w-4xl">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent p-5">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Target hari ini</p>
            </div>
            <p className="mt-2 text-3xl font-semibold">45 <span className="text-base font-normal text-muted-foreground">/ 60 menit</span></p>
            <Progress value={75} className="mt-3 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">15 menit lagi mencapai target harian.</p>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-warning" />
              <p className="text-sm font-semibold">Streak</p>
            </div>
            <p className="mt-2 text-3xl font-semibold">14 hari</p>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className="h-3 flex-1 rounded-sm bg-warning/70" />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Belajar hari ini untuk menjaga streak.</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border bg-card p-5">
          <p className="text-sm font-semibold">Tugas hari ini</p>
          <ul className="mt-3 space-y-2">
            {[
              { t: "Baca materi Tarif PPh Pasal 17", done: true },
              { t: "Kerjakan 5 kartu belajar PTKP", done: true },
              { t: "Selesaikan kuis mingguan PPh OP", done: false },
              { t: "Tinjau catatan PPN", done: false },
            ].map((x, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg border bg-background p-3">
                <Checkbox checked={x.done} />
                <span className={"flex-1 text-sm " + (x.done ? "text-muted-foreground line-through" : "")}>{x.t}</span>
                {x.done && <Check className="h-4 w-4 text-success" />}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border bg-card p-5">
          <p className="text-sm font-semibold">Target mingguan</p>
          <div className="mt-3 grid grid-cols-7 gap-2">
            {["S","S","R","K","J","S","M"].map((d, i) => {
              const done = i < 5;
              return (
                <div key={i} className={"rounded-lg border p-2 text-center " + (done ? "bg-primary/10 text-primary" : "bg-muted/40 text-muted-foreground")}>
                  <p className="text-[10px]">{d}</p>
                  <p className="mt-1 text-sm font-semibold">{done ? "✓" : "—"}</p>
                </div>
              );
            })}
          </div>
        </div>
      </PageBody>
    </>
  );
}
