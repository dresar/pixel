import { createFileRoute, Outlet, useRouterState, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, ChevronRight, CheckCircle2, AlertCircle, Sparkles, Layers, Award, HelpCircle, FileText } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDaftarKuis } from "@/functions/quiz";
import { getDaftarModul } from "@/functions/modules";

export const Route = createFileRoute("/_app/kuis")({
  loader: async () => {
    try {
      const [quizRes, modulRes] = await Promise.all([
        getDaftarKuis(),
        getDaftarModul({ data: { halaman: 1, per_halaman: 50 } }),
      ]);
      return {
        quizList: quizRes.success && quizRes.data ? quizRes.data : [],
        modulesList: modulRes.success && modulRes.data ? modulRes.data : [],
      };
    } catch {
      return { quizList: [], modulesList: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Kuis & Evaluasi Mandiri — BrevetAI" },
      { name: "description", content: "Pilih kuis per modul brevet atau uji kompetensi bebas dengan Pilihan Ganda & Penilaian Esai AI." },
    ],
  }),
  component: KuisLayout,
});

function KuisLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (pathname !== "/kuis" && pathname !== "/kuis/") {
    return <Outlet />;
  }

  return <DaftarKuisView />;
}

function DaftarKuisView() {
  const { quizList, modulesList } = Route.useLoaderData();
  const [tabAktif, setTabAktif] = useState<"SEMUA" | "MODUL" | "BEBAS">("SEMUA");

  const filteredQuizzes = quizList.filter((q: any) => {
    if (tabAktif === "MODUL") return !!q.moduleId;
    if (tabAktif === "BEBAS") return !q.moduleId;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Kuis & Evaluasi Mandiri Perpajakan"
        description="Uji pemahaman materi Brevet Pajak — kuis modul spesifik & uji kompetensi bebas dengan koreksi otomatis Gemini AI."
        breadcrumb={[{ label: "Beranda", to: "/beranda" }, { label: "Kuis" }]}
      />

      <PageBody className="space-y-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Button
            variant={tabAktif === "SEMUA" ? "default" : "outline"}
            size="sm"
            onClick={() => setTabAktif("SEMUA")}
            className="rounded-xl text-xs font-bold"
          >
            🌐 Semua Kuis ({quizList.length})
          </Button>
          <Button
            variant={tabAktif === "MODUL" ? "default" : "outline"}
            size="sm"
            onClick={() => setTabAktif("MODUL")}
            className="rounded-xl text-xs font-bold"
          >
            📘 Kuis per Modul Brevet
          </Button>
          <Button
            variant={tabAktif === "BEBAS" ? "default" : "outline"}
            size="sm"
            onClick={() => setTabAktif("BEBAS")}
            className="rounded-xl text-xs font-bold"
          >
            ⚡ Kuis Bebas & Evaluasi AI
          </Button>
        </div>

        {/* Quizzes List */}
        {filteredQuizzes.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center my-6 shadow-xs space-y-3">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-base font-bold text-foreground">Belum Ada Kuis Tersedia</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Silakan tambahkan kuis modul atau kuis bebas dari Admin Panel.
            </p>
            <Button size="sm" asChild className="font-bold text-xs rounded-xl">
              <Link to="/admin/kuis">Ke Admin Kelola Kuis</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredQuizzes.map((q: any) => {
              const linkedModule = modulesList.find((m: any) => m.id === q.moduleId);
              const slugClean = q.slug || `kuis-${q.id}`;

              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs hover:border-primary/50 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] rounded-full font-mono font-bold border-primary/30 text-primary bg-primary/10">
                        {q.moduleId ? linkedModule ? `📘 Modul: ${linkedModule.judul}` : "📘 Modul Brevet" : "⚡ Kuis Bebas Uji Kompetensi"}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] rounded-full font-bold">
                        {q.tipeKuis || "LATIHAN"}
                      </Badge>
                    </div>

                    <h3 className="text-base font-bold text-foreground leading-snug">{q.judul}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {q.deskripsi || "Evaluasi komprehensif pemahaman aturan perpajakan Indonesia."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary" /> {q.batasWaktuMenit || 15} Menit
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-amber-400" /> Min. {q.nilaiMinimumLulus || 70}%
                      </span>
                    </div>

                    <Button asChild size="sm" className="rounded-xl font-bold text-xs gap-1 shadow-xs">
                      <Link to="/kuis/$slug" params={{ slug: slugClean }}>
                        Mulai Kuis <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageBody>
    </>
  );
}
