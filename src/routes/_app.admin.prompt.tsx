import { createFileRoute } from "@tanstack/react-router";
import { Wand2, Sparkles, Copy, Upload, Check, Loader2, ClipboardList, BookOpen, Layers } from "lucide-react";
import { useState, useEffect } from "react";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { daftarApiKeys, tambahApiKey, importBanyakApiKey } from "@/functions/api-keys";

export const Route = createFileRoute("/_app/admin/prompt")({
  head: () => ({
    meta: [
      { title: "Prompt & API Keys — Admin BrevetAI" },
      { name: "description", content: "Pustaka prompt dan manajemen rotasi ratusan API key Gemini." },
    ],
  }),
  component: AdminPrompt,
});

function AdminPrompt() {
  const [keysList, setKeysList] = useState<any[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [singleKeyName, setSingleKeyName] = useState("");
  const [singleKeyValue, setSingleKeyValue] = useState("");
  const [batchText, setBatchText] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sequential Module Generator States
  const [modulUrutan, setModulUrutan] = useState("2");
  const [modulSekarang, setModulSekarang] = useState("Ketentuan Umum Perpajakan (KUP)");
  const [modulSebelumnya, setModulSebelumnya] = useState("Modul 1: PPh Orang Pribadi & Tarif Progresif Pasal 17");
  const [tipeHasil, setTipeHasil] = useState<"MODUL" | "KUIS" | "GAMBAR">("MODUL");
  const [generatedPromptText, setGeneratedPromptText] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const memuatKeys = async () => {
    setLoadingKeys(true);
    try {
      const res = await daftarApiKeys();
      if (res.success && res.data) {
        setKeysList(res.data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingKeys(false);
    }
  };

  useEffect(() => {
    memuatKeys();
  }, []);

  const updateGeneratedPrompt = () => {
    if (tipeHasil === "MODUL") {
      setGeneratedPromptText(
        `[PROMPT CLAUDE - GENERATOR MODUL BERKELANJUTAN & RISET MENDALAM]\n` +
        `Anda adalah Pakar Utama Perpajakan Indonesia dan Perancang Kurikulum Brevet A & B.\n\n` +
        `PERINTAH RISET MENDALAM PERPAJAKAN:\n` +
        `1. Lakukan analisis riset hukum mendalam berdasarkan UU HPP No. 7/2021, UU KUP, PMK 168/2023, dan aturan DJP terbaru.\n` +
        `2. Sajikan materi dalam Bahasa Indonesia yang lugas, mudah dipahami, bebas istilah membingungkan, dilengkapi studi kasus angka nyata.\n\n` +
        `KONTEKS KURIKULUM & MODUL SEBELUMNYA (KONTINUITAS):\n` +
        `- Modul Sebelumnya yang Sudah Terbit: "${modulSebelumnya}"\n` +
        `- Urutan Modul Saat Ini: Modul Ke-${modulUrutan}\n\n` +
        `TUGAS UTAMA:\n` +
        `Buatkan isi materi lengkap untuk Modul Ke-${modulUrutan}: "${modulSekarang}".\n` +
        `Pastikan modul ini menyambung secara konseptual dari modul sebelumnya, tidak mengulang dasar yang sudah dibahas, dan membangun pemahaman bertahap yang sempurna.\n\n` +
        `OUTPUT HARUS BERUPA JSON VALID SESUAI SKEMA KONTEN ENGINE BREVETAI:\n` +
        `{\n` +
        `  "judul": "Modul ${modulUrutan}: ${modulSekarang}",\n` +
        `  "slug": "${modulSekarang.toLowerCase().replace(/[^a-z0-9]/g, "-")}",\n` +
        `  "urutan": ${modulUrutan},\n` +
        `  "tingkatKesulitan": "DASAR",\n` +
        `  "estimasiMenit": 45,\n` +
        `  "bab": [\n` +
        `    {\n` +
        `      "judulBab": "Bab 1: Konsep & Riset Regulasi",\n` +
        `      "isiTeks": "Penjelasan riset mendalam...",\n` +
        `      "studiKasus": "Contoh kasus angka riil...",\n` +
        `      "poinKunci": ["Poin 1", "Poin 2"]\n` +
        `    }\n` +
        `  ]\n` +
        `}`
      );
    } else if (tipeHasil === "KUIS") {
      setGeneratedPromptText(
        `[PROMPT CLAUDE - GENERATOR 10 SOAL KUIS BEBAS DUPLIKASI]\n` +
        `Anda adalah Pakar Perpajakan Indonesia.\n` +
        `Buatkan 10 Soal Kuis Pilihan Ganda BARU untuk "${modulSekarang}" (Modul Ke-${modulUrutan}).\n\n` +
        `KONTEKS KONTINUITAS:\n` +
        `Modul ini melanjutkan topik dari "${modulSebelumnya}". Jangan buat ulang soal dari modul terdahulu.\n\n` +
        `OUTPUT HARUS BERUPA JSON VALID SKEMA KUIS BREVETAI.`
      );
    } else {
      setGeneratedPromptText(
        `[PROMPT DALL-E 3 / CHATGPT - INFOGRAFIS EDUTAINMENT PAJAK]\n` +
        `A high-resolution, modern educational visual infographic illustrating "${modulSekarang}". Clean flat vector UI design, vibrant indigo and emerald palette, structured tax calculation flow, clear typography, professional finance aesthetics. No text misspelling, 16:9 aspect ratio.`
      );
    }
  };

  useEffect(() => {
    updateGeneratedPrompt();
  }, [modulUrutan, modulSekarang, modulSebelumnya, tipeHasil]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPromptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleTambahSatu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleKeyName || !singleKeyValue) return;
    setIsSubmitting(true);
    setImportStatus(null);

    try {
      const res = await tambahApiKey({
        data: { nama: singleKeyName, apiKey: singleKeyValue, prioritas: 0 },
      });
      if (res.success) {
        setImportStatus("API Key berhasil ditambahkan!");
        setSingleKeyName("");
        setSingleKeyValue("");
        memuatKeys();
      } else {
        setImportStatus(`Gagal: ${res.message}`);
      }
    } catch {
      setImportStatus("Terjadi kesalahan sistem saat menyimpan key.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchText.trim()) return;

    const baris = batchText.split("\n").filter((b) => b.trim());
    const items = baris.map((b, i) => {
      const [nama, key] = b.includes("=") ? b.split("=") : [`Key-${i + 1}`, b];
      return { nama: nama.trim(), apiKey: key.trim(), prioritas: 0 };
    });

    setIsSubmitting(true);
    setImportStatus(null);

    try {
      const res = await importBanyakApiKey({ data: { keys: items } });
      if (res.success) {
        setImportStatus(res.message);
        setBatchText("");
        memuatKeys();
      } else {
        setImportStatus(`Gagal: ${res.message}`);
      }
    } catch {
      setImportStatus("Terjadi kesalahan sistem saat import batch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Prompt Generator & API Keys"
        description="Generator Prompt Eksternal Claude dengan fitur Riset Mendalam & Kontinuitas Kurikulum Modul Berkelanjutan."
        breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Prompt & API Keys" }]}
      />
      <PageBody className="space-y-6">
        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="generator">🪄 Claude Continuous Module Prompt Generator</TabsTrigger>
            <TabsTrigger value="api-keys">🔑 Gemini API Keys ({keysList.length})</TabsTrigger>
          </TabsList>

          {/* Generator Tab */}
          <TabsContent value="generator" className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 border-b pb-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Wand2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Claude Sequential Module Generator Prompt</h3>
                  <p className="text-xs text-muted-foreground">
                    Menghasilkan prompt berantai untuk Claude agar modul ke-2, ke-3, dst. memiliki konteks berkelanjutan dan riset mendalam.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="urutanInput">Urutan Modul Ke-</Label>
                  <Input
                    id="urutanInput"
                    type="number"
                    value={modulUrutan}
                    onChange={(e) => setModulUrutan(e.target.value)}
                    placeholder="2"
                  />
                </div>
                <div>
                  <Label htmlFor="sekarangInput">Judul Modul Saat Ini</Label>
                  <Input
                    id="sekarangInput"
                    value={modulSekarang}
                    onChange={(e) => setModulSekarang(e.target.value)}
                    placeholder="Ketentuan Umum Perpajakan"
                  />
                </div>
                <div>
                  <Label htmlFor="tipeSelect">Tipe Prompt Output</Label>
                  <Select
                    value={tipeHasil}
                    onValueChange={(v: any) => setTipeHasil(v)}
                  >
                    <SelectTrigger id="tipeSelect">
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MODUL">Modul Pembelajaran Teks (JSON)</SelectItem>
                      <SelectItem value="KUIS">10 Soal Kuis Interaktif (JSON)</SelectItem>
                      <SelectItem value="GAMBAR">Prompt Infografis Visual (DALL-E 3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="sebelumnyaInput">Konteks Modul Terdahulu (Untuk Menjaga Kontinuitas Kurikulum)</Label>
                <Input
                  id="sebelumnyaInput"
                  value={modulSebelumnya}
                  onChange={(e) => setModulSebelumnya(e.target.value)}
                  placeholder="Misal: Modul 1: PPh Orang Pribadi & Tarif Progresif"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label>Hasil Prompt Claude Berantai (Siap Salin)</Label>
                  <Button size="sm" variant="outline" onClick={handleCopy} className="h-7 text-xs">
                    {copiedPrompt ? <Check className="mr-1 h-3.5 w-3.5 text-success" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
                    {copiedPrompt ? "Tersalin!" : "Salin Prompt"}
                  </Button>
                </div>
                <Textarea
                  value={generatedPromptText}
                  onChange={(e) => setGeneratedPromptText(e.target.value)}
                  className="min-h-[280px] font-mono text-xs p-4 leading-relaxed bg-muted/30"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border bg-card p-5">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" /> Aturan Riset & Kontinuitas
                </h4>
                <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed list-disc list-inside">
                  <li><strong>Riset Mendalam:</strong> Prompt mewajibkan Claude menganalisis UU HPP & PMK terbaru.</li>
                  <li><strong>Kontinuitas Kurikulum:</strong> Claude membaca ringkasan modul sebelumnya agar materi menyambung sempurna.</li>
                  <li><strong>Format JSON Valid:</strong> Hasil respon Claude tinggal di-copy dan di-import di menu CMS.</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border bg-card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-base">Import Ratusan Gemini API Keys</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Masukkan banyak API key sekaligus (1 per baris). Format: <code className="bg-muted px-1 rounded">NamaKey=AIzaSy...</code>
                </p>
                <form onSubmit={handleImportBatch} className="space-y-3">
                  <Textarea
                    value={batchText}
                    onChange={(e) => setBatchText(e.target.value)}
                    placeholder={`Key-1=AIzaSyA...\nKey-2=AIzaSyB...`}
                    rows={6}
                    disabled={isSubmitting}
                  />
                  <Button type="submit" disabled={isSubmitting || !batchText.trim()}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Import Sekaligus
                  </Button>
                </form>
              </div>

              <div className="rounded-2xl border bg-card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-base">Tambah Satu API Key</h3>
                </div>
                <form onSubmit={handleTambahSatu} className="space-y-3">
                  <div>
                    <Label htmlFor="keyName">Nama Key / Label</Label>
                    <Input
                      id="keyName"
                      value={singleKeyName}
                      onChange={(e) => setSingleKeyName(e.target.value)}
                      placeholder="Misal: Key Utama Dev 1"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="keyValue">API Key Gemini</Label>
                    <Input
                      id="keyValue"
                      type="password"
                      value={singleKeyValue}
                      onChange={(e) => setSingleKeyValue(e.target.value)}
                      placeholder="AIzaSy..."
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting || !singleKeyName || !singleKeyValue}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Simpan Key
                  </Button>
                </form>
              </div>
            </div>

            {importStatus && (
              <div className="rounded-xl bg-primary/10 p-3 text-xs font-medium text-primary border border-primary/20 flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" /> {importStatus}
              </div>
            )}

            <div className="rounded-2xl border bg-card p-5">
              <h3 className="font-semibold text-base mb-4">Daftar API Keys di Database ({keysList.length})</h3>
              {loadingKeys ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Memuat daftar API key...</p>
              ) : keysList.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  Belum ada API key terdaftar di database.
                </p>
              ) : (
                <div className="divide-y text-xs">
                  {keysList.map((k) => (
                    <div key={k.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{k.nama}</p>
                        <p className="text-muted-foreground font-mono text-[11px]">{k.apiKeyAman}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={k.status === "AKTIF" ? "default" : "destructive"}>
                          {k.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}
