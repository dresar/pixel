import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Scale,
  Calculator,
  HelpCircle,
  Trash2,
  Eye,
  FileJson,
  Edit3,
  ClipboardList,
  Sparkles,
  Code,
  Copy,
  Check,
  Type,
  Download,
  Bot,
  Wand2,
  X,
  Terminal,
  Sparkle,
  Image as ImageIcon,
  CheckCircle2,
  Cpu,
  Layers,
  Settings,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { PageBody, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getDaftarSemuaLesson, updateLessonAdmin, getDaftarModul, getKontenPelajaran } from "@/functions/modules";

export const Route = createFileRoute("/_app/admin/materi/$slug")({
  loader: async ({ params }) => {
    try {
      const [lessonRes, modulRes, singleRes] = await Promise.all([
        getDaftarSemuaLesson(),
        getDaftarModul({ data: { halaman: 1, per_halaman: 50 } }),
        getKontenPelajaran({ slug: params.slug }).catch(() => null),
      ]);
      const lessonsList = lessonRes?.success && lessonRes?.data ? lessonRes.data : [];
      const modulesList = modulRes?.success && modulRes?.data ? modulRes.data : [];
      
      let currentLesson = lessonsList.find(
        (l: any) => l.slug === params.slug || l.id === params.slug
      ) || null;

      if (!currentLesson && singleRes && singleRes.success && singleRes.data) {
        currentLesson = singleRes.data;
      }

      return { currentLesson, modulesList, lessonsList };
    } catch {
      return { currentLesson: null, modulesList: [], lessonsList: [] };
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Edit ${loaderData?.currentLesson?.judul || "Materi"} — Admin BrevetAI` },
      { name: "description", content: "Editor materi edukasi perpajakan Brevet A/B." },
    ],
  }),
  component: EditMateriDetailPage,
});

function EditMateriDetailPage() {
  const { currentLesson, modulesList, lessonsList } = Route.useLoaderData();
  const navigate = useNavigate();

  if (!currentLesson) {
    return (
      <PageBody className="py-16 text-center space-y-4">
        <h3 className="text-xl font-bold text-foreground">Materi Tidak Ditemukan</h3>
        <p className="text-xs text-muted-foreground">Data materi yang Anda cari tidak tersedia di database Neon.</p>
        <Button onClick={() => navigate({ to: "/admin/materi" })}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Materi
        </Button>
      </PageBody>
    );
  }

  // Parent Module Name
  const parentModule = useMemo(() => {
    if (currentLesson?.modulJudul) return currentLesson.modulJudul;
    if (!currentLesson?.modulId || !modulesList) return "Modul Perpajakan Brevet A/B";
    const found = modulesList.find((m: any) => m.id === currentLesson.modulId);
    return found ? (found.judul || found.title) : "Modul Perpajakan Brevet A/B";
  }, [currentLesson, modulesList]);

  // Prompt Engine Options State
  const [outputSize, setOutputSize] = useState<"SANGAT_LENGKAP" | "LENGKAP" | "RINGKAS">("SANGAT_LENGKAP");
  const [visualStyle, setVisualStyle] = useState<"INFOGRAFIS" | "MINDMAP" | "FLOWCHART" | "COMPARISON_TABLE">("INFOGRAFIS");
  const [tahunRegulasi, setTahunRegulasi] = useState("Regulasi Terbaru");

  // 🌲 FULL CURRICULUM CONTENT TREE MAP WITH ALL 100% TEKS MATERI DATABASE INCLUDED
  const fullCurriculumContentTree = useMemo(() => {
    if (!lessonsList || lessonsList.length === 0) {
      return "[DATABASE CONTEXT EMPTY]";
    }

    const groupedMap = new Map<string, any[]>();
    lessonsList.forEach((l: any) => {
      const groupKey = l.modulJudul || l.chapterJudul || "Modul Perpajakan Brevet A/B";
      if (!groupedMap.has(groupKey)) groupedMap.set(groupKey, []);
      groupedMap.get(groupKey)!.push(l);
    });

    let resultText = "";
    let modCounter = 1;

    groupedMap.forEach((mLessons, mName) => {
      resultText += `<module_group id="${modCounter}" name="${mName}">\n`;
      resultText += `  <total_lessons>${mLessons.length}</total_lessons>\n`;

      mLessons.forEach((l: any, lIdx: number) => {
        let fullContentText = "";
        if (l.kontenJson) {
          try {
            const pObj = typeof l.kontenJson === "string" ? JSON.parse(l.kontenJson) : l.kontenJson;
            const bList = pObj.blok_konten || pObj.blocks || (Array.isArray(pObj) ? pObj : []);
            if (Array.isArray(bList) && bList.length > 0) {
              fullContentText = bList.map((b: any, bIdx: number) => {
                if (b.tipe === "STORY_HOOK") return `    <block index="${bIdx+1}" type="STORY_HOOK">${b.data?.narasi || b.data?.teks || ""}</block>`;
                if (b.tipe === "PARAGRAF") return `    <block index="${bIdx+1}" type="PARAGRAF">${b.data?.teks || b.data?.narasi || ""}</block>`;
                if (b.tipe === "PASAL_HUKUM") return `    <block index="${bIdx+1}" type="PASAL_HUKUM" law="${b.data?.undang_undang || ""}" article="${b.data?.pasal || ""}">${b.data?.bunyi_pasal || ""}</block>`;
                if (b.tipe === "CONTOH_KASUS") return `    <block index="${bIdx+1}" type="CONTOH_KASUS" title="${b.data?.judul_kasus || ""}"><scenario>${b.data?.skenario || ""}</scenario><calculation>${b.data?.perhitungan || ""}</calculation></block>`;
                if (b.tipe === "GLOSARIUM") return `    <block index="${bIdx+1}" type="GLOSARIUM" term="${b.data?.istilah || ""}">${b.data?.definisi || ""}</block>`;
                if (b.tipe === "POIN_KUNCI") return `    <block index="${bIdx+1}" type="POIN_KUNCI">${b.data?.teks || b.data?.poin || ""}</block>`;
                if (b.tipe === "VISUAL_PROMPT") return `    <block index="${bIdx+1}" type="VISUAL_PROMPT" kind="${b.data?.jenis_visual || ""}">${b.data?.deskripsi || ""}</block>`;
                return `    <block index="${bIdx+1}" type="${b.tipe}">${JSON.stringify(b.data || {})}</block>`;
              }).join("\n");
            }
          } catch {
            fullContentText = "";
          }
        }

        const isTarget = (l.id === currentLesson.id || l.slug === currentLesson.slug) ? ' target="true"' : '';
        resultText += `  <lesson index="${modCounter}.${lIdx + 1}" title="${l.judul}" slug="${l.slug}"${isTarget}>\n`;
        resultText += fullContentText ? `${fullContentText}\n` : `    <status>DRAFT_IN_PROGRESS</status>\n`;
        resultText += `  </lesson>\n`;
      });

      resultText += `</module_group>\n`;
      modCounter++;
    });

    return resultText;
  }, [lessonsList, currentLesson]);

  // 🛡️ SAFE PARSING OF KONTEN_JSON FROM NEON DB (SUPPORT ALL 7 BLOCK TYPES)
  const initialBlocks = useMemo(() => {
    let parsed: any = null;
    if (currentLesson?.kontenJson) {
      if (typeof currentLesson.kontenJson === "string") {
        try {
          parsed = JSON.parse(currentLesson.kontenJson);
        } catch {
          parsed = {
            versi: "2.0",
            metadata: { tipe: "EDUKASI_TEKS" },
            blok_konten: [
              {
                tipe: "PARAGRAF",
                data: { teks: currentLesson.kontenJson },
              },
            ],
          };
        }
      } else if (typeof currentLesson.kontenJson === "object") {
        parsed = currentLesson.kontenJson;
      }
    }

    let loadedBlocks = [];
    if (parsed && Array.isArray(parsed.blok_konten) && parsed.blok_konten.length > 0) {
      loadedBlocks = parsed.blok_konten;
    } else if (parsed && Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
      loadedBlocks = parsed.blocks;
    }

    if (loadedBlocks.length > 0) return loadedBlocks;

    // Default Fallback blocks if database contains empty [] or null
    return [
      {
        tipe: "STORY_HOOK",
        data: {
          narasi: `Pernahkah Anda membayangkan bagaimana seluruh sistem perpajakan di Indonesia saling terhubung dari undang-undang hingga simulasi Coretax? Mari kita pelajari ${currentLesson.judul || "materi ini"}.`,
        },
      },
      {
        tipe: "PARAGRAF",
        data: {
          teks: currentLesson.deskripsi || `Penjelasan teoretis dan yuridis mendalam mengenai ${currentLesson.judul || "materi perpajakan"}...`,
        },
      },
      {
        tipe: "PASAL_HUKUM",
        data: {
          undang_undang: "UU No. 7 Tahun 2021 tentang HPP",
          pasal: "Pasal 17 ayat (1)",
          bunyi_pasal: "Dasar hukum pelaksanaan perpajakan di Indonesia.",
        },
      },
      {
        tipe: "CONTOH_KASUS",
        data: {
          judul_kasus: `Studi Kasus ${currentLesson.judul}`,
          skenario: "Wajib Pajak A melakukan kewajiban perpajakan sesuai ketentuan regulasi terbaru.",
          perhitungan: "Perhitungan PPh Terutang: Layer 1 (5%) + Layer 2 (15%) = Total Pajak Terutang.",
        },
      },
      {
        tipe: "GLOSARIUM",
        data: {
          istilah: "Coretax DJP",
          definisi: "Sistem inti administrasi perpajakan terpadu Direktorat Jenderal Pajak.",
        },
      },
    ];
  }, [currentLesson]);

  const [editJudul, setEditJudul] = useState(currentLesson.judul || (currentLesson as any).title || "");
  const [blocks, setBlocks] = useState<any[]>(initialBlocks);
  const [quizData, setQuizData] = useState<any | null>(null);
  const [rawJsonText, setRawJsonText] = useState(
    JSON.stringify(
      { versi: "2.0", metadata: { tipe: "EDUKASI_TEKS" }, blok_konten: initialBlocks },
      null,
      2
    )
  );
  const [activeTab, setActiveTab] = useState("visual");
  const [loading, setLoading] = useState(false);

  // Modal / External Prompt Studio State
  const [showPromptStudio, setShowPromptStudio] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [pastedAiJson, setPastedAiJson] = useState("");

  // Per-block formatting tools state (HTML Code Editor view toggle & font size)
  const [htmlViewBlockIdx, setHtmlViewBlockIdx] = useState<number | null>(null);
  const [blockFontSizes, setBlockFontSizes] = useState<Record<number, string>>({});
  const [copiedBlockIdx, setCopiedBlockIdx] = useState<number | null>(null);

  // 🚀 CLAUDE CONTENT GENERATION ENGINE v4 (PRODUCTION READY REFACTOR)
  const externalSuperPrompt = useMemo(() => {
    return `<role>
  Anda adalah Lead Tax Curriculum Architect, Senior Tax Consultant, dan AI Pedagogical Engine Specialist di BrevetAI. Anda bertanggung jawab menghasilkan materi pembelajaran perpajakan Indonesia kelas dunia (Brevet A & B) yang super mendalam, 100% akurat secara regulasi, mudah dipahami, serta dilengkapi evaluasi kuis dan metadata CMS utuh.
</role>

<mission>
  Menyusun dan mengompilasi materi edukasi perpajakan terpadu beserta bank soal evaluasi kuis (10 Pilihan Ganda + 5 Esai Uraian Perhitungan) untuk topik "{{TOPIK_MATERI}}" di bawah induk modul "{{JUDUL_MODUL}}" menggunakan skema terstruktur JSON Schema v{{JSON_SCHEMA_VERSION}} tanpa potongan teks sama sekali.
</mission>

<variables>
  <variable name="JUDUL_MODUL">${parentModule}</variable>
  <variable name="TOPIK_MATERI">${editJudul}</variable>
  <variable name="TARGET_AUDIENS">Peserta Brevet Pajak A & B, Praktisi Keuangan, & Konsultan Pajak Pemula</variable>
  <variable name="LEVEL_BREVET">BREVET_AB</variable>
  <variable name="JENIS_KONTEN">EDUKASI_TEKS_DAN_BANK_SOAL</variable>
  <variable name="OUTPUT_SIZE">${outputSize}</variable>
  <variable name="TAHUN_REGULASI">${tahunRegulasi}</variable>
  <variable name="VISUAL_STYLE">${visualStyle}</variable>
  <variable name="JSON_SCHEMA_VERSION">2.0</variable>
  <variable name="JUMLAH_SOAL_PG">10</variable>
  <variable name="JUMLAH_SOAL_ESAI">5</variable>
  <variable name="JUMLAH_FLASHCARD">5</variable>
  <variable name="JUMLAH_CASE_STUDY">2</variable>
</variables>

<context>
  BrevetAI adalah platform edutech perpajakan terdepan di Indonesia. Seluruh materi harus mengikuti regulasi resmi DJP Kementerian Keuangan RI terbaru, termasuk UU HPP No. 7/2021, PMK No. 168/2023 (TER Kategori A, B, C), PP No. 55/2022, PER-16/PJ/2016, serta ekosistem Coretax DJP & E-Bupot 21/26.
</context>

<database_context>
  <description>Peta lengkap dan konten teks utuh 100% dari seluruh modul dan materi yang ada pada Neon DB BrevetAI untuk menghindari duplikasi dan menjaga kontinuitas alur pembelajaran:</description>
${fullCurriculumContentTree}
</database_context>

<rules>
  1. WAJIB LENGKAP 100%: Dilarang keras menggunakan singkatan placeholder seperti "(dan seterusnya...)", "[lanjutan...]", atau "...". Seluruh narasi, pasal, contoh kasus, dan soal evaluasi wajib ditulis secara utuh dari awal sampai akhir.
  2. GAYA BAHASA NON-FORMAL & KOMUNIKATIF: Gunakan Bahasa Indonesia non-formal / semi-formal yang sangat ramah, santai, komunikatif, dan pedagogis seperti mentor profesional yang menjelaskan kepada teman sejawat, dengan tetap mempertahankan presisi hukum perpajakan.
  3. INTEGRITAS DASAR HUKUM: Setiap pasal dan undang-undang wajib memuat nomor UU/PMK, tahun, pasal, dan ayat yang tepat. Jika ada aspek yang masih membutuhkan verifikasi regulasi teknis spesifik, tandai secara eksplisit.
  4. ZERO ASSUMPTION: Jangan memunculkan asumsi perhitungan yang bertentangan dengan UU HPP & TER PMK 168/2023.
</rules>

<workflow_multi_pass>
  Sebelum mengeluarkan JSON akhir, jalankan urutan analisis internal berikut:
  Pass 1: Memahami topik materi {{TOPIK_MATERI}} dan posisinya di modul {{JUDUL_MODUL}}.
  Pass 2: Melakukan cross-check regulasi perpajakan (UU HPP, PMK 168/2023, Coretax DJP).
  Pass 3: Mengidentifikasi prerequisite dan knowledge gap yang mungkin dimiliki peserta.
  Pass 4: Menyusun Story Hook & analogi kehidupan nyata yang intuitif.
  Pass 5: Menguraikan penjelasan teoretis, dasar pasal hukum, dan simulasi hitungan step-by-step.
  Pass 6: Menyusun 10 Soal Kuis Pilihan Ganda (PG) + 5 Soal Esai Uraian Perhitungan.
  Pass 7: Mengompilasi visual prompt infografis/diagram dan metadata CMS lengkap.
  Pass 8: Melakukan Self Review & Quality Check sebelum merilis JSON final.
</workflow_multi_pass>

<research>
  <engine_name>Deep Research Engine</engine_name>
  <instruction>
    Verifikasi seluruh dasar hukum perpajakan Indonesia:
    - UU No. 7 Tahun 2021 (UU HPP) klaster PPh & tarif progresif Pasal 17 OP.
    - PMK No. 168/2023 tentang Pemotongan PPh Pasal 21/26 (TER Kategori A, B, C).
    - PP No. 55 Tahun 2022 tentang Penyesuaian Pengaturan PPh.
    - PER-16/PJ/2016 tentang Pedoman Teknis Pemotongan PPh.
    - Integrasi Sistem Coretax DJP & Pelaporan e-Bupot 21/26.
  </instruction>
</research>

<reasoning>
  <engine_name>Tax Reasoning Engine</engine_name>
  <instruction>
    Jelaskan filosofi di balik regulasi perpajakan: mengapa aturan ini ada, apa tujuan pemerintah, siapa subjek yang memotong/dipotong, bagaimana dampaknya terhadap akuntansi perusahaan (jurnal debet/kredit), serta berikan analogi kehidupan sehari-hari yang mudah dicerna.
  </instruction>
</reasoning>

<curriculum>
  <engine_name>Curriculum & Knowledge Gap Engine</engine_name>
  <instruction>
    Jaga kesinambungan materi dengan melihat database_context. Jika topik {{TOPIK_MATERI}} membutuhkan pemahaman konsep dasar (seperti PTKP, TER, PKP, atau NIK-NPWP Coretax) yang belum dibahas, berikan pengantar singkat untuk menutup knowledge gap peserta.
  </instruction>
</curriculum>

<pedagogy>
  <engine_name>Pedagogy & Story Engine</engine_name>
  <instruction>
    Awali materi dengan Story Hook atau perumpamaan dunia nyata yang menarik perhatian. Lanjutkan dengan penjelasan konsep utama, pasal hukum terkait, studi kasus simulasi angka hitungan step-by-step, kesalahan umum (common mistakes) yang sering terjadi di lapangan, dan poin kunci rangkuman.
  </instruction>
</pedagogy>

<visual>
  <engine_name>Visual Engine</engine_name>
  <instruction>
    Hasilkan prompt gambar AI DALL-E / Midjourney berkualitas tinggi dengan gaya visual {{VISUAL_STYLE}} yang menjelaskan alur atau struktur materi perpajakan ini secara visual, profesional, tanpa watermark, dan ramah pembelajar.
  </instruction>
</visual>

<assessment>
  <engine_name>Assessment Engine</engine_name>
  <instruction>
    Hasilkan bank soal evaluasi lengkap:
    1. 10 Soal Pilihan Ganda (4 Opsi: A, B, C, D) lengkap dengan isBenar, pembahasan detail, dan dasar hukum.
    2. 5 Soal Esai / Uraian Perhitungan Kasus Nyata lengkap dengan skenario, pertanyaan, dan langkah perhitungan step-by-step.
  </instruction>
</assessment>

<cms_metadata>
  <engine_name>CMS Metadata Engine</engine_name>
  <instruction>
    Hasilkan metadata CMS lengkap: slug, keywords, tags, difficulty ({{LEVEL_BREVET}}), prerequisite, related modules, search keywords, dan versi regulasi.
  </instruction>
</cms_metadata>

<json_schema>
Hasilkan keluaran persis sesuai JSON Schema v{{JSON_SCHEMA_VERSION}} berikut:
\`\`\`json
{
  "versi": "2.0",
  "metadata": {
    "judul_materi": "${editJudul}",
    "modul": "${parentModule}",
    "slug": "${currentLesson.slug}",
    "tingkat": "BREVET_AB",
    "gaya_bahasa": "NON_FORMAL_KOMUNIKATIF",
    "output_size": "${outputSize}",
    "tahun_regulasi": "${tahunRegulasi}",
    "total_kuis_pg": 10,
    "total_esai_uraian": 5
  },
  "blok_konten": [
    {
      "tipe": "STORY_HOOK",
      "data": { "narasi": "Story hook pengantar komunikatif..." }
    },
    {
      "tipe": "PARAGRAF",
      "data": { "teks": "Penjelasan teoretis dan filosofis mendalam..." }
    },
    {
      "tipe": "PASAL_HUKUM",
      "data": {
        "undang_undang": "UU No. 7 Tahun 2021 tentang HPP",
        "pasal": "Pasal 17 ayat (1) huruf a",
        "bunyi_pasal": "Teks kutipan pasal..."
      }
    },
    {
      "tipe": "CONTOH_KASUS",
      "data": {
        "judul_kasus": "Simulasi Perhitungan PPh 17 vs TER PMK 168/2023",
        "skenario": "Skenario kasus nyata...",
        "perhitungan": "Langkah 1: ...\nLangkah 2: ...\nTotal PPh Terutang = ..."
      }
    },
    {
      "tipe": "GLOSARIUM",
      "data": { "istilah": "TER", "definisi": "Definisi istilah perpajakan..." }
    },
    {
      "tipe": "POIN_KUNCI",
      "data": { "teks": "Rangkuman poin utama..." }
    },
    {
      "tipe": "VISUAL_PROMPT",
      "data": {
        "jenis_visual": "${visualStyle}",
        "deskripsi": "Deskripsi gambar visual",
        "promptGambar": "Infografis pendidikan profesional, clean, tanpa watermark"
      }
    }
  ],
  "kuis_evaluasi": {
    "soal_pilihan_ganda": [
      {
        "nomor": 1,
        "soal": "Soal studi kasus pilihan ganda 1...",
        "opsi": [
          { "abjad": "A", "teks": "Opsi A", "isBenar": false },
          { "abjad": "B", "teks": "Opsi B (Benar)", "isBenar": true },
          { "abjad": "C", "teks": "Opsi C", "isBenar": false },
          { "abjad": "D", "teks": "Opsi D", "isBenar": false }
        ],
        "pembahasan": "Pembahasan detail...",
        "dasar_hukum": "UU HPP Pasal 17"
      }
    ],
    "soal_esai_uraian": [
      {
        "nomor": 1,
        "judul_kasus": "Studi Kasus Hitungan 1",
        "skenario_soal": "Skenario soal...",
        "pertanyaan": "Berapakah PPh terutang?",
        "kunci_jawaban_perhitungan": "Langkah 1: ...\nHasil Akhir: ..."
      }
    ]
  }
}
\`\`\`
</json_schema>

<output_contract>
  WAJIB HANYA MENGHASILKAN TEPAT SATU CLAUDE ARTIFACT / FILE JSON VALID SESUAI SCHEMA DI ATAS. DILARANG KERAS MENAMBAHKAN TEKS PENJELASAN PEMBUKA/PENUTUP DI LUAR JSON SCHEMA!
</output_contract>`;
  }, [editJudul, parentModule, currentLesson, fullCurriculumContentTree, outputSize, visualStyle, tahunRegulasi]);

  const handleCopyExternalPrompt = () => {
    navigator.clipboard.writeText(externalSuperPrompt);
    setCopiedPrompt(true);
    toast.success("Claude Engine v4 Production Prompt berhasil disalin! Siap dipaste ke Claude 3.5 Sonnet / ChatGPT.");
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleDownloadExternalPrompt = (format: "txt" | "md") => {
    const content = format === "md"
      ? `# Claude Content Generation Engine v4 - ${editJudul}\n\n> Waktu Kompilasi Engine: ${new Date().toLocaleString("id-ID")}\n> Modul: ${parentModule}\n\n---\n\n\`\`\`xml\n${externalSuperPrompt}\n\`\`\``
      : externalSuperPrompt;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `claude-engine-v4-${editJudul.toLowerCase().replace(/[^a-z0-9]/g, "-")}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`File Claude Engine v4 Prompt berhasil diunduh (.${format})`);
  };

  const handleApplyPastedAiJson = () => {
    if (!pastedAiJson.trim()) {
      toast.error("Tempelkan hasil JSON dari Claude / ChatGPT terlebih dahulu.");
      return;
    }

    try {
      let cleanJson = pastedAiJson.trim();
      if (cleanJson.startsWith("```json")) cleanJson = cleanJson.replace(/^```json/, "").replace(/```$/, "").trim();
      if (cleanJson.startsWith("```")) cleanJson = cleanJson.replace(/^```/, "").replace(/```$/, "").trim();

      const parsed = JSON.parse(cleanJson);
      const newBlocks = parsed.blok_konten || parsed.blocks || [];
      if (!Array.isArray(newBlocks) || newBlocks.length === 0) {
        toast.error("Format JSON tidak memiliki array 'blok_konten' yang valid.");
        return;
      }

      setBlocks(newBlocks);
      if (parsed.kuis_evaluasi) {
        setQuizData(parsed.kuis_evaluasi);
      }

      const updatedFullJson = {
        versi: "2.0",
        metadata: { tipe: "EDUKASI_TEKS", ...parsed.metadata },
        blok_konten: newBlocks,
        kuis_evaluasi: parsed.kuis_evaluasi || undefined,
      };
      setRawJsonText(JSON.stringify(updatedFullJson, null, 2));

      const totalPg = parsed.kuis_evaluasi?.soal_pilihan_ganda?.length || 0;
      const totalEsai = parsed.kuis_evaluasi?.soal_esai_uraian?.length || 0;
      const quizInfo = totalPg || totalEsai ? ` + ${totalPg} Kuis PG & ${totalEsai} Esai Uraian` : "";

      toast.success(`${newBlocks.length} Blok Materi AI${quizInfo} berhasil diterapkan ke editor!`);
      setShowPromptStudio(false);
      setPastedAiJson("");
    } catch {
      toast.error("Format JSON dari AI tidak valid. Pastikan sintaks JSON sesuai schema.");
    }
  };

  const handleAddBlock = (tipe: string) => {
    let newBlockData: any = {};
    if (tipe === "STORY_HOOK") {
      newBlockData = { narasi: "Bayangkan sebuah skenario perpajakan nyata..." };
    } else if (tipe === "PARAGRAF") {
      newBlockData = { teks: "Tuliskan penjelasan materi perpajakan baru di sini..." };
    } else if (tipe === "PASAL_HUKUM") {
      newBlockData = {
        undang_undang: "UU No. 7 Tahun 2021 tentang HPP",
        pasal: "Pasal 17 ayat (1) huruf a",
        bunyi_pasal: "Tarif PPh Orang Pribadi berlaku progresif dari 5% sampai dengan 35% atas Penghasilan Kena Pajak.",
      };
    } else if (tipe === "CONTOH_KASUS") {
      newBlockData = {
        judul_kasus: "Perhitungan PPh Pasal 17 OP & TER PMK 168/2023",
        skenario: "Wajib Pajak A memiliki PKP sebesar Rp 100.000.000 dalam satu tahun pajak.",
        perhitungan: "Layer 1 (5% x Rp 60.000.000) = Rp 3.000.000\nLayer 2 (15% x Rp 40.000.000) = Rp 6.000.000\nTotal PPh Terutang = Rp 9.000.000",
      };
    } else if (tipe === "GLOSARIUM") {
      newBlockData = {
        istilah: "PTKP",
        definisi: "Penghasilan Tidak Kena Pajak sebagai batasan dasar pemotongan PPh Orang Pribadi.",
      };
    } else if (tipe === "POIN_KUNCI") {
      newBlockData = { teks: "Kesimpulan poin penting dari materi ini..." };
    } else if (tipe === "VISUAL_PROMPT") {
      newBlockData = {
        jenis_visual: "INFOGRAFIS",
        deskripsi: "Diagram struktur tarif PPh Pasal 17",
        promptGambar: "Infografis pendidikan profesional, clean, tanpa watermark",
      };
    }

    const updatedBlocks = [...blocks, { tipe, data: newBlockData }];
    setBlocks(updatedBlocks);
    setRawJsonText(
      JSON.stringify(
        { versi: "2.0", metadata: { tipe: "EDUKASI_TEKS" }, blok_konten: updatedBlocks, kuis_evaluasi: quizData || undefined },
        null,
        2
      )
    );
  };

  const handleUpdateBlockField = (index: number, key: string, value: string) => {
    const nextBlocks = [...blocks];
    nextBlocks[index] = {
      ...nextBlocks[index],
      data: { ...nextBlocks[index].data, [key]: value },
    };
    setBlocks(nextBlocks);
    setRawJsonText(
      JSON.stringify(
        { versi: "2.0", metadata: { tipe: "EDUKASI_TEKS" }, blok_konten: nextBlocks, kuis_evaluasi: quizData || undefined },
        null,
        2
      )
    );
  };

  const handleRemoveBlock = (index: number) => {
    const nextBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(nextBlocks);
    setRawJsonText(
      JSON.stringify(
        { versi: "2.0", metadata: { tipe: "EDUKASI_TEKS" }, blok_konten: nextBlocks, kuis_evaluasi: quizData || undefined },
        null,
        2
      )
    );
  };

  const handleSimpanMateri = async () => {
    setLoading(true);
    try {
      let finalJson = { versi: "2.0", metadata: { tipe: "EDUKASI_TEKS" }, blok_konten: blocks, kuis_evaluasi: quizData || undefined };
      if (activeTab === "json") {
        finalJson = JSON.parse(rawJsonText);
      }

      const res = await updateLessonAdmin({
        data: {
          id: currentLesson.id,
          judul: editJudul,
          statusPublikasi: "TERBIT",
          kontenJson: finalJson,
        },
      });

      if (res.success) {
        toast.success(`Materi "${editJudul}" berhasil diperbarui ke database Neon!`);
      } else {
        toast.error(res.message || "Gagal memperbarui materi");
      }
    } catch (err: any) {
      toast.error(err?.message || "Gagal memperbarui materi. Pastikan format JSON benar.");
    } finally {
      setLoading(false);
    }
  };

  // Helper render HTML block string for Code Editor Suite
  const getBlockHtmlString = (block: any) => {
    if (block.tipe === "STORY_HOOK") {
      return `<div className="story-hook bg-primary/10 border-l-4 border-primary p-4 rounded-r-xl">\n  <p className="italic text-sm text-foreground">${block.data?.narasi || block.data?.teks || ""}</p>\n</div>`;
    }
    if (block.tipe === "PARAGRAF") {
      return `<p className="text-sm text-foreground leading-relaxed">${block.data?.teks || block.data?.narasi || ""}</p>`;
    }
    if (block.tipe === "POIN_KUNCI") {
      return `<div className="poin-kunci border border-primary/30 bg-primary/5 p-3 rounded-xl flex items-center gap-2">\n  <strong className="text-primary font-bold">Poin Kunci:</strong> <span>${block.data?.teks || block.data?.poin || ""}</span>\n</div>`;
    }
    if (block.tipe === "PASAL_HUKUM") {
      return `<div className="pasal-box border-l-4 border-amber-500 bg-amber-500/10 p-4 rounded-r-xl">\n  <strong className="text-amber-500 font-bold">${block.data?.undang_undang || ""} • ${block.data?.pasal || ""}</strong>\n  <p className="italic font-serif text-sm mt-1">"${block.data?.bunyi_pasal || ""}"</p>\n</div>`;
    }
    if (block.tipe === "CONTOH_KASUS") {
      return `<div className="studi-kasus border border-emerald-500/30 bg-emerald-500/10 p-4 rounded-xl">\n  <h4 className="text-xs font-bold text-emerald-500">${block.data?.judul_kasus || ""}</h4>\n  <p className="text-xs mt-1">${block.data?.skenario || ""}</p>\n  <pre className="font-mono text-xs bg-background p-3 rounded-lg border mt-2"><code>${block.data?.perhitungan || ""}</code></pre>\n</div>`;
    }
    if (block.tipe === "GLOSARIUM") {
      return `<div className="glosarium-item border border-blue-500/30 bg-blue-500/10 p-3 rounded-xl flex items-center justify-between text-xs">\n  <strong className="font-bold text-blue-500">${block.data?.istilah || ""}:</strong>\n  <span className="text-foreground">${block.data?.definisi || ""}</span>\n</div>`;
    }
    if (block.tipe === "VISUAL_PROMPT") {
      return `<div className="visual-prompt border border-purple-500/30 bg-purple-500/10 p-3 rounded-xl text-xs">\n  <strong>Visual (${block.data?.jenis_visual || ""}):</strong> ${block.data?.deskripsi || ""}\n</div>`;
    }
    return `<div>${JSON.stringify(block.data)}</div>`;
  };

  const handleCopyBlockHtml = (idx: number, block: any) => {
    const html = getBlockHtmlString(block);
    navigator.clipboard.writeText(html);
    setCopiedBlockIdx(idx);
    toast.success(`HTML Code Snippet Blok #${idx + 1} berhasil disalin!`);
    setTimeout(() => setCopiedBlockIdx(null), 2000);
  };

  return (
    <>
      <PageHeader
        title={`Edit Materi: ${currentLesson.judul}`}
        description="Sunting teks, dasar hukum, contoh kasus, dan glosarium secara interaktif."
        breadcrumb={[
          { label: "Admin", to: "/admin/dashboard" },
          { label: "Materi", to: "/admin/materi" },
          { label: "Edit" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate({ to: "/admin/materi" })} className="font-bold">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali
            </Button>

            {/* BUTTON 1: TAMBAHKAN KUIS UNTUK MATERI INI */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate({ to: "/admin/kuis/baru" })}
              className="font-bold border-amber-500/40 text-amber-500 hover:bg-amber-500/10 shadow-2xs"
            >
              <ClipboardList className="mr-1.5 h-4 w-4" /> + Buat Kuis Materi Ini
            </Button>

            {/* BUTTON 2: GENERATE MATERI (Buka Prompt Studio External Panel) */}
            <Button
              size="sm"
              onClick={() => setShowPromptStudio(!showPromptStudio)}
              className="font-bold bg-gradient-to-r from-primary to-amber-500 text-white shadow-md"
            >
              <Sparkles className="mr-1.5 h-4 w-4" /> Generate Materi
            </Button>

            <Button size="sm" onClick={handleSimpanMateri} disabled={loading} className="font-bold shadow-md">
              {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              Simpan Perubahan
            </Button>
          </div>
        }
      />

      <PageBody className="space-y-6">
        {/* IN-PAGE EXTERNAL PROMPT STUDIO PANEL (CLAUDE CONTENT GENERATION ENGINE v4) */}
        {showPromptStudio && (
          <div className="rounded-2xl border-2 border-primary/40 bg-card p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between border-b pb-3 gap-2">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" /> Claude Content Generation Engine v4 (Production Ready)
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Structured XML Prompting with Multi-Pass Workflow, Deep Research, Tax Reasoning, and Full Database Context.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button size="xs" variant="outline" onClick={() => handleDownloadExternalPrompt("txt")}>
                  <Download className="mr-1 h-3.5 w-3.5" /> .TXT
                </Button>
                <Button size="xs" variant="outline" onClick={() => handleDownloadExternalPrompt("md")}>
                  <Download className="mr-1 h-3.5 w-3.5" /> .MD
                </Button>
                <Button size="xs" onClick={handleCopyExternalPrompt} className="font-bold">
                  {copiedPrompt ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
                  Salin Prompt Engine v4
                </Button>
                <Button size="xs" variant="ghost" onClick={() => setShowPromptStudio(false)} className="text-muted-foreground">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Dynamic Engine Control Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-muted/30 p-3 rounded-xl border text-xs">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3 text-primary" /> Output Size Engine
                </Label>
                <select
                  value={outputSize}
                  onChange={(e) => setOutputSize(e.target.value as any)}
                  className="w-full bg-background border rounded-lg p-1.5 text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value="SANGAT_LENGKAP">SANGAT LENGKAP (Exhaustive Deep Detail)</option>
                  <option value="LENGKAP">LENGKAP (Standard Brevet A/B)</option>
                  <option value="RINGKAS">RINGKAS (Summary Mode)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                  <ImageIcon className="h-3 w-3 text-purple-500" /> Visual Engine Style
                </Label>
                <select
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value as any)}
                  className="w-full bg-background border rounded-lg p-1.5 text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value="INFOGRAFIS">INFOGRAFIS (Edukasi Visual)</option>
                  <option value="MINDMAP">MINDMAP (Hierarki Konsep)</option>
                  <option value="FLOWCHART">FLOWCHART (Alur Prosedur)</option>
                  <option value="COMPARISON_TABLE">COMPARISON TABLE (Matriks Tabel)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                  <Settings className="h-3 w-3 text-amber-500" /> Tahun Regulasi Acuan *
                </Label>
                <select
                  value={tahunRegulasi}
                  onChange={(e) => setTahunRegulasi(e.target.value)}
                  className="w-full bg-background border rounded-lg p-1.5 text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value="Regulasi Terbaru">Regulasi Terbaru (Default) ⭐</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </select>
              </div>
            </div>

            <Textarea
              rows={16}
              value={externalSuperPrompt}
              readOnly
              className="font-mono text-xs leading-relaxed bg-background p-4 border rounded-xl"
            />

            {/* PASTE BOX FOR AI RESULT */}
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Bot className="h-4 w-4 text-emerald-500" /> Tempelkan Hasil JSON dari Claude / ChatGPT di sini:
              </span>
              <Textarea
                rows={5}
                placeholder="Pastekan hasil keluaran JSON dari AI di sini..."
                value={pastedAiJson}
                onChange={(e) => setPastedAiJson(e.target.value)}
                className="font-mono text-xs bg-background"
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleApplyPastedAiJson} className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                  🚀 Terapkan Hasil AI (Materi + 10 Kuis PG & 5 Esai Uraian) ke Editor
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border bg-card p-6 space-y-6 shadow-xs">
          {/* Header Title Editor */}
          <div className="space-y-2 border-b pb-4">
            <Label className="text-xs font-bold">Judul Materi Pembelajaran *</Label>
            <Input
              value={editJudul}
              onChange={(e) => setEditJudul(e.target.value)}
              className="text-base font-bold bg-background"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 bg-muted/50 p-1 rounded-xl mb-6">
              <TabsTrigger value="visual" className="font-semibold text-xs py-2">
                <Edit3 className="mr-1.5 h-4 w-4 text-primary" /> Visual Editor Blok
              </TabsTrigger>
              <TabsTrigger value="preview" className="font-semibold text-xs py-2">
                <Eye className="mr-1.5 h-4 w-4 text-primary" /> Pratinjau Tampilan Siswa
              </TabsTrigger>
              <TabsTrigger value="json" className="font-semibold text-xs py-2">
                <FileJson className="mr-1.5 h-4 w-4 text-primary" /> Editor Raw JSON
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: VISUAL EDITOR BLOK */}
            <TabsContent value="visual" className="space-y-6">
              {/* Toolbar Tambah Blok */}
              <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Tambah Blok Konten Edukasi:</span>
                  <Badge variant="outline" className="text-[10px] font-mono text-primary">
                    {blocks.length} Blok Aktif
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="xs" variant="outline" onClick={() => handleAddBlock("STORY_HOOK")} className="font-semibold text-xs">
                    <Sparkle className="mr-1.5 h-3.5 w-3.5 text-purple-500" /> + Story Hook
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => handleAddBlock("PARAGRAF")} className="font-semibold text-xs">
                    <FileText className="mr-1.5 h-3.5 w-3.5 text-primary" /> + Paragraf
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => handleAddBlock("PASAL_HUKUM")} className="font-semibold text-xs">
                    <Scale className="mr-1.5 h-3.5 w-3.5 text-amber-500" /> + Pasal Hukum
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => handleAddBlock("CONTOH_KASUS")} className="font-semibold text-xs">
                    <Calculator className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> + Contoh Kasus
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => handleAddBlock("GLOSARIUM")} className="font-semibold text-xs">
                    <HelpCircle className="mr-1.5 h-3.5 w-3.5 text-blue-500" /> + Glosarium
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => handleAddBlock("POIN_KUNCI")} className="font-semibold text-xs">
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-teal-500" /> + Poin Kunci
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => handleAddBlock("VISUAL_PROMPT")} className="font-semibold text-xs">
                    <ImageIcon className="mr-1.5 h-3.5 w-3.5 text-indigo-500" /> + Visual Prompt
                  </Button>
                </div>
              </div>

              {/* Lista Blok Konten (HANDLES ALL 7 BLOCK TYPES) */}
              <div className="space-y-4">
                {blocks.map((block: any, idx: number) => {
                  const fontSize = blockFontSizes[idx] || "text-xs";
                  const isHtmlView = htmlViewBlockIdx === idx;
                  const bType = block.tipe || "PARAGRAF";

                  return (
                    <div key={idx} className="rounded-xl border bg-background p-4 space-y-3 relative group shadow-2xs">
                      {/* Header Row Toolbar per Blok */}
                      <div className="flex flex-wrap items-center justify-between border-b pb-2.5 gap-2">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                          Blok #{idx + 1} • {bType}
                        </span>

                        {/* Rich Code Suite Toolbar */}
                        <div className="flex items-center gap-1.5">
                          {/* Font Size Preset Selector */}
                          <div className="flex items-center gap-1 bg-muted/40 px-2 py-1 rounded-lg border">
                            <Type className="h-3 w-3 text-primary" />
                            <select
                              value={fontSize}
                              onChange={(e) => setBlockFontSizes({ ...blockFontSizes, [idx]: e.target.value })}
                              className="bg-transparent text-[11px] font-bold text-foreground focus:outline-none"
                              title="Ukuran Font Teks"
                            >
                              <option value="text-[11px]">11px (Kecil)</option>
                              <option value="text-xs">12px (Normal)</option>
                              <option value="text-sm">14px (Sedang)</option>
                              <option value="text-base">16px (Besar)</option>
                              <option value="text-lg">18px (Judul Sub)</option>
                            </select>
                          </div>

                          {/* Code Editor View Toggle */}
                          <Button
                            size="xs"
                            variant={isHtmlView ? "default" : "outline"}
                            onClick={() => setHtmlViewBlockIdx(isHtmlView ? null : idx)}
                            className="h-7 px-2.5 text-[11px] font-bold shadow-2xs"
                            title="Toggle HTML Code Editor View"
                          >
                            <Terminal className="mr-1 h-3.5 w-3.5" /> {isHtmlView ? "Form Editor" : "Code HTML"}
                          </Button>

                          {/* Salin HTML Code */}
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => handleCopyBlockHtml(idx, block)}
                            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                            title="Salin Code Snippet HTML"
                          >
                            {copiedBlockIdx === idx ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>

                          {/* Hapus Blok */}
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => handleRemoveBlock(idx)}
                            className="text-destructive hover:bg-destructive/10 h-7 px-2"
                            title="Hapus Blok Ini"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* HTML CODE EDITOR SUITE WITH LINE NUMBERS & SYNTAX VIEW */}
                      {isHtmlView ? (
                        <div className="rounded-xl border border-amber-500/30 bg-card overflow-hidden">
                          <div className="bg-muted/50 px-3 py-1.5 border-b flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Code className="h-3 w-3 text-amber-500" /> block-{idx + 1}.html
                            </span>
                            <span>HTML Syntax Highlight View</span>
                          </div>
                          <div className="flex font-mono text-xs">
                            <div className="select-none bg-muted/20 p-3 text-right text-muted-foreground border-r font-mono text-[10px] space-y-1">
                              <div>1</div>
                              <div>2</div>
                              <div>3</div>
                              <div>4</div>
                            </div>
                            <Textarea
                              rows={4}
                              value={getBlockHtmlString(block)}
                              readOnly
                              className="border-0 rounded-none font-mono text-xs bg-background p-3 leading-relaxed text-amber-500 focus-visible:ring-0"
                            />
                          </div>
                        </div>
                      ) : (
                        /* STANDARD VISUAL FORM INPUTS (HANDLES ALL 7 TYPES) */
                        <>
                          {bType === "STORY_HOOK" && (
                            <Textarea
                              rows={3}
                              placeholder="Narasi pengantar / story hook..."
                              value={block.data?.narasi || block.data?.teks || ""}
                              onChange={(e) => handleUpdateBlockField(idx, "narasi", e.target.value)}
                              className={`italic ${fontSize} leading-relaxed bg-primary/5 border-primary/20`}
                            />
                          )}

                          {bType === "PARAGRAF" && (
                            <Textarea
                              rows={4}
                              placeholder="Teks paragraf penjelasan..."
                              value={block.data?.teks || block.data?.narasi || ""}
                              onChange={(e) => handleUpdateBlockField(idx, "teks", e.target.value)}
                              className={`font-normal ${fontSize} leading-relaxed bg-background`}
                            />
                          )}

                          {bType === "POIN_KUNCI" && (
                            <Textarea
                              rows={2}
                              placeholder="Rangkuman poin kunci..."
                              value={block.data?.teks || block.data?.poin || ""}
                              onChange={(e) => handleUpdateBlockField(idx, "teks", e.target.value)}
                              className={`font-bold ${fontSize} bg-teal-500/10 border-teal-500/30`}
                            />
                          )}

                          {bType === "PASAL_HUKUM" && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <Input
                                  placeholder="UU (Contoh: UU HPP No. 7/2021)"
                                  value={block.data?.undang_undang || ""}
                                  onChange={(e) => handleUpdateBlockField(idx, "undang_undang", e.target.value)}
                                  className="text-xs font-bold bg-background"
                                />
                                <Input
                                  placeholder="Pasal (Contoh: Pasal 17)"
                                  value={block.data?.pasal || ""}
                                  onChange={(e) => handleUpdateBlockField(idx, "pasal", e.target.value)}
                                  className="text-xs font-bold bg-background"
                                />
                              </div>
                              <Textarea
                                placeholder="Bunyi pasal undang-undang..."
                                rows={3}
                                value={block.data?.bunyi_pasal || ""}
                                onChange={(e) => handleUpdateBlockField(idx, "bunyi_pasal", e.target.value)}
                                className={`italic ${fontSize} bg-background`}
                              />
                            </div>
                          )}

                          {bType === "CONTOH_KASUS" && (
                            <div className="space-y-3">
                              <Input
                                placeholder="Judul Studi Kasus"
                                value={block.data?.judul_kasus || ""}
                                onChange={(e) => handleUpdateBlockField(idx, "judul_kasus", e.target.value)}
                                className="text-xs font-bold bg-background"
                              />
                              <Textarea
                                placeholder="Skenario Kasus..."
                                rows={2}
                                value={block.data?.skenario || ""}
                                onChange={(e) => handleUpdateBlockField(idx, "skenario", e.target.value)}
                                className={`bg-background ${fontSize}`}
                              />
                              <Textarea
                                placeholder="Langkah Perhitungan..."
                                rows={3}
                                value={block.data?.perhitungan || ""}
                                onChange={(e) => handleUpdateBlockField(idx, "perhitungan", e.target.value)}
                                className="font-mono text-xs bg-muted/30"
                              />
                            </div>
                          )}

                          {bType === "GLOSARIUM" && (
                            <div className="grid grid-cols-3 gap-3">
                              <Input
                                placeholder="Istilah (Contoh: NPWP)"
                                value={block.data?.istilah || ""}
                                onChange={(e) => handleUpdateBlockField(idx, "istilah", e.target.value)}
                                className="text-xs font-bold bg-background"
                              />
                              <Input
                                placeholder="Definisi Ringkas..."
                                value={block.data?.definisi || ""}
                                onChange={(e) => handleUpdateBlockField(idx, "definisi", e.target.value)}
                                className="text-xs col-span-2 bg-background"
                              />
                            </div>
                          )}

                          {bType === "VISUAL_PROMPT" && (
                            <div className="space-y-3 border p-3 rounded-xl bg-purple-500/5">
                              <div className="grid grid-cols-2 gap-3">
                                <Input
                                  placeholder="Jenis Visual (Contoh: INFOGRAFIS / MINDMAP)"
                                  value={block.data?.jenis_visual || ""}
                                  onChange={(e) => handleUpdateBlockField(idx, "jenis_visual", e.target.value)}
                                  className="text-xs font-bold bg-background"
                                />
                                <Input
                                  placeholder="Deskripsi Singkat..."
                                  value={block.data?.deskripsi || ""}
                                  onChange={(e) => handleUpdateBlockField(idx, "deskripsi", e.target.value)}
                                  className="text-xs bg-background"
                                />
                              </div>
                              <Textarea
                                placeholder="Prompt Gambar AI (DALL-E / Midjourney)..."
                                rows={2}
                                value={block.data?.promptGambar || ""}
                                onChange={(e) => handleUpdateBlockField(idx, "promptGambar", e.target.value)}
                                className="font-mono text-xs bg-background"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* TAB 2: PRATINJAU TAMPILAN SISWA (HANDLES ALL 7 BLOCK TYPES + KUIS EVALUASI) */}
            <TabsContent value="preview" className="space-y-4">
              <div className="rounded-xl border bg-background p-6 space-y-6">
                <div className="border-b pb-4">
                  <Badge variant="secondary" className="mb-2 text-[10px]">PREVIEW TEKS MATERI</Badge>
                  <h2 className="text-2xl font-black text-foreground">{editJudul}</h2>
                </div>

                {blocks.map((b: any, i: number) => (
                  <div key={i} className="space-y-2">
                    {b.tipe === "STORY_HOOK" && (
                      <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
                        <span className="text-[10px] font-bold text-primary block mb-1">💡 STORY HOOK</span>
                        <p className="text-xs italic text-foreground leading-relaxed">{b.data?.narasi || b.data?.teks}</p>
                      </div>
                    )}
                    {b.tipe === "PARAGRAF" && (
                      <p className="text-sm text-foreground leading-relaxed">{b.data?.teks || b.data?.narasi}</p>
                    )}
                    {b.tipe === "POIN_KUNCI" && (
                      <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-3.5 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />
                        <span className="text-xs font-bold text-foreground">{b.data?.teks || b.data?.poin}</span>
                      </div>
                    )}
                    {b.tipe === "PASAL_HUKUM" && (
                      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1.5">
                        <div className="flex items-center gap-2 text-amber-500 font-bold text-xs">
                          <Scale className="h-4 w-4" /> {b.data?.undang_undang} • {b.data?.pasal}
                        </div>
                        <p className="text-xs italic text-foreground leading-relaxed">"{b.data?.bunyi_pasal}"</p>
                      </div>
                    )}
                    {b.tipe === "CONTOH_KASUS" && (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                          <Calculator className="h-4 w-4" /> {b.data?.judul_kasus}
                        </div>
                        <p className="text-xs text-foreground">{b.data?.skenario}</p>
                        <div className="font-mono text-xs bg-background/80 p-3 rounded-lg border whitespace-pre-wrap">
                          {b.data?.perhitungan}
                        </div>
                      </div>
                    )}
                    {b.tipe === "GLOSARIUM" && (
                      <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 flex items-center justify-between text-xs">
                        <span className="font-bold text-blue-500">{b.data?.istilah}</span>
                        <span className="text-foreground">{b.data?.definisi}</span>
                      </div>
                    )}
                    {b.tipe === "VISUAL_PROMPT" && (
                      <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-purple-500 font-bold">
                          <ImageIcon className="h-3.5 w-3.5" /> Visual: {b.data?.jenis_visual}
                        </div>
                        <p className="text-foreground">{b.data?.deskripsi}</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* PREVIEW KUIS EVALUASI (10 PG & 5 ESAI) IF AVAILABLE */}
                {quizData && (
                  <div className="border-t pt-6 space-y-4">
                    <Badge variant="outline" className="text-[10px] font-bold text-amber-500 border-amber-500/30">
                      ⚡ BANK SOAL KUIS EVALUASI AI (10 PG + 5 ESAI URAIAN)
                    </Badge>

                    {quizData.soal_pilihan_ganda && quizData.soal_pilihan_ganda.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-foreground">10 Soal Pilihan Ganda:</h4>
                        {quizData.soal_pilihan_ganda.map((pg: any, i: number) => (
                          <div key={i} className="rounded-xl border bg-muted/20 p-3.5 space-y-2 text-xs">
                            <span className="font-bold text-primary">Soal #{i + 1}: {pg.soal}</span>
                            <div className="grid grid-cols-2 gap-1.5 pl-2">
                              {pg.opsi?.map((o: any, idx: number) => (
                                <div key={idx} className={`p-1.5 rounded-lg border ${o.isBenar ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-500 font-bold" : "bg-background"}`}>
                                  {o.abjad}. {o.teks}
                                </div>
                              ))}
                            </div>
                            {pg.pembahasan && (
                              <p className="text-[11px] text-muted-foreground italic border-t pt-1.5">Pembahasan: {pg.pembahasan}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {quizData.soal_esai_uraian && quizData.soal_esai_uraian.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold text-foreground">5 Soal Esai / Uraian Perhitungan:</h4>
                        {quizData.soal_esai_uraian.map((esai: any, i: number) => (
                          <div key={i} className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-3.5 space-y-2 text-xs">
                            <span className="font-bold text-purple-500">Esai #{i + 1}: {esai.judul_kasus || esai.pertanyaan}</span>
                            {esai.skenario_soal && <p className="text-foreground">{esai.skenario_soal}</p>}
                            <p className="font-semibold text-foreground">Pertanyaan: {esai.pertanyaan}</p>
                            {esai.kunci_jawaban_perhitungan && (
                              <pre className="font-mono text-[11px] bg-background p-2.5 rounded-lg border whitespace-pre-wrap">
                                {esai.kunci_jawaban_perhitungan}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 3: RAW JSON EDITOR */}
            <TabsContent value="json" className="space-y-3">
              <Textarea
                rows={16}
                value={rawJsonText}
                onChange={(e) => setRawJsonText(e.target.value)}
                className="font-mono text-xs bg-background p-4 leading-relaxed"
              />
            </TabsContent>
          </Tabs>

          <div className="border-t pt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate({ to: "/admin/materi" })}>
              Batal
            </Button>
            <Button onClick={handleSimpanMateri} disabled={loading} className="font-bold shadow-md">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              ⚡ Simpan Perubahan Materi
            </Button>
          </div>
        </div>
      </PageBody>
    </>
  );
}
