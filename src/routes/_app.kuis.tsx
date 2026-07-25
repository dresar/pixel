import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Flag } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { quizQuestion } from "@/lib/dummy";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/kuis")({
  head: () => ({
    meta: [
      { title: "Kuis — BrevetAI" },
      { name: "description", content: "Uji pemahaman materi Brevet Pajak dengan kuis adaptif dan pembahasan." },
    ],
  }),
  component: Kuis,
});

function Kuis() {
  const [selected, setSelected] = useState<string | null>(null);
  const q = quizQuestion;

  return (
    <>
      <PageHeader
        title="Kuis mingguan"
        description="PPh Orang Pribadi · Bab 2 Tarif & Perhitungan"
        breadcrumb={[{ label: "Belajar", to: "/belajar" }, { label: "Kuis" }]}
        actions={
          <div className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span className="tabular-nums">12:34</span>
          </div>
        }
      />
      <PageBody className="max-w-3xl">
        <div className="flex items-center gap-3">
          <Progress value={(q.no / q.total) * 100} className="h-2" />
          <span className="shrink-0 text-xs text-muted-foreground">
            Soal {q.no} / {q.total}
          </span>
        </div>

        <div className="mt-6 rounded-2xl border bg-card p-5 sm:p-7">
          <Badge variant="secondary" className="text-[10px]">Pilihan ganda</Badge>
          <h2 className="mt-3 text-lg font-semibold leading-snug sm:text-xl">{q.question}</h2>

          <div className="mt-5 space-y-2.5">
            {q.options.map((o) => {
              const active = selected === o.key;
              return (
                <button
                  key={o.key}
                  onClick={() => setSelected(o.key)}
                  className={
                    "flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition-colors " +
                    (active
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "hover:bg-accent/40")
                  }
                >
                  <span
                    className={
                      "grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-xs font-semibold " +
                      (active ? "border-primary bg-primary text-primary-foreground" : "bg-muted")
                    }
                  >
                    {o.key}
                  </span>
                  <span className="flex-1">{o.text}</span>
                  {active && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" size="sm">
              <ChevronLeft className="mr-1 h-4 w-4" /> Sebelum
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Flag className="mr-1 h-4 w-4" /> Tandai
              </Button>
              <Button asChild size="sm">
                <Link to="/kuis/hasil">
                  Berikut <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Butuh bantuan?</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            AI dapat menjelaskan konsep tarif progresif tanpa memberikan jawaban langsung.
          </p>
          <Button asChild size="sm" variant="outline" className="mt-3">
            <Link to="/ai/chat">Tanya AI</Link>
          </Button>
        </div>
      </PageBody>
    </>
  );
}
