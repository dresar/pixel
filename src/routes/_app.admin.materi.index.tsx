import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  BookOpen,
  Edit3,
  Eye,
  Layers,
} from "lucide-react";
import { useState } from "react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getDaftarSemuaLesson, getDaftarSemuaChapter, getDaftarModul } from "@/functions/modules";

export const Route = createFileRoute("/_app/admin/materi/")({
  loader: async () => {
    try {
      const [lessonRes, chapterRes, modulRes] = await Promise.all([
        getDaftarSemuaLesson(),
        getDaftarSemuaChapter(),
        getDaftarModul({ data: { halaman: 1, per_halaman: 50 } }),
      ]);
      return {
        initialLessons: lessonRes.success && lessonRes.data ? lessonRes.data : [],
        chaptersList: chapterRes.success && chapterRes.data ? chapterRes.data : [],
        modulesList: modulRes.success && modulRes.data ? modulRes.data : [],
      };
    } catch {
      return { initialLessons: [], chaptersList: [], modulesList: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Kelola Materi Pembelajaran — Admin BrevetAI" },
      { name: "description", content: "Daftar materi pembelajaran perpajakan Brevet A/B." },
    ],
  }),
  component: AdminMateriGridPage,
});

function AdminMateriGridPage() {
  const { initialLessons } = Route.useLoaderData();
  const [materiList] = useState<any[]>(initialLessons);
  const [cari, setCari] = useState("");

  const filtered = materiList.filter((l: any) =>
    (l.judul || l.title || "").toLowerCase().includes(cari.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Materi Pembelajaran"
        description="Kelola dan sunting materi edukasi perpajakan Brevet A & B."
        breadcrumb={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Materi" }]}
        actions={
          <Button size="sm" asChild className="font-bold shadow-sm">
            <Link to="/admin/modul">
              <Layers className="mr-1.5 h-4 w-4" /> Kelola via Modul
            </Link>
          </Button>
        }
      />

      <PageBody className="space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari judul materi pembelajaran..."
            className="pl-10 h-10 bg-card shadow-2xs"
          />
        </div>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center my-6 shadow-xs">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="text-base font-bold text-foreground">Belum Ada Materi Pembelajaran</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              Impor modul Brevet A/B via AI atau tambahkan materi baru di halaman kelola modul.
            </p>
          </div>
        ) : (
          /* Grid Layout - Clean Card (No Extra Clutter) */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l: any) => {
              const statusText = l.statusPublikasi || "TERBIT";
              const isTerbit = statusText === "TERBIT";

              return (
                <div
                  key={l.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-5 shadow-xs transition-all hover:shadow-md hover:border-primary/40"
                >
                  <div className="space-y-3">
                    {/* Top Right Status Badge Only */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-muted-foreground font-semibold flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-primary" /> Materi Edukasi
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          isTerbit
                            ? "border-success/40 bg-success/15 text-success"
                            : "border-amber-500/40 bg-amber-500/15 text-amber-500"
                        }`}
                      >
                        ● {statusText}
                      </Badge>
                    </div>

                    {/* Material Title Only */}
                    <h3 className="text-base font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 pt-1">
                      {l.judul || l.title}
                    </h3>
                  </div>

                  {/* Card Footer Actions: Pratinjau & Edit Materi */}
                  <div className="mt-5 border-t pt-3 flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline" asChild className="font-semibold text-xs px-2.5 h-8">
                      <Link to="/belajar/materi/$slug" params={{ slug: l.slug }} target="_blank">
                        <Eye className="mr-1 h-3.5 w-3.5 text-primary" /> Pratinjau
                      </Link>
                    </Button>

                    <Button size="sm" asChild className="font-semibold text-xs px-3 h-8 shadow-xs">
                      <Link to="/admin/materi/$slug" params={{ slug: l.slug }}>
                        <Edit3 className="mr-1 h-3.5 w-3.5" /> Edit Materi
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
