import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, ChevronRight, CheckCircle2, AlertCircle, Sparkles, Loader2, Bot, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { getDetailKuis, kirimHasilKuis, evaluasiJawabanEsaiAI } from "@/functions/quiz";

export const Route = createFileRoute("/_app/belajar/materi/$slug/quiz")({
  loader: async () => {
    try {
      const res = await getDetailKuis({ data: {} });
      return { quizData: res.success && res.data ? res.data : null };
    } catch {
      return { quizData: null };
    }
  },
  head: ({ params }) => ({
    meta: [
      { title: `Kuis ${params.slug ? params.slug.replace(/-/g, " ") : "Materi"} — BrevetAI` },
      { name: "description", content: "Kuis evaluasi modul perpajakan." },
    ],
  }),
  component: LessonQuiz,
});

function LessonQuiz() {
  const navigate = useNavigate();
  const params = useParams({ from: "/_app/belajar/materi/$slug/quiz" });
  const { quizData } = Route.useLoaderData();
  const [index, setIndex] = useState(0);
  const [jawabanUser, setJawabanUser] = useState<Record<string, string>>({});
  const [jawabanEsai, setJawabanEsai] = useState<Record<string, string>>({});
  const [aiFeedback, setAiFeedback] = useState<Record<string, { skor: number; umpanBalik: string; lulus: boolean }>>({});
  const [evaluatingAi, setEvaluatingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const questions = quizData?.questions || [];
  const q = questions[index];

  if (!q) {
    return (
      <>
        <PageHeader title="Kuis Evaluasi Modul" description={`Evaluasi materi ${params.slug}`} />
        <PageBody className="w-full max-w-xl mx-auto text-center py-12">
          <div className="rounded-2xl border bg-card p-8 space-y-4 shadow-xs">
            <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground/60" />
            <h2 className="text-base font-bold text-foreground">Belum Ada Soal Kuis Tersedia</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Soal kuis belum diunggah ke database. Silakan masuk sebagai Admin untuk menambahkan kuis baru.
            </p>
            <Button size="sm" asChild className="font-bold text-xs rounded-xl">
              <Link to="/admin/kuis">Ke Admin Kelola Kuis</Link>
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
        toast.success("Asisten BrevetAI telah mengevaluasi jawaban esai kamu!");
      } else {
        toast.error(res.message || "Gagal mengevaluasi jawaban esai");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi ke server AI");
    } finally {
      setEvaluatingAi(false);
    }
  };

  const handleBerikutnya = async () => {
    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else {
      setSubmitting(true);
      let totalPoin = 0;
      let dapaPoin = 0;

      questions.forEach((question: any) => {
        const questionIsEssay = question.tipePertanyaan === "ESAI" || (!question.options || question.options.length === 0);
        totalPoin += question.poin || 20;

        if (questionIsEssay) {
          const feedback = aiFeedback[question.id];
          if (feedback) {
            dapaPoin += Math.round(((question.poin || 20) * feedback.skor) / 100);
          } else if (jawabanEsai[question.id]?.trim()) {
            dapaPoin += Math.round((question.poin || 20) * 0.75);
          }
        } else {
          const userChoiceId = jawabanUser[question.id];
          const correctOpt = question.options?.find((o: any) => o.adalahBenar);
          if (userChoiceId && correctOpt && userChoiceId === correctOpt.id) {
            dapaPoin += question.poin || 20;
          }
        }
      });

      const nilaiPersen = Math.round((dapaPoin / Math.max(totalPoin, 1)) * 100);
      const isLulus = nilaiPersen >= (quizData?.quiz?.nilaiMinimumLulus || 70);

      try {
        await kirimHasilKuis({
          data: {
            quizId: quizData?.quizId || "",
            skor: dapaPoin,
            nilaiPersen,
            lulus: isLulus,
            durasiDetik: 180,
          },
        });
      } catch {
        // Fallback
      } finally {
        sessionStorage.setItem("last_quiz_score", String(nilaiPersen));
        sessionStorage.setItem("last_quiz_total", String(questions.length));
        setSubmitting(false);
        navigate({ to: "/kuis/hasil" });
      }
    }
  };

  return (
    <>
      <PageHeader
        title={`Kuis Evaluasi — ${params.slug ? params.slug.replace(/-/g, " ").toUpperCase() : "PAJAK"}`}
        description="Soal evaluasi khusus modul perpajakan ini."
        breadcrumb={[
          { label: "Belajar", to: "/belajar" },
          { label: "Kuis Evaluasi" },
        ]}
        actions={
          <Button variant="outline" size="sm" asChild className="rounded-xl font-bold text-xs">
            <Link to="/kuis"><ArrowLeft className="mr-1 h-3.5 w-3.5" /> Kembali</Link>
          </Button>
        }
      />
      <PageBody className="w-full max-w-3xl mx-auto space-y-6 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs rounded-full font-mono font-bold border-primary/40 text-primary bg-primary/10 px-3 py-1">
              Soal {index + 1} dari {questions.length}
            </Badge>
            <Badge variant="secondary" className="text-xs rounded-full font-bold px-3 py-1">
              {isEssay ? "✍️ Soal Esai" : "🔘 Pilihan Ganda"}
            </Badge>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground font-semibold bg-muted/30 px-3 py-1 rounded-full border">
            <Clock className="h-3.5 w-3.5 text-primary" /> 15:00
          </span>
        </div>

        <Progress value={((index + 1) / questions.length) * 100} className="h-2 rounded-full" />

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm space-y-6">
          <h2 className="text-base sm:text-lg font-bold text-foreground leading-relaxed sm:leading-relaxed">
            {q.pertanyaanTeks}
          </h2>

          {/* Render PILIHAN GANDA */}
          {!isEssay && (
            <div className="space-y-3">
              {q.options?.map((o: any, idx: number) => {
                const selected = jawabanUser[q.id] === o.id;
                const letter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={o.id}
                    onClick={() => handlePilih(o.id)}
                    className={
                      "w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-3 " +
                      (selected
                        ? "border-primary bg-primary/10 text-primary shadow-xs ring-2 ring-primary/40"
                        : "border-border bg-card hover:border-primary/50 text-foreground")
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={
                          "grid h-7 w-7 shrink-0 place-items-center rounded-xl border text-xs font-black " +
                          (selected ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground")
                        }
                      >
                        {letter}
                      </span>
                      <span className="leading-normal">{o.teksOpsi}</span>
                    </div>
                    {selected && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Render ESAI (Ngetik Sendiri + AI Evaluator) */}
          {isEssay && (
            <div className="space-y-4">
              <Textarea
                value={jawabanEsai[q.id] || ""}
                onChange={(e) => setJawabanEsai({ ...jawabanEsai, [q.id]: e.target.value })}
                placeholder="Ketikkan jawaban esai kamu secara lengkap di sini..."
                rows={5}
                className="font-sans text-xs sm:text-sm bg-background border-border p-4 leading-relaxed focus:ring-2 focus:ring-primary rounded-2xl"
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleEvaluasiEsaiAi}
                  disabled={evaluatingAi || !jawabanEsai[q.id]?.trim()}
                  className="font-bold text-xs rounded-xl shadow-xs gap-1.5"
                >
                  {evaluatingAi ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bot className="h-3.5 w-3.5 text-amber-400" />}
                  {evaluatingAi ? "Menganalisis dengan Asisten AI..." : "⚡ Analisis & Evaluasi Asisten BrevetAI"}
                </Button>
              </div>

              {/* AI Feedback Display Card */}
              {aiFeedback[q.id] && (
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-400" /> Analisis Asisten BrevetAI
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs font-bold ${
                        aiFeedback[q.id].skor >= 70
                          ? "bg-success/15 text-success border-success/40"
                          : "bg-amber-500/15 text-amber-500 border-amber-500/40"
                      }`}
                    >
                      Skor AI: {aiFeedback[q.id].skor} / 100
                    </Badge>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground font-medium">
                    {aiFeedback[q.id].umpanBalik}
                  </p>
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

          <Button
            onClick={handleBerikutnya}
            disabled={submitting}
            className="rounded-2xl text-xs sm:text-sm font-bold gap-1.5 px-6 py-2.5 shadow-md"
          >
            {index < questions.length - 1 ? (
              <>Selanjutnya <ChevronRight className="h-4 w-4" /></>
            ) : (
              submitting ? "Menyimpan..." : "Kirim Hasil Kuis"
            )}
          </Button>
        </div>
      </PageBody>
    </>
  );
}
