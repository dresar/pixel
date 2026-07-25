import { createFileRoute } from "@tanstack/react-router";
import { FileJson, ExternalLink } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/referensi")({
  head: () => ({
    meta: [
      { title: "Referensi — BrevetAI" },
      { name: "description", content: "Daftar peraturan, undang-undang, dan rujukan resmi terkait perpajakan." },
    ],
  }),
  component: Referensi,
});

const refs = [
  { code: "UU 6/1983", title: "Ketentuan Umum dan Tata Cara Perpajakan", tag: "UU KUP" },
  { code: "UU 36/2008", title: "Pajak Penghasilan", tag: "UU PPh" },
  { code: "UU 42/2009", title: "PPN Barang dan Jasa & PPnBM", tag: "UU PPN" },
  { code: "UU 7/2021", title: "Harmonisasi Peraturan Perpajakan", tag: "UU HPP" },
  { code: "PMK 168/2023", title: "Petunjuk Pelaksanaan Pemotongan PPh Pasal 21", tag: "PMK" },
  { code: "PER-11/PJ/2025", title: "Tata Cara Pembuatan Faktur Pajak", tag: "PER DJP" },
];

function Referensi() {
  return (
    <>
      <PageHeader title="Referensi" description="Rujukan peraturan perpajakan resmi." />
      <PageBody>
        <div className="grid gap-3 md:grid-cols-2">
          {refs.map((r) => (
            <div key={r.code} className="rounded-xl border bg-card p-4 hover:bg-accent/40">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{r.code}</Badge>
                <FileJson className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-sm font-semibold">{r.title}</p>
              <div className="mt-2 flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px]">{r.tag}</Badge>
                <a href="#" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  Buka <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </PageBody>
    </>
  );
}
