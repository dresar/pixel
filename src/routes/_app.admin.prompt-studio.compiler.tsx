import { createFileRoute } from "@tanstack/react-router";
import { Wand2, Copy, Check, Download, ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getDaftarPromptEngine } from "@/functions/prompt-studio";
import { getDaftarModul } from "@/functions/modules";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/admin/prompt-studio/compiler")({
  loader: async () => {
    try {
      const [enginesRes, modulRes] = await Promise.all([
        getDaftarPromptEngine(),
        getDaftarModul({ data: { halaman: 1, per_halaman: 50 } }),
      ]);
      return {
        engines: enginesRes.success && enginesRes.data ? enginesRes.data : [],
        existingModules: modulRes.success && modulRes.data ? modulRes.data : [],
      };
    } catch {
      return { engines: [], existingModules: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Prompt Compiler — Prompt Studio BrevetAI" },
      { name: "description", content: "Compile Super Prompt kurikulum Brevet A/B untuk Claude AI." },
    ],
  }),
  component: PromptCompilerPage,
});

const TIPE_OUTPUT_OPTIONS = [
  "MODUL_PEMBELAJARAN",
  "BANK_SOAL_KUIS",
  "FLASHCARD",
  "GLOSARIUM",
  "STUDI_KASUS",
  "LATIHAN_SOAL",
  "PENILAIAN",
  "RINGKASAN_MATERI",
];

const LEVEL_OPTIONS = ["BREVET_A", "BREVET_B", "KEDUANYA"];
const BAHASA_OPTIONS = ["Bahasa Indonesia", "English"];
const TINGKAT_OPTIONS = ["DASAR", "MENENGAH", "LANJUT"];
const TAHUN_OPTIONS = ["2025", "2024", "2023"];
const SKEMA_OPTIONS = ["2.0", "1.5"];

function injectVariables(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value || `[${key}]`);
  }
  return result;
}

function PromptCompilerPage() {
  const { engines, existingModules } = Route.useLoaderData();

  // Variables form
  const [topik, setTopik] = useState("");
  const [judulModul, setJudulModul] = useState("");
  const [level, setLevel] = useState("BREVET_A");
  const [audiens, setAudiens] = useState("Peserta ujian Brevet Pajak A & B");
  const [tahun, setTahun] = useState("2025");
  const [tipeOutput, setTipeOutput] = useState("MODUL_PEMBELAJARAN");
  const [bahasa, setBahasa] = useState("Bahasa Indonesia");
  const [versiSkema, setVersiSkema] = useState("2.0");
  const [tingkat, setTingkat] = useState("DASAR");

  // Engine toggles (active engines per compiler session)
  const [activeEngineIds, setActiveEngineIds] = useState<Set<string>>(
    () => new Set(engines.filter((e: any) => e.aktif).map((e: any) => e.id))
  );

  const [copied, setCopied] = useState(false);

  const variables: Record<string, string> = {
    TOPIK_MATERI: topik,
    JUDUL_MODUL: judulModul,
    LEVEL_BREVET: level,
    TARGET_AUDIENS: audiens,
    TAHUN_REGULASI: tahun,
    TIPE_OUTPUT: tipeOutput,
    BAHASA: bahasa,
    VERSI_SKEMA: versiSkema,
    TINGKAT_KESULITAN: tingkat,
    IDENTITAS_AI: "Ahli Kurikulum & Pengajar Utama",
  };

  // Automatically inject continuity context from existing modules
  const kontinuitasContext = useMemo(() => {
    if (!existingModules || existingModules.length === 0) return "";
    return `\n\n[KONTEKS MODUL YANG SUDAH ADA — HINDARI DUPLIKASI]\n${(existingModules as any[]).map((m, i) => `${i + 1}. ${m.judul}: ${m.deskripsi || "-"}`).join("\n")}\n\nBuat MODUL KE-${(existingModules as any[]).length + 1} yang melanjutkan kurikulum tanpa mengulang topik di atas.`;
  }, [existingModules]);

  const compiledEngines = useMemo(() => {
    return (engines as any[])
      .filter((e) => activeEngineIds.has(e.id))
      .sort((a, b) => a.urutanKompilasi - b.urutanKompilasi);
  }, [engines, activeEngineIds]);

  const superPrompt = useMemo(() => {
    if (compiledEngines.length === 0) return "";
    const sections = compiledEngines.map((engine) => {
      const compiled = injectVariables(engine.kontenTemplate, variables);
      return compiled;
    });
    return sections.join("\n\n" + "─".repeat(60) + "\n\n") + kontinuitasContext;
  }, [compiledEngines, variables, kontinuitasContext]);

  const charCount = superPrompt.length;
  const tokenEstimate = Math.ceil(charCount / 4);

  const handleCopy = useCallback(() => {
    if (!superPrompt) return;
    navigator.clipboard.writeText(superPrompt);
    setCopied(true);
    toast.success("Super Prompt berhasil disalin! Paste ke Claude.ai");
    setTimeout(() => setCopied(false), 2000);
  }, [superPrompt]);

  const handleDownload = useCallback((format: "txt" | "md") => {
    if (!superPrompt) return;
    const content = format === "md"
      ? `# BrevetAI Super Prompt\n\n> Generated: ${new Date().toLocaleString("id-ID")}\n> Topik: ${topik}\n> Level: ${level}\n\n---\n\n\`\`\`\n${superPrompt}\n\`\`\``
      : superPrompt;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brevetai-prompt-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Prompt diunduh sebagai .${format}`);
  }, [superPrompt, topik, level]);

  const toggleEngine = (id: string) => {
    setActiveEngineIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const missingVars = !topik || !judulModul;

  return (
    <>
      <PageHeader
        title="Prompt Compiler"
        description="Compile Super Prompt dari engine aktif untuk dikirim ke Claude.ai"
        breadcrumb={[
          { label: "Admin", to: "/admin/dashboard" },
          { label: "Prompt Studio", to: "/admin/prompt-studio" },
          { label: "Compiler" },
        ]}
        actions={
          <Link to="/admin/prompt-studio">
            <Button size="sm" variant="outline" className="font-bold shadow-2xs">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali
            </Button>
          </Link>
        }
      />

      <PageBody>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: Variables Form */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" /> Variabel Generator
              </span>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Topik Materi *</Label>
                <Input
                  value={topik}
                  onChange={(e) => setTopik(e.target.value)}
                  placeholder="Contoh: PPh Pasal 21 TER"
                  className="text-xs bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Judul Modul *</Label>
                <Input
                  value={judulModul}
                  onChange={(e) => setJudulModul(e.target.value)}
                  placeholder="Contoh: Pemotongan & Pemungutan PPh"
                  className="text-xs bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Level Brevet</Label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Tingkat</Label>
                  <select
                    value={tingkat}
                    onChange={(e) => setTingkat(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {TINGKAT_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Tipe Output</Label>
                  <select
                    value={tipeOutput}
                    onChange={(e) => setTipeOutput(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {TIPE_OUTPUT_OPTIONS.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Tahun Regulasi</Label>
                  <select
                    value={tahun}
                    onChange={(e) => setTahun(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {TAHUN_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Bahasa</Label>
                  <select
                    value={bahasa}
                    onChange={(e) => setBahasa(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {BAHASA_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Skema JSON</Label>
                  <select
                    value={versiSkema}
                    onChange={(e) => setVersiSkema(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {SKEMA_OPTIONS.map((s) => <option key={s} value={s}>v{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Target Audiens</Label>
                <Input
                  value={audiens}
                  onChange={(e) => setAudiens(e.target.value)}
                  className="text-xs bg-background"
                />
              </div>
            </div>

            {/* Active Engines Selector */}
            <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-3">
              <span className="text-xs font-bold text-foreground">Engine Aktif ({compiledEngines.length}/{engines.length})</span>
              <div className="space-y-1.5">
                {(engines as any[]).map((engine) => (
                  <label key={engine.id} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={activeEngineIds.has(engine.id)}
                      onChange={() => toggleEngine(engine.id)}
                      className="w-3.5 h-3.5 rounded accent-primary"
                    />
                    <span className={`text-xs font-semibold ${activeEngineIds.has(engine.id) ? "text-foreground" : "text-muted-foreground"}`}>
                      #{engine.urutanKompilasi} {engine.nama}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Compiled Prompt Preview */}
          <div className="lg:col-span-3 space-y-4">
            {/* Info bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-xs">
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                <span><strong className="text-foreground">{charCount.toLocaleString()}</strong> karakter</span>
                <span>·</span>
                <span>~<strong className="text-foreground">{tokenEstimate.toLocaleString()}</strong> token</span>
                <span>·</span>
                <span><strong className="text-foreground">{compiledEngines.length}</strong> engine</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleDownload("txt")} className="h-8 text-xs px-2.5 font-semibold">
                  <Download className="mr-1 h-3.5 w-3.5" /> TXT
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownload("md")} className="h-8 text-xs px-2.5 font-semibold">
                  <Download className="mr-1 h-3.5 w-3.5" /> MD
                </Button>
                <Button
                  size="sm"
                  onClick={handleCopy}
                  disabled={missingVars || !superPrompt}
                  className="h-8 text-xs px-3 font-bold shadow-sm"
                >
                  {copied ? <Check className="mr-1 h-3.5 w-3.5 text-success" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
                  {copied ? "Tersalin!" : "Salin Super Prompt"}
                </Button>
              </div>
            </div>

            {/* Validation warning */}
            {missingVars && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-400 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Isi "Topik Materi" dan "Judul Modul" terlebih dahulu untuk meng-compile prompt.
              </div>
            )}

            {/* Compiled Prompt */}
            <div className="rounded-2xl border bg-card shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/20">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Wand2 className="h-3.5 w-3.5 text-primary" /> Super Prompt (Live Preview)
                </span>
                <div className="flex flex-wrap gap-1">
                  {compiledEngines.map((e) => (
                    <Badge key={e.id} variant="outline" className="text-[9px] font-mono px-1.5 py-0">
                      {e.kodeEngine.split("_")[0]}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="h-[480px] overflow-y-auto p-4">
                {superPrompt ? (
                  <pre className="whitespace-pre-wrap font-mono text-[11px] text-foreground leading-relaxed">
                    {superPrompt}
                  </pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
                    <Sparkles className="h-8 w-8 text-primary/30" />
                    <span className="text-xs">Isi variabel di kiri untuk melihat Super Prompt yang di-compile.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}
