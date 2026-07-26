import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  Bookmark,
  Highlighter,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Scale,
  Calculator,
  BookOpen,
  Clock,
  Layers,
  Award,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { PageBody } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getKontenPelajaran } from "@/functions/modules";

export const Route = createFileRoute("/_app/belajar/materi/$slug")({
  loader: async ({ params }) => {
    const slug = params.slug || "tarif-pph-pasal-17-op";
    try {
      const res = await getKontenPelajaran({ data: { slug } });
      return { lesson: res.success ? res.data : null, slug };
    } catch {
      return { lesson: null, slug };
    }
  },
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug ? params.slug.replace(/-/g, " ") : "Materi Belajar"} — BrevetAI` },
      { name: "description", content: "Materi edukasi teks dan ilustrasi visual Brevet Pajak A & B." },
    ],
  }),
  component: LessonReaderSlug,
});

function LessonReaderSlug() {
  const navigate = useNavigate();
  const params = useParams({ from: "/_app/belajar/materi/$slug" });
  const { lesson, slug } = Route.useLoaderData();
  const articleRef = useRef<HTMLDivElement>(null);

  const [bookmarkSaved, setBookmarkSaved] = useState(false);
  const [progressVal, setProgressVal] = useState(35);

  const [selectedText, setSelectedText] = useState("");
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const [highlights, setHighlights] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`mod_prog_${slug}`);
    if (saved) {
      setProgressVal(Number(saved));
    }
  }, [slug]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setSelectedText("");
        setToolbarPos(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 2) {
        setSelectedText(text);

        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (rect && rect.width > 0) {
            setToolbarPos({
              top: rect.top + window.scrollY - 45,
              left: Math.max(10, rect.left + window.scrollX + rect.width / 2 - 110),
            });
          }
        } catch {
          // ignore
        }
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("mouseup", handleSelectionChange);
    document.addEventListener("touchend", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("mouseup", handleSelectionChange);
      document.removeEventListener("touchend", handleSelectionChange);
    };
  }, []);

  const handleSorotTeks = () => {
    if (!selectedText) return;
    setHighlights([...highlights, selectedText]);
    setSelectedText("");
    setToolbarPos(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleTanyaAI = () => {
    if (!selectedText) return;
    const promptText = `Tolong jelaskan secara rinci tentang materi perpajakan ini: "${selectedText}"`;
    navigate({ to: "/ai/chat", search: { initialPrompt: promptText } as any });
  };

  const handleLanjutBelajar = () => {
    if (progressVal < 100) {
      setProgressVal(100);
      localStorage.setItem(`mod_prog_${slug}`, "100");
    }
    const quizSlug = `kuis-${lesson?.id || slug}`;
    navigate({ to: "/kuis/$slug", params: { slug: quizSlug } });
  };

  const blocks = Array.isArray(lesson?.kontenJson) ? lesson.kontenJson : [];

  return (
    <div className="relative bg-background min-h-dvh">
      {/* Floating Selection Toolbar */}
      {toolbarPos && selectedText && (
        <div
          style={{ top: `${toolbarPos.top}px`, left: `${toolbarPos.left}px` }}
          className="absolute z-50 flex items-center gap-1.5 rounded-xl border border-border bg-popover p-1.5 shadow-md animate-in fade-in zoom-in-95"
        >
          <Button size="sm" variant="ghost" onClick={handleSorotTeks} className="h-7 text-[11px] px-2 font-bold">
            <Highlighter className="mr-1 h-3.5 w-3.5 text-amber-400" /> Sorot
          </Button>
          <div className="h-3.5 w-px bg-border" />
          <Button size="sm" onClick={handleTanyaAI} className="h-7 text-[11px] px-2 bg-primary text-primary-foreground font-bold">
            <Sparkles className="mr-1 h-3.5 w-3.5" /> Tanya AI
          </Button>
        </div>
      )}

      {/* Reader Header Bar (Full Width Responsive) */}
      <div className="sticky top-14 z-10 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-8 lg:px-12">
          <Button asChild variant="ghost" size="icon" aria-label="Kembali ke Katalog">
            <Link to="/belajar">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs sm:text-sm font-bold text-foreground">
              {(lesson as any)?.modul?.judul || "Materi Pembelajaran Brevet Pajak"}
            </p>
            <Progress value={progressVal} className="mt-1.5 h-1.5 rounded-full" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBookmarkSaved(!bookmarkSaved)}
            className="text-xs font-bold rounded-xl shrink-0"
          >
            <Bookmark className={`mr-1.5 h-4 w-4 ${bookmarkSaved ? "fill-primary text-primary" : ""}`} />
            {bookmarkSaved ? "Tersimpan" : "Simpan Materi"}
          </Button>
        </div>
      </div>

      <PageBody className="max-w-7xl py-8 px-4 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Main Reading Article Body (Full Wide Desktop) */}
          <article ref={articleRef} className="min-w-0 select-text space-y-8">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="outline" className="rounded-full text-xs font-mono font-bold border-primary/40 text-primary bg-primary/10 px-3 py-1">
                📘 {(lesson as any)?.modul?.judul || "Brevet Pajak"}
              </Badge>
              <Badge variant="secondary" className="rounded-full text-xs font-bold px-3 py-1">
                {lesson?.statusPublikasi || "TERBIT"}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary" /> Estimasi baca: {lesson?.estimasiMenit || 15} menit
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
              {lesson?.judul || "Materi Pembelajaran Perpajakan"}
            </h1>

            {/* Attached Lesson Illustration Image (Visual Media) */}
            {lesson?.gambarUrl && (
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="relative aspect-16/9 w-full bg-muted overflow-hidden">
                  <img
                    src={lesson.gambarUrl}
                    alt={lesson.judul}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-3 text-center text-xs font-mono text-muted-foreground bg-muted/20 border-t border-border flex items-center justify-center gap-1.5">
                  <span>📷 Infografis / Ilustrasi Edukasi Visual Perpajakan</span>
                </div>
              </div>
            )}

            {/* Interactive Action Bar */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
              <Button size="sm" variant="ghost" onClick={handleSorotTeks} className="text-xs font-bold rounded-xl">
                <Highlighter className="mr-1.5 h-4 w-4 text-amber-400" /> Sorot Teks Pilihan
              </Button>
              <Button size="sm" variant="ghost" onClick={handleTanyaAI} className="text-xs font-bold text-primary rounded-xl">
                <Sparkles className="mr-1.5 h-4 w-4" /> Minta AI Jelaskan Istilah
              </Button>
            </div>

            {/* Highlights Banner */}
            {highlights.length > 0 && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs space-y-1.5 shadow-2xs">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <Highlighter className="h-4 w-4 text-amber-400" /> Teks Tersorot ({highlights.length}):
                </p>
                {highlights.map((h, i) => (
                  <p key={i} className="text-muted-foreground italic font-serif leading-relaxed">"{h}"</p>
                ))}
              </div>
            )}

            {/* Dynamic Content Blocks Render */}
            <div className="space-y-8 pt-2">
              {blocks.map((b: any, i: number) => (
                <div key={i} className="space-y-4">
                  {b.tipe === "PARAGRAF" && (
                    <p className="text-base sm:text-lg text-foreground/90 leading-relaxed font-sans">{b.data?.teks}</p>
                  )}

                  {b.tipe === "PASAL_HUKUM" && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-2.5 shadow-2xs">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-sm sm:text-base">
                        <Scale className="h-5 w-5 shrink-0" /> {b.data?.undang_undang} • {b.data?.pasal}
                      </div>
                      <p className="text-sm sm:text-base italic text-foreground/95 leading-relaxed font-serif">"{b.data?.bunyi_pasal}"</p>
                    </div>
                  )}

                  {b.tipe === "CONTOH_KASUS" && (
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 space-y-4 shadow-2xs">
                      <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm sm:text-base">
                        <Calculator className="h-5 w-5 shrink-0" /> {b.data?.judul_kasus || "Studi Kasus Perhitungan"}
                      </div>
                      <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">{b.data?.skenario}</p>
                      {b.data?.perhitungan && (
                        <div className="font-mono text-xs sm:text-sm bg-slate-900 text-emerald-400 p-5 rounded-xl border border-slate-700 shadow-xs whitespace-pre-wrap leading-relaxed">
                          {b.data?.perhitungan}
                        </div>
                      )}
                    </div>
                  )}

                  {b.tipe === "GLOSARIUM" && (
                    <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm sm:text-base">
                      <span className="font-bold text-primary">{b.data?.istilah}</span>
                      <span className="text-foreground/90">{b.data?.definisi}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Completion Card */}
            <div className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs">
              <div>
                <h3 className="font-black text-lg text-foreground">
                  {progressVal === 100 ? "Materi Selesai! Uji Pemahaman" : "Selesaikan Materi Ini"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  {progressVal === 100
                    ? "Selamat! Anda telah membaca seluruh materi ini. Lanjut kerjakan kuis evaluasi."
                    : "Klik tombol di samping untuk menandai materi ini tuntas."}
                </p>
              </div>
              <Button onClick={handleLanjutBelajar} className="w-full sm:w-auto shrink-0 rounded-xl font-bold text-xs sm:text-sm h-11 px-6 shadow-xs">
                {progressVal === 100 ? (
                  <>
                    Uji Pemahaman via Kuis <ChevronRight className="ml-1.5 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Lanjutkan Belajar <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </article>

          {/* Dynamic Sidebar (Full Desktop View) */}
          <aside className="space-y-6 hidden lg:block">
            <div className="rounded-2xl border border-border/80 bg-card p-6 sticky top-28 space-y-5 shadow-xs">
              <div className="space-y-2 border-b border-border/60 pb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-primary" /> Informasi Materi
                </p>
                <p className="font-extrabold text-foreground text-sm leading-snug">{lesson?.judul}</p>
                <Badge variant="outline" className="text-[10px] font-mono font-bold rounded-full border-primary/30 text-primary">
                  {(lesson as any)?.modul?.judul || "Brevet Pajak"}
                </Badge>
              </div>

              {/* Dynamic Outline Sections */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Poin Pembahasan Materi:</p>
                <div className="space-y-2 text-xs">
                  {blocks.map((b: any, idx: number) => {
                    if (b.tipe === "PASAL_HUKUM") {
                      return (
                        <div key={idx} className="flex items-center gap-1.5 text-amber-400 font-semibold">
                          <Scale className="h-3.5 w-3.5 shrink-0" /> {b.data?.undang_undang || "Landasan Hukum"}
                        </div>
                      );
                    }
                    if (b.tipe === "CONTOH_KASUS") {
                      return (
                        <div key={idx} className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <Calculator className="h-3.5 w-3.5 shrink-0" /> {b.data?.judul_kasus || "Studi Kasus"}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              <div className="border-t border-border/60 pt-4">
                <Button asChild size="sm" className="w-full text-xs font-bold rounded-xl h-10 shadow-xs">
                  <Link to="/kuis/$slug" params={{ slug: `kuis-${lesson?.id || slug}` }}>
                    ⚡ Uji Pemahaman via Kuis
                  </Link>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </PageBody>
    </div>
  );
}
