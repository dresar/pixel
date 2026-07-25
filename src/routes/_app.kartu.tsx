import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RotateCw, Check, X, Search, Plus, Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/kartu")({
  head: () => ({
    meta: [
      { title: "Kartu Belajar (Flashcards) — BrevetAI" },
      { name: "description", content: "Kartu belajar interaktif untuk mengingat istilah, tarif, dan pasal penting." },
    ],
  }),
  component: Kartu,
});

const cardsList = [
  {
    id: 1,
    topic: "KUP & NPWP",
    term: "NPWP (Nomor Pokok Wajib Pajak)",
    def: "Nomor yang diberikan kepada Wajib Pajak sebagai sarana dalam administrasi perpajakan yang dipergunakan sebagai tanda pengenal diri atau identitas Wajib Pajak dalam melaksanakan hak dan kewajiban perpajakannya.",
  },
  {
    id: 2,
    topic: "PTKP",
    term: "PTKP Wajib Pajak Kawin (K/0)",
    def: "Rp 58.500.000 / tahun (Rp 54.000.000 untuk WP sendiri + Rp 4.500.000 tambahan untuk status kawin).",
  },
  {
    id: 3,
    topic: "PPh Pasal 21",
    term: "TER (Tarif Efektif Rata-Rata)",
    def: "Skema pemotongan PPh 21 bulanan berdasarkan PMK 168/2023 yang dikelompokkan ke Kategori A, B, C berdasarkan status PTKP Wajib Pajak.",
  },
  {
    id: 4,
    topic: "PPN",
    term: "Pengusaha Kena Pajak (PKP)",
    def: "Pengusaha yang melakukan penyerahan BKP dan/atau JKP yang dikenai pajak berdasarkan UU PPN 1984 dan perubahannya, dengan omset melebihi Rp 4,8 Miliar per tahun.",
  },
  {
    id: 5,
    topic: "PPh Badan",
    term: "Fasilitas Pasal 31E UU PPh",
    def: "Pengurangan tarif sebesar 50% dari tarif PPh Badan (22%) atas Penghasilan Kena Pajak dari bagian peredaran bruto sampai dengan Rp 4.800.000.000.",
  },
];

function Kartu() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [cari, setCari] = useState("");

  const filteredCards = cardsList.filter(
    (c) =>
      c.term.toLowerCase().includes(cari.toLowerCase()) ||
      c.def.toLowerCase().includes(cari.toLowerCase()),
  );

  const card = filteredCards[index] || cardsList[0];

  const handleNext = () => {
    setFlipped(false);
    setIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setFlipped(false);
    setIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  return (
    <>
      <PageHeader
        title="Kartu Belajar Interaktif (Flashcards)"
        description="Kartu memori cepat untuk mengingat konsep, rumus, dan pasal perpajakan."
        breadcrumb={[{ label: "Belajar", to: "/belajar" }, { label: "Kartu" }]}
      />
      <PageBody className="max-w-3xl">
        <div className="relative mb-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={cari}
            onChange={(e) => {
              setCari(e.target.value);
              setIndex(0);
            }}
            placeholder="Cari kartu istilah atau tarif pajak..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            Kartu {index + 1} dari {filteredCards.length}
          </span>
          <Progress value={((index + 1) / filteredCards.length) * 100} className="h-1.5 flex-1" />
        </div>

        {/* Flashcard Component */}
        <div
          onClick={() => setFlipped(!flipped)}
          className="mt-4 flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-8 text-center shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline">{card.topic}</Badge>
            <Badge variant={flipped ? "secondary" : "default"} className="text-[10px]">
              {flipped ? "Jawaban / Definisi" : "Istilah / Pertanyaan"}
            </Badge>
          </div>

          <h2 className="text-xl font-bold leading-relaxed sm:text-2xl max-w-xl">
            {flipped ? card.def : card.term}
          </h2>

          <div className="mt-8 flex items-center gap-1.5 text-xs text-primary font-medium">
            <RotateCw className="h-3.5 w-3.5" />
            <span>Klik kartu untuk membalik ({flipped ? "Lihat Istilah" : "Lihat Penjelasan"})</span>
          </div>
        </div>

        {/* Next / Prev Controls */}
        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={handlePrev} size="sm">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Kartu Sebelumnya
          </Button>

          <Button onClick={handleNext} size="sm">
            Kartu Berikutnya <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </PageBody>
    </>
  );
}
