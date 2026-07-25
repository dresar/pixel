import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bookmark,
  Highlighter,
  StickyNote,
  Sparkles,
  ArrowLeft,
  Info,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { PageBody } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getKontenPelajaran } from "@/functions/modules";
import { z } from "zod";

const searchSchema = z.object({
  slug: z.string().optional(),
  id: z.string().optional(),
});

export const Route = createFileRoute("/_app/belajar/materi")({
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  loader: async () => {
    try {
      const res = await getKontenPelajaran({ data: { slug: "tarif-pph-pasal-17-op" } });
      return { defaultLesson: res.success ? res.data : null };
    } catch {
      return { defaultLesson: null };
    }
  },
  head: () => ({
    meta: [
      { title: "Materi Belajar Pajak — BrevetAI" },
      { name: "description", content: "Materi edukasi teks dan ilustrasi visual Brevet Pajak A & B." },
    ],
  }),
  component: LessonReader,
});

function LessonReader() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { defaultLesson } = Route.useLoaderData();
  const lesson = defaultLesson;
  const moduleId = search.id || "default";
  const [bookmarkSaved, setBookmarkSaved] = useState(false);
  const [progressVal, setProgressVal] = useState(35);

  useEffect(() => {
    const saved = localStorage.getItem(`mod_prog_${moduleId}`);
    if (saved) {
      setProgressVal(Number(saved));
    }
  }, [moduleId]);

  const handleLanjutBelajar = () => {
    if (progressVal < 100) {
      setProgressVal(100);
      localStorage.setItem(`mod_prog_${moduleId}`, "100");
    } else {
      navigate({ to: "/kuis" });
    }
  };

  return (
    <div>
      {/* Reader Top Bar */}
      <div className="sticky top-14 z-10 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <Button asChild variant="ghost" size="icon" aria-label="Kembali ke Modul">
            <Link to="/belajar">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">
              {(lesson as any)?.modul?.judul || "Modul PPh Orang Pribadi"} · Bab Tarif & Perhitungan
            </p>
            <Progress value={progressVal} className="mt-1 h-1" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBookmarkSaved(!bookmarkSaved)}
            className="text-xs"
          >
            <Bookmark className={`mr-1 h-3.5 w-3.5 ${bookmarkSaved ? "fill-primary text-primary" : ""}`} />
            {bookmarkSaved ? "Tersimpan" : "Simpan"}
          </Button>
        </div>
      </div>

      <PageBody className="max-w-5xl py-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
          {/* Article Reading View (Full Text & Visual Images) */}
          <article className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{(lesson as any)?.modul?.judul || "PPh Orang Pribadi"}</Badge>
              <Badge variant="secondary">Dasar / Menengah</Badge>
              <span className="text-xs text-muted-foreground">Estimasi baca: {lesson?.estimasiMenit || 15} menit</span>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {lesson?.judul || "Tarif PPh Pasal 17 untuk Wajib Pajak Orang Pribadi"}
            </h1>

            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Pasal 17 Undang-Undang Pajak Penghasilan (UU PPh) sebagaimana telah diubah dengan UU Harmonisasi Peraturan Perpajakan (UU HPP) mengatur tentang lapisan tarif progresif atas Penghasilan Kena Pajak (PKP) Wajib Pajak Orang Pribadi Dalam Negeri.
            </p>

            {/* Action Bar */}
            <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border bg-card p-2 shadow-xs">
              <Button size="sm" variant="ghost" className="text-xs">
                <Highlighter className="mr-1.5 h-3.5 w-3.5" /> Sorot Teks
              </Button>
              <Button size="sm" variant="ghost" className="text-xs">
                <StickyNote className="mr-1.5 h-3.5 w-3.5" /> Tambah Catatan
              </Button>
              <Button asChild size="sm" variant="ghost" className="text-xs text-primary">
                <Link to="/ai/chat">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Minta AI Jelaskan
                </Link>
              </Button>
            </div>

            {/* Detailed Educational Reading Section */}
            <section id="pengantar" className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
              <h2 className="text-lg font-bold text-foreground">1. Pengantar Lapisan Tarif Progresif</h2>
              <p>
                Sistem perpajakan di Indonesia menganut asas keadilan (*ability to pay*), di mana Wajib Pajak yang memiliki penghasilan lebih tinggi dikenakan lapisan tarif pajak yang lebih tinggi secara berjenjang.
              </p>

              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="flex gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="text-xs sm:text-sm">
                    <p className="font-bold text-foreground">Catatan Penting UU HPP No. 7 Tahun 2021</p>
                    <p className="text-muted-foreground mt-0.5">
                      Batas lapisan pertama Penghasilan Kena Pajak (PKP) dinaikkan dari semula Rp 50 juta menjadi Rp 60 juta (tarif 5%), dan ditambahkan lapisan tarif baru sebesar 35% untuk PKP di atas Rp 5 Miliar per tahun.
                    </p>
                  </div>
                </div>
              </div>

              <h2 id="tabel-tarif" className="text-lg font-bold text-foreground">2. Tabel Lapisan Tarif PPh Pasal 17 ayat (1) huruf a</h2>
              <div className="overflow-hidden rounded-xl border bg-card">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-muted/60 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">Lapisan Penghasilan Kena Pajak (PKP)</th>
                      <th className="px-4 py-3 text-right">Tarif Pajak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr className="hover:bg-accent/30">
                      <td className="px-4 py-3">Sampai dengan Rp 60.000.000</td>
                      <td className="px-4 py-3 text-right font-bold text-primary">5%</td>
                    </tr>
                    <tr className="hover:bg-accent/30">
                      <td className="px-4 py-3">Di atas Rp 60.000.000 s.d. Rp 250.000.000</td>
                      <td className="px-4 py-3 text-right font-bold text-primary">15%</td>
                    </tr>
                    <tr className="hover:bg-accent/30">
                      <td className="px-4 py-3">Di atas Rp 250.000.000 s.d. Rp 500.000.000</td>
                      <td className="px-4 py-3 text-right font-bold text-primary">25%</td>
                    </tr>
                    <tr className="hover:bg-accent/30">
                      <td className="px-4 py-3">Di atas Rp 500.000.000 s.d. Rp 5.000.000.000</td>
                      <td className="px-4 py-3 text-right font-bold text-primary">30%</td>
                    </tr>
                    <tr className="hover:bg-accent/30">
                      <td className="px-4 py-3">Di atas Rp 5.000.000.000 (Rp 5 Miliar)</td>
                      <td className="px-4 py-3 text-right font-bold text-primary">35%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 id="contoh-kasus" className="text-lg font-bold text-foreground">3. Contoh Studi Kasus Perhitungan</h2>
              <div className="rounded-xl border bg-card p-5 space-y-3">
                <p className="font-semibold text-foreground">Studi Kasus:</p>
                <p className="text-muted-foreground">
                  Pak Budi memiliki Penghasilan Kena Pajak (PKP) setahun sebesar <strong>Rp 100.000.000</strong>. Berapakah PPh terutang Pak Budi dalam satu tahun pajak?
                </p>
                <div className="rounded-lg bg-muted/40 p-4 font-mono text-xs space-y-2 border">
                  <p>• Lapisan 1 (5% × Rp 60.000.000) = Rp 3.000.000</p>
                  <p>• Lapisan 2 (15% × Rp 40.000.000) = Rp 6.000.000</p>
                  <div className="border-t pt-2 font-bold text-primary">
                    Total PPh Terutang = Rp 3.000.000 + Rp 6.000.000 = Rp 9.000.000 / tahun
                  </div>
                </div>
              </div>

              {/* Bottom Navigation / Lanjutkan Belajar */}
              <div className="mt-10 rounded-2xl border bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base">
                    {progressVal === 100 ? "Modul Selesai! Uji Pemahaman" : "Selesaikan Bab Ini"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {progressVal === 100
                      ? "Selamat! Anda telah membaca seluruh materi. Lanjut kerjakan kuis evaluasi."
                      : "Klik tombol di samping untuk menandai bab ini selesai."}
                  </p>
                </div>
                <Button onClick={handleLanjutBelajar} className="shrink-0">
                  {progressVal === 100 ? (
                    <>
                      Uji Pemahaman via Kuis <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Lanjutkan Belajar <CheckCircle2 className="ml-1.5 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </section>
          </article>

          {/* Table of Contents Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border bg-card p-5 sticky top-28">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Daftar Isi Materi</p>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#pengantar" className="text-muted-foreground hover:text-primary transition-colors">
                    1. Pengantar Lapisan Tarif
                  </a>
                </li>
                <li>
                  <a href="#tabel-tarif" className="text-muted-foreground hover:text-primary transition-colors">
                    2. Tabel Lapisan Tarif UU HPP
                  </a>
                </li>
                <li>
                  <a href="#contoh-kasus" className="text-muted-foreground hover:text-primary transition-colors">
                    3. Contoh Perhitungan
                  </a>
                </li>
              </ul>

              <div className="mt-6 border-t pt-4">
                <Button asChild size="sm" className="w-full text-xs">
                  <Link to="/kuis">Uji Pemahaman via Kuis</Link>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </PageBody>
    </div>
  );
}
