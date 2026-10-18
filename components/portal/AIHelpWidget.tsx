"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = { role: "user" | "ai"; content: string };

export default function AIHelpWidget({ maxMessages = 20 }: { maxMessages?: number }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || messages.length >= maxMessages) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/portal/ai-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal mendapatkan jawaban");
      }

      // Tambah pesan kosong sebagai placeholder streaming
      setMessages((prev) => [...prev, { role: "ai", content: "" }]);
      setLoading(false);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "ai", content: text };
          return updated;
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: (err as Error).message },
      ]);
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 lg:bottom-6 right-6 w-12 h-12 bg-[#1E242E] rounded-full flex items-center justify-center text-white border border-slate-700 shadow-xl hover:bg-slate-800 transition-all z-50 hover:scale-105 active:scale-95"
        aria-label="Buka bantuan portal"
      >
        <MessageSquare className="w-5 h-5 text-slate-200" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-6 w-84 max-h-[460px] bg-white border border-slate-200 shadow-2xl shadow-slate-900/15 rounded-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-250">
      {/* Header */}
      <div className="p-4 bg-[#1E242E] flex items-center justify-between text-white border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white text-sm">Bantuan Portal MFWEB</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-md"
          aria-label="Tutup bantuan"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px] max-h-[300px] bg-[#F8F9FA]">
        {messages.length === 0 && (
          <div className="text-center py-8 px-4">
            <div className="w-10 h-10 rounded-full bg-slate-200/70 flex items-center justify-center mx-auto mb-2 text-slate-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Halo! Ada yang bisa kami bantu terkait proyek, tagihan, atau penggunaan tools?
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-[#1E242E] text-white rounded-br-xs shadow-xs"
                  : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs"
              }`}
            >
              {m.content || (
                <span className="inline-flex gap-1 py-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-bl-xs border border-slate-200 shadow-xs">
              <Loader2 className="w-3.5 h-3.5 text-slate-600 animate-spin" />
            </div>
          </div>
        )}
        {messages.length >= maxMessages && (
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2 text-center font-medium">
            Batas sesi tercapai. Hubungi admin via WhatsApp untuk bantuan langsung.
          </p>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Tanyakan sesuatu..."
            disabled={loading || messages.length >= maxMessages}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:bg-white disabled:opacity-50 transition-colors"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={loading || !input.trim() || messages.length >= maxMessages}
            className="bg-[#1E242E] hover:bg-slate-800 text-white shrink-0 h-8 w-8 rounded-xl shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
