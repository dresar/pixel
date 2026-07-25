import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  UserCheck,
  ShieldAlert,
  KeyRound,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
  UserCog,
  Edit,
} from "lucide-react";
import { useState } from "react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDaftarPenggunaAdmin, updatePeranPenggunaAdmin, gantiSandiPenggunaAdmin } from "@/functions/users";

export const Route = createFileRoute("/_app/admin/pengguna")({
  loader: async () => {
    try {
      const res = await getDaftarPenggunaAdmin();
      return { initialUsers: res.success && res.data ? res.data : [] };
    } catch {
      return { initialUsers: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Manajemen Pengguna — Admin BrevetAI" },
      { name: "description", content: "Kelola peran, hak akses, dan keamanan akun pengguna." },
    ],
  }),
  component: AdminPengguna,
});

function AdminPengguna() {
  const { initialUsers } = Route.useLoaderData();
  const [usersList, setUsersList] = useState<any[]>(initialUsers);
  const [cari, setCari] = useState("");

  // Modals state
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Form state
  const [newRole, setNewRole] = useState<"STUDENT" | "ADMIN" | "SUPER_ADMIN">("STUDENT");
  const [newStatus, setNewStatus] = useState<"AKTIF" | "NONAKTIF" | "DITANGGUHKAN">("AKTIF");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const filtered = usersList.filter((u: any) =>
    (u.name || u.namaLengkap || "").toLowerCase().includes(cari.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(cari.toLowerCase())
  );

  const handleOpenRoleModal = (user: any) => {
    setSelectedUser(user);
    setNewRole(user.peran || "STUDENT");
    setNewStatus(user.statusAkun || "AKTIF");
    setStatusMsg(null);
    setRoleModalOpen(true);
  };

  const handleOpenPassModal = (user: any) => {
    setSelectedUser(user);
    setNewPassword("");
    setStatusMsg(null);
    setPassModalOpen(true);
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = (await updatePeranPenggunaAdmin({
        data: {
          userId: selectedUser.id,
          peran: newRole,
          statusAkun: newStatus,
        },
      })) as any;

      if (res.success) {
        setStatusMsg({ text: "Peran dan status akun berhasil diperbarui di database!", type: "success" });
        setUsersList(usersList.map((u) => (u.id === selectedUser.id ? { ...u, peran: newRole, statusAkun: newStatus } : u)));
        setTimeout(() => {
          setRoleModalOpen(false);
          setStatusMsg(null);
        }, 1500);
      } else {
        setStatusMsg({ text: res.message || "Gagal memperbarui peran", type: "error" });
      }
    } catch {
      setStatusMsg({ text: "Terjadi kesalahan koneksi ke server", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || newPassword.length < 6) return;
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = (await gantiSandiPenggunaAdmin({
        data: {
          userId: selectedUser.id,
          passwordBaru: newPassword,
        },
      })) as any;

      if (res.success) {
        setStatusMsg({ text: "Kata sandi pengguna berhasil diubah!", type: "success" });
        setNewPassword("");
        setTimeout(() => {
          setPassModalOpen(false);
          setStatusMsg(null);
        }, 1500);
      } else {
        setStatusMsg({ text: res.message || "Gagal mengubah kata sandi", type: "error" });
      }
    } catch {
      setStatusMsg({ text: "Terjadi kesalahan koneksi ke server", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Manajemen Pengguna Platform"
        description="Kelola hak akses peran (STUDENT vs ADMIN vs SUPER_ADMIN) dan ganti sandi keamanan pengguna."
        breadcrumb={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Pengguna" }]}
      />

      <PageBody>
        <div className="relative mb-6 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari berdasarkan nama atau email pengguna..."
            className="pl-9"
          />
        </div>

        {/* Zero Dummy Policy: If Empty, show clean Empty State */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center my-6">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-base font-semibold">Tidak Ada Data Pengguna Ditemukan</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              {cari ? `Tidak ada pengguna dengan kata kunci "${cari}".` : "Belum ada akun pengguna terdaftar di dalam database Neon PostgreSQL."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="p-3.5 text-left font-semibold">Nama Pengguna</th>
                    <th className="p-3.5 text-left font-semibold">Email Resmi</th>
                    <th className="p-3.5 text-left font-semibold">Peran (Role)</th>
                    <th className="p-3.5 text-left font-semibold">Status Akun</th>
                    <th className="p-3.5 text-right font-semibold">Aksi Keamanan</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((u: any) => {
                    const initials = (u.name || u.namaLengkap || "U")
                      .split(" ")
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <tr key={u.id} className="transition-colors hover:bg-muted/20">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-foreground">{u.name || u.namaLengkap || "Tanpa Nama"}</p>
                              <p className="text-[11px] text-muted-foreground font-mono">ID: {u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-muted-foreground font-medium">{u.email || "-"}</td>
                        <td className="p-3.5">
                          <Badge
                            variant={u.peran === "SUPER_ADMIN" ? "default" : u.peran === "ADMIN" ? "secondary" : "outline"}
                            className="text-[10px] font-bold tracking-wide"
                          >
                            {u.peran === "SUPER_ADMIN" ? "⚡ SUPER ADMIN" : u.peran === "ADMIN" ? "🛡️ ADMIN" : "👨‍🎓 STUDENT"}
                          </Badge>
                        </td>
                        <td className="p-3.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold ${
                              u.statusAkun === "AKTIF"
                                ? "border-success/30 bg-success/10 text-success"
                                : "border-destructive/30 bg-destructive/10 text-destructive"
                            }`}
                          >
                            {u.statusAkun || "AKTIF"}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleOpenRoleModal(u)}
                            className="text-xs h-8 px-2.5"
                          >
                            <UserCog className="mr-1 h-3.5 w-3.5 text-primary" /> Ubah Peran
                          </Button>

                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleOpenPassModal(u)}
                            className="text-xs h-8 px-2.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                          >
                            <KeyRound className="mr-1 h-3.5 w-3.5" /> Ganti Sandi
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL 1: UBAH PERAN */}
        <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ubah Peran & Status Pengguna</DialogTitle>
              <DialogDescription>
                Sesuaikan hak akses untuk {selectedUser?.name || selectedUser?.email}.
              </DialogDescription>
            </DialogHeader>

            {statusMsg && (
              <div
                className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
                  statusMsg.type === "success"
                    ? "bg-success/15 text-success border border-success/30"
                    : "bg-destructive/15 text-destructive border border-destructive/30"
                }`}
              >
                {statusMsg.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateRole} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Peran Pengguna (Role)</Label>
                <Select value={newRole} onValueChange={(val: any) => setNewRole(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">👨‍🎓 STUDENT (Siswa Brevet Pajak)</SelectItem>
                    <SelectItem value="ADMIN">🛡️ ADMIN (Kelola Konten & Modul)</SelectItem>
                    <SelectItem value="SUPER_ADMIN">⚡ SUPER ADMIN (Akses Penuh)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Status Akun</Label>
                <Select value={newStatus} onValueChange={(val: any) => setNewStatus(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AKTIF">🟢 AKTIF</SelectItem>
                    <SelectItem value="NONAKTIF">🔴 NONAKTIF</SelectItem>
                    <SelectItem value="DITANGGUHKAN">⚠️ DITANGGUHKAN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setRoleModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL 2: GANTI SANDI */}
        <Dialog open={passModalOpen} onOpenChange={setPassModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <KeyRound className="h-5 w-5" /> Reset Kata Sandi Pengguna
              </DialogTitle>
              <DialogDescription>
                Masukkan kata sandi baru untuk {selectedUser?.name || selectedUser?.email}. Pengguna dapat langsung login menggunakan sandi baru ini.
              </DialogDescription>
            </DialogHeader>

            {statusMsg && (
              <div
                className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
                  statusMsg.type === "success"
                    ? "bg-success/15 text-success border border-success/30"
                    : "bg-destructive/15 text-destructive border border-destructive/30"
                }`}
              >
                {statusMsg.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Kata Sandi Baru</Label>
                <Input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter..."
                  required
                  min={6}
                />
                <p className="text-[11px] text-muted-foreground">
                  Sandi akan langsung tersimpan secara rapi dan aman di tabel accounts Neon.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setPassModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="destructive" disabled={loading || newPassword.length < 6}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Kata Sandi Baru
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageBody>
    </>
  );
}
