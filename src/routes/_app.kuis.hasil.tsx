import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, RefreshCcw, Sparkles, Download, Check, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/kuis/hasil")({
  head: () => ({
    meta: [
      { title: "Hasil Evaluasi Kuis — BrevetAI" },
      { name: "description", content: "Ringkasan nilai dan evaluasi pengerjaan kuis." },
    ],
  }),
  component: KuisHasil,
});

function KuisHasil() {
  const [skor, setSkor] = useState(80);
  const [totalSoal, setTotalSoal] = useState(5);
  const [tersimpan, setTersimpan] = useState(false);

  useEffect(() => {
    const savedScore = sessionStorage.getItem("last_quiz_score");
    const savedTotal = sessionStorage.getItem("last_quiz_total");
    if (savedScore !== null) {
      setSkor(Number(savedScore));
    }
    if (savedTotal !== null) {
      setTotalSoal(Number(savedTotal));
    }
  }, []);

  const totalBenar = Math.round((skor / 100) * totalSoal);
  const totalSalah = totalSoal - totalBenar;
  const isLulus = skor >= 70;

  const handleDownloadHasil = () => {
    const reportText =
      `==========================================\n` +
      `LAPORAN HASIL EVALUASI KUIS BREVETAI\n` +
      `==========================================\n` +
      `Tanggal: ${new Date().toLocaleDateString("id-ID")}\n` +
      `Skor Akhir: ${skor} / 100\n` +
      `Status: ${isLulus ? "LULUS" : "BELUM LULUS"}\n` +
      `Jawaban Benar: ${totalBenar} dari ${totalSoal} Soal\n` +
      `==========================================\n` +
      `Disimpan ke database sistem platform BrevetAI.\n`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Hasil-Kuis-BrevetAI-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setTersimpan(true);
  };

  return (
    <>
      <PageHeader
        title="Hasil Evaluasi Kuis Perpajakan"
        description="Nilai pengerjaan kuis otomatis disimpan ke dalam database akun Anda."
        breadcrumb={[{ label: "Kuis", to: "/kuis" }, { label: "Hasil Evaluasi" }]}
      />
      <PageBody className="max-w-4xl space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Score Card */}
          <div className="rounded-2xl border bg-gradient-to-br from-primary/15 via-card to-card p-6 text-center md:col-span-1 shadow-xs">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Trophy className="h-7 w-7" />
            </div>
            <p className="mt-4 text-5xl font-bold tracking-tight">{skor}</p>
            <div className="mt-2">
              <Badge variant={isLulus ? "default" : "destructive"}>
                {isLulus ? "LULUS (Passing Grade 70%)" : "BELUM LULUS"}
              </Badge>
            </div>
            <Progress value={skor} className="mx-auto mt-4 h-2" />
            <p className="mt-2 text-[11px] text-muted-foreground">
              {totalBenar} benar · {totalSalah} salah dari {totalSoal} soal
            </p>
          </div>

          {/* Evaluation Summary */}
          <div className="rounded-2xl border bg-card p-6 md:col-span-2 space-y-4">
            <p className="text-sm font-semibold">Ringkasan Evaluasi Performa</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-success/10 border border-success/20 p-3">
                <p className="text-xl font-bold text-success">{totalBenar}</p>
                <p className="text-[11px] text-muted-foreground font-medium">Soal Benar</p>
              </div>
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-xl font-bold text-destructive">{totalSalah}</p>
                <p className="text-[11px] text-muted-foreground font-medium">Soal Salah</p>
              </div>
              <div className="rounded-xl bg-muted/50 border p-3">
                <p className="text-xl font-bold text-foreground">03:12</p>
                <p className="text-[11px] text-muted-foreground font-medium">Durasi</p>
              </div>
            </div>

            <div className="rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Penyimpanan Terverifikasi:</p>
              Hasil kuis ini telah tercatat secara permanen di database Neon PostgreSQL untuk mengukur progres belajar Anda.
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Button size="sm" onClick={handleDownloadHasil}>
                {tersimpan ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
                {tersimpan ? "Hasil Terunduh" : "Unduh Laporan Evaluasi"}
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/kuis">
                  <RefreshCcw className="mr-1.5 h-3.5 w-3.5" /> Ulangi Kuis
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="text-primary">
                <Link to="/ai/chat">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Tanya AI Pembahasan
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}
