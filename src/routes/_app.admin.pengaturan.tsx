import { createFileRoute } from "@tanstack/react-router";
import { Server, Sparkles, Database, ShieldCheck, CheckCircle2, AlertTriangle, Save } from "lucide-react";
import { useState } from "react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/admin/pengaturan")({
  head: () => ({
    meta: [
      { title: "Pengaturan Platform — Admin BrevetAI" },
      { name: "description", content: "Konfigurasi inti sistem, AI workflow, dan database Neon." },
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
  const [aiActive, setAiActive] = useState(true);
  const [defaultModel, setDefaultModel] = useState("claude-3-5-sonnet (External AI)");
  const [maintMode, setMaintMode] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <>
      <PageHeader
        title="Pengaturan Sistem & Konfigurasi AI"
        description="Kelola pengaturan penting platform BrevetAI tanpa informasi yang berlebihan."
        breadcrumb={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Pengaturan" }]}
      />

      <PageBody className="max-w-3xl space-y-6">
        {savedMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-success/15 border border-success/30 p-3.5 text-xs text-success font-semibold">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Pengaturan platform berhasil disimpan di memori sistem!</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* CARD 1: DATABASE & AUTH STATUS */}
          <Card
            icon={Database}
            title="Koneksi Database & Keamanan"
            desc="Status infrastruktur server yang berjalan saat ini."
          >
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-3.5">
                <div>
                  <p className="font-bold text-foreground">Neon PostgreSQL</p>
                  <p className="text-[11px] text-muted-foreground">Serverless DB (Drizzle ORM)</p>
                </div>
                <Badge variant="outline" className="border-success/40 bg-success/15 text-success font-semibold">
                  ● Terhubung
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-3.5">
                <div>
                  <p className="font-bold text-foreground">Better Auth v1.6</p>
                  <p className="text-[11px] text-muted-foreground">Sesi & Kredensial Pengguna</p>
                </div>
                <Badge variant="outline" className="border-success/40 bg-success/15 text-success font-semibold">
                  ● Aktif (Secure)
                </Badge>
              </div>
            </div>
          </Card>

          {/* CARD 2: AI WORKFLOW CONFIG */}
          <Card
            icon={Sparkles}
            title="Konfigurasi AI Workflow (Rule 12)"
            desc="Aturan pembuatan konten otomatis menggunakan Claude AI eksternal & Gemini."
          >
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">Generator Prompt Claude di CMS</p>
                  <p className="text-muted-foreground mt-0.5">
                    Izinkan Admin menghasilkan prompt tersinkronisasi dan mengimpor kembali format JSON ke database.
                  </p>
                </div>
                <Switch checked={aiActive} onCheckedChange={setAiActive} />
              </div>

              <div className="grid gap-1.5 pt-2 border-t">
                <Label className="font-bold text-xs">Model Standar Pembuatan Modul</Label>
                <Input
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className="text-xs bg-muted/20"
                />
                <p className="text-[11px] text-muted-foreground italic">
                  * Catatan: Sistem mematuhi Aturan Master 12 dimana CMS bertindak sebagai prompter & validator JSON.
                </p>
              </div>
            </div>
          </Card>

          {/* CARD 3: MAINTENANCE MODE */}
          <Card
            icon={Server}
            title="Mode Pemeliharaan Sistem (Maintenance)"
            desc="Kendalikan akses masuk publik saat pembaruan kurikulum pajak besar-besaran."
          >
            <div className="flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-foreground">Aktifkan Mode Pemeliharaan</p>
                <p className="text-muted-foreground mt-0.5">
                  Jika aktif, siswa biasa (STUDENT) tidak dapat mengakses modul atau kuis untuk sementara.
                </p>
              </div>
              <Switch checked={maintMode} onCheckedChange={setMaintMode} />
            </div>
            {maintMode && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Perhatian: Portal siswa akan ditutup sementara jika perubahan ini disimpan!</span>
              </div>
            )}
          </Card>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" className="font-semibold">
              <Save className="mr-1.5 h-4 w-4" /> Simpan Pengaturan Platform
            </Button>
          </div>
        </form>
      </PageBody>
    </>
  );
}
