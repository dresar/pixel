import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Scale, ExternalLink, Search, BookOpen, Layers } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getReferensiHukum } from "@/functions/referensi";

export const Route = createFileRoute("/_app/referensi")({
  loader: async () => {
    try {
      const res = await getReferensiHukum({ data: {} });
      return { referensiList: res.success && res.data ? res.data : [] };
    } catch {
      return { referensiList: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Referensi Peraturan Hukum — BrevetAI" },
      { name: "description", content: "Daftar undang-undang, PMK, PER DJP, dan rujukan resmi perpajakan Indonesia realtime." },
    ],
  }),
  component: Referensi,
});

function Referensi() {
  const { referensiList } = Route.useLoaderData();
  const [cari, setCari] = useState("");

  const filtered = referensiList.filter(
    (r: any) =>
      r.nomorPeraturan.toLowerCase().includes(cari.toLowerCase()) ||
      r.judul.toLowerCase().includes(cari.toLowerCase()) ||
      r.ringkasan.toLowerCase().includes(cari.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Referensi Peraturan Hukum Perpajakan"
        description="Pustaka rujukan resmi Undang-Undang HPP, PPh, PPN, KUP, dan PMK Kementerian Keuangan RI."
        breadcrumb={[{ label: "Beranda", to: "/beranda" }, { label: "Referensi" }]}
      />
      <PageBody className="space-y-6">
        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari UU, PMK, atau topik peraturan..."
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              className="pl-10 rounded-2xl text-xs h-10 bg-card border-border shadow-xs"
            />
          </div>
          <Badge variant="outline" className="h-10 px-4 rounded-2xl font-mono text-xs border-border">
            Total {filtered.length} Peraturan
          </Badge>
        </div>

        {/* Realtime Cards List */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center my-6 shadow-xs space-y-2">
            <Layers className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <h3 className="text-base font-bold text-foreground">Belum Ada Referensi Peraturan</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Peraturan hukum akan ditampilkan secara realtime di sini ketika ditambahkan dari Admin Panel.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((r: any) => (
              <div
                key={r.id}
                className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-primary/50 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs rounded-full font-mono font-bold border-primary/30 text-primary bg-primary/10">
                      {r.nomorPeraturan}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] rounded-full font-bold">
                      {r.kategori} {r.tahun ? `· ${r.tahun}` : ""}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-foreground leading-snug">{r.judul}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{r.ringkasan}</p>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                    <Scale className="h-3.5 w-3.5 text-primary" /> Dokumen Hukum Resmi
                  </span>
                  {r.urlDokumen ? (
                    <a
                      href={r.urlDokumen}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      Buka Dokumen <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-primary">Status: Aktif</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
}
