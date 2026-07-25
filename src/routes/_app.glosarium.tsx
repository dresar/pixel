import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getGlosarium } from "@/functions/glossary";
import { glossary as dummyGlossary } from "@/lib/dummy";

export const Route = createFileRoute("/_app/glosarium")({
  loader: async () => {
    try {
      const res = await getGlosarium({ data: {} });
      return { initialGlossary: res.success && res.data ? res.data : [] };
    } catch {
      return { initialGlossary: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Glosarium — BrevetAI" },
      { name: "description", content: "Kumpulan istilah perpajakan lengkap dengan definisi." },
    ],
  }),
  component: Glosarium,
});

function Glosarium() {
  const { initialGlossary } = Route.useLoaderData();
  const [cari, setCari] = useState("");
  const [items, setItems] = useState<any[]>(initialGlossary);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!cari.trim()) {
        setItems(initialGlossary);
        return;
      }
      try {
        const res = await getGlosarium({ data: { cari } });
        if (res.success && res.data) {
          setItems(res.data);
        }
      } catch {
        // ignore
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [cari, initialGlossary]);

  const displayItems = items.length > 0 ? items : dummyGlossary;

  return (
    <>
      <PageHeader title="Glosarium Perpajakan" description="Kumpulan istilah perpajakan resmi Indonesia dengan definisi dan referensi UU." />
      <PageBody className="max-w-4xl">
        <div className="relative mb-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari istilah pajak (misal: NPWP, PPh, PPN, PTKP)..."
            className="pl-9"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {displayItems.map((g: any) => (
            <div key={g.istilah || g.term} className="rounded-xl border bg-card p-4 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-bold text-primary">{g.istilah || g.term}</p>
                {g.kategori && (
                  <Badge variant="outline" className="text-[10px]">
                    {g.kategori}
                  </Badge>
                )}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{g.definisi || g.def}</p>
              {g.referensiUndangUndang && (
                <p className="pt-1 text-[11px] font-mono text-primary/80">📜 {g.referensiUndangUndang}</p>
              )}
            </div>
          ))}
        </div>
      </PageBody>
    </>
  );
}
