import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Trash2 } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/unduhan")({
  head: () => ({
    meta: [
      { title: "Unduhan — BrevetAI" },
      { name: "description", content: "Materi dan sertifikat yang telah kamu unduh untuk akses offline." },
    ],
  }),
  component: Unduhan,
});

const files = [
  { name: "PPh OP — Rangkuman Bab 2.pdf", size: "2.3 MB", tag: "Materi" },
  { name: "Set kartu PTKP.pdf", size: "1.1 MB", tag: "Kartu" },
  { name: "Sertifikat KUP.pdf", size: "480 KB", tag: "Sertifikat" },
  { name: "SPT 1770 Contoh.xlsx", size: "820 KB", tag: "Studi kasus" },
];

function Unduhan() {
  return (
    <>
      <PageHeader title="Unduhan" description="Berkas belajar untuk akses offline." />
      <PageBody className="max-w-3xl">
        <ul className="divide-y rounded-2xl border bg-card">
          {files.map((f) => (
            <li key={f.name} className="flex items-center gap-3 p-4">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{f.name}</p>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Badge variant="secondary" className="text-[10px]">{f.tag}</Badge>
                  <span>{f.size}</span>
                </div>
              </div>
              <Button size="icon" variant="ghost" aria-label="Unduh"><Download className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" aria-label="Hapus"><Trash2 className="h-4 w-4" /></Button>
            </li>
          ))}
        </ul>
      </PageBody>
    </>
  );
}
