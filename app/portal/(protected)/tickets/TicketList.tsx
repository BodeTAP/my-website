"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Send, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Message = { id: string; body: string; senderRole: string; createdAt: string };
type Ticket = { id: string; subject: string; status: string; messages: Message[]; updatedAt: Date };

const STATUS_COLOR: Record<string, string> = {
  OPEN: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  IN_PROGRESS: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  CLOSED: "bg-white/5 text-blue-200/40 border-white/10",
};

export default function TicketList({
  tickets: initialTickets,
  clientId,
  userId,
}: {
  tickets: Ticket[];
  clientId: string;
  userId: string;
}) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [openTicket, setOpenTicket] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Live messages state — keyed by ticketId
  const [liveMessages, setLiveMessages] = useState<Record<string, Message[]>>(
    Object.fromEntries(initialTickets.map((t) => [t.id, t.messages]))
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async (ticketId: string) => {
    try {
      const res = await fetch(`/api/portal/tickets/${ticketId}/messages`);
      if (!res.ok) return;
      const data: Message[] = await res.json();
      setLiveMessages((prev) => {
        const current = prev[ticketId] ?? [];
        if (current.length === data.length) return prev;
        return { ...prev, [ticketId]: data };
      });
    } catch {
      // silent
    }
  }, []);

  // Start / stop polling when openTicket changes
  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (!openTicket) return;

    fetchMessages(openTicket);
    pollingRef.current = setInterval(() => fetchMessages(openTicket), 3000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [openTicket, fetchMessages]);

  // Scroll to bottom whenever messages update for the open ticket
  useEffect(() => {
    if (openTicket) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveMessages, openTicket]);

  const createTicket = async () => {
    if (!subject.trim() || !body.trim()) return;
    setLoading(true);
    const res = await fetch("/api/portal/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, subject, body, userId }),
    });
    if (res.ok) {
      const ticket = await res.json();
      setLiveMessages((prev) => ({ ...prev, [ticket.id]: [] }));
      setShowNew(false);
      setSubject("");
      setBody("");
      router.refresh();
    }
    setLoading(false);
  };

  const sendReply = async (ticketId: string) => {
    const msg = replyMap[ticketId];
    if (!msg?.trim()) return;
    setLoading(true);

    // Optimistic update
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      body: msg,
      senderRole: "CLIENT",
      createdAt: new Date().toISOString(),
    };
    setLiveMessages((prev) => ({ ...prev, [ticketId]: [...(prev[ticketId] ?? []), optimistic] }));
    setReplyMap((m) => ({ ...m, [ticketId]: "" }));

    await fetch(`/api/portal/tickets/${ticketId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: msg, userId }),
    });

    // Fetch confirmed messages to replace optimistic
    await fetchMessages(ticketId);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, ticketId: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendReply(ticketId);
    }
  };

  return (
    <div className="space-y-4">
      {/* New ticket button */}
      <Button onClick={() => setShowNew(!showNew)} className="bg-blue-600 hover:bg-blue-500 text-white">
        <Plus className="w-4 h-4 mr-2" />
        Buat Tiket Baru
      </Button>

      {/* New ticket form */}
      {showNew && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-semibold">Tiket Baru</h3>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Judul / topik pertanyaan..."
            className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
          />
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Jelaskan permintaan atau pertanyaan Anda..."
            className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 resize-none"
          />
          <div className="flex gap-2">
            <Button disabled={loading} onClick={createTicket} className="bg-blue-600 hover:bg-blue-500 text-white">
              <Send className="w-4 h-4 mr-2" />
              Kirim Tiket
            </Button>
            <Button variant="ghost" onClick={() => setShowNew(false)} className="text-blue-200/50 hover:text-white hover:bg-white/5">
              Batal
            </Button>
          </div>
        </div>
      )}

      {/* Ticket list */}
      {initialTickets.length === 0 && !showNew ? (
        <div className="glass rounded-2xl p-10 text-center text-blue-200/30">
          Belum ada tiket. Buat tiket baru untuk mengirim pertanyaan atau permintaan revisi.
        </div>
      ) : (
        initialTickets.map((t) => {
          const messages = liveMessages[t.id] ?? t.messages;
          const isOpen = openTicket === t.id;

          return (
            <div key={t.id} className="glass rounded-2xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/2 transition-colors"
                onClick={() => setOpenTicket(isOpen ? null : t.id)}
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={STATUS_COLOR[t.status]}>
                    {t.status === "OPEN" ? "Terbuka" : t.status === "IN_PROGRESS" ? "Diproses" : "Selesai"}
                  </Badge>
                  <span className="text-white font-medium">{t.subject}</span>
                  {/* Unread indicator — tampil jika ada pesan baru */}
                  {messages.length > t.messages.length && (
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-200/30 text-xs">
                    {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(t.updatedAt))}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-200/40" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-blue-200/40" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-white/5 p-5 space-y-4">
                  {/* Messages */}
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`rounded-xl px-4 py-3 text-sm ${
                          m.senderRole === "CLIENT" ? "bg-blue-600/15 ml-8" : "bg-white/5 mr-8"
                        }`}
                      >
                        <p className={`font-medium text-xs mb-1 ${m.senderRole === "CLIENT" ? "text-blue-300" : "text-blue-200/50"}`}>
                          {m.senderRole === "CLIENT" ? "Anda" : "Tim MFWEB"}
                          <span className="ml-2 font-normal text-blue-200/30">
                            {new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date(m.createdAt))}
                          </span>
                        </p>
                        <p className="text-blue-100/80 whitespace-pre-wrap">{m.body}</p>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>

                  {/* Real-time indicator */}
                  <p className="text-blue-200/20 text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                    Pesan baru akan muncul otomatis
                  </p>

                  {/* Reply */}
                  {t.status !== "CLOSED" && (
                    <div className="flex gap-2">
                      <Textarea
                        value={replyMap[t.id] ?? ""}
                        onChange={(e) => setReplyMap((m) => ({ ...m, [t.id]: e.target.value }))}
                        onKeyDown={(e) => handleKeyDown(e, t.id)}
                        rows={2}
                        placeholder="Ketik pesan... (Enter untuk kirim)"
                        className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 resize-none text-sm"
                      />
                      <Button
                        disabled={loading}
                        onClick={() => sendReply(t.id)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-500 text-white self-end h-10 px-4"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
