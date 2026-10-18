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
      <div className="p-6 text-center shrink-0 border-t border-slate-100 bg-slate-50/50">
        <p className="text-slate-500 text-sm mb-4">Percakapan telah diakhiri karena tiket ini ditutup.</p>
        <Button
          size="sm"
          onClick={() => changeStatus("OPEN")}
          disabled={loading}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors h-10 px-5 rounded-xl shadow-2xs font-semibold"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2 text-slate-500" />}
          Buka Kembali Tiket
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 shrink-0 border-t border-slate-100 bg-white relative z-20">
      
      {/* Control Bar (Status & AI Draft) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
          {["IN_PROGRESS", "CLOSED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wider uppercase transition-all ${
                status === s
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
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
          className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 h-8 px-3 rounded-xl shadow-2xs font-semibold text-xs transition-colors"
        >
          {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-slate-500" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />}
          AI Auto-Draft
        </Button>
      </div>

      {/* Message Input Container */}
      <div className="flex items-end gap-3">
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:bg-white focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-all">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Tulis balasan untuk klien... (Tekan Enter untuk kirim)"
            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 resize-none text-sm p-3.5 outline-none min-h-[52px] max-h-[120px] custom-scrollbar"
            style={{ overflowY: body.split("\n").length > 3 ? "auto" : "hidden" }}
          />
        </div>
        
        <Button
          disabled={loading || !body.trim()}
          onClick={sendReply}
          className="bg-[#1E242E] hover:bg-slate-800 text-white rounded-xl h-[52px] w-[52px] shrink-0 p-0 shadow-xs transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
        </Button>
      </div>

      <p className="text-[11px] text-slate-400 text-center mt-3">
        Gunakan <kbd className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-mono text-[10px]">Shift</kbd> + <kbd className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-mono text-[10px]">Enter</kbd> untuk baris baru
      </p>
    </div>
  );
}
