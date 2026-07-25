import { createFileRoute } from "@tanstack/react-router";
import { Server, Sparkles, Database, Wrench, KeyRound } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/admin/pengaturan")({
  head: () => ({
    meta: [
      { title: "Pengaturan — Admin BrevetAI" },
      { name: "description", content: "Pengaturan sistem, AI, penyimpanan, dan mode pemeliharaan." },
    ],
  }),
  component: AdminPengaturan,
});

function Card({ icon: Icon, title, desc, children }: any) {
  return (
    <section className="rounded-2xl border bg-card">
      <div className="flex items-start gap-3 border-b p-5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function AdminPengaturan() {
  return (
    <>
      <PageHeader
        title="Pengaturan sistem"
        description="Konfigurasi platform, AI, dan mode pemeliharaan."
        breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Pengaturan" }]}
      />
      <PageBody className="max-w-3xl space-y-5">
        <Card icon={Sparkles} title="AI" desc="Model dan pengaturan asisten AI.">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Aktifkan asisten AI</p>
                <p className="text-xs text-muted-foreground">Nonaktifkan untuk sementara jika ada gangguan.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="grid gap-1.5">
              <Label>Nama model default</Label>
              <Input defaultValue="brevet-tutor-2026" />
            </div>
          </div>
        </Card>

        <Card icon={KeyRound} title="API & Kunci" desc="Kelola integrasi dan kunci layanan.">
          <div className="grid gap-1.5">
            <Label>Kunci publik</Label>
            <Input readOnly value="pk_live_brevetai_••••••••1234" />
            <Button size="sm" variant="outline" className="w-fit">Salin</Button>
          </div>
        </Card>

        <Card icon={Database} title="Penyimpanan" desc="Kuota dan penyimpanan media.">
          <p className="text-sm">Terpakai <span className="font-semibold">28,4 GB</span> dari 100 GB.</p>
        </Card>

        <Card icon={Wrench} title="Pemeliharaan" desc="Aktifkan mode pemeliharaan untuk memblokir akses publik.">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Mode pemeliharaan</p>
              <p className="text-xs text-muted-foreground">Pengguna akan diarahkan ke halaman pemeliharaan.</p>
            </div>
            <Switch />
          </div>
        </Card>

        <Card icon={Server} title="Cadangan">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Cadangan otomatis</p>
              <p className="text-xs text-muted-foreground">Setiap hari pukul 02.00 WIB.</p>
            </div>
            <Button size="sm">Buat sekarang</Button>
          </div>
        </Card>
      </PageBody>
    </>
  );
}
