import { createFileRoute } from "@tanstack/react-router";
import { Bell, Palette, Globe, Shield, CreditCard, KeyRound, Trash2 } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export const Route = createFileRoute("/_app/pengaturan")({
  head: () => ({
    meta: [
      { title: "Pengaturan — BrevetAI" },
      { name: "description", content: "Atur preferensi akun, tampilan, notifikasi, dan keamanan." },
    ],
  }),
  component: Pengaturan,
});

function Section({ icon: Icon, title, desc, children }: any) {
  return (
    <section className="rounded-2xl border bg-card">
      <div className="border-b p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">{title}</p>
            {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Row({ label, hint, control }: any) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function Pengaturan() {
  return (
    <>
      <PageHeader title="Pengaturan" description="Kelola akun dan preferensi belajarmu." />
      <PageBody className="max-w-3xl space-y-5">
        <Section icon={Palette} title="Tampilan" desc="Atur tema dan pengalaman visual.">
          <Row label="Mode gelap" hint="Aktifkan tampilan gelap untuk mata lebih nyaman." control={<Switch defaultChecked />} />
          <Row label="Font besar" hint="Perbesar teks untuk keterbacaan." control={<Switch />} />
          <Row label="Animasi halus" hint="Aktifkan transisi mikro." control={<Switch defaultChecked />} />
        </Section>

        <Section icon={Bell} title="Notifikasi" desc="Pilih jenis notifikasi yang ingin kamu terima.">
          <Row label="Pengingat belajar harian" control={<Switch defaultChecked />} />
          <Row label="Materi & kuis baru" control={<Switch defaultChecked />} />
          <Row label="Peringkat mingguan" control={<Switch />} />
        </Section>

        <Section icon={Globe} title="Preferensi" desc="Pengaturan umum aplikasi.">
          <Row
            label="Bahasa"
            control={
              <Select defaultValue="id">
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                </SelectContent>
              </Select>
            }
          />
          <Row
            label="Zona waktu"
            control={
              <Select defaultValue="wib">
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="wib">WIB (UTC+7)</SelectItem>
                  <SelectItem value="wita">WITA (UTC+8)</SelectItem>
                  <SelectItem value="wit">WIT (UTC+9)</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </Section>

        <Section icon={KeyRound} title="Keamanan" desc="Kata sandi dan sesi aktif.">
          <div className="space-y-3">
            <div className="grid gap-1.5">
              <Label>Kata sandi saat ini</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="grid gap-1.5">
              <Label>Kata sandi baru</Label>
              <Input type="password" placeholder="Minimal 8 karakter" />
            </div>
            <Button size="sm">Simpan</Button>
          </div>
        </Section>

        <Section icon={CreditCard} title="Langganan" desc="Paket dan pembayaran.">
          <Row
            label="Paket saat ini"
            hint="Pelajar — Rp99.000/bulan"
            control={<Button size="sm" variant="outline">Kelola</Button>}
          />
        </Section>

        <Section icon={Shield} title="Akun">
          <Row
            label="Hapus akun"
            hint="Tindakan permanen. Semua datamu akan dihapus."
            control={<Button size="sm" variant="destructive"><Trash2 className="mr-1 h-3.5 w-3.5" /> Hapus</Button>}
          />
        </Section>
      </PageBody>
    </>
  );
}
