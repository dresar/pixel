import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { glossary } from "@/lib/dummy";

export const Route = createFileRoute("/_app/glosarium")({
  head: () => ({
    meta: [
      { title: "Glosarium — BrevetAI" },
      { name: "description", content: "Kumpulan istilah perpajakan lengkap dengan definisi." },
    ],
  }),
  component: Glosarium,
});

function Glosarium() {
  return (
    <>
      <PageHeader title="Glosarium" description="Daftar istilah perpajakan yang sering digunakan." />
      <PageBody className="max-w-4xl">
        <div className="relative mb-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari istilah..." className="pl-9" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {glossary.map((g) => (
            <div key={g.term} className="rounded-xl border bg-card p-4">
              <div className="flex items-baseline gap-2">
                <p className="text-base font-semibold text-primary">{g.term}</p>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{g.def}</p>
            </div>
          ))}
        </div>
      </PageBody>
    </>
  );
}
