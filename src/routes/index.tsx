import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  BookOpen,
  Map,
  ClipboardList,
  Layers,
  Trophy,
  ArrowRight,
  Check,
  Star,
  Brain,
  MessageSquare,
  Zap,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BrevetAI — Belajar Brevet Pajak A & B berbasis AI" },
      {
        name: "description",
        content:
          "Platform belajar Brevet Pajak A & B modern berbasis AI. Roadmap terarah, materi interaktif, kuis adaptif, dan asisten AI pribadi.",
      },
    ],
  }),
  component: Landing,
});

function LandingTopbar() {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold tracking-tight">BrevetAI</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#fitur" className="hover:text-foreground">Fitur</a>
          <a href="#materi" className="hover:text-foreground">Materi</a>
          <a href="#harga" className="hover:text-foreground">Harga</a>
          <a href="#ulasan" className="hover:text-foreground">Ulasan</a>
        </nav>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Ganti tema">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/masuk">Masuk</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/daftar">Daftar</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Landing() {
  return (
    <div className="min-h-dvh bg-background">
      <LandingTopbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bp-dots opacity-40" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bp-glow" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-5 gap-1.5 rounded-full px-3 py-1 text-xs">
              <Sparkles className="h-3 w-3" /> Didukung AI generasi baru
            </Badge>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Kuasai Brevet Pajak A & B<br />
              bersama <span className="text-primary">asisten AI</span> pribadimu
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              Roadmap belajar terarah, materi interaktif, kuis adaptif, dan penjelasan AI kapan pun kamu butuh.
              Belajar pajak jadi terasa ringan dan menyenangkan.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-lg">
                <Link to="/daftar">
                  Mulai gratis <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-lg">
                <Link to="/beranda">Lihat demo</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Tanpa kartu kredit</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Materi lengkap A & B</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Dukungan AI 24 jam</span>
            </div>
          </div>

          {/* App preview */}
          <div className="relative mx-auto mt-14 max-w-5xl">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-primary/20 via-transparent to-primary/10 blur-2xl" />
            <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-primary/5">
              <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                <span className="ml-3 text-xs text-muted-foreground">brevetai.id/beranda</span>
              </div>
              <div className="grid grid-cols-12 gap-0">
                <aside className="col-span-3 hidden border-r bg-sidebar p-4 md:block">
                  {["Beranda", "Roadmap", "Belajar", "Tanya AI", "Kuis", "Kartu"].map((n, i) => (
                    <div
                      key={n}
                      className={
                        "mb-1 rounded-lg px-3 py-2 text-xs " +
                        (i === 0 ? "bg-sidebar-accent font-medium" : "text-muted-foreground")
                      }
                    >
                      {n}
                    </div>
                  ))}
                </aside>
                <div className="col-span-12 p-5 md:col-span-9">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Selamat datang kembali</p>
                      <p className="text-base font-semibold">Lanjut belajar PPh Orang Pribadi</p>
                    </div>
                    <Badge className="rounded-full">14 hari beruntun 🔥</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {["KUP", "PPh OP", "PPN"].map((m, i) => (
                      <div key={m} className="rounded-xl border bg-card p-3">
                        <p className="text-[10px] text-muted-foreground">Modul</p>
                        <p className="text-sm font-semibold">{m}</p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-primary" style={{ width: [78, 45, 20][i] + "%" }} />
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground">{[78, 45, 20][i]}% selesai</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-xl border bg-gradient-to-br from-primary/10 to-transparent p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">Rekomendasi AI</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Lanjutkan materi &ldquo;Tarif PPh Pasal 17 untuk Orang Pribadi&rdquo; — 6 menit lagi selesai.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Fitur unggulan</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Semua yang kamu butuhkan untuk lulus Brevet
            </h2>
            <p className="mt-3 text-muted-foreground">
              Dibangun untuk pengalaman belajar modern, terstruktur, dan personal.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Map, title: "Roadmap belajar", desc: "Peta belajar terstruktur dari dasar KUP hingga sengketa pajak lanjut." },
              { icon: BookOpen, title: "Materi interaktif", desc: "Bacaan bersih, sorotan, catatan, dan visualisasi konsep pajak." },
              { icon: Sparkles, title: "Asisten AI", desc: "Tanyakan apa saja — AI menjelaskan pasal, tarif, dan studi kasus." },
              { icon: ClipboardList, title: "Kuis adaptif", desc: "Kuis mengikuti tingkat pemahamanmu, lengkap dengan pembahasan." },
              { icon: Layers, title: "Kartu belajar", desc: "Kartu ingatan cepat untuk istilah, tarif, dan pasal penting." },
              { icon: Trophy, title: "Pencapaian & sertifikat", desc: "Kumpulkan lencana dan terbitkan sertifikat penyelesaian modul." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Materi */}
      <section id="materi" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Cakupan materi</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Brevet A & B, dari dasar sampai lanjut
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {[
              { label: "Brevet A", topics: ["KUP", "PPh Orang Pribadi", "PPN & PPnBM", "Pajak Bumi & Bangunan", "Bea Meterai"] },
              { label: "Brevet B", topics: ["PPh Badan", "Akuntansi Pajak", "Pemeriksaan Pajak", "Sengketa Pajak", "Perencanaan Pajak"] },
            ].map((g) => (
              <div key={g.label} className="rounded-2xl border bg-card p-6">
                <p className="text-xs text-muted-foreground">Kelompok</p>
                <p className="text-lg font-semibold">{g.label}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {g.topics.map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <span className="grid h-5 w-5 place-items-center rounded-md bg-primary/10 text-primary">
                        <Check className="h-3 w-3" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="ulasan" className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Kata mereka</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Dipercaya ribuan peserta brevet
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { name: "Siti Nurhaliza", role: "Konsultan Pajak, Bandung", quote: "Roadmap-nya jelas, dan AI-nya benar-benar membantu memahami pasal-pasal sulit." },
              { name: "Budi Santoso", role: "Staf Pajak, Surabaya", quote: "Kuis adaptifnya bikin belajar lebih efektif. Sertifikatnya juga rapi." },
              { name: "Dewi Kartika", role: "Mahasiswa Akuntansi, Yogyakarta", quote: "Kartu belajarnya sangat membantu menghafal tarif dan definisi." },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border bg-card p-6">
                <div className="mb-2 flex gap-0.5 text-warning">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="harga" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Harga</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Mulai sesuai kebutuhanmu</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { name: "Gratis", price: "Rp0", desc: "Kenali materi dasar", features: ["Materi pengantar KUP", "5 kuis dasar", "Tanya AI 10x / hari"] },
              { name: "Pelajar", price: "Rp99rb", period: "/bln", desc: "Untuk peserta brevet aktif", features: ["Semua modul A", "Kuis & kartu belajar", "Tanya AI tanpa batas"], featured: true },
              { name: "Profesional", price: "Rp199rb", period: "/bln", desc: "Untuk praktisi pajak", features: ["Semua modul A & B", "Studi kasus & simulasi", "Sertifikat resmi"] },
            ].map((p) => (
              <div
                key={p.name}
                className={
                  "rounded-2xl border bg-card p-6 " +
                  (p.featured ? "border-primary shadow-md shadow-primary/10 ring-1 ring-primary/20" : "")
                }
              >
                {p.featured && <Badge className="mb-3">Paling populer</Badge>}
                <p className="text-sm text-muted-foreground">{p.name}</p>
                <p className="mt-2">
                  <span className="text-3xl font-semibold">{p.price}</span>
                  {p.period && <span className="text-sm text-muted-foreground">{p.period}</span>}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" /> {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-5 w-full" variant={p.featured ? "default" : "outline"}>
                  <Link to="/daftar">Mulai</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary/5 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Brain className="h-5 w-5" />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Siap kuasai Brevet Pajak?</h2>
          <p className="mt-3 text-muted-foreground">
            Gabung sekarang dan mulai perjalanan belajar bersama asisten AI-mu.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/daftar">Daftar gratis</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/masuk">Masuk</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t py-10 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span>© 2026 BrevetAI. Dibuat di Indonesia.</span>
          </div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">Kebijakan</a>
            <a href="#" className="hover:text-foreground">Syarat</a>
            <a href="#" className="hover:text-foreground">Kontak</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
