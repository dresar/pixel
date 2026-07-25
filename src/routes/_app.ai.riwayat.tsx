import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Search, MoreHorizontal } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/ai/riwayat")({
  head: () => ({
    meta: [
      { title: "Riwayat AI — BrevetAI" },
      { name: "description", content: "Riwayat percakapan dengan asisten AI." },
    ],
  }),
  component: RiwayatAI,
});

const convos = [
  { title: "Perhitungan PPh terutang untuk PKP 350 juta", time: "3 jam lalu" },
  { title: "Perbedaan PPN dan PPnBM", time: "Kemarin" },
  { title: "Ringkasan bab KUP dalam 5 poin", time: "2 hari lalu" },
  { title: "Studi kasus SPT 1770 pegawai swasta", time: "5 hari lalu" },
  { title: "Cara mengisi Faktur Pajak elektronik", time: "1 minggu lalu" },
];

function RiwayatAI() {
  return (
    <>
      <PageHeader
        title="Riwayat AI"
        description="Semua percakapanmu dengan asisten AI."
        breadcrumb={[{ label: "AI", to: "/ai/chat" }, { label: "Riwayat" }]}
      />
      <PageBody className="max-w-3xl">
        <div className="relative mb-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari percakapan..." className="pl-9" />
        </div>
        <ul className="divide-y rounded-2xl border bg-card">
          {convos.map((c, i) => (
            <li key={i} className="flex items-center gap-3 p-4 hover:bg-accent/40">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.title}</p>
                <p className="text-[11px] text-muted-foreground">{c.time}</p>
              </div>
              <Button size="icon" variant="ghost" aria-label="Aksi"><MoreHorizontal className="h-4 w-4" /></Button>
            </li>
          ))}
        </ul>
      </PageBody>
    </>
  );
}
