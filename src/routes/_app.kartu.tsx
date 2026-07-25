import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RotateCw, ThumbsUp, ThumbsDown, Star, Search, Plus, Layers, ArrowLeft, ArrowRight } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/kartu")({
  head: () => ({
    meta: [
      { title: "Kartu belajar — BrevetAI" },
      { name: "description", content: "Kartu belajar interaktif untuk mengingat istilah, tarif, dan pasal penting." },
    ],
  }),
  component: Kartu,
});

const cards = [
  { term: "NPWP", def: "Nomor Pokok Wajib Pajak sebagai identitas administrasi perpajakan." },
  { term: "PPh Pasal 21", def: "Pajak atas penghasilan sehubungan dengan pekerjaan, jasa, atau kegiatan." },
  { term: "PTKP K/2", def: "Penghasilan Tidak Kena Pajak untuk kawin dengan 2 tanggungan." },
];

function Kartu() {
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const c = cards[i];
  return (
    <>
      <PageHeader
        title="Kartu belajar"
        description="Kartu ingatan cepat untuk istilah dan konsep pajak."
        breadcrumb={[{ label: "Belajar", to: "/belajar" }, { label: "Kartu" }]}
        actions={
          <Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Buat</Button>
        }
      />
      <PageBody className="max-w-3xl">
        <div className="relative mb-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari kartu..." className="pl-9" />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Kartu {i + 1} / {cards.length}</span>
          <Progress value={((i + 1) / cards.length) * 100} className="h-1.5 flex-1" />
        </div>

        <div
          onClick={() => setFlip((f) => !f)}
          className="mt-4 flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent p-8 text-center shadow-sm transition-transform hover:scale-[1.005] sm:min-h-[340px]"
        >
          <Badge variant="secondary" className="mb-4 text-[10px]">
            {flip ? "Definisi" : "Istilah"}
          </Badge>
          <p className="text-2xl font-semibold sm:text-3xl">{flip ? c.def : c.term}</p>
          <p className="mt-6 text-[11px] text-muted-foreground">Ketuk untuk membalik</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button variant="outline"><ThumbsDown className="mr-1 h-3.5 w-3.5" /> Sulit</Button>
          <Button variant="outline"><RotateCw className="mr-1 h-3.5 w-3.5" /> Ulangi</Button>
          <Button variant="outline"><ThumbsUp className="mr-1 h-3.5 w-3.5" /> Mudah</Button>
          <Button variant="outline"><Star className="mr-1 h-3.5 w-3.5" /> Favorit</Button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setI((x) => Math.max(0, x - 1))}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
          </Button>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Layers className="h-3.5 w-3.5" /> Set: KUP Dasar
          </div>
          <Button onClick={() => { setFlip(false); setI((x) => Math.min(cards.length - 1, x + 1)); }}>
            Berikutnya <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </PageBody>
    </>
  );
}
