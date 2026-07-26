import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Copy,
  Plus,
  Loader2,
  Check,
  CheckCircle2,
  BookOpen,
  ArrowLeft,
  RefreshCw,
  Bot,
  User,
  AtSign,
  Image as ImageIcon,
  X,
  Paperclip,
  FileText,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/AppShell";
import { kirimPesanChat } from "@/functions/ai";
import { getDaftarModul } from "@/functions/modules";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/ai/chat")({
  validateSearch: (search: Record<string, unknown>) => ({
    lesson: (search.lesson as string) || undefined,
    title: (search.title as string) || undefined,
    id: (search.id as string) || undefined,
  }),
  loader: async () => {
    try {
      const res = await getDaftarModul({ data: { halaman: 1, per_halaman: 50 } });
      return { modulesList: res.success && res.data ? res.data : [] };
    } catch {
      return { modulesList: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Asisten BrevetAI — Chat Pembelajaran Pajak" },
      { name: "description", content: "Asisten cerdas AI Brevet Pajak — penjelasan pasal, tarif, dan studi kasus perpajakan akrab & santai." },
    ],
  }),
  component: AIChatPage,
});

type MessageItem = {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: string;
  imagePreview?: string;
};

// ── FORMATTER RICH HTML VIEW SPACIOUS & HIGHLY READABLE ──────────────────────────
function RichHtmlView({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <div key={`ul-${elements.length}`} className="my-2 space-y-2 pl-1">
          {listItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2 shadow-2xs" />
              <div className="flex-1">{formatInlineText(item)}</div>
            </div>
          ))}
        </div>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushList();
      return;
    }

    // Check Subheading ###
    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h4 key={index} className="mt-4 mb-1.5 text-xs sm:text-sm font-extrabold text-primary flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          {trimmed.slice(4)}
        </h4>
      );
      return;
    }

    // Check Main Heading ##
    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h3 key={index} className="mt-5 mb-2 text-sm sm:text-base font-black text-foreground flex items-center gap-2 border-b border-border/60 pb-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          {trimmed.slice(3)}
        </h3>
      );
      return;
    }

    // Check Top Heading #
    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h2 key={index} className="mt-5 mb-3 text-base sm:text-lg font-black text-primary tracking-tight border-b border-primary/30 pb-1.5">
          {trimmed.slice(2)}
        </h2>
      );
      return;
    }

    // Check Bullet List - or *
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listItems.push(trimmed.slice(2));
      return;
    }

    // Numbered List (1., 2.)
    if (/^\d+\.\s/.test(trimmed)) {
      flushList();
      const dotIdx = trimmed.indexOf(".");
      const num = trimmed.slice(0, dotIdx);
      const text = trimmed.slice(dotIdx + 1).trim();
      elements.push(
        <div key={index} className="my-2 flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-primary/10 text-primary font-bold text-[11px]">
            {num}
          </span>
          <div className="flex-1 pt-0.5">{formatInlineText(text)}</div>
        </div>
      );
      return;
    }

    // Empty line
    if (!trimmed) {
      flushList();
      elements.push(<div key={index} className="h-2" />);
      return;
    }

    // Normal Paragraph
    flushList();
    elements.push(
      <p key={index} className="my-1.5 text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans">
        {formatInlineText(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-0.5 w-full font-sans">{elements}</div>;
}

function formatInlineText(text: string) {
  const cleanText = text.replace(/<br\s*\/?>/gi, "\n");
  const parts = cleanText.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return parts.map((part, idx) => {
    if (part.startsWith("***") && part.endsWith("***") && part.length > 6) {
      return (
        <strong key={idx} className="font-extrabold text-primary italic">
          {part.slice(3, -3)}
        </strong>
      );
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <span key={idx} className="font-extrabold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-md inline-block my-0.5">
          {part.slice(2, -2)}
        </span>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={idx} className="italic text-sky-400 font-medium">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={idx} className="font-mono text-[11px] sm:text-xs bg-muted text-primary border border-border px-1.5 py-0.5 rounded-md">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function AIChatPage() {
  const search = useSearch({ from: "/_app/ai/chat" });
  const navigate = useNavigate();

  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(search.id);
  const [loading, setLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Mention & Image states
  const [mentionOpen, setMentionOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string; previewUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-defined Modul & Materi list for @ Mention
  const sampleTopics = [
    { type: "MODUL", title: "Modul 1: Dasar-Dasar Perpajakan & UU KUP" },
    { type: "MATERI", title: "Definisi Pajak dan Ciri-Cirinya" },
    { type: "MATERI", title: "Fungsi Pajak (Budgetair & Regulerend)" },
    { type: "MODUL", title: "Modul 2: PPh Orang Pribadi & Skema TER" },
    { type: "MATERI", title: "Tarif PPh Pasal 17 ayat (1) huruf a" },
    { type: "MATERI", title: "Skema TER PMK 168/2023 (Kategori A, B, C)" },
    { type: "MODUL", title: "Modul 3: PPh Badan & Fasilitas Pasal 31E" },
    { type: "MATERI", title: "Perhitungan PPh Badan & Koreksi Fiskal" },
    { type: "MODUL", title: "Modul 4: PPN & PPnBM (PMK 131/2024)" },
    { type: "MATERI", title: "Mekanisme Pajak Masukan & Keluaran" },
    { type: "MODUL", title: "Modul 5: Coretax DJP & Integrasi NIK NPWP" },
  ];

  // Initialize contextual prompt if navigated from lesson page
  useEffect(() => {
    if (search.title && messages.length === 0) {
      const initialPrompt = `Tolong jelaskan secara rinci dan santai tentang materi "${search.title}". Berikan analogi sederhana dan contoh kasus perhitungannya jika ada.`;
      handleSend(initialPrompt);
    }
  }, [search.title]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImage({
        base64: result,
        mimeType: file.type || "image/jpeg",
        previewUrl: URL.createObjectURL(file),
      });
      toast.success("Gambar berhasil diunggah! Siap dianalisis AI.");
    };
    reader.readAsDataURL(file);
  };

  const handleSelectMention = (title: string) => {
    setMsg((prev) => `${prev} @[${title}] `);
    setMentionOpen(false);
    toast.info(`Topik "@${title}" ditambahkan ke pertanyaan!`);
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || msg).trim();
    if ((!textToSend && !selectedImage) || loading) return;

    const userMsg: MessageItem = {
      id: Date.now().toString(),
      role: "user",
      text: textToSend || (selectedImage ? "[Mengirim Gambar untuk Analisis AI]" : ""),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      imagePreview: selectedImage?.previewUrl,
    };

    setMessages((prev) => [...prev, userMsg]);
    setMsg("");
    const imgToSend = selectedImage;
    setSelectedImage(null);
    setLoading(true);

    try {
      const res = await kirimPesanChat({
        pesan: textToSend || "Tolong analisis dokumen / gambar perpajakan ini secara mendalam.",
        conversationId,
        gambarBase64: imgToSend?.base64,
        mimeType: imgToSend?.mimeType,
      });

      if (res.success && res.data) {
        if (res.data.conversationId) {
          setConversationId(res.data.conversationId);
        }

        const aiMsg: MessageItem = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: res.data.balasan || "Tentu, mari kita bahas materi perpajakan ini!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        toast.error("Gagal mendapatkan respons AI.");
      }
    } catch {
      toast.error("Terjadi kendala koneksi ke server AI.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    toast.success("Pesan berhasil disalin!");
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const defaultSuggestions = [
    "Jelaskan tarif PPh Pasal 17 dengan contoh hitungan santai",
    "Bagaimana skema TER PMK 168/2023 memotong PPh 21 bulanan?",
    "Apa perbedaan Pajak dan Retribusi menurut UU KUP?",
    "Bagaimana integrasi NIK sebagai NPWP di Coretax DJP?",
  ];

  return (
    <>
      <PageHeader
        title="Asisten AI Pembelajaran Pajak"
        actions={
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setMessages([]);
                setConversationId(undefined);
                toast.info("Diskusi baru dimulai");
              }}
              className="rounded-xl font-bold text-xs gap-1.5 border-border hover:bg-accent shrink-0 shadow-2xs"
            >
              <RefreshCw className="h-3.5 w-3.5 text-primary" /> Percakapan Baru
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl font-bold text-xs gap-1.5 border-border hover:bg-accent shrink-0 shadow-2xs">
              <Link to="/roadmap">
                <ArrowLeft className="h-3.5 w-3.5 text-primary" /> Kembali
              </Link>
            </Button>
          </div>
        }
      />

      {/* FULL VIEWPORT CONTAINER (ZERO MARGIN, FULL HEIGHT UNDER HEADER & NEXT TO SIDEBAR) */}
      <div className="flex-1 flex flex-col min-h-0 h-full w-full bg-background overflow-hidden relative">

        {/* Chat Messages Container (FULL SPACE MAXIMUM VIEWPORT) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-5 my-auto">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary border border-primary/30 shadow-xs">
                <Sparkles className="h-7 w-7" />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">Halo! Apa yang ingin kamu diskusikan?</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Tanyakan apapun seputar regulasi UU HPP, PMK 168/2023, PPh 21 TER, Coretax DJP, atau gunakan simbol <code className="text-primary font-bold">@</code> untuk memilih topik materi spesifik!
                </p>
              </div>

              <div className="w-full space-y-2 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-left font-mono">
                  💡 Rekomendasi Topik Diskusi:
                </p>
                <div className="grid gap-2">
                  {defaultSuggestions.map((s, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      onClick={() => handleSend(s)}
                      className="w-full justify-start text-left text-xs font-semibold rounded-xl p-3 h-auto leading-relaxed border-border hover:border-primary/50 hover:bg-primary/5 whitespace-normal shadow-2xs"
                    >
                      <span className="mr-2 text-sm shrink-0">💡</span>
                      <span className="flex-1">{s}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex gap-3 text-xs sm:text-sm", m.role === "user" ? "justify-end" : "justify-start")}>
                  {m.role === "ai" && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div className={cn("space-y-1.5", m.role === "user" ? "max-w-[80%] sm:max-w-[70%]" : "flex-1 max-w-full")}>
                    {/* User Image Preview Badge in Chat */}
                    {m.imagePreview && (
                      <div className="flex justify-end mb-1">
                        <img
                          src={m.imagePreview}
                          alt="Lampiran Gambar"
                          className="h-32 w-auto max-w-xs object-cover rounded-xl border border-border shadow-xs"
                        />
                      </div>
                    )}

                    <div
                      className={cn(
                        "p-4 sm:p-5 leading-relaxed text-xs sm:text-sm shadow-2xs",
                        m.role === "user"
                          ? "bg-card border border-border text-foreground font-semibold rounded-2xl rounded-tr-xs ml-auto"
                          : "bg-card border border-border/80 text-foreground rounded-2xl rounded-tl-xs w-full"
                      )}
                    >
                      {m.role === "user" ? <p className="whitespace-pre-wrap">{m.text}</p> : <RichHtmlView content={m.text} />}
                    </div>

                    <div className={cn("flex items-center gap-1.5 px-1", m.role === "user" ? "justify-end" : "justify-start")}>
                      <span className="text-[10px] text-muted-foreground font-mono">{m.timestamp}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleCopyMessage(m.text, m.id)}
                        className="h-5 w-5 rounded-md text-muted-foreground hover:text-foreground"
                        title="Salin Teks"
                      >
                        {copiedMsgId === m.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>

                  {m.role === "user" && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground font-extrabold text-xs shadow-xs">
                      U
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground bg-primary/5 p-3 sm:p-4 rounded-xl border border-primary/20 w-fit animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                <span className="font-semibold text-foreground">Asisten BrevetAI sedang menyusun penjelasan...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* MENTION DROPDOWN POPUP */}
        {mentionOpen && (
          <div className="absolute bottom-16 left-4 right-4 max-w-4xl mx-auto bg-card border border-primary/30 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/80">
              <span className="text-xs font-black text-primary flex items-center gap-1.5">
                <AtSign className="h-4 w-4" /> Pilih Topik Modul atau Materi Pajak:
              </span>
              <Button size="icon" variant="ghost" onClick={() => setMentionOpen(false)} className="h-6 w-6 rounded-lg">
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {sampleTopics.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectMention(item.title)}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-primary/10 transition-colors"
                >
                  <span className="font-semibold text-foreground truncate">{item.title}</span>
                  <Badge variant="outline" className="text-[9px] font-mono border-primary/30 text-primary shrink-0">
                    {item.type}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* IMAGE PREVIEW BEFORE SENDING */}
        {selectedImage && (
          <div className="px-4 py-2 border-t border-border/80 bg-card flex items-center gap-3 shrink-0">
            <div className="relative">
              <img
                src={selectedImage.previewUrl}
                alt="Lampiran"
                className="h-12 w-12 object-cover rounded-lg border border-primary/40 shadow-2xs"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-xs"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="text-xs">
              <span className="font-bold text-foreground block">Gambar Terlampir</span>
              <span className="text-[10px] text-muted-foreground font-mono">Siap dianalisis oleh AI</span>
            </div>
          </div>
        )}

        {/* COMPACT INPUT BAR AT BOTTOM WITH @ MENTION & IMAGE UPLOAD BUTTONS */}
        <div className="p-3 sm:p-4 border-t border-border/80 bg-card/90 backdrop-blur-md shrink-0">
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            {/* Hidden File Input for Image Upload */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Upload Image Button */}
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              title="Unggah Gambar / Dokumen Pajak"
              className="h-[42px] w-[42px] rounded-xl border-border hover:bg-accent text-muted-foreground hover:text-primary shrink-0 shadow-2xs"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>

            {/* Mention @ Button */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setMentionOpen(!mentionOpen)}
              title="Sebut Modul / Materi (@)"
              className="h-[42px] rounded-xl font-bold border-border hover:bg-accent text-muted-foreground hover:text-primary shrink-0 px-3 gap-1 shadow-2xs"
            >
              <AtSign className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline text-xs">Topik</span>
            </Button>

            {/* Textarea */}
            <Textarea
              placeholder="Tanyakan pasal, kirim gambar, atau gunakan @ untuk sebut materi..."
              value={msg}
              onChange={(e) => {
                const val = e.target.value;
                setMsg(val);
                if (val.endsWith("@")) {
                  setMentionOpen(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              className="rounded-xl text-xs sm:text-sm bg-muted/40 border-border/80 px-4 py-2.5 min-h-[42px] max-h-28 resize-none focus:bg-background focus:ring-1 focus:ring-primary transition-all flex-1 leading-normal"
            />

            {/* Send Button */}
            <Button
              onClick={() => handleSend()}
              disabled={loading || (!msg.trim() && !selectedImage)}
              className="rounded-xl font-bold gap-1.5 px-4 h-[42px] shrink-0 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 text-xs sm:text-sm"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="hidden sm:inline">Kirim</span>
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center font-mono mt-1.5">
            Mengacu pada UU HPP No. 7/2021, PMK 168/2023 & Coretax DJP 2026
          </p>
        </div>
      </div>
    </>
  );
}
