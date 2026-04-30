"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminTicketReply({
  ticketId,
  currentStatus,
  onSent,
}: {
  ticketId: string;
  currentStatus: string;
  onSent?: () => void;
}) {
  const [body, setBody] = useState("");
  // Jika tiket OPEN, maka default ubah status menjadi IN_PROGRESS saat dibalas.
  const [status, setStatus] = useState(currentStatus === "OPEN" ? "IN_PROGRESS" : currentStatus);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [closed, setClosed] = useState(currentStatus === "CLOSED");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [body]);

  const getAiDraft = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/ai/draft-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBody(data.draft);
      // Auto focus end of draft
      setTimeout(() => textareaRef.current?.focus(), 100);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal generate draft AI");
    } finally {
      setAiLoading(false);
    }
  };

  const sendReply = async () => {
    if (!body.trim()) return;
    setLoading(true);

    await fetch(`/api/admin/tickets/${ticketId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, status }),
    });

    setBody("");
    if (textareaRef.current) textareaRef.current.style.height = "52px";
    
    setLoading(false);
    if (status === "CLOSED") setClosed(true);
    onSent?.();
  };

  const changeStatus = async (newStatus: string) => {
    setLoading(true);
    await fetch(`/api/admin/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatus(newStatus);
    if (newStatus === "CLOSED") setClosed(true);
    else setClosed(false);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  if (closed) {
    return (
      <div className="p-6 text-center shrink-0 border-t border-white/10 bg-black/40 backdrop-blur-md">
        <p className="text-blue-200/40 text-sm mb-4">Percakapan telah diakhiri karena tiket ini ditutup.</p>
        <Button
          size="sm"
          onClick={() => changeStatus("OPEN")}
          disabled={loading}
          className="bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors h-10 px-6 rounded-xl"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2 text-pink-400" />}
          Buka Kembali Tiket
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 shrink-0 border-t border-white/10 bg-[#070e1a]/95 backdrop-blur-xl relative z-20">
      
      {/* Control Bar (Status & AI Draft) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl border border-white/5 w-fit">
          {["IN_PROGRESS", "CLOSED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all ${
                status === s
                  ? "bg-pink-600/20 text-pink-400 ring-1 ring-pink-500/30"
                  : "text-blue-200/40 hover:text-white hover:bg-white/5"
              }`}
            >
              {s === "IN_PROGRESS" ? "Proses Keluhan" : "Tutup Tiket"}
            </button>
          ))}
        </div>

        <Button
          size="sm"
          onClick={getAiDraft}
          disabled={aiLoading}
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 text-purple-300 border border-purple-500/30 h-8 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all"
        >
          {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
          AI Auto-Draft
        </Button>
      </div>

      {/* Message Input Container */}
      <div className="flex items-end gap-3">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-pink-500/50 focus-within:ring-1 focus-within:ring-pink-500/50 transition-all">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Tulis balasan untuk klien... (Tekan Enter untuk kirim)"
            className="w-full bg-transparent text-white placeholder:text-blue-200/30 resize-none text-sm p-4 outline-none min-h-[52px] max-h-[120px] custom-scrollbar"
            style={{ overflowY: body.split("\n").length > 3 ? "auto" : "hidden" }}
          />
        </div>
        
        <Button
          disabled={loading || !body.trim()}
          onClick={sendReply}
          className="bg-pink-600 hover:bg-pink-500 text-white rounded-2xl h-[52px] w-[52px] shrink-0 p-0 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all disabled:opacity-50 disabled:shadow-none disabled:hover:bg-pink-600"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
        </Button>
      </div>

      <p className="text-[10px] text-blue-200/30 text-center mt-3">
        Gunakan <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-blue-200/50">Shift</kbd> + <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-blue-200/50">Enter</kbd> untuk baris baru
      </p>
    </div>
  );
}
