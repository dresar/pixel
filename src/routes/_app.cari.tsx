import { createFileRoute } from "@tanstack/react-router";
import { Search, BookOpen, Layers, ClipboardList, Sparkles } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/cari")({
  head: () => ({
    meta: [
      { title: "Cari — BrevetAI" },
      { name: "description", content: "Cari materi, kuis, dan istilah pajak di seluruh platform." },
    ],
  }),
  component: Cari,
});

const results = [
  { type: "Materi", icon: BookOpen, title: "Tarif PPh Pasal 17 untuk Orang Pribadi", meta: "PPh OP · Bab 2" },
  { type: "Kuis", icon: ClipboardList, title: "Kuis mingguan PPh OP", meta: "10 soal · 15 menit" },
  { type: "Kartu", icon: Layers, title: "Set kartu PTKP", meta: "12 kartu" },
  { type: "AI", icon: Sparkles, title: "Percakapan: Perhitungan PPh terutang", meta: "3 jam lalu" },
];

function Cari() {
  return (
    <>
      <PageHeader title="Cari" description="Cari materi, kuis, kartu, dan riwayat AI di seluruh platform." />
      <PageBody className="max-w-4xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Ketik untuk mencari..." className="h-12 pl-10 text-base" autoFocus />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["PPh 21", "PTKP", "SPT 1770", "PPN masukan", "NPWP"].map((t) => (
            <button key={t} className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground hover:bg-accent">
              {t}
            </button>
          ))}
        </div>

        <Tabs defaultValue="semua" className="mt-6">
          <TabsList>
            <TabsTrigger value="semua">Semua</TabsTrigger>
            <TabsTrigger value="materi">Materi</TabsTrigger>
            <TabsTrigger value="kuis">Kuis</TabsTrigger>
            <TabsTrigger value="kartu">Kartu</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
          </TabsList>
          <TabsContent value="semua" className="mt-5 space-y-2">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border bg-card p-4 hover:bg-accent/40">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <r.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{r.type}</Badge>
                    <span className="text-[11px] text-muted-foreground">{r.meta}</span>
                  </div>
                  <p className="mt-1 truncate text-sm font-medium">{r.title}</p>
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="materi" className="mt-5 text-sm text-muted-foreground">Hasil filter materi.</TabsContent>
          <TabsContent value="kuis" className="mt-5 text-sm text-muted-foreground">Hasil filter kuis.</TabsContent>
          <TabsContent value="kartu" className="mt-5 text-sm text-muted-foreground">Hasil filter kartu.</TabsContent>
          <TabsContent value="ai" className="mt-5 text-sm text-muted-foreground">Hasil filter riwayat AI.</TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}
