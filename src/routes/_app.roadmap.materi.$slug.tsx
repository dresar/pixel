import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Sparkles,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Scale,
  Calculator,
  BookOpen,
  Clock,
  Award,
  Play,
  FileText,
  GraduationCap,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { PageHeader, PageBody } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getKontenPelajaran, getRealtimeRoadmapData, getDaftarMateriSiswa } from "@/functions/modules";

export const Route = createFileRoute("/_app/roadmap/materi/$slug")({
  loader: async ({ params }) => {
    const slug = (params.slug || "apa-itu-pajak").toLowerCase();
    try {
      const lessonRes = await getKontenPelajaran({ data: { slug } });
      if (lessonRes && lessonRes.success && lessonRes.data) {
        return {
          viewType: "LESSON" as const,
          lesson: lessonRes.data,
          slug,
        };
      }
    } catch {
      // ignore
    }

    try {
      const [roadmapRes, lessonsRes] = await Promise.all([
        getRealtimeRoadmapData(),
        getDaftarMateriSiswa(),
      ]);

      const modules = roadmapRes.success && roadmapRes.data ? roadmapRes.data.modules : [];
      const allLessons = lessonsRes.success && lessonsRes.data ? lessonsRes.data : [];

      const currentModule = modules.find(
        (m: any) =>
          m.slug?.toLowerCase() === slug ||
          m.id === slug ||
          (m.title && m.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") === slug)
      ) || modules[0] || {
        id: "default",
        code: "BREVET-A",
        title: "Modul Perpajakan Brevet A/B",
        description: "Modul pembelajaran komprehensif Ketentuan Umum, PPh, PPN, dan Administrasi Perpajakan.",
        difficulty: "DASAR",
        totalLessons: allLessons.length,
        duration: "60 Menit",
        xpReward: 200,
        progress: 0,
      };

      const moduleLessons = allLessons.filter((l: any) => {
        if (!currentModule || !currentModule.id) return true;
        return (
          l.moduleId === currentModule.id ||
          (l.modulJudul && currentModule.title && l.modulJudul.toLowerCase() === currentModule.title.toLowerCase())
        );
      });

      return {
        viewType: "MODULE" as const,
        slug,
        module: currentModule,
        lessons: moduleLessons.length > 0 ? moduleLessons : allLessons,
      };
    } catch {
      return {
        viewType: "MODULE" as const,
        slug,
        module: {
          id: "default",
          code: "BREVET-A",
          title: "Modul Perpajakan Brevet A/B",
          description: "Modul pembelajaran komprehensif Ketentuan Umum, PPh, PPN, dan Administrasi Perpajakan.",
          difficulty: "DASAR",
          totalLessons: 0,
          duration: "60 Menit",
          xpReward: 200,
          progress: 0,
        },
        lessons: [],
      };
    }
  },
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug ? params.slug.replace(/-/g, " ") : "Materi Pembelajaran"} — BrevetAI` },
      { name: "description", content: "Materi edukasi teks, ilustrasi visual, dan simulasi kasus Brevet Pajak A & B." },
    ],
  }),
  component: RoadmapMateriSlugPage,
});

function RoadmapMateriSlugPage() {
  const data = Route.useLoaderData();

  if (data.viewType === "LESSON" && data.lesson) {
    return <LessonReaderView lesson={data.lesson} slug={data.slug} />;
  }

  return <ModuleOverviewView module={data.module} lessons={data.lessons} slug={data.slug} />;
}

// ── TAMPILAN READ MATERI LENGKAP (TIGHTLY DOCKED UNDER HEADER) ───────────────
function LessonReaderView({ lesson, slug }: { lesson: any; slug: string }) {
  const navigate = useNavigate();
  const articleRef = useRef<HTMLDivElement>(null);
  const [progressVal, setProgressVal] = useState(35);

  useEffect(() => {
    const saved = localStorage.getItem(`mod_prog_${slug}`);
    if (saved) {
      setProgressVal(Number(saved));
    }
  }, [slug]);

  const handleLanjutBelajar = () => {
    if (progressVal < 100) {
      setProgressVal(100);
      localStorage.setItem(`mod_prog_${slug}`, "100");
    }
    const quizSlug = `kuis-${lesson?.id || slug}`;
    navigate({ to: "/kuis/$slug", params: { slug: quizSlug } });
  };

  const rawJson = lesson?.kontenJson;
  const blocks: any[] = Array.isArray(rawJson)
    ? rawJson
    : Array.isArray(rawJson?.blok_konten)
      ? rawJson.blok_konten
      : Array.isArray(rawJson?.blokKonten)
        ? rawJson.blokKonten
        : typeof rawJson === "string"
          ? [{ tipe: "PARAGRAF", data: { teks: rawJson } }]
          : [];
  const modulJudul = (lesson as any)?.modul?.judul || lesson?.modulJudul || "Modul Perpajakan Brevet A/B";

  return (
    <>
      {/* Docked Sub-Header dengan Tombol Mengarah ke Chat AI */}
      <PageHeader
        title={lesson?.judul || "Materi Pembelajaran Perpajakan"}
        description={`Modul: ${modulJudul}`}
        breadcrumb={[
          { label: "Beranda", to: "/beranda" },
          { label: "Roadmap Kurikulum", to: "/roadmap" },
          { label: lesson?.judul || "Materi" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              className="rounded-xl font-bold text-xs gap-1.5 bg-gradient-to-r from-primary via-blue-600 to-amber-500 text-white shadow-xs hover:opacity-95"
            >
              <Link to="/ai/chat" search={{ lesson: slug, title: lesson?.judul }}>
                <Sparkles className="h-4 w-4" /> Asisten BrevetAI
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl font-bold text-xs gap-1.5 border-border hover:bg-accent shrink-0 shadow-2xs">
              <Link to="/roadmap">
                <ArrowLeft className="h-4 w-4 text-primary" /> Kembali ke Roadmap
              </Link>
            </Button>
          </div>
        }
      />

      {/* Reading Body (Tightly Docked Under Header, Minimal Gap) */}
      <PageBody className="w-full max-w-5xl mx-auto pt-3 pb-8 px-4 sm:px-6">
        <article ref={articleRef} className="min-w-0 select-text space-y-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="outline" className="rounded-full text-xs font-mono font-bold border-primary/40 text-primary bg-primary/10 px-3 py-1">
              📘 {modulJudul}
            </Badge>
            <Badge variant="secondary" className="rounded-full text-xs font-bold px-3 py-1">
              {lesson?.statusPublikasi || "TERBIT"}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-primary" /> Estimasi baca: {lesson?.estimasiMenit || 15} menit
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight text-foreground leading-tight">
            {lesson?.judul || "Materi Pembelajaran Perpajakan"}
          </h1>

          {/* Media Gambar Ilustrasi Materi */}
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

          {/* Blok Konten Pembelajaran (Semua 7 Tipe Block) */}
          <div className="space-y-6 pt-1">
            {blocks.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <p className="text-base sm:text-lg text-foreground/90 leading-relaxed font-sans">
                  {lesson?.deskripsi || "Materi edukasi perpajakan mengenai konsep dasar, ketentuan UU KUP, UU HPP No. 7/2021, dan PMK 168/2023 TER."}
                </p>
              </div>
            ) : (
              blocks.map((b: any, i: number) => (
                <div key={i} className="space-y-4">
                  {b.tipe === "PARAGRAF" && (
                    <p className="text-base sm:text-lg xl:text-xl text-foreground/90 leading-relaxed font-sans">{b.data?.teks}</p>
                  )}

                  {b.tipe === "STORY_HOOK" && (
                    <div className="rounded-2xl border-2 border-primary/30 bg-primary/10 p-6 space-y-3 shadow-xs">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm sm:text-base">
                        <Sparkles className="h-5 w-5 shrink-0" /> Gambaran Umum & Story Hook
                      </div>
                      <p className="text-base sm:text-lg text-foreground/95 leading-relaxed font-sans">{b.data?.narasi || b.data?.teks}</p>
                    </div>
                  )}

                  {b.tipe === "POIN_KUNCI" && (
                    <div className="rounded-2xl border-2 border-blue-500/30 bg-blue-500/10 p-6 space-y-3 shadow-xs">
                      <div className="flex items-center gap-2 text-blue-400 font-bold text-sm sm:text-base">
                        <Award className="h-5 w-5 shrink-0" /> Poin Kunci Pembelajaran
                      </div>
                      <p className="text-base sm:text-lg text-foreground/95 leading-relaxed font-sans whitespace-pre-wrap">{b.data?.teks}</p>
                    </div>
                  )}

                  {b.tipe === "PASAL_HUKUM" && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 space-y-3 shadow-2xs">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-sm sm:text-base">
                        <Scale className="h-5 w-5 shrink-0" /> {b.data?.undang_undang} • {b.data?.pasal}
                      </div>
                      <p className="text-base sm:text-lg italic text-foreground/95 leading-relaxed font-serif">"{b.data?.bunyi_pasal}"</p>
                    </div>
                  )}

                  {b.tipe === "CONTOH_KASUS" && (
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 space-y-4 shadow-2xs">
                      <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm sm:text-base">
                        <Calculator className="h-5 w-5 shrink-0" /> {b.data?.judul_kasus || "Studi Kasus Perhitungan"}
                      </div>
                      <p className="text-base sm:text-lg text-foreground/90 leading-relaxed">{b.data?.skenario}</p>
                      {b.data?.perhitungan && (
                        <div className="font-mono text-xs sm:text-sm xl:text-base bg-slate-900 text-emerald-400 p-5 rounded-xl border border-slate-700 shadow-xs whitespace-pre-wrap leading-relaxed">
                          {b.data?.perhitungan}
                        </div>
                      )}
                    </div>
                  )}

                  {b.tipe === "GLOSARIUM" && (
                    <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-base sm:text-lg">
                      <span className="font-bold text-primary">{b.data?.istilah}</span>
                      <span className="text-foreground/90">{b.data?.definisi}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Ringkasan Informasi Materi */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" /> Informasi & Ringkasan Materi
              </p>
              <Badge variant="outline" className="text-[10px] font-mono font-bold rounded-full border-primary/30 text-primary">
                {modulJudul}
              </Badge>
            </div>
            <h3 className="font-extrabold text-foreground text-base leading-snug">{lesson?.judul}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{lesson?.deskripsi}</p>
          </div>

          {/* Kartu Penuntasan Pembelajaran */}
          <div className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs">
            <div>
              <h3 className="font-black text-lg sm:text-xl text-foreground">
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
      </PageBody>
    </>
  );
}

// ── TAMPILAN OVERVIEW MODUL ───────────────────────────────────────────────────
function ModuleOverviewView({ module, lessons, slug }: { module: any; lessons: any[]; slug: string }) {
  const firstLessonSlug = lessons.length > 0 ? lessons[0].slug : "apa-itu-pajak";

  return (
    <>
      <PageHeader
        title={module.title || "Modul Kurikulum Brevet Pajak"}
        description={module.description || "Silabus dan kurikulum lengkap Brevet Pajak A & B"}
        breadcrumb={[
          { label: "Beranda", to: "/beranda" },
          { label: "Roadmap Kurikulum", to: "/roadmap" },
          { label: module.title || "Modul" },
        ]}
        actions={
          <Button asChild variant="outline" size="sm" className="rounded-xl font-bold text-xs gap-1.5 border-border hover:bg-accent shrink-0 shadow-2xs">
            <Link to="/roadmap">
              <ArrowLeft className="h-4 w-4 text-primary" /> Kembali ke Roadmap
            </Link>
          </Button>
        }
      />

      <PageBody className="w-full max-w-full py-6 px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-8">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge variant="outline" className="rounded-full font-mono text-xs font-bold border-primary/40 text-primary bg-primary/10 px-3 py-1">
                  {module.code || "BREVET-A"}
                </Badge>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-primary" /> {module.duration || "60 Menit"}</span>
                  <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4 text-amber-500" /> {module.xpReward || 200} XP</span>
                </div>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{module.title}</h1>
                <p className="text-muted-foreground text-sm sm:text-base mt-2 leading-relaxed">{module.description}</p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="lg" className="rounded-xl font-bold text-xs sm:text-sm h-11 px-6 shadow-xs">
                  <Link to="/roadmap/materi/$slug" params={{ slug: firstLessonSlug }}>
                    <Play className="mr-2 h-4 w-4" /> Mulai Pelajaran Pertama
                  </Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Daftar Bab & Materi Pembelajaran ({lessons.length})
              </h3>

              <div className="grid gap-3">
                {lessons.map((les: any, index: number) => (
                  <div
                    key={les.id || index}
                    className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex items-center justify-between gap-4 hover:border-primary/50 transition-all shadow-2xs group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate">
                          {les.judul}
                        </h4>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {les.estimasiMenit || 15} Menit • {les.statusPublikasi || "TERBIT"}
                        </p>
                      </div>
                    </div>

                    <Button asChild size="sm" variant="outline" className="rounded-xl font-bold text-xs shrink-0 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Link to="/roadmap/materi/$slug" params={{ slug: les.slug || les.id }}>
                        Baca Materi <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border/80 bg-card p-6 sticky top-28 space-y-5 shadow-xs">
              <h3 className="font-extrabold text-base text-foreground border-b border-border/60 pb-3">Ringkasan Kurikulum</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Tingkat Kesulitan:</span>
                  <Badge variant="secondary" className="font-bold text-[10px]">{module.difficulty || "DASAR"}</Badge>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Jumlah Materi:</span>
                  <span className="font-bold font-mono text-foreground">{lessons.length} Bab</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Estimasi Waktu:</span>
                  <span className="font-bold font-mono text-foreground">{module.duration || "60 Menit"}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Hadiah XP:</span>
                  <span className="font-bold font-mono text-amber-500">+{module.xpReward || 200} XP</span>
                </div>
              </div>

              <Button asChild className="w-full rounded-xl font-bold text-xs h-11 shadow-xs">
                <Link to="/roadmap/materi/$slug" params={{ slug: firstLessonSlug }}>
                  Mulai Sekarang <ChevronRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </PageBody>
    </>
  );
}
