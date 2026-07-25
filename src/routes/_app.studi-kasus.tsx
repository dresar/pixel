import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Users } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/studi-kasus")({
  head: () => ({
    meta: [
      { title: "Studi kasus — BrevetAI" },
      { name: "description", content: "Studi kasus perpajakan berbasis skenario nyata." },
    ],
  }),
  component: StudiKasus,
});

const cases = [
  { title: "SPT 1770 pegawai swasta dengan tambahan usaha", level: "Menengah", duration: "45 menit", tag: "PPh OP" },
  { title: "Rekonsiliasi fiskal PT Maju Jaya", level: "Lanjut", duration: "60 menit", tag: "PPh Badan" },
  { title: "Faktur Pajak keliru dan pembetulannya", level: "Menengah", duration: "30 menit", tag: "PPN" },
  { title: "Keberatan atas SKP kurang bayar", level: "Lanjut", duration: "50 menit", tag: "Sengketa" },
];

function StudiKasus() {
  return (
    <>
      <PageHeader title="Studi kasus" description="Latih pemahamanmu dengan skenario perpajakan nyata." />
      <PageBody>
        <div className="grid gap-4 md:grid-cols-2">
          {cases.map((c) => (
            <div key={c.title} className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <Badge variant="outline" className="text-[10px]">{c.tag}</Badge>
                </div>
              </div>
              <p className="mt-3 text-base font-semibold">{c.title}</p>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span>Level: {c.level}</span>
                <span>{c.duration}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm">Mulai</Button>
                <Button size="sm" variant="outline">Tinjau</Button>
              </div>
            </div>
          ))}
        </div>
      </PageBody>
    </>
  );
}
