import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Clock, ArrowRight, AlertCircle } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDaftarStudiKasus } from "@/functions/studi-kasus";

export const Route = createFileRoute("/_app/studi-kasus")({
  loader: async () => {
    try {
      const res = await getDaftarStudiKasus();
      const list = res?.data || res;
      return { cases: Array.isArray(list) ? list : (Array.isArray((res as any)?.cases) ? (res as any).cases : []) };
    } catch {
      return { cases: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Studi Kasus & Simulasi — BrevetAI" },
      { name: "description", content: "Studi kasus perpajakan berbasis skenario nyata dari database." },
    ],
  }),
  component: StudiKasus,
});

function StudiKasus() {
  const loaderData = Route.useLoaderData();
  const rawCases = loaderData?.cases;
  const casesList = Array.isArray(rawCases) ? rawCases : [];

  return (
    <>
      <PageHeader
        title="Studi Kasus & Simulasi"
        description="Latih pemahamanmu dengan skenario perpajakan nyata."
      />
      <PageBody className="w-full max-w-5xl mx-auto space-y-6">
        {casesList.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-12 text-center space-y-3">
            <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground/60" />
            <h3 className="text-base font-bold text-foreground">Belum Ada Studi Kasus Dipublikasikan</h3>
            <p className="text-xs text-muted-foreground">Studi kasus akan segera diunggah oleh instruktur BrevetAI.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {casesList.map((c: any) => (
              <div key={c.id || c.title} className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className="text-xs font-mono font-bold border-primary/30 text-primary bg-primary/5">
                        {c.tag || "PPh OP"}
                      </Badge>
                    </div>
                    <Badge variant="secondary" className="text-xs font-bold">
                      Level: {c.level || "MENENGAH"}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-foreground leading-snug">{c.judul}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {c.deskripsi || c.skenarioTeks || "Simulasi kasus nyata transaksi perpajakan."}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" /> {c.durasiMenit || c.duration || 45} menit
                  </span>

                  <Button size="sm" className="rounded-xl font-bold text-xs gap-1.5 shadow-xs">
                    Mulai Simulasi <ArrowRight className="h-3.5 w-3.5" />
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
