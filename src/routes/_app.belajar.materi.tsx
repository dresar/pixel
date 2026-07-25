import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bookmark,
  Highlighter,
  StickyNote,
  Sparkles,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  List,
  Share2,
  ChevronRight,
  Info,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";
import { PageBody } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { lessonContent } from "@/lib/dummy";

export const Route = createFileRoute("/_app/belajar/materi")({
  head: () => ({
    meta: [
      { title: "Tarif PPh Pasal 17 — BrevetAI" },
      { name: "description", content: "Pelajari tarif PPh Pasal 17 untuk orang pribadi lengkap dengan contoh perhitungan." },
    ],
  }),
  component: LessonReader,
});

function LessonReader() {
  const l = lessonContent;
  return (
    <div>
      {/* Reader top bar */}
      <div className="sticky top-14 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2.5 sm:px-6">
          <Button asChild variant="ghost" size="icon" aria-label="Kembali">
            <Link to="/belajar"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{l.module} · {l.chapter}</p>
            <Progress value={62} className="mt-1 h-1" />
          </div>
          <Button variant="ghost" size="icon" aria-label="Bagikan"><Share2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" aria-label="Daftar isi"><List className="h-4 w-4" /></Button>
        </div>
      </div>

      <PageBody className="max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
          {/* Article */}
          <article className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{l.module}</Badge>
              <Badge variant="secondary">{l.difficulty}</Badge>
              <span className="text-xs text-muted-foreground">{l.readingTime}</span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{l.title}</h1>
            <p className="mt-3 text-muted-foreground">
              Pasal 17 UU PPh mengatur tarif progresif atas Penghasilan Kena Pajak (PKP) orang pribadi.
              Pahami lapisan tarif, contoh perhitungan, dan penerapannya pada studi kasus SPT 1770.
            </p>

            {/* Action bar */}
            <div className="mt-5 flex flex-wrap items-center gap-1.5 rounded-xl border bg-card p-1.5">
              <Button size="sm" variant="ghost"><Bookmark className="mr-1 h-3.5 w-3.5" /> Simpan</Button>
              <Button size="sm" variant="ghost"><Highlighter className="mr-1 h-3.5 w-3.5" /> Sorot</Button>
              <Button size="sm" variant="ghost"><StickyNote className="mr-1 h-3.5 w-3.5" /> Catatan</Button>
              <Button size="sm" variant="ghost"><Sparkles className="mr-1 h-3.5 w-3.5" /> Jelaskan</Button>
              <Button size="sm" variant="ghost"><BookOpen className="mr-1 h-3.5 w-3.5" /> Glosarium</Button>
            </div>

            <section id="pengantar" className="prose-content mt-8 space-y-4 text-[15px] leading-relaxed text-foreground/90">
              <h2 className="text-lg font-semibold text-foreground">Pengantar</h2>
              <p>
                Pajak Penghasilan (PPh) Pasal 17 dikenakan atas Penghasilan Kena Pajak dengan sistem tarif progresif.
                Semakin besar penghasilan, semakin tinggi lapisan tarifnya. Sistem ini bertujuan menciptakan keadilan
                dalam pengenaan pajak.
              </p>

              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="flex gap-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">Ringkasan singkat</p>
                    <p className="text-muted-foreground">Tarif progresif berjenjang dari 5% hingga 35% sejak berlakunya UU HPP.</p>
                  </div>
                </div>
              </div>

              <h2 id="lapisan-tarif" className="text-lg font-semibold text-foreground">Lapisan tarif progresif</h2>
              <div className="overflow-hidden rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Lapisan PKP</th>
                      <th className="px-3 py-2 text-right">Tarif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      ["s.d. Rp60.000.000", "5%"],
                      [">Rp60jt – Rp250jt", "15%"],
                      [">Rp250jt – Rp500jt", "25%"],
                      [">Rp500jt – Rp5M", "30%"],
                      [">Rp5.000.000.000", "35%"],
                    ].map(([a, b]) => (
                      <tr key={a}>
                        <td className="px-3 py-2">{a}</td>
                        <td className="px-3 py-2 text-right font-medium">{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 id="contoh" className="text-lg font-semibold text-foreground">Contoh perhitungan</h2>
              <p>
                Pak Budi, Wajib Pajak Orang Pribadi lajang tanpa tanggungan, memiliki PKP sebesar Rp350.000.000 pada tahun pajak 2025.
                Perhitungan PPh terutang:
              </p>
              <pre className="overflow-x-auto rounded-xl border bg-muted/50 p-4 text-xs leading-relaxed">
{`5%  x Rp60.000.000   =  Rp 3.000.000
15% x Rp190.000.000  =  Rp28.500.000
25% x Rp100.000.000  =  Rp25.000.000
------------------------------------
PPh terutang        =  Rp56.500.000`}
              </pre>

              <div className="rounded-xl border border-warning/40 bg-warning/10 p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">Perhatian</p>
                    <p className="text-muted-foreground">Kurangi terlebih dahulu penghasilan neto dengan PTKP sebelum menerapkan tarif ini.</p>
                  </div>
                </div>
              </div>

              <h2 id="studi-kasus" className="text-lg font-semibold text-foreground">Studi kasus</h2>
              <p>
                Ibu Sinta memiliki penghasilan neto Rp420.000.000, status K/2 (kawin, 2 tanggungan). Hitung PPh terutangnya
                dengan menerapkan PTKP dan tarif Pasal 17 secara berlapis.
              </p>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="flex gap-3">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">Tips</p>
                    <p className="text-muted-foreground">Selalu hitung dari lapisan terendah — jangan langsung menerapkan satu tarif untuk seluruh PKP.</p>
                  </div>
                </div>
              </div>

              <h2 id="ringkasan" className="text-lg font-semibold text-foreground">Ringkasan</h2>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>Tarif PPh Pasal 17 bersifat progresif berlapis.</li>
                <li>Terapkan tarif secara bertingkat, bukan langsung ke total PKP.</li>
                <li>PTKP diperhitungkan sebelum tarif diterapkan.</li>
              </ul>
            </section>

            {/* Prev/Next */}
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <Link to="/belajar" className="group rounded-xl border bg-card p-4 hover:bg-accent/40">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sebelumnya</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                  <ArrowLeft className="h-4 w-4" /> Objek PPh Orang Pribadi
                </p>
              </Link>
              <Link to="/belajar" className="group rounded-xl border bg-card p-4 text-right hover:bg-accent/40">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Berikutnya</p>
                <p className="mt-1 flex items-center justify-end gap-2 text-sm font-medium">
                  PTKP & Pengurang Penghasilan <ArrowRight className="h-4 w-4" />
                </p>
              </Link>
            </div>

            <div className="mt-6 rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Uji pemahaman</p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Kerjakan kuis singkat 5 soal untuk memantapkan materi ini.</p>
              <Button asChild size="sm" className="mt-3">
                <Link to="/kuis">Mulai kuis <ChevronRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          </article>

          {/* Sticky TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Daftar isi</p>
              <ul className="space-y-1 text-sm">
                {l.toc.map((t) => (
                  <li key={t.id}>
                    <a
                      href={"#" + t.id}
                      className="block rounded-md px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      {t.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl border bg-card p-3 text-xs">
                <p className="font-medium">Progres bab</p>
                <Progress value={62} className="mt-2 h-1.5" />
                <p className="mt-1.5 text-muted-foreground">62% selesai</p>
              </div>
            </div>
          </aside>
        </div>
      </PageBody>
    </div>
  );
}
