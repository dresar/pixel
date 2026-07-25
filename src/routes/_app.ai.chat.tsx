import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Copy,
  RefreshCcw,
  Plus,
  History,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { kirimPesanChat, getRiwayatAi } from "@/functions/ai";

export const Route = createFileRoute("/_app/ai/chat")({
  head: () => ({
    meta: [
      { title: "Tanya AI — BrevetAI" },
      { name: "description", content: "Tanyakan apa saja tentang perpajakan — asisten AI menjelaskan pasal, tarif, dan studi kasus." },
    ],
  }),
  component: AIChat,
});

const suggestions = [
  "Jelaskan tarif PPh Pasal 17 dengan contoh",
  "Apa beda PPN dan PPnBM?",
  "Buatkan ringkasan KUP dalam 5 poin",
  "Buatkan 5 soal kuis PPh OP",
];

type MessageItem = {
  role: "user" | "ai";
  text: string;
};

function AIChat() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
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
        },
      });

      if (res.success && res.data) {
        setConversationId(res.data.conversationId);
        setMessages((prev) => [...prev, { role: "ai", text: res.data!.respons }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: res.message || "Maaf, asisten AI tidak dapat memproses jawaban saat ini. Silakan coba lagi." },
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

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col lg:h-[calc(100dvh-3.5rem)]">
      {/* Sub header */}
      <div className="border-b bg-background/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 min-w-0">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Asisten AI Brevet Pajak</p>
              <p className="truncate text-[11px] text-muted-foreground">Gemini Rotasi Multi-Key Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={percakapanBaru}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Obrolan Baru
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
          {messages.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold">Tanyakan apa saja tentang Pajak A & B</h2>
              <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                Asisten AI menggunakan pengetahuan Undang-Undang Perpajakan Indonesia terbaru untuk membantumu belajar.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                {suggestions.map((s, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs rounded-full"
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
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
              <div
                className={
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed " +
                  (m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border bg-card shadow-sm")
                }
              >
                {m.text}
                {m.role === "ai" && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 px-2 text-xs"
                      onClick={() => salinTeks(m.text, i)}
                    >
                      {copiedIndex === i ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      {copiedIndex === i ? "Tersalin" : "Salin"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary animate-pulse">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-3 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" /> Sedang memproses dan menyusun jawaban...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Form */}
      <div className="border-t bg-background p-4 sm:px-6">
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
            placeholder="Tanyakan sesuatu tentang PPh, PPN, KUP, atau studi kasus..."
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !msg.trim()} className="shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
