import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_app/admin/pengguna")({
  head: () => ({
    meta: [
      { title: "Pengguna — Admin BrevetAI" },
      { name: "description", content: "Kelola pengguna dan hak akses platform." },
    ],
  }),
  component: AdminPengguna,
});

const users = [
  { name: "Siti Nurhaliza", email: "siti@brevetai.id", role: "Peserta", city: "Bandung", status: "Aktif" },
  { name: "Budi Santoso", email: "budi@brevetai.id", role: "Peserta", city: "Surabaya", status: "Aktif" },
  { name: "Dewi Kartika", email: "dewi@brevetai.id", role: "Peserta", city: "Yogyakarta", status: "Nonaktif" },
  { name: "Andi Wijaya", email: "andi@brevetai.id", role: "Instruktur", city: "Medan", status: "Aktif" },
  { name: "Rangga Prasetyo", email: "rangga@brevetai.id", role: "Peserta", city: "Jakarta", status: "Aktif" },
  { name: "Rina Anggraini", email: "rina@brevetai.id", role: "Admin", city: "Jakarta", status: "Aktif" },
];

function AdminPengguna() {
  return (
    <>
      <PageHeader
        title="Pengguna"
        description="Kelola pengguna, peran, dan status akun."
        breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Pengguna" }]}
        actions={<Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Undang</Button>}
      />
      <PageBody>
        <div className="relative mb-4 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari pengguna..." className="pl-9" />
        </div>
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="w-10 p-3"><Checkbox /></th>
                  <th className="p-3 text-left">Nama</th>
                  <th className="p-3 text-left">Peran</th>
                  <th className="p-3 text-left">Kota</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="w-10 p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.email} className="hover:bg-accent/30">
                    <td className="p-3"><Checkbox /></td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                            {u.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{u.name}</p>
                          <p className="truncate text-[11px] text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3"><Badge variant="outline" className="text-[10px]">{u.role}</Badge></td>
                    <td className="p-3 text-muted-foreground">{u.city}</td>
                    <td className="p-3">
                      <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] " + (u.status === "Aktif" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" /> {u.status}
                      </span>
                    </td>
                    <td className="p-3"><Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageBody>
    </>
  );
}
