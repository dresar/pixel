import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, ChevronRight, CheckCircle2, AlertCircle, Sparkles, Loader2, Bot } from "lucide-react";
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
        <PageBody className="max-w-xl text-center py-12">
          <div className="rounded-2xl border bg-card p-8 space-y-4">
            <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground/60" />
            <h2 className="text-base font-semibold">Belum Ada Soal Kuis Tersedia</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Soal kuis belum diunggah ke database. Silakan masuk sebagai Admin untuk menambahkan kuis baru.
            </p>
            <Button size="sm" asChild className="font-bold text-xs">
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
        toast.success("AI Gemini telah mengevaluasi jawaban esai kamu!");
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

  const canProceed = isEssay
    ? Boolean(jawabanEsai[q.id]?.trim())
    : Boolean(jawabanUser[q.id]);

  return (
    <>
      <PageHeader
        title={`Kuis Evaluasi — ${params.slug ? params.slug.replace(/-/g, " ").toUpperCase() : "PAJAK"}`}
        description="Soal evaluasi khusus modul perpajakan ini dari database."
        breadcrumb={[
          { label: "Belajar", to: "/belajar" },
          { label: "Kuis Evaluasi" },
        ]}
        actions={
          <div className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-mono">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>15:00</span>
          </div>
        }
      />
      <PageBody className="max-w-3xl">
        <div className="flex items-center gap-3">
          <Progress value={((index + 1) / questions.length) * 100} className="h-2" />
          <span className="shrink-0 text-xs font-semibold text-muted-foreground">
            Soal {index + 1} dari {questions.length}
          </span>
        </div>

        <div className="mt-6 rounded-2xl border bg-card p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <Badge variant="outline">Brevet A & B</Badge>
            <Badge
              variant={isEssay ? "secondary" : "default"}
              className={`text-[10px] font-bold ${isEssay ? "bg-amber-500/15 text-amber-500 border border-amber-500/30" : ""}`}
            >
              {isEssay ? "✍️ Soal Esai (Ketik)" : "🔘 Pilihan Ganda"}
            </Badge>
          </div>

          <h2 className="text-base font-semibold leading-relaxed sm:text-lg text-foreground">
            {q.pertanyaanTeks}
          </h2>

          {/* Render PILIHAN GANDA */}
          {!isEssay && (
            <div className="space-y-3 pt-2">
              {q.options?.map((o: any, idx: number) => {
                const selected = jawabanUser[q.id] === o.id;
                const letter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={o.id}
                    onClick={() => handlePilih(o.id)}
                    className={
                      "flex w-full items-center gap-3 rounded-xl border p-4 text-left text-xs sm:text-sm transition-all " +
                      (selected
                        ? "border-primary bg-primary/10 font-semibold ring-2 ring-primary/40 shadow-xs text-primary"
                        : "hover:bg-accent/50")
                    }
                  >
                    <span
                      className={
                        "grid h-6 w-6 shrink-0 place-items-center rounded-lg border text-xs font-bold " +
                        (selected ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground")
                      }
                    >
                      {letter}
                    </span>
                    <span className="flex-1">{o.teksOpsi}</span>
                    {selected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Render ESAI (Ngetik Sendiri + AI Evaluator) */}
          {isEssay && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Textarea
                  value={jawabanEsai[q.id] || ""}
                  onChange={(e) => setJawabanEsai({ ...jawabanEsai, [q.id]: e.target.value })}
                  placeholder="Ketikkan jawaban esai kamu secara lengkap di sini..."
                  rows={5}
                  className="font-sans text-xs sm:text-sm bg-background border-primary/30 leading-relaxed focus:ring-2 focus:ring-primary"
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleEvaluasiEsaiAi}
                    disabled={evaluatingAi || !jawabanEsai[q.id]?.trim()}
                    className="font-bold text-xs shadow-xs"
                  >
                    {evaluatingAi ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Bot className="mr-1.5 h-3.5 w-3.5 text-amber-400" />}
                    {evaluatingAi ? "Menganalisis dengan Gemini..." : "⚡ Analisis & Evaluasi AI Gemini"}
                  </Button>
                </div>
              </div>

              {/* AI Feedback Display Card */}
              {aiFeedback[q.id] && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-400" /> Analisis AI Gemini (Bahasa Santai)
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

          {/* Bottom Actions */}
          <div className="mt-7 flex items-center justify-between border-t pt-5">
            <Button
              variant="outline"
              size="sm"
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
            >
              Sebelumnya
            </Button>

            <Button
              size="sm"
              onClick={handleBerikutnya}
              disabled={!canProceed || submitting}
            >
              {index === questions.length - 1 ? "Selesaikan & Simpan Hasil" : "Soal Berikutnya"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </PageBody>
    </>
  );
}
