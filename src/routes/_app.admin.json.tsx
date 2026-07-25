import { createFileRoute } from "@tanstack/react-router";
import { FileJson, Upload, Download, Check } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/admin/json")({
  head: () => ({
    meta: [
      { title: "JSON — Admin BrevetAI" },
      { name: "description", content: "Kelola konten JSON: import, ekspor, validasi." },
    ],
  }),
  component: AdminJSON,
});

const sample = `{
  "kode": "BRV-A-02",
  "judul": "Pajak Penghasilan Orang Pribadi",
  "level": "Menengah",
  "bab": [
    { "id": "b1", "judul": "Objek PPh OP", "materi": 4 },
    { "id": "b2", "judul": "Tarif & Perhitungan", "materi": 6 }
  ]
}`;

function AdminJSON() {
  return (
    <>
      <PageHeader
        title="JSON manager"
        description="Impor, ekspor, dan validasi konten dalam format JSON."
        breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "JSON" }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Upload className="mr-1 h-3.5 w-3.5" /> Impor</Button>
            <Button size="sm"><Download className="mr-1 h-3.5 w-3.5" /> Ekspor</Button>
          </>
        }
      />
      <PageBody className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <FileJson className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">modul-pph-op.json</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-success">
              <Check className="h-3.5 w-3.5" /> Valid
            </span>
          </div>
          <pre className="overflow-x-auto p-5 text-xs leading-relaxed"><code>{sample}</code></pre>
        </div>
        <aside className="space-y-3">
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-sm font-semibold">Statistik dokumen</p>
            <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <li className="flex justify-between"><span>Total kunci</span><span>18</span></li>
              <li className="flex justify-between"><span>Total bab</span><span>2</span></li>
              <li className="flex justify-between"><span>Total materi</span><span>10</span></li>
              <li className="flex justify-between"><span>Ukuran</span><span>3,4 KB</span></li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-sm font-semibold">Versi</p>
            <ul className="mt-3 space-y-2">
              {["v1.2 — 25 Jul 2026","v1.1 — 12 Jul 2026","v1.0 — 04 Jul 2026"].map((v) => (
                <li key={v} className="flex items-center justify-between text-xs">
                  <span>{v}</span>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">Bandingkan</Button>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-sm font-semibold">Tag</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["PPh OP","Brevet A","Terbit"].map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
              ))}
            </div>
          </div>
        </aside>
      </PageBody>
    </>
  );
}
