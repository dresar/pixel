import { createFileRoute } from "@tanstack/react-router";
import {
  Wand2,
  Copy,
  Check,
  Download,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CheckSquare,
  Square,
  FileCode,
  Layers,
  ChevronDown,
} from "lucide-react";
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
const TINGKAT_OPTIONS = ["DASAR", "MENENGAH", "LANJUT"];

function injectVariables(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value || `[${key}]`);
  }
  return result;
}

function PromptCompilerPage() {
  const { engines, existingModules } = Route.useLoaderData();

  // Variables form (simplified)
  const [topik, setTopik] = useState("");
  const [judulModul, setJudulModul] = useState("");
  const [level, setLevel] = useState("BREVET_A");
  const [tipeOutput, setTipeOutput] = useState("MODUL_PEMBELAJARAN");
  const [tingkat, setTingkat] = useState("DASAR");

  // Defaults as requested:
  const tahunSekarang = useMemo(() => new Date().getFullYear().toString(), []);
  const defaultAudiens = "Peserta yang belajar Brevet Pajak A & B";
  const defaultBahasa = "Bahasa Indonesia";
  const defaultSkema = "2.0";

  // Engine toggles
  const [activeEngineIds, setActiveEngineIds] = useState<Set<string>>(
    () => new Set((engines as any[]).filter((e) => e.aktif).map((e) => e.id))
  );

  const [copied, setCopied] = useState(false);
  const [showConfig, setShowConfig] = useState(true);

  const variables: Record<string, string> = {
    // Primary & Aliases requested by user
    TOPIK: topik || "{{TOPIK}}",
    TOPIK_MATERI: topik || "{{TOPIK_MATERI}}",
    JUDUL_MODUL: judulModul || "{{JUDUL_MODUL}}",
    LEVEL: level,
    LEVEL_BREVET: level,
    TINGKAT: tingkat,
    TINGKAT_KESULITAN: tingkat,
    OUTPUT_SIZE: "LENGKAP",
    BAHASA: defaultBahasa,
    BAHASA_OUTPUT: defaultBahasa,
    AUDIENS: defaultAudiens,
    TARGET_AUDIENS: defaultAudiens,
    TARGET_PEMBELAJAR: defaultAudiens,
    VISUAL_STYLE: "Infografis pendidikan profesional, clean, tanpa watermark",
    GAYA_VISUAL: "Infografis pendidikan profesional, clean, tanpa watermark",
    GAYA_PENJELASAN: "Formal, jelas, pedagogis, mudah dipahami dengan analogi",

    // System & Schema meta
    TAHUN_REGULASI: tahunSekarang,
    REGULASI_VERSI: tahunSekarang,
    TIPE_OUTPUT: tipeOutput,
    OUTPUT_TYPE: tipeOutput,
    JENIS_KONTEN: tipeOutput,
    VERSI_SKEMA: defaultSkema,
    JSON_SCHEMA_VERSION: defaultSkema,
    JENIS_ASSESSMENT: "Quiz Pilihan Ganda, Case Study, & Practice Exercise",
    MIN_SOAL: "5",
    MODUL_SEBELUMNYA: "Modul terdahulu jika ada",
    MODUL_BERIKUTNYA: "Modul lanjutan jika ada",
    MODUL_TERKAIT: "Modul sejenis",
    DAFTAR_MODUL_TERSEDIA: "Modul Brevet A/B terdaftar",
    IDENTITAS_AI: "Ahli Kurikulum & Pengajar Utama",
  };

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
      return injectVariables(engine.kontenTemplate, variables);
    });
    return sections.join("\n\n" + "─".repeat(60) + "\n\n") + kontinuitasContext;
  }, [compiledEngines, variables, kontinuitasContext]);

  const charCount = superPrompt.length;
  const tokenEstimate = Math.ceil(charCount / 4);

  const handleCopy = useCallback(() => {
    if (!superPrompt) return;
    navigator.clipboard.writeText(superPrompt);
    setCopied(true);
    toast.success("Super Prompt berhasil disalin ke clipboard! Siap dipaste ke Claude.ai");
    setTimeout(() => setCopied(false), 2500);
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

  const toggleSelectAll = () => {
    if (activeEngineIds.size === engines.length) {
      setActiveEngineIds(new Set());
    } else {
      setActiveEngineIds(new Set((engines as any[]).map((e) => e.id)));
    }
  };

  const missingVars = !topik.trim() || !judulModul.trim();

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

      <PageBody className="space-y-6 pb-24">
        {/* TOP PANEL: Form Input & Engine Selector (Full Width Expandable) */}
        <div className="rounded-2xl border bg-card shadow-xs overflow-hidden">
          <div
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20 cursor-pointer select-none hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-bold text-sm text-foreground">
                Pengaturan Variabel & Engine Kompilasi
              </span>
              {topik && judulModul && (
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {topik} ({level})
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">
                {showConfig ? "Sembunyikan Form" : "Buka Form"}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showConfig ? "rotate-180" : ""}`} />
            </div>
          </div>

          {showConfig && (
            <div className="p-5 space-y-6">
              {/* Form Input Grid (Clean 5 Fields) */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
                  <Label className="text-xs font-bold">Topik Materi *</Label>
                  <Input
                    value={topik}
                    onChange={(e) => setTopik(e.target.value)}
                    placeholder="Contoh: PPh Pasal 21 TER"
                    className="text-xs bg-background"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
                  <Label className="text-xs font-bold">Judul Modul *</Label>
                  <Input
                    value={judulModul}
                    onChange={(e) => setJudulModul(e.target.value)}
                    placeholder="Contoh: Pemotongan & Pemungutan PPh"
                    className="text-xs bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Level Brevet</Label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {LEVEL_OPTIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Tingkat Kesulitan</Label>
                  <select
                    value={tingkat}
                    onChange={(e) => setTingkat(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {TINGKAT_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
                  <Label className="text-xs font-bold">Tipe Output</Label>
                  <select
                    value={tipeOutput}
                    onChange={(e) => setTipeOutput(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {TIPE_OUTPUT_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Engine Selector Badges */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary" /> Engine Kompilasi Aktif ({compiledEngines.length}/{engines.length})
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={toggleSelectAll}
                    className="h-6 text-[11px] font-semibold text-primary"
                  >
                    {activeEngineIds.size === engines.length ? "Nihilkan Semua" : "Pilih Semua (18 Engine)"}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(engines as any[]).map((engine) => {
                    const isChecked = activeEngineIds.has(engine.id);
                    return (
                      <button
                        key={engine.id}
                        type="button"
                        onClick={() => toggleEngine(engine.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isChecked
                            ? "bg-primary/15 text-primary border border-primary/40 font-bold"
                            : "bg-muted/40 text-muted-foreground border border-transparent hover:bg-muted"
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <Square className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        )}
                        <span>#{engine.urutanKompilasi} {engine.nama}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Validation Warning */}
        {missingVars && (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-xs text-amber-400 font-semibold shadow-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Harap isi <strong>"Topik Materi"</strong> dan <strong>"Judul Modul"</strong> pada form di atas untuk meng-compile Super Prompt.</span>
          </div>
        )}

        {/* FULL WIDTH SUPER PROMPT LIVE PREVIEW */}
        <div className="rounded-2xl border bg-card shadow-md overflow-hidden flex flex-col min-h-[550px]">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2.5">
              <FileCode className="h-4 w-4 text-primary" />
              <span className="font-bold text-sm text-foreground">
                Super Prompt (Full-Width Live Preview)
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
              <span><strong className="text-foreground">{charCount.toLocaleString()}</strong> karakter</span>
              <span>·</span>
              <span>~<strong className="text-foreground">{tokenEstimate.toLocaleString()}</strong> token</span>
              <span>·</span>
              <span><strong className="text-foreground">{compiledEngines.length}</strong> engine</span>
            </div>
          </div>

          {/* Active Engines Tags */}
          <div className="px-5 py-2 border-b bg-muted/10 flex flex-wrap gap-1">
            {compiledEngines.map((e) => (
              <Badge key={e.id} variant="outline" className="text-[9px] font-mono px-2 py-0.5 bg-background">
                #{e.urutanKompilasi} {e.nama}
              </Badge>
            ))}
          </div>

          {/* Code Body — Large Area */}
          <div className="flex-1 p-5 overflow-y-auto bg-background/50 font-mono text-xs text-foreground leading-relaxed min-h-[420px]">
            {superPrompt ? (
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed selection:bg-primary/30">
                {superPrompt}
              </pre>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
                <Sparkles className="h-10 w-10 text-primary/30 animate-pulse" />
                <span className="text-xs max-w-sm">
                  Masukkan Topik & Judul Modul di form bagian atas untuk meng-compile Super Prompt 18 engine secara langsung.
                </span>
              </div>
            )}
          </div>

          {/* MAIN ACTION BAR AT THE BOTTOM (Besar, Jelas, & Nyaman untuk Copy) */}
          <div className="border-t bg-muted/40 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground leading-relaxed text-center sm:text-left">
              <strong className="text-foreground">Langkah Selanjutnya:</strong> Salin Super Prompt di atas ➔ Buka <a href="https://claude.ai" target="_blank" rel="noreferrer" className="text-primary underline font-bold">Claude.ai</a> ➔ Paste ➔ Unduh JSON Artifact ➔ Impor di CMS Modul.
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleDownload("txt")}
                disabled={missingVars || !superPrompt}
                className="h-10 text-xs px-3 font-semibold shadow-2xs"
              >
                <Download className="mr-1.5 h-4 w-4" /> Download TXT
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleDownload("md")}
                disabled={missingVars || !superPrompt}
                className="h-10 text-xs px-3 font-semibold shadow-2xs"
              >
                <Download className="mr-1.5 h-4 w-4" /> Download MD
              </Button>

              <Button
                type="button"
                size="lg"
                onClick={handleCopy}
                disabled={missingVars || !superPrompt}
                className="h-10 text-xs sm:text-sm px-5 font-bold bg-primary text-primary-foreground shadow-md hover:bg-primary/90 flex-1 sm:flex-none"
              >
                {copied ? <Check className="mr-2 h-4 w-4 text-success" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Berhasil Disalin!" : "⚡ Salin Super Prompt"}
              </Button>
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}
