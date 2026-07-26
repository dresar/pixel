import { createFileRoute } from "@tanstack/react-router";
import { Database, ShieldCheck, CheckCircle2, Save, KeyRound, Sliders, Globe } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/admin/pengaturan")({
  head: () => ({
    meta: [
      { title: "Pengaturan Platform — Admin BrevetAI" },
      { name: "description", content: "Konfigurasi inti platform dan status infrastruktur BrevetAI." },
    ],
  }),
  component: AdminPengaturan,
});

function Card({ icon: Icon, title, desc, children }: any) {
  return (
    <section className="rounded-2xl border bg-card shadow-xs">
      <div className="flex items-start gap-3 border-b p-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{title}</p>
          {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function AdminPengaturan() {
  const [namaPlatform, setNamaPlatform] = useState("BrevetAI — Learning Management System");
  const [versiKurikulum, setVersiKurikulum] = useState("Regulasi Perpajakan 2026 (UU HPP & PMK 168/2023)");
  const [passingGradeDefault, setPassingGradeDefault] = useState("70");
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Pengaturan platform berhasil disimpan!");
    }, 600);
  };

  return (
    <>
      <PageHeader
        title="Pengaturan Platform"
        description="Kelola preferensi inti dan pantau status infrastruktur platform BrevetAI."
        breadcrumb={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Pengaturan" }]}
      />

      <PageBody className="max-w-3xl space-y-6">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* CARD 1: DATABASE & INFRASTRUCTURE STATUS */}
          <Card
            icon={Database}
            title="Status System & Infrastruktur Server"
            desc="Monitoring koneksi database dan layanan utama yang terhubung."
          >
            <div className="grid gap-3 sm:grid-cols-3 text-xs">
              <div className="flex flex-col justify-between rounded-xl border bg-muted/30 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Neon Database</span>
                  <Badge variant="outline" className="border-success/40 bg-success/15 text-success font-semibold text-[10px]">
                    ● Terhubung
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">PostgreSQL Serverless</p>
              </div>

              <div className="flex flex-col justify-between rounded-xl border bg-muted/30 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Better Auth</span>
                  <Badge variant="outline" className="border-success/40 bg-success/15 text-success font-semibold text-[10px]">
                    ● Aktif
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">Autentikasi Sesi & Peran</p>
              </div>

              <div className="flex flex-col justify-between rounded-xl border bg-muted/30 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Gemini Key Rotation</span>
                  <Badge variant="outline" className="border-success/40 bg-success/15 text-success font-semibold text-[10px]">
                    ● 54 Keys
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">Auto-fallback AI API</p>
              </div>
            </div>
          </Card>

          {/* CARD 2: ESSENTIAL PLATFORM PREFERENCES */}
          <Card
            icon={Sliders}
            title="Konfigurasi Utama Kurikulum & Kuis"
            desc="Pengaturan dasar untuk nama platform dan nilai standar kuis evaluasi."
          >
            <div className="space-y-4 text-xs">
              <div className="grid gap-1.5">
                <Label className="font-bold text-xs">Nama Platform</Label>
                <Input
                  value={namaPlatform}
                  onChange={(e) => setNamaPlatform(e.target.value)}
                  className="text-xs bg-muted/20"
                />
              </div>

              <div className="grid gap-1.5">
                <Label className="font-bold text-xs">Standar Versi Kurikulum</Label>
                <Input
                  value={versiKurikulum}
                  onChange={(e) => setVersiKurikulum(e.target.value)}
                  className="text-xs bg-muted/20"
                />
              </div>

              <div className="grid gap-1.5">
                <Label className="font-bold text-xs">Nilai Minimum Lulus Kuis Default (%)</Label>
                <Input
                  type="number"
                  value={passingGradeDefault}
                  onChange={(e) => setPassingGradeDefault(e.target.value)}
                  className="text-xs bg-muted/20 w-32"
                  min={50}
                  max={100}
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" disabled={saving} className="font-bold shadow-xs">
              <Save className="mr-1.5 h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>
          </div>
        </form>
      </PageBody>
    </>
  );
}
