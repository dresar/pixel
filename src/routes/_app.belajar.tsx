import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Search, BookOpen, Clock, Layers, Sparkles, ArrowRight, Image as ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { PageHeader, PageBody } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDaftarMateriSiswa } from "@/functions/modules";
import { z } from "zod";

const searchSchema = z.object({
  cari: z.string().optional(),
  modul: z.string().optional(),
  slug: z.string().optional(),
});

export const Route = createFileRoute("/_app/belajar")({
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  loader: async () => {
    try {
      const res = await getDaftarMateriSiswa();
      return { materiList: res.success && res.data ? res.data : [] };
    } catch {
      return { materiList: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Katalog Materi Belajar Pajak — BrevetAI" },
      { name: "description", content: "Materi edukasi lengkap Brevet Pajak A & B — baca teks, pelajari infografis visual, dan uji pemahaman." },
    ],
  }),
  component: BelajarLayout,
});

function BelajarLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // If subroute (like /belajar/materi/$slug) is active, render Outlet!
  if (pathname !== "/belajar" && pathname !== "/belajar/") {
    return <Outlet />;
  }

  return <BelajarCatalog />;
}

function BelajarCatalog() {
  const { materiList } = Route.useLoaderData();
  const search = Route.useSearch();
  const [cari, setCari] = useState(search.cari || search.modul || search.slug || "");
  const [kategoriFilter, setKategoriFilter] = useState("SEMUA");

  useEffect(() => {
    const q = search.cari || search.modul || search.slug || "";
    if (q) {
      setCari(q);
    }
  }, [search.cari, search.modul, search.slug]);

  const filteredMateri = materiList.filter((m: any) => {
    const matchSearch =
      !cari ||
      m.judul.toLowerCase().includes(cari.toLowerCase()) ||
      (m.modulJudul && m.modulJudul.toLowerCase().includes(cari.toLowerCase())) ||
      (m.ringkasan && m.ringkasan.toLowerCase().includes(cari.toLowerCase()));

    if (kategoriFilter === "DENGAN_GAMBAR") return matchSearch && !!m.gambarUrl;
    return matchSearch;
  });

  return (
    <>
      <PageHeader
        title="Katalog Materi Pembelajaran Pajak"
        description="Pilih dan baca materi pembelajaran Brevet Pajak A & B secara langsung — dilengkapi infografis visual & pembahasan UU."
        breadcrumb={[{ label: "Beranda", to: "/beranda" }, { label: "Katalog Materi" }]}
      />

      <PageBody className="space-y-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari materi pembelajaran, PPh, PPN, KUP, atau contoh kasus..."
              className="pl-10 rounded-2xl text-xs h-10 bg-card border-border shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Button
              variant={kategoriFilter === "SEMUA" ? "default" : "outline"}
              size="sm"
              onClick={() => { setKategoriFilter("SEMUA"); setCari(""); }}
              className="rounded-xl text-xs font-bold shrink-0"
            >
              📚 Semua Materi ({materiList.length})
            </Button>
            <Button
              variant={kategoriFilter === "DENGAN_GAMBAR" ? "default" : "outline"}
              size="sm"
              onClick={() => setKategoriFilter("DENGAN_GAMBAR")}
              className="rounded-xl text-xs font-bold shrink-0 border-primary/30 text-primary"
            >
              📷 Materi Ber-Infografis
            </Button>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {cari && (
          <div className="flex items-center justify-between bg-primary/10 border border-primary/30 p-3 rounded-xl text-xs">
            <span className="text-foreground">
              Menampilkan materi untuk modul/pencarian: <strong className="text-primary font-bold">"{cari}"</strong>
            </span>
            <Button size="xs" variant="ghost" onClick={() => setCari("")} className="text-xs font-bold text-muted-foreground hover:text-foreground">
              Tampilkan Semua ({materiList.length})
            </Button>
          </div>
        )}

        {/* Realtime Materi Cards Grid */}
        {filteredMateri.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center my-6 shadow-xs space-y-2">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-base font-bold text-foreground">Belum Ada Materi Pembelajaran</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Materi untuk pencarian ini belum tersedia atau masih disiapkan di database.
            </p>
            {cari && (
              <Button size="sm" onClick={() => setCari("")} variant="outline" className="mt-2 text-xs font-bold">
                Reset Pencarian
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMateri.map((m: any) => (
              <div
                key={m.id}
                className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] rounded-full font-mono font-bold border-primary/30 text-primary bg-primary/5">
                      {m.modulKode || "BREVET-A"}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {m.estimasiMenit || 15} mnt
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {m.judul}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {m.ringkasan}
                  </p>
                </div>

                <div className="mt-5 border-t border-border/40 pt-3.5 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground truncate max-w-[140px]">
                    {m.modulJudul || "Modul Utama"}
                  </span>
                  <Button asChild size="xs" className="font-bold text-xs rounded-xl shadow-xs">
                    <Link to="/roadmap/materi/$slug" params={{ slug: m.slug }}>
                      Baca Materi <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
}
