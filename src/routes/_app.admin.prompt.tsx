import { createFileRoute } from "@tanstack/react-router";
import { Wand2, Sparkles, Copy, Star, History } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/admin/prompt")({
  head: () => ({
    meta: [
      { title: "Prompt — Admin BrevetAI" },
      { name: "description", content: "Pustaka dan generator prompt untuk AI." },
    ],
  }),
  component: AdminPrompt,
});

const templates = [
  { name: "Ringkasan bab", tag: "Ringkasan", uses: 214 },
  { name: "Buat 5 soal pilihan ganda", tag: "Kuis", uses: 187 },
  { name: "Studi kasus SPT", tag: "Kasus", uses: 96 },
  { name: "Visualisasi tarif progresif", tag: "Visual", uses: 61 },
];

function AdminPrompt() {
  return (
    <>
      <PageHeader
        title="Prompt"
        description="Pustaka prompt dan generator untuk kebutuhan konten."
        breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Prompt" }]}
      />
      <PageBody className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border bg-card">
          <div className="flex items-center gap-2 border-b p-4">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Wand2 className="h-4 w-4" />
            </div>
            <p className="text-sm font-semibold">Generator prompt</p>
          </div>
          <div className="space-y-3 p-5">
            <Tabs defaultValue="susun">
              <TabsList>
                <TabsTrigger value="susun">Susun</TabsTrigger>
                <TabsTrigger value="variabel">Variabel</TabsTrigger>
                <TabsTrigger value="pratinjau">Pratinjau</TabsTrigger>
              </TabsList>
              <TabsContent value="susun" className="mt-4 space-y-3">
                <Textarea
                  className="min-h-[220px]"
                  defaultValue={`Kamu adalah tutor pajak. Jelaskan konsep {{topik}} untuk peserta {{level}} dalam gaya {{gaya}}.
Sertakan: 1) definisi singkat, 2) contoh numerik, 3) 3 poin ringkasan.`}
                />
                <div className="flex flex-wrap gap-1.5">
                  {["{{topik}}","{{level}}","{{gaya}}","{{format}}"].map((v) => (
                    <Badge key={v} variant="secondary" className="text-[10px]">{v}</Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm"><Sparkles className="mr-1 h-3.5 w-3.5" /> Buat</Button>
                  <Button size="sm" variant="outline"><Copy className="mr-1 h-3.5 w-3.5" /> Salin</Button>
                  <Button size="sm" variant="ghost"><History className="mr-1 h-3.5 w-3.5" /> Riwayat</Button>
                </div>
              </TabsContent>
              <TabsContent value="variabel" className="mt-4 text-sm text-muted-foreground">Atur variabel prompt dan nilai default.</TabsContent>
              <TabsContent value="pratinjau" className="mt-4 text-sm text-muted-foreground">Pratinjau hasil prompt sebelum menyimpan.</TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="rounded-2xl border bg-card">
          <div className="border-b p-4">
            <p className="text-sm font-semibold">Pustaka prompt</p>
            <p className="text-[11px] text-muted-foreground">Template siap pakai untuk berbagai kebutuhan.</p>
          </div>
          <ul className="divide-y">
            {templates.map((t) => (
              <li key={t.name} className="flex items-center gap-3 p-4">
                <Star className="h-4 w-4 text-warning" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">{t.tag}</Badge>
                    <span>{t.uses} penggunaan</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost">Buka</Button>
              </li>
            ))}
          </ul>
        </div>
      </PageBody>
    </>
  );
}
