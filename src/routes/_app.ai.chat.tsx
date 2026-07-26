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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageHeader, PageBody } from "@/components/layout/AppShell";
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
      { title: "Tanya AI Asisten Brevet — BrevetAI" },
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
};

// ── FORMATTER RICH HTML VIEW SPACIOUS & HIGHLY READABLE ──────────────────────────
function RichHtmlView({ content }: { content: string }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Teks disalin ke clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <div key={`ul-${elements.length}`} className="my-3 space-y-2.5 pl-1">
          {listItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm sm:text-base text-foreground/90 leading-relaxed">
              <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2.5 shadow-2xs" />
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
        <h4 key={index} className="mt-5 mb-2 text-sm sm:text-base font-extrabold text-primary flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          {trimmed.slice(4)}
        </h4>
      );
      return;
    }

    // Check Main Heading ##
    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h3 key={index} className="mt-6 mb-3 text-base sm:text-lg font-black text-foreground flex items-center gap-2 border-b border-border/80 pb-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          {trimmed.slice(3)}
        </h3>
      );
      return;
    }

    // Check Top Heading #
    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h2 key={index} className="mt-6 mb-4 text-lg sm:text-xl font-black text-primary tracking-tight border-b-2 border-primary/30 pb-2">
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
        <div key={index} className="my-2.5 flex items-start gap-3 text-sm sm:text-base text-foreground/90 leading-relaxed">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
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
      elements.push(<div key={index} className="h-3" />);
      return;
    }

    // Normal Paragraph
    flushList();
    elements.push(
      <p key={index} className="my-2 text-sm sm:text-base text-foreground/90 leading-relaxed font-sans">
        {formatInlineText(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1 w-full font-sans">{elements}</div>;
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
        <code key={idx} className="font-mono text-xs sm:text-sm bg-muted text-primary border border-border px-2 py-0.5 rounded-md">
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

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || msg).trim();
    if (!textToSend || loading) return;

    const userMsg: MessageItem = {
      id: Date.now().toString(),
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setMsg("");
    setLoading(true);

    try {
      const res = await kirimPesanChat({
        pesan: textToSend,
        conversationId,
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
    toast.success("Pesan berhasil disalin ke clipboard!");
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
        description="Diskusi interaktif, penjelasan pasal hukum, dan simulasi hitungan pajak santai & lengkap"
        breadcrumb={[
          { label: "Beranda", to: "/beranda" },
          { label: "Roadmap Kurikulum", to: "/roadmap" },
          { label: "Asisten BrevetAI" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setMessages([]);
                setConversationId(undefined);
                toast.info("Diskusi baru dimulai");
              }}
              className="rounded-xl font-bold text-xs gap-1.5 border-border hover:bg-accent shadow-2xs"
            >
              <RefreshCw className="h-3.5 w-3.5 text-primary" /> Percakapan Baru
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl font-bold text-xs gap-1.5 border-border hover:bg-accent shrink-0 shadow-2xs">
              <Link to="/roadmap">
                <ArrowLeft className="h-4 w-4 text-primary" /> Kembali
              </Link>
            </Button>
          </div>
        }
      />

      <PageBody className="w-full max-w-5xl mx-auto p-3 sm:p-6 flex-1 flex flex-col min-h-0 h-[calc(100vh-4.5rem)]">
        <div className="flex-1 flex flex-col min-h-0 bg-card rounded-2xl border border-border/80 shadow-md overflow-hidden">
          {/* Context Banner if opened from lesson */}
          {search.title && (
            <div className="p-3 sm:px-6 bg-primary/10 border-b border-primary/20 flex items-center justify-between text-xs shrink-0">
              <span className="font-bold text-primary flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Topik Pembahasan: "{search.title}"
              </span>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                Konteks Materi Aktif
              </Badge>
            </div>
          )}

          {/* Chat Messages Container (SPACIOUS & HIGHLY READABLE) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
            {messages.length === 0 ? (
              <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6">
                <div className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary border border-primary/30 shadow-md">
                  <Sparkles className="h-8 w-8" />
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Halo! Apa yang ingin kamu diskusikan?</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                    Saya Asisten BrevetAI, siap membantu menjelaskan regulasi UU HPP No. 7/2021, PMK 168/2023, PPh 21 TER, dan Coretax DJP secara santai & lengkap.
                  </p>
                </div>

                <div className="w-full space-y-3 pt-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-left">
                    💡 Rekomendasi Topik Diskusi:
                  </p>
                  <div className="grid gap-2.5">
                    {defaultSuggestions.map((s, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        onClick={() => handleSend(s)}
                        className="w-full justify-start text-left text-xs sm:text-sm font-semibold rounded-2xl p-4 h-auto leading-relaxed border-border hover:border-primary/50 hover:bg-primary/5 whitespace-normal shadow-2xs"
                      >
                        <span className="mr-2 text-sm shrink-0">💡</span>
                        <span className="flex-1">{s}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={cn("flex gap-3 sm:gap-4 text-sm sm:text-base", m.role === "user" ? "justify-end" : "justify-start")}>
                  {m.role === "ai" && (
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                      <Bot className="h-5 w-5" />
                    </div>
                  )}

                  <div className={cn("space-y-2", m.role === "user" ? "max-w-[85%] sm:max-w-[75%]" : "w-full max-w-full")}>
                    <div
                      className={cn(
                        "p-5 sm:p-6 leading-relaxed text-sm sm:text-base shadow-xs",
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-3xl rounded-tr-xs font-semibold ml-auto"
                          : "bg-muted/30 border border-border/80 text-foreground rounded-3xl rounded-tl-xs w-full"
                      )}
                    >
                      {m.role === "user" ? <p className="whitespace-pre-wrap">{m.text}</p> : <RichHtmlView content={m.text} />}
                    </div>

                    <div className={cn("flex items-center gap-2 px-2", m.role === "user" ? "justify-end" : "justify-start")}>
                      <span className="text-[10px] text-muted-foreground font-mono">{m.timestamp}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleCopyMessage(m.text, m.id)}
                        className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground"
                        title="Salin Teks"
                      >
                        {copiedMsgId === m.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>

                  {m.role === "user" && (
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-secondary text-secondary-foreground font-extrabold text-xs shadow-xs">
                      U
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground bg-primary/5 p-4 sm:p-5 rounded-2xl border border-primary/20 w-fit animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                <span className="font-semibold text-foreground">Asisten BrevetAI sedang menyusun jawaban & simulasi perhitungan...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar (SPACIOUS WIDE TEXTAREA) */}
          <div className="p-3 sm:p-5 border-t border-border/80 bg-card space-y-2 shrink-0">
            <div className="flex gap-3 items-end">
              <Textarea
                placeholder="Tanyakan topik perpajakan, pasal hukum, atau minta contoh simulasi hitungan..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={2}
                className="rounded-2xl text-xs sm:text-sm bg-muted/40 border-border/80 p-3.5 min-h-[56px] max-h-36 resize-none focus:bg-background focus:ring-2 focus:ring-primary transition-all flex-1"
              />
              <Button
                onClick={() => handleSend()}
                disabled={loading || !msg.trim()}
                className="rounded-2xl font-bold gap-2 px-6 h-14 shrink-0 bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                <span className="hidden sm:inline">Kirim</span>
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center font-mono">
              Mengacu pada UU HPP No. 7/2021, PMK 168/2023 & Coretax DJP 2026
            </p>
          </div>
        </div>
      </PageBody>
    </>
  );
}
