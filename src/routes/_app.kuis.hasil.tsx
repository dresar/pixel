import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, CheckCircle2, XCircle, RefreshCcw, ArrowRight, Sparkles } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/kuis/hasil")({
  head: () => ({
    meta: [
      { title: "Hasil kuis — BrevetAI" },
      { name: "description", content: "Tinjau hasil kuis dan pembahasan tiap soal." },
    ],
  }),
  component: KuisHasil,
});

function KuisHasil() {
  return (
    <>
      <PageHeader
        title="Hasil kuis"
        description="Kerja bagus! Berikut ringkasan hasilmu."
        breadcrumb={[{ label: "Kuis", to: "/kuis" }, { label: "Hasil" }]}
      />
      <PageBody className="max-w-4xl">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-gradient-to-br from-primary/15 to-transparent p-6 text-center md:col-span-1">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Trophy className="h-6 w-6" />
            </div>
            <p className="mt-3 text-4xl font-semibold tracking-tight">82</p>
            <p className="text-xs text-muted-foreground">Skor akhir · Sangat baik</p>
            <Progress value={82} className="mx-auto mt-4 h-2" />
            <p className="mt-2 text-[11px] text-muted-foreground">8 benar · 2 salah dari 10 soal</p>
          </div>

          <div className="rounded-2xl border bg-card p-6 md:col-span-2">
            <p className="text-sm font-semibold">Ringkasan</p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-lg font-semibold text-success">8</p>
                <p className="text-[11px] text-muted-foreground">Benar</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-lg font-semibold text-destructive">2</p>
                <p className="text-[11px] text-muted-foreground">Salah</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-lg font-semibold">12:34</p>
                <p className="text-[11px] text-muted-foreground">Durasi</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm"><RefreshCcw className="mr-1 h-3.5 w-3.5" /> Ulang</Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/belajar/materi">Tinjau materi</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link to="/ai/chat">
                  <Sparkles className="mr-1 h-3.5 w-3.5" /> Bahas dengan AI
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-sm font-semibold">Pembahasan soal</p>
          {[
            { no: 1, benar: true, q: "Definisi Wajib Pajak menurut UU KUP" },
            { no: 2, benar: true, q: "Fungsi NPWP" },
            { no: 3, benar: false, q: "Tarif PPh Pasal 17 pada lapisan kedua" },
            { no: 4, benar: true, q: "Batas waktu SPT Tahunan OP" },
            { no: 5, benar: false, q: "Perhitungan PTKP K/2" },
          ].map((r) => (
            <div key={r.no} className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">Soal {r.no}</Badge>
                {r.benar ? (
                  <span className="inline-flex items-center gap-1 text-xs text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Benar
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-destructive">
                    <XCircle className="h-3.5 w-3.5" /> Salah
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm font-medium">{r.q}</p>
              <Button asChild size="sm" variant="ghost" className="mt-2 h-7 px-2 text-xs">
                <Link to="/ai/chat">
                  Jelaskan <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </PageBody>
    </>
  );
}
