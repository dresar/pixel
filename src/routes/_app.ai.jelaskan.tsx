import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Copy, RefreshCcw, X } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/ai/jelaskan")({
  head: () => ({
    meta: [
      { title: "Jelaskan — BrevetAI" },
      { name: "description", content: "Panel penjelasan AI untuk konsep dan istilah pajak." },
    ],
  }),
  component: Jelaskan,
});

function Jelaskan() {
  return (
    <>
      <PageHeader
        title="Jelaskan"
        description="Panel penjelasan AI untuk konsep atau istilah yang kamu pilih."
        breadcrumb={[{ label: "AI", to: "/ai/chat" }, { label: "Jelaskan" }]}
      />
      <PageBody className="max-w-3xl">
        <div className="rounded-2xl border bg-card">
          <div className="flex items-center gap-2 border-b p-4">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Penjelasan singkat</p>
              <p className="text-[11px] text-muted-foreground">Istilah: PTKP (Penghasilan Tidak Kena Pajak)</p>
            </div>
            <Button size="icon" variant="ghost" aria-label="Tutup"><X className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-3 p-5 text-sm leading-relaxed">
            <p>
              PTKP adalah pengurang penghasilan neto orang pribadi yang besarannya ditentukan oleh status
              perkawinan dan jumlah tanggungan. Nilai PTKP dikurangkan sebelum tarif Pasal 17 diterapkan.
            </p>
            <div className="rounded-xl border bg-muted/40 p-3">
              <p className="mb-2 text-xs font-semibold">Contoh</p>
              <p className="text-xs text-muted-foreground">
                Wajib Pajak dengan status K/2 mendapatkan PTKP setara Rp67.500.000 per tahun.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-[10px]">PTKP</Badge>
              <Badge variant="secondary" className="text-[10px]">PPh OP</Badge>
              <Badge variant="secondary" className="text-[10px]">UU HPP</Badge>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" variant="outline"><Copy className="mr-1 h-3.5 w-3.5" /> Salin</Button>
              <Button size="sm" variant="outline"><RefreshCcw className="mr-1 h-3.5 w-3.5" /> Ulang</Button>
              <Button size="sm">Lanjut baca</Button>
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}
