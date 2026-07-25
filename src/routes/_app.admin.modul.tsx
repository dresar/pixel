import { createFileRoute } from "@tanstack/react-router";
import { Plus, Filter, Search, MoreHorizontal } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { modules } from "@/lib/dummy";

export const Route = createFileRoute("/_app/admin/modul")({
  head: () => ({
    meta: [
      { title: "Modul — Admin BrevetAI" },
      { name: "description", content: "Kelola modul pembelajaran platform." },
    ],
  }),
  component: AdminModul,
});

function AdminModul() {
  return (
    <>
      <PageHeader
        title="Modul"
        description="Kelola semua modul pembelajaran."
        breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Modul" }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Filter className="mr-1 h-3.5 w-3.5" /> Filter</Button>
            <Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Baru</Button>
          </>
        }
      />
      <PageBody>
        <div className="relative mb-4 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari modul..." className="pl-9" />
        </div>

        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="w-10 p-3"><Checkbox /></th>
                  <th className="p-3 text-left">Kode</th>
                  <th className="p-3 text-left">Judul</th>
                  <th className="p-3 text-left">Level</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-right">Materi</th>
                  <th className="p-3 text-right">Diperbarui</th>
                  <th className="w-10 p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {modules.map((m) => (
                  <tr key={m.id} className="hover:bg-accent/30">
                    <td className="p-3"><Checkbox /></td>
                    <td className="p-3"><Badge variant="outline">{m.code}</Badge></td>
                    <td className="p-3 font-medium">{m.title}</td>
                    <td className="p-3"><Badge variant="secondary" className="text-[10px]">{m.difficulty}</Badge></td>
                    <td className="p-3">
                      <span className={
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] " +
                        (m.status === "Berjalan" ? "bg-primary/10 text-primary" :
                         m.status === "Terkunci" ? "bg-muted text-muted-foreground" : "bg-success/15 text-success")
                      }>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" /> {m.status}
                      </span>
                    </td>
                    <td className="p-3 text-right tabular-nums">{m.lessons}</td>
                    <td className="p-3 text-right text-[11px] text-muted-foreground">22 Jul 2026</td>
                    <td className="p-3"><Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t p-3 text-xs text-muted-foreground">
            <span>Menampilkan 1–6 dari 42</span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline">Sebelum</Button>
              <Button size="sm" variant="outline">Berikutnya</Button>
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}
