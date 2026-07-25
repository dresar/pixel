import { createFileRoute } from "@tanstack/react-router";
import { FileJson, Upload, Download, Check, AlertCircle, Copy, Save } from "lucide-react";
import { useState } from "react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/admin/json")({
  head: () => ({
    meta: [
      { title: "JSON Manager — Admin BrevetAI" },
      { name: "description", content: "Kelola konten JSON: import, ekspor, validasi." },
    ],
  }),
  component: AdminJSON,
});

const defaultJsonContent = `{
  "kode": "BRV-A-02",
  "judul": "Pajak Penghasilan Orang Pribadi",
  "level": "Menengah",
  "estimasiMenit": 360,
  "bab": [
    {
      "id": "b1",
      "judul": "Objek PPh Orang Pribadi",
      "materiCount": 4,
      "materi": [
        { "id": "m1", "judul": "Pengertian & Klasifikasi Penghasilan" },
        { "id": "m2", "judul": "Penghasilan Bukan Objek Pajak (Pasal 4 ayat 3)" }
      ]
    },
    {
      "id": "b2",
      "judul": "Tarif & Perhitungan PPh Pasal 21 TER",
      "materiCount": 6,
      "materi": [
        { "id": "m3", "judul": "Penerapan TER Kategori A, B, C" },
        { "id": "m4", "judul": "Perhitungan Masa Pajak Terakhir (Desember)" }
      ]
    }
  ]
}`;

function AdminJSON() {
  const [jsonText, setJsonText] = useState(defaultJsonContent);
  const [isValid, setIsValid] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleValidasi = (val: string) => {
    setJsonText(val);
    try {
      JSON.parse(val);
      setIsValid(true);
      setErrorMsg(null);
    } catch (e: any) {
      setIsValid(false);
      setErrorMsg(e.message);
    }
  };

  const handleSimpan = () => {
    if (!isValid) return;
    setStatusMsg("Konten JSON berhasil disimpan dan divalidasi!");
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleEkspor = () => {
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modul-pph-op-v1.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Manajemen Konten JSON"
        description="Impor, ekspor, edit interaktif, dan validasi skema skrip pembelajaran JSON."
        breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "JSON" }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleEkspor}>
              <Download className="mr-1 h-3.5 w-3.5" /> Ekspor JSON
            </Button>
            <Button size="sm" onClick={handleSimpan} disabled={!isValid}>
              <Save className="mr-1 h-3.5 w-3.5" /> Simpan Perubahan
            </Button>
          </>
        }
      />
      <PageBody className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <FileJson className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">modul-pph-op-v1.json</p>
            </div>
            {isValid ? (
              <Badge variant="outline" className="text-success border-success/30 bg-success/10 gap-1">
                <Check className="h-3.5 w-3.5" /> Syntax JSON Valid
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Syntax Error
              </Badge>
            )}
          </div>
          {statusMsg && (
            <div className="bg-success/15 p-3 text-xs text-success font-medium border-b flex items-center gap-2">
              <Check className="h-4 w-4" /> {statusMsg}
            </div>
          )}
          {errorMsg && (
            <div className="bg-destructive/15 p-3 text-xs text-destructive font-mono border-b">
              {errorMsg}
            </div>
          )}
          <Textarea
            value={jsonText}
            onChange={(e) => handleValidasi(e.target.value)}
            className="min-h-[420px] rounded-none border-0 font-mono text-xs p-5 focus-visible:ring-0 leading-relaxed bg-background"
          />
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm font-semibold">Statistik Dokumen JSON</p>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li className="flex justify-between border-b pb-1.5">
                <span>Ukuran Berkas</span>
                <span className="font-mono text-foreground">{jsonText.length} bytes</span>
              </li>
              <li className="flex justify-between border-b pb-1.5">
                <span>Status Validasi</span>
                <span className={isValid ? "text-success font-semibold" : "text-destructive font-semibold"}>
                  {isValid ? "VALID" : "INVALID"}
                </span>
              </li>
              <li className="flex justify-between border-b pb-1.5">
                <span>Jumlah Bab</span>
                <span className="font-mono text-foreground">2 Bab</span>
              </li>
              <li className="flex justify-between">
                <span>Versi Schema</span>
                <span className="font-mono text-foreground">v1.2</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm font-semibold">Instruksi Impor Batch</p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Format JSON digunakan untuk pembaruan cepat seluruh bab dan materi pelajaran platform BrevetAI secara massal.
            </p>
          </div>
        </aside>
      </PageBody>
    </>
  );
}
