"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = { role: "user" | "ai"; content: string };

export default function AIHelpWidget() {
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
    if (!input.trim() || loading || messages.length >= 20) return;

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
        className="fixed bottom-24 lg:bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-500 transition-all z-50 animate-in fade-in zoom-in duration-300"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-6 w-80 max-h-100 bg-[#030914]/35 backdrop-blur-2xl border border-white/10 rounded-2xl flex flex-col shadow-2xl z-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-white text-sm">Tanya AI</span>
        </div>
        <button onClick={() => setOpen(false)} className="text-blue-200/50 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-50">
        {messages.length === 0 && (
          <p className="text-xs text-blue-200/40 text-center mt-10">
            Halo! Ada yang bisa saya bantu terkait proyek atau invoice Anda?
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] p-2.5 rounded-2xl text-xs ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-blue-100 border border-white/5"
              }`}
            >
              {m.content || (
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/5">
              <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
            </div>
          </div>
        )}
        {messages.length >= 20 && (
          <p className="text-[10px] text-amber-400/60 text-center italic">
            Hubungi admin untuk pertanyaan lebih lanjut.
          </p>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10 bg-white/5">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Tanyakan sesuatu..."
            disabled={loading || messages.length >= 20}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-blue-200/30 outline-none focus:border-blue-500/50 disabled:opacity-50"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={loading || !input.trim() || messages.length >= 20}
            className="bg-blue-600 shrink-0 h-8 w-8 rounded-lg"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
