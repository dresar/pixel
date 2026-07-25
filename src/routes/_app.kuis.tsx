import { createFileRoute, useNavigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getDetailKuis, kirimHasilKuis } from "@/functions/quiz";

export const Route = createFileRoute("/_app/kuis")({
  loader: async () => {
    try {
      const res = await getDetailKuis({ data: {} });
      return { quizData: res.success && res.data ? res.data : null };
    } catch {
      return { quizData: null };
    }
  },
  head: () => ({
    meta: [
      { title: "Kuis Perpajakan — BrevetAI" },
      { name: "description", content: "Uji pemahaman materi Brevet Pajak dengan kuis adaptif dan pembahasan." },
    ],
  }),
  component: KuisLayout,
});

function KuisLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // If subroute like /kuis/hasil is active, render Outlet!
  if (pathname !== "/kuis" && pathname !== "/kuis/") {
    return <Outlet />;
  }

  return <KuisComponent />;
}

function KuisComponent() {
  const navigate = useNavigate();
  const { quizData } = Route.useLoaderData();
  const [index, setIndex] = useState(0);
  const [jawabanUser, setJawabanUser] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const questions = quizData?.questions || [];
  const q = questions[index];

  if (!q) {
    return (
      <>
        <PageHeader title="Kuis Evaluasi" description="Pengerjaan kuis evaluasi materi Brevet Pajak." />
        <PageBody className="max-w-xl text-center py-12">
          <div className="rounded-2xl border bg-card p-8">
            <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-base font-semibold">Belum Ada Soal Kuis Tersedia</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Soal kuis belum diunggah ke database. Silakan masuk sebagai Admin untuk menambahkan kuis baru.
            </p>
          </div>
        </PageBody>
      </>
    );
  }

  const handlePilih = (optionId: string) => {
    setJawabanUser({ ...jawabanUser, [q.id]: optionId });
  };

  const handleBerikutnya = async () => {
    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else {
      setSubmitting(true);
      let totalPoin = 0;
      let dapaPoin = 0;

      questions.forEach((question: any) => {
        totalPoin += question.poin || 20;
        const userChoiceId = jawabanUser[question.id];
        const correctOpt = question.options?.find((o: any) => o.adalahBenar);
        if (userChoiceId && correctOpt && userChoiceId === correctOpt.id) {
          dapaPoin += question.poin || 20;
        }
      });

      const nilaiPersen = Math.round((dapaPoin / Math.max(totalPoin, 1)) * 100);
      const isLulus = nilaiPersen >= 70;

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
        // Fallback local state if session issues
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
        title="Kuis Evaluasi Brevet Pajak A & B"
        description="Soal evaluasi resmi yang diambil dari database platform BrevetAI."
        breadcrumb={[{ label: "Belajar", to: "/belajar" }, { label: "Kuis" }]}
        actions={
          <div className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-mono">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>12:00</span>
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

        <div className="mt-6 rounded-2xl border bg-card p-5 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between">
            <Badge variant="outline">KUP & PPh</Badge>
            <Badge variant="secondary" className="text-[10px]">Pilihan Ganda</Badge>
          </div>

          <h2 className="mt-4 text-base font-semibold leading-relaxed sm:text-lg">
            {q.pertanyaanTeks}
          </h2>

          <div className="mt-6 space-y-3">
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
              disabled={!jawabanUser[q.id] || submitting}
            >
              {index === questions.length - 1 ? "Selesaikan & Simpan ke DB" : "Soal Berikutnya"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </PageBody>
    </>
  );
}
