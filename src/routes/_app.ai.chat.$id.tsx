import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Copy,
  Loader2,
  Check,
  CheckCircle2,
  Lightbulb,
  Calculator,
  BookOpen,
  ArrowLeft,
  RefreshCw,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageHeader, PageBody } from "@/components/layout/AppShell";
import { kirimPesanChat } from "@/functions/ai";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ai/chat/$id")({
  loader: async ({ params }) => {
    return { conversationId: params.id };
  },
  head: ({ params }) => ({
    meta: [
      { title: `Percakapan AI #${params.id || "Chat"} — BrevetAI` },
      { name: "description", content: "Diskusi interaktif Brevet Pajak A & B" },
    ],
  }),
  component: AIChatIdPage,
});

type MessageItem = {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: string;
};

function RichHtmlView({ content }: { content: string }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Teks / Rumus berhasil disalin ke clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <div key={`ul-${elements.length}`} className="my-3 space-y-2 pl-1">
          {listItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 mt-2 shadow-xs" />
              <div className="flex-1 leading-relaxed">{formatInlineText(item)}</div>
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

    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <div key={index} className="mt-4 mb-2 flex items-center gap-2 bg-primary/10 border-l-4 border-primary px-3.5 py-2 rounded-r-xl shadow-2xs">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <h4 className="text-xs sm:text-sm font-black text-foreground tracking-wide">{trimmed.slice(4)}</h4>
        </div>
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <div key={index} className="mt-5 mb-3 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-3 rounded-xl border border-primary/20 shadow-xs">
          <h3 className="text-sm sm:text-base font-black text-primary flex items-center gap-2">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
            {trimmed.slice(3)}
          </h3>
        </div>
      );
      return;
    }

    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h2 key={index} className="mt-5 mb-3 text-base sm:text-lg font-black text-primary border-b border-primary/30 pb-1.5">
          {trimmed.slice(2)}
        </h2>
      );
      return;
    }

    const isCallout =
      trimmed.toLowerCase().startsWith("tips") ||
      trimmed.toLowerCase().startsWith("catatan") ||
      trimmed.toLowerCase().startsWith("analogi") ||
      trimmed.toLowerCase().startsWith("contoh");

    if (isCallout) {
      flushList();
      elements.push(
        <div key={index} className="my-3.5 bg-amber-500/10 border-l-4 border-amber-400 p-3.5 rounded-r-2xl shadow-2xs flex items-start gap-2.5">
          <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed text-foreground/95 flex-1">
            {formatInlineText(trimmed)}
          </div>
        </div>
      );
      return;
    }

    const isFormula =
      trimmed.includes("=") ||
      trimmed.includes("×") ||
      trimmed.includes("Rp") ||
      trimmed.includes("%") ||
      trimmed.includes("$$") ||
      trimmed.includes("\\");

    if (trimmed.length > 25 && isFormula && (trimmed.includes("1.") || trimmed.includes("•") || trimmed.includes(":"))) {
      flushList();
      elements.push(
        <div key={index} className="my-3 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2 text-[11px] font-mono text-emerald-400">
            <span className="flex items-center gap-1.5 font-bold">
              <Calculator className="h-3.5 w-3.5 text-emerald-400" /> Canvas Skenario / Rumus Perhitungan
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopyText(trimmed, index)}
              className="h-6 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg px-2 gap-1"
            >
              {copiedIndex === index ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" /> Tersalin!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Salin Rumus
                </>
              )}
            </Button>
          </div>
          <div className="p-4 font-mono text-xs sm:text-sm text-emerald-300 leading-relaxed whitespace-pre-wrap">
            {formatInlineText(trimmed)}
          </div>
        </div>
      );
      return;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      listItems.push(trimmed.replace(/^[-*•]\s*/, ""));
      return;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      flushList();
      elements.push(
        <div key={index} className="my-2 flex items-start gap-2.5 text-xs sm:text-sm text-foreground">
          <span className="shrink-0 font-extrabold text-white font-mono bg-gradient-to-br from-primary to-emerald-500 px-2 py-0.5 rounded-lg text-xs shadow-2xs">
            {trimmed.match(/^\d+\./)?.[0]}
          </span>
          <span className="flex-1 leading-relaxed pt-0.5">{formatInlineText(trimmed.replace(/^\d+\.\s/, ""))}</span>
        </div>
      );
      return;
    }

    if (!trimmed) {
      flushList();
      elements.push(<div key={index} className="h-2" />);
      return;
    }

    flushList();
    elements.push(
      <p key={index} className="my-1.5 text-xs sm:text-sm leading-relaxed text-foreground/90">
        {formatInlineText(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1 text-foreground font-sans">{elements}</div>;
}

function formatInlineText(text: string): React.ReactNode {
  let cleanText = text
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\approx/g, "≈");

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
        <code key={idx} className="font-mono text-xs bg-slate-900 text-emerald-400 border border-slate-700 px-2 py-0.5 rounded-md shadow-xs">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function AIChatIdPage() {
  const { conversationId } = Route.useLoaderData();
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

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
        data: {
          pesan: textToSend,
          conversationId,
        },
      });

      if (res.success && res.data) {
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

  return (
    <>
      <PageHeader
        title={`Percakapan AI #${conversationId.slice(0, 8)}`}
        description="Diskusi interaktif, penjelasan pasal hukum, dan simulasi hitungan pajak santai & lengkap"
        breadcrumb={[
          { label: "Beranda", to: "/beranda" },
          { label: "Roadmap Kurikulum", to: "/roadmap" },
          { label: "Chat AI" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-xl font-bold text-xs gap-1.5 border-border hover:bg-accent shrink-0 shadow-2xs">
              <Link to="/ai/chat">
                <ArrowLeft className="h-4 w-4 text-primary" /> Kembali ke Chat Utama
              </Link>
            </Button>
          </div>
        }
      />

      <PageBody className="w-full max-w-5xl mx-auto py-6 px-4 sm:px-8">
        <div className="flex flex-col h-[calc(100vh-180px)] rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary border border-primary/30 shadow-xs">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-black text-foreground">Sesi Percakapan {conversationId.slice(0, 8)}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ketik pertanyaanmu untuk melanjutkan pembahasan topik perpajakan secara interaktif.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex gap-3 text-xs sm:text-sm ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "ai" && (
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                      <Bot className="h-5 w-5" />
                    </div>
                  )}

                  <div className={`max-w-[90%] sm:max-w-[85%] space-y-2 ${m.role === "user" ? "text-right" : "text-left"}`}>
                    <div
                      className={`rounded-2xl p-4 sm:p-5 shadow-2xs leading-relaxed ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none font-medium"
                          : "bg-muted/80 border border-border text-foreground rounded-tl-none font-sans"
                      }`}
                    >
                      {m.role === "user" ? <p className="whitespace-pre-wrap">{m.text}</p> : <RichHtmlView content={m.text} />}
                    </div>

                    <div className="flex items-center gap-2 px-1 justify-end">
                      <span className="text-[10px] text-muted-foreground font-mono">{m.timestamp}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleCopyMessage(m.text, m.id)}
                        className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground"
                      >
                        {copiedMsgId === m.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>

                  {m.role === "user" && (
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground font-extrabold text-xs shadow-xs">
                      U
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground bg-muted/50 p-4 rounded-2xl border w-fit">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Asisten BrevetAI sedang menyusun penjelasan...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          <div className="p-4 border-t border-border bg-card space-y-2">
            <div className="flex gap-2 items-end">
              <Textarea
                placeholder="Lanjutkan pertanyaanmu..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={2}
                className="rounded-xl text-xs sm:text-sm bg-background min-h-[50px] resize-none"
              />
              <Button
                onClick={() => handleSend()}
                disabled={loading || !msg.trim()}
                className="rounded-xl font-bold gap-2 px-5 h-12 shrink-0 bg-primary text-primary-foreground shadow-xs"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
