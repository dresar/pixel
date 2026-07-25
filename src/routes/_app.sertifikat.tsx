import { createFileRoute } from "@tanstack/react-router";
import { Award, Download, Share2, Lock } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/sertifikat")({
  head: () => ({
    meta: [
      { title: "Sertifikat — BrevetAI" },
      { name: "description", content: "Sertifikat penyelesaian modul Brevet Pajak yang telah kamu dapatkan." },
    ],
  }),
  component: Sertifikat,
});

const certs = [
  { code: "BRV-A-01", title: "Ketentuan Umum & Tata Cara Perpajakan", date: "18 Mei 2026", ready: true },
  { code: "BRV-A-02", title: "Pajak Penghasilan Orang Pribadi", date: "—", ready: false },
  { code: "BRV-A-03", title: "PPN & PPnBM", date: "—", ready: false },
];

function Sertifikat() {
  return (
    <>
      <PageHeader title="Sertifikat" description="Bukti penyelesaian modul belajarmu." />
      <PageBody>
        <div className="grid gap-4 md:grid-cols-2">
          {certs.map((c) => (
            <div
              key={c.code}
              className={
                "relative overflow-hidden rounded-2xl border p-6 " +
                (c.ready ? "bg-gradient-to-br from-primary/10 via-card to-card" : "bg-card opacity-80")
              }
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{c.code}</Badge>
                  <Award className={c.ready ? "h-6 w-6 text-primary" : "h-6 w-6 text-muted-foreground"} />
                </div>
                <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Sertifikat penyelesaian</p>
                <p className="mt-1 text-base font-semibold">{c.title}</p>
                <p className="mt-2 text-xs text-muted-foreground">Terbit: {c.date}</p>
                <div className="mt-4 flex gap-2">
                  {c.ready ? (
                    <>
                      <Button size="sm"><Download className="mr-1 h-3.5 w-3.5" /> Unduh</Button>
                      <Button size="sm" variant="outline"><Share2 className="mr-1 h-3.5 w-3.5" /> Bagikan</Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      <Lock className="mr-1 h-3.5 w-3.5" /> Selesaikan modul
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageBody>
    </>
  );
}
