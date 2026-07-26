import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, ChevronRight, CheckCircle2, AlertCircle, Sparkles, Loader2, Bot, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { getKuisBySlug, kirimHasilKuis, evaluasiJawabanEsaiAI } from "@/functions/quiz";

export const Route = createFileRoute("/_app/kuis/$slug")({
  loader: async ({ params }) => {
    try {
      const res = await getKuisBySlug({ data: { slug: params.slug } });
      return { quizData: res.success && res.data ? res.data : null };
    } catch {
      return { quizData: null };
    }
  },
  head: ({ params }) => ({
    meta: [{ title: `Kuis ${params.slug} — BrevetAI` }],
  }),
  component: KuisDetailBySlug,
});

function KuisDetailBySlug() {
  const navigate = useNavigate();
  const { quizData } = Route.useLoaderData();
  const [index, setIndex] = useState(0);
  const [jawabanUser, setJawabanUser] = useState<Record<string, string>>({});
  const [jawabanEsai, setJawabanEsai] = useState<Record<string, string>>({});
  const [aiFeedback, setAiFeedback] = useState<Record<string, { skor: number; umpanBalik: string; lulus: boolean }>>({});
  const [evaluatingAi, setEvaluatingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const quiz = quizData?.quiz;
  const questions = quizData?.questions || [];
  const q = questions[index];

  if (!quiz || !q) {
    return (
      <>
        <PageHeader title="Kuis Evaluasi" description="Evaluasi pemahaman materi Brevet Pajak." />
        <PageBody className="w-full max-w-xl mx-auto text-center py-12">
          <div className="rounded-2xl border bg-card p-8 space-y-4 shadow-xs">
            <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground/60" />
            <h2 className="text-base font-bold text-foreground">Kuis Tidak Ditemukan atau Belum Ada Soal</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Soal untuk kuis ini belum diunggah. Silakan pilih kuis lain atau tambahkan dari Admin Panel.
            </p>
            <Button size="sm" asChild className="font-bold text-xs rounded-xl">
              <Link to="/kuis">Kembali ke Daftar Kuis</Link>
            </Button>
          </div>
        </PageBody>
      </>
    );
  }

  const isEssay = q.tipePertanyaan === "ESAI" || (!q.options || q.options.length === 0);

  const handlePilih = (optionId: string) => {
    setJawabanUser({ ...jawabanUser, [q.id]: optionId });
  };

  const handleEvaluasiEsaiAi = async () => {
    const teksInput = jawabanEsai[q.id]?.trim();
    if (!teksInput) {
      toast.error("Tuliskan jawaban esai kamu terlebih dahulu sebelum dianalisis AI!");
      return;
    }

    setEvaluatingAi(true);
    try {
      const res = await evaluasiJawabanEsaiAI({
        data: {
          questionId: q.id,
          jawabanSiswa: teksInput,
        },
      });

      if (res.success && res.data) {
        setAiFeedback({
          ...aiFeedback,
          [q.id]: {
            skor: res.data.skor,
            umpanBalik: res.data.umpanBalik,
            lulus: res.data.lulus,
          },
        });
        toast.success(`Evaluasi AI Selesai! Skor: ${res.data.skor}/100`);
      } else {
        toast.error("Gagal meminta evaluasi dari AI.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi AI.");
    } finally {
      setEvaluatingAi(false);
    }
  };

  const handleSelesai = async () => {
    setSubmitting(true);
    let totalSkor = 0;

    questions.forEach((question: any) => {
      if (question.tipePertanyaan === "ESAI" || (!question.options || question.options.length === 0)) {
        const feedback = aiFeedback[question.id];
        if (feedback) {
          totalSkor += (feedback.skor / 100) * (question.poin || 1);
        }
      } else {
        const selectedId = jawabanUser[question.id];
        const correctOpt = question.options?.find((o: any) => o.adalahBenar);
        if (selectedId && correctOpt && selectedId === correctOpt.id) {
          totalSkor += question.poin || 1;
        }
      }
    });

    const maxSkor = questions.reduce((acc: number, item: any) => acc + (item.poin || 1), 0);
    const nilaiPersen = Math.round((totalSkor / (maxSkor || 1)) * 100);
    const minLulus = quiz.nilaiMinimumLulus || 70;
    const lulus = nilaiPersen >= minLulus;

    try {
      await kirimHasilKuis({
        data: {
          quizId: quiz.id,
          skor: totalSkor,
          nilaiPersen,
          lulus,
          durasiDetik: 120,
        },
      });
      toast.success(lulus ? "Selamat! Kamu LULUS kuis ini!" : "Kuis selesai. Tetap semangat belajar lagi!");
      navigate({ to: "/kuis" });
    } catch {
      toast.error("Gagal menyimpan hasil kuis.");
    } finally {
      setSubmitting(false);
    }
  };

  const pct = Math.round(((index + 1) / questions.length) * 100);

  return (
    <>
      <PageHeader
        title={quiz.judul}
        description="Evaluasi pemahaman materi perpajakan Indonesia."
        breadcrumb={[{ label: "Beranda", to: "/beranda" }, { label: "Kuis", to: "/kuis" }, { label: quiz.slug }]}
        actions={
          <Button variant="outline" size="sm" asChild className="rounded-xl font-bold text-xs">
            <Link to="/kuis"><ArrowLeft className="mr-1 h-3.5 w-3.5" /> Kembali</Link>
          </Button>
        }
      />

      <PageBody className="w-full max-w-3xl mx-auto space-y-6 px-4 sm:px-6 py-4">
        {/* Header Progress & Status */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs rounded-full font-mono font-bold border-primary/40 text-primary bg-primary/10 px-3 py-1">
              Soal {index + 1} dari {questions.length}
            </Badge>
            <Badge variant="secondary" className="text-xs rounded-full font-bold px-3 py-1">
              {isEssay ? "Soal Uraian / Esai AI" : "Pilihan Ganda"}
            </Badge>
          </div>
          {quiz.batasWaktuMenit && (
            <span className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground font-semibold bg-muted/30 px-3 py-1 rounded-full border">
              <Clock className="h-3.5 w-3.5 text-primary" /> {quiz.batasWaktuMenit} menit
            </span>
          )}
        </div>

        <Progress value={pct} className="h-2 rounded-full" />

        {/* Question Card */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm space-y-6">
          <h3 className="text-base sm:text-lg font-bold text-foreground leading-relaxed sm:leading-relaxed">
            {q.pertanyaanTeks}
          </h3>

          {/* Render Options if Multiple Choice */}
          {!isEssay && (
            <div className="space-y-3">
              {q.options?.map((o: any, idx: number) => {
                const checked = jawabanUser[q.id] === o.id;
                const letter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={o.id}
                    onClick={() => handlePilih(o.id)}
                    className={
                      "w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-3 " +
                      (checked
                        ? "border-primary bg-primary/10 text-primary shadow-xs ring-2 ring-primary/40"
                        : "border-border bg-card hover:border-primary/50 text-foreground")
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={
                          "grid h-7 w-7 shrink-0 place-items-center rounded-xl border text-xs font-black " +
                          (checked ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground")
                        }
                      >
                        {letter}
                      </span>
                      <span className="leading-normal">{o.teksOpsi}</span>
                    </div>
                    {checked && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Render Textarea if Essay */}
          {isEssay && (
            <div className="space-y-4">
              <Textarea
                rows={5}
                placeholder="Ketikkan jawaban esai lengkap kamu di sini..."
                value={jawabanEsai[q.id] || ""}
                onChange={(e) => setJawabanEsai({ ...jawabanEsai, [q.id]: e.target.value })}
                className="rounded-2xl text-xs sm:text-sm bg-background border-border p-4 leading-relaxed focus:ring-2 focus:ring-primary"
              />

              <Button
                type="button"
                onClick={handleEvaluasiEsaiAi}
                disabled={evaluatingAi || !jawabanEsai[q.id]?.trim()}
                variant="outline"
                className="w-full rounded-2xl text-xs sm:text-sm font-bold gap-2 border-primary/40 text-primary hover:bg-primary/10 py-5"
              >
                {evaluatingAi ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Bot className="h-4 w-4 text-primary" />}
                {evaluatingAi ? "Asisten BrevetAI sedang menilai esai..." : "⚡ Nilai Jawaban Esai via Asisten BrevetAI"}
              </Button>

              {aiFeedback[q.id] && (
                <div
                  className={
                    "p-4 sm:p-5 rounded-2xl border space-y-2 text-xs sm:text-sm " +
                    (aiFeedback[q.id].lulus
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-400")
                  }
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4" /> Skor Penilaian AI: {aiFeedback[q.id].skor}/100
                    </span>
                    <Badge variant={aiFeedback[q.id].lulus ? "default" : "secondary"} className="text-xs font-bold rounded-lg px-2.5 py-0.5">
                      {aiFeedback[q.id].lulus ? "LULUS" : "PERLU PERBAIKAN"}
                    </Badge>
                  </div>
                  <p className="leading-relaxed text-foreground/90 font-medium">{aiFeedback[q.id].umpanBalik}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <Button
            variant="outline"
            onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
            disabled={index === 0}
            className="rounded-2xl text-xs sm:text-sm font-bold px-6 py-2.5 border-border hover:bg-accent"
          >
            Sebelumnya
          </Button>

          {index < questions.length - 1 ? (
            <Button onClick={() => setIndex((prev) => prev + 1)} className="rounded-2xl text-xs sm:text-sm font-bold gap-1.5 px-6 py-2.5 shadow-md">
              Selanjutnya <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSelesai} disabled={submitting} className="rounded-2xl text-xs sm:text-sm font-bold bg-success hover:bg-success/90 text-success-foreground px-6 py-2.5 shadow-md">
              {submitting ? "Menyimpan..." : "Kirim Hasil Kuis"}
            </Button>
          )}
        </div>
      </PageBody>
    </>
  );
}
