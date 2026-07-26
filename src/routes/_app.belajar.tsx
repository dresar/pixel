import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Search, BookOpen, Clock, Layers, Sparkles, ArrowRight, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { PageHeader, PageBody } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDaftarMateriSiswa } from "@/functions/modules";

export const Route = createFileRoute("/_app/belajar")({
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
  const [cari, setCari] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("SEMUA");

  const filteredMateri = materiList.filter((m: any) => {
    const matchSearch =
      m.judul.toLowerCase().includes(cari.toLowerCase()) ||
      m.modulJudul.toLowerCase().includes(cari.toLowerCase()) ||
      m.ringkasan.toLowerCase().includes(cari.toLowerCase());

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
              onClick={() => setKategoriFilter("SEMUA")}
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

        {/* Realtime Materi Cards Grid */}
        {filteredMateri.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center my-6 shadow-xs space-y-2">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-base font-bold text-foreground">Belum Ada Materi Pembelajaran</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Silakan buat atau terbitkan materi baru dari Admin Panel (`/admin/materi`).
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMateri.map((m: any) => (
              <div
                key={m.id}
                className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image Media Preview Thumbnail */}
                  {m.gambarUrl ? (
                    <div className="relative aspect-16/9 w-full bg-muted overflow-hidden border-b border-border/50">
                      <img src={m.gambarUrl} alt={m.judul} className="h-full w-full object-cover" />
                      <div className="absolute top-2.5 right-2.5">
                        <Badge className="bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded-full border-none">
                          📷 Infografis AI
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-16/9 w-full bg-gradient-to-br from-primary/15 via-primary/5 to-muted/40 p-5 flex flex-col justify-between border-b border-border/40">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] rounded-full font-mono font-bold border-primary/30 text-primary">
                          {m.modulKode}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] rounded-full font-bold">
                          {m.tingkatKesulitan}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                        <BookOpen className="h-4 w-4" /> {m.modulJudul}
                      </div>
                    </div>
                  )}

                  {/* Card Content Body */}
                  <div className="p-5 space-y-2.5">
                    {m.gambarUrl && (
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] rounded-full font-mono font-bold border-primary/30 text-primary">
                          {m.modulKode}
                        </Badge>
                        <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3 text-primary" /> {m.estimasiMenit} mnt
                        </span>
                      </div>
                    )}

                    <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2">{m.judul}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{m.ringkasan}</p>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 pt-0">
                  <Button asChild className="w-full rounded-xl font-bold text-xs shadow-xs gap-1.5">
                    <Link to="/belajar/materi/$slug" params={{ slug: m.slug }}>
                      <span>Baca Materi Sekarang</span> <ArrowRight className="h-4 w-4" />
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
