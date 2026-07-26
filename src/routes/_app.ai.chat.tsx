import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Copy,
  Plus,
  Loader2,
  Check,
  Layers,
  Lightbulb,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { kirimPesanChat } from "@/functions/ai";
import { getDaftarModul } from "@/functions/modules";

export const Route = createFileRoute("/_app/ai/chat")({
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
  component: AIChat,
});

const suggestions = [
  "Jelaskan tarif PPh Pasal 17 dengan contoh santai",
  "Apa beda PPN dan PPnBM kalau kita jajan?",
  "Buatkan analogi gampang buat KUP & Pajak",
  "Studi kasus perhitungan PPh 21 TER yang asik",
];

type MessageItem = {
  role: "user" | "ai";
  text: string;
};

// Formatter Rich HTML View dengan Warna-Warni Harmonis & Layout Visual Cantik
function RichHtmlView({ content }: { content: string }) {
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

    // Check Subheading ###
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

    // Check Main Heading ##
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

    // Check Top Heading #
    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h2 key={index} className="mt-5 mb-3 text-base sm:text-lg font-black text-primary border-b border-primary/30 pb-1.5">
          {trimmed.slice(2)}
        </h2>
      );
      return;
    }

    // Check Tips / Catatan / Analogi Callout Box
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

    // Check List Items - or *
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listItems.push(trimmed.slice(2));
      return;
    }

    // Check Numbered Lists 1. 2.
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

    // Blank line spacing
    if (!trimmed) {
      flushList();
      elements.push(<div key={index} className="h-2" />);
      return;
    }

    // Standard Paragraph
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
  const parts = text.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return parts.map((part, idx) => {
    if (part.startsWith("***") && part.endsWith("***")) {
      return (
        <strong key={idx} className="font-extrabold text-primary italic">
          {part.slice(3, -3)}
        </strong>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span key={idx} className="font-bold text-primary bg-primary/15 border border-primary/30 px-1.5 py-0.5 rounded-md inline-block my-0.5">
          {part.slice(2, -2)}
        </span>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={idx} className="italic text-sky-400 font-medium">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={idx} className="font-mono text-xs bg-slate-900 text-emerald-400 border border-slate-700 px-2 py-0.5 rounded-md shadow-xs">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function AIChat() {
  const { modulesList } = Route.useLoaderData();
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [selectedModulId, setSelectedModulId] = useState<string>("SEMUA");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleKirim = async (teksKirim?: string) => {
    const teks = teksKirim ?? msg;
    if (!teks.trim() || loading) return;

    const userMsg = teks.trim();
    setMsg("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await kirimPesanChat({
        data: {
          pesan: userMsg,
          conversationId,
          modulId: selectedModulId !== "SEMUA" ? selectedModulId : undefined,
        },
      });

      if (res.success && res.data) {
        setConversationId(res.data.conversationId);
        setMessages((prev) => [...prev, { role: "ai", text: res.data!.respons }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: res.message || "Maaf, asisten AI tidak dapat memproses jawaban saat ini." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Terjadi kesalahan koneksi ke server AI. Silakan coba beberapa saat lagi." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const salinTeks = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const percakapanBaru = () => {
    setMessages([]);
    setConversationId(undefined);
    setMsg("");
  };

  const selectedModulInfo = modulesList.find((m: any) => m.id === selectedModulId);

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col lg:h-[calc(100dvh-3.5rem)] bg-background">
      {/* Sub Header & Module Context Selector */}
      <div className="border-b border-border bg-card/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-bold text-foreground">Asisten AI Brevet Pajak</p>
                <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5 rounded-full border-success/40 text-success bg-success/10 hidden sm:inline-flex">
                  ● Gemini 3.1 Flash Lite
                </Badge>
              </div>

              {/* Module Context Selector Dropdown */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <Layers className="h-3.5 w-3.5 text-primary shrink-0" />
                <Select value={selectedModulId} onValueChange={setSelectedModulId}>
                  <SelectTrigger className="h-6 text-xs bg-transparent border-none p-0 focus:ring-0 text-muted-foreground font-semibold hover:text-foreground">
                    <SelectValue placeholder="Pilih Modul Pembelajaran" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border shadow-md">
                    <SelectItem value="SEMUA" className="text-xs font-semibold rounded-lg">
                      🌐 Semua Modul Brevet (Pertanyaan Umum)
                    </SelectItem>
                    {modulesList.map((m: any) => (
                      <SelectItem key={m.id} value={m.id} className="text-xs rounded-lg">
                        📘 Modul: {m.judul}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={percakapanBaru} className="h-9 text-xs font-bold rounded-xl border-border hover:bg-accent">
              <Plus className="mr-1.5 h-4 w-4" /> Obrolan Baru
            </Button>
          </div>
        </div>

        {selectedModulId !== "SEMUA" && selectedModulInfo && (
          <div className="bg-primary/10 border-t border-primary/20 px-4 py-1.5 text-center">
            <p className="text-[11px] font-mono font-semibold text-primary flex items-center justify-center gap-1.5">
              <span>📖</span> AI saat ini berfokus membaca materi dari: <strong>{selectedModulInfo.judul}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Messages Feed */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
          {messages.length === 0 && (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary border border-primary/30 shadow-xs">
                <Sparkles className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Tanyakan Apa Saja Tentang Perpajakan Indonesia</h2>
                <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Diskusi santai dengan Kakak Mentor AI tentang Undang-Undang Perpajakan terbaru dan modul Brevet pilihanmu.
                </p>
              </div>

              <div className="pt-3 flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                {suggestions.map((s, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs rounded-full border-border hover:border-primary hover:text-primary transition-all px-4 py-2"
                    onClick={() => handleKirim(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={"flex gap-3 " + (m.role === "user" ? "justify-end" : "")}>
              {m.role === "ai" && (
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary border border-primary/30 shadow-2xs">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
              <div
                className={
                  "max-w-[88%] text-xs sm:text-sm leading-relaxed border transition-all " +
                  (m.role === "user"
                    ? "bg-primary text-primary-foreground border-primary font-medium rounded-2xl rounded-br-xs px-4 py-3 shadow-xs"
                    : "bg-card border-border/80 rounded-2xl rounded-bl-xs p-4.5 shadow-xs")
                }
              >
                {m.role === "user" ? (
                  <p className="whitespace-pre-wrap">{m.text}</p>
                ) : (
                  <RichHtmlView content={m.text} />
                )}

                {m.role === "ai" && (
                  <div className="mt-3 flex items-center justify-end border-t border-border/40 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 px-2.5 text-xs font-semibold rounded-lg hover:bg-accent"
                      onClick={() => salinTeks(m.text, i)}
                    >
                      {copiedIndex === i ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedIndex === i ? "Tersalin!" : "Salin Jawaban"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary animate-pulse border border-primary/30">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" /> Kakak Mentor AI sedang membaca modul & menyusun jawaban...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Form */}
      <div className="border-t border-border bg-card p-4 sm:px-6">
        <form
          className="mx-auto max-w-3xl flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleKirim();
          }}
        >
          <Textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleKirim();
              }
            }}
            placeholder={
              selectedModulInfo
                ? `Tanyakan sesuatu tentang modul "${selectedModulInfo.judul}"...`
                : "Tanyakan sesuatu tentang PPh, PPN, KUP, atau studi kasus..."
            }
            className="min-h-[46px] max-h-32 resize-none text-xs sm:text-sm bg-background border-border rounded-2xl px-4 py-3"
            rows={1}
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !msg.trim()} className="shrink-0 h-[46px] w-[46px] rounded-xl shadow-xs font-bold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
