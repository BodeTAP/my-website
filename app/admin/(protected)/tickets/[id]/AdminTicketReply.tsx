"use client";

import { useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [closed, setClosed] = useState(currentStatus === "CLOSED");

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
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal generate draft");
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
      <div className="glass rounded-2xl p-5 text-center">
        <p className="text-blue-200/40 text-sm mb-3">Tiket ini sudah ditutup.</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => changeStatus("OPEN")}
          disabled={loading}
          className="border-white/10 text-white hover:bg-white/5"
        >
          Buka Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-blue-200/50 text-sm">Status setelah balas:</span>
          {["IN_PROGRESS", "CLOSED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                status === s
                  ? "bg-blue-600 text-white"
                  : "text-blue-200/40 hover:text-white bg-white/5"
              }`}
            >
              {s === "IN_PROGRESS" ? "Diproses" : "Tutup Tiket"}
            </button>
          ))}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={getAiDraft}
          disabled={aiLoading}
          className="border-blue-500/30 text-blue-300 hover:bg-blue-600/10 h-8"
        >
          {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
          Draft AI
        </Button>
      </div>

      <div className="flex gap-3">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder="Tulis balasan... (Enter untuk kirim)"
          className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 resize-none text-sm"
        />
        <Button
          disabled={loading || !body.trim()}
          onClick={sendReply}
          className="bg-blue-600 hover:bg-blue-500 text-white self-end h-10 px-4"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
