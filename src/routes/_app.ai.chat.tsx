import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles,
  Send,
  Wand2,
  Copy,
  RefreshCcw,
  Image as ImageIcon,
  BookOpen,
  Layers,
  ClipboardList,
  Plus,
  History,
} from "lucide-react";
import { PageBody } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const messages = [
  {
    role: "user",
    text: "Jelaskan lapisan tarif PPh Pasal 17 dengan contoh perhitungan.",
  },
  {
    role: "ai",
    text: `Tarif PPh Pasal 17 untuk Orang Pribadi bersifat progresif berlapis:\n\n• 5% s.d. Rp60 juta\n• 15% >Rp60jt – Rp250jt\n• 25% >Rp250jt – Rp500jt\n• 30% >Rp500jt – Rp5 M\n• 35% >Rp5 M\n\nContoh: PKP Rp350jt → 5%×60jt + 15%×190jt + 25%×100jt = Rp56,5 juta.`,
  },
];

function AIChat() {
  const [msg, setMsg] = useState("");
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
              <p className="truncate text-sm font-semibold">Asisten AI Pajak</p>
              <p className="truncate text-[11px] text-muted-foreground">Konteks: PPh Orang Pribadi</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm"><History className="mr-1 h-3.5 w-3.5" /> Riwayat</Button>
            <Button variant="outline" size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Baru</Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
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
                    : "border bg-card")
                }
              >
                {m.text}
                {m.role === "ai" && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                      <Copy className="h-3 w-3" /> Salin
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                      <RefreshCcw className="h-3 w-3" /> Ulang
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                      <ClipboardList className="h-3 w-3" /> Buat kuis
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                      <Layers className="h-3 w-3" /> Kartu
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                      <ImageIcon className="h-3 w-3" /> Visual
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* thinking placeholder */}
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl border bg-card px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
              <span className="ml-2 text-xs text-muted-foreground">AI sedang berpikir...</span>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Composer */}
      <div className="border-t bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => setMsg(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative rounded-2xl border bg-card focus-within:ring-2 focus-within:ring-ring">
            <Textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Tanyakan apa saja tentang perpajakan..."
              className="min-h-[52px] resize-none border-0 bg-transparent pr-24 focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={2}
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Alat">
                <Wand2 className="h-4 w-4" />
              </Button>
              <Button size="icon" className="h-8 w-8" aria-label="Kirim">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            AI dapat membuat kesalahan. Periksa informasi penting pada sumber resmi.
          </p>
        </div>
      </div>
    </div>
  );
}
