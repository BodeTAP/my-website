"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Send, ArrowLeft, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Message = { id: string; body: string; senderRole: string; createdAt: string };
type Ticket = { id: string; subject: string; status: string; messages: Message[]; updatedAt: Date | string };

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
  const [replyText, setReplyText] = useState("");
  const [openTicket, setOpenTicket] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Live messages state
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

  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (!openTicket) return;

    fetchMessages(openTicket);
    pollingRef.current = setInterval(() => fetchMessages(openTicket), 3000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [openTicket, fetchMessages]);

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
      setOpenTicket(ticket.id); // auto open new ticket
      router.refresh();
    }
    setLoading(false);
  };

  const sendReply = async () => {
    if (!openTicket || !replyText.trim()) return;
    setLoading(true);

    const ticketId = openTicket;
    const msg = replyText;

    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      body: msg,
      senderRole: "CLIENT",
      createdAt: new Date().toISOString(),
    };
    
    setLiveMessages((prev) => ({ ...prev, [ticketId]: [...(prev[ticketId] ?? []), optimistic] }));
    setReplyText("");

    await fetch(`/api/portal/tickets/${ticketId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: msg, userId }),
    });

    await fetchMessages(ticketId);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  const activeTicketInfo = initialTickets.find(t => t.id === openTicket);
  const activeMessages = openTicket ? (liveMessages[openTicket] ?? []) : [];

  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-220px)] min-h-[500px]">
      
      {/* ─── LEFT PANE: Ticket List ─── */}
      <div className={`w-full lg:w-1/3 flex flex-col border-r border-white/5 ${openTicket || showNew ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Header Left */}
        <div className="p-4 border-b border-white/5 shrink-0 flex items-center justify-between bg-white/2">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            Kotak Masuk
          </h2>
          <Button 
            size="sm" 
            onClick={() => { setShowNew(true); setOpenTicket(null); }} 
            className="bg-blue-600 hover:bg-blue-500 text-white h-8 px-3 rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {initialTickets.length === 0 ? (
            <div className="p-8 text-center text-blue-200/40 text-sm">
              Belum ada tiket masuk.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {initialTickets.map((t) => {
                const messages = liveMessages[t.id] ?? t.messages;
                const unread = messages.length > t.messages.length;
                const isActive = openTicket === t.id;
                
                return (
                  <button
                    key={t.id}
                    onClick={() => { setOpenTicket(t.id); setShowNew(false); }}
                    className={`w-full text-left p-4 transition-all hover:bg-white/5 ${isActive ? 'bg-white/5 border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className={`font-medium line-clamp-1 text-sm ${isActive ? 'text-white' : 'text-blue-100/80'}`}>
                        {t.subject}
                      </span>
                      {unread && <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-1.5" />}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className={`text-[10px] py-0 px-2 h-5 ${STATUS_COLOR[t.status]}`}>
                        {t.status === "OPEN" ? "Terbuka" : t.status === "IN_PROGRESS" ? "Diproses" : "Selesai"}
                      </Badge>
                      <span className="text-blue-200/30 text-[10px] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(t.updatedAt))}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT PANE: Chat View / Form ─── */}
      <div className={`flex flex-col relative ${!openTicket && !showNew ? 'hidden lg:flex flex-1 bg-[#050b14]/50' : 'flex'} ${(openTicket || showNew) ? 'fixed inset-0 z-[100] bg-[#020611] lg:static lg:z-auto lg:flex-1 lg:bg-[#050b14]/50 lg:inset-auto' : ''}`}>
        
        {/* State 1: New Ticket Form */}
        {showNew && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-10">
            <div className="max-w-xl mx-auto space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="sm" onClick={() => setShowNew(false)} className="lg:hidden text-blue-200/50 p-0 h-8 w-8">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h3 className="text-white font-bold text-lg">Buat Tiket Baru</h3>
                  <p className="text-blue-200/50 text-sm">Kirim detail pertanyaan atau revisi Anda ke tim kami.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-blue-200/60 mb-1.5">Subjek / Topik</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Contoh: Revisi Teks Beranda"
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 h-11"
                  />
                </div>
                <div>
                  <label className="block text-sm text-blue-200/60 mb-1.5">Deskripsi Lengkap</label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={6}
                    placeholder="Sebutkan sedetail mungkin apa yang ingin ditanyakan atau diubah..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 resize-none p-3"
                  />
                </div>
                <div className="pt-2">
                  <Button disabled={loading || !subject || !body} onClick={createTicket} className="bg-blue-600 hover:bg-blue-500 text-white w-full sm:w-auto">
                    {loading ? "Mengirim..." : (
                      <>
                        Kirim Tiket <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State 2: Active Chat */}
        {openTicket && activeTicketInfo && (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 sm:px-6 border-b border-white/5 bg-white/2 flex items-center justify-between shrink-0 sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setOpenTicket(null)} className="lg:hidden text-blue-200/50 p-0 h-8 w-8 shrink-0">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">{activeTicketInfo.subject}</h3>
                  <p className="text-blue-200/40 text-[11px] flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                    Koneksi real-time aktif
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={`${STATUS_COLOR[activeTicketInfo.status]} shrink-0 hidden sm:inline-flex`}>
                {activeTicketInfo.status === "OPEN" ? "Terbuka" : activeTicketInfo.status === "IN_PROGRESS" ? "Diproses" : "Selesai"}
              </Badge>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {activeMessages.map((m) => {
                const isMe = m.senderRole === "CLIENT";
                return (
                  <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${isMe ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white/5 border border-white/5 text-blue-50 rounded-tl-sm"}`}>
                      {!isMe && (
                        <p className="text-[11px] font-medium text-blue-300 mb-1">Tim MFWEB</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.body}</p>
                      <p className={`text-[10px] mt-2 text-right ${isMe ? "text-blue-200/60" : "text-blue-200/30"}`}>
                        {new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date(m.createdAt))}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} className="h-1" />
            </div>

            {/* Chat Input (Sticky Footer) */}
            {activeTicketInfo.status !== "CLOSED" ? (
              <div className="p-4 sm:p-6 border-t border-white/5 bg-[#030712] shrink-0">
                <div className="relative">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Ketik balasan Anda di sini... (Tekan Enter untuk kirim)"
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 resize-none rounded-xl pr-14 min-h-[50px] py-3.5 focus-visible:ring-blue-500/30"
                  />
                  <Button
                    disabled={loading || !replyText.trim()}
                    onClick={sendReply}
                    size="sm"
                    className="absolute right-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white h-8 w-8 p-0 rounded-lg shadow-md shadow-blue-500/20 transition-transform active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-blue-200/30 mt-2 text-center">Tekan Shift + Enter untuk garis baru</p>
              </div>
            ) : (
              <div className="p-4 border-t border-white/5 bg-[#030712] shrink-0 text-center">
                <p className="text-blue-200/40 text-sm">Tiket ini sudah ditutup. Silakan buat tiket baru jika ada pertanyaan lain.</p>
              </div>
            )}
          </>
        )}

        {/* State 3: Empty Placeholder (Desktop Only) */}
        {!openTicket && !showNew && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center mb-4 border border-blue-500/20">
              <MessageSquare className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-white font-medium text-lg mb-1">Dukungan Tiket</h3>
            <p className="text-blue-200/40 text-sm max-w-sm">
              Pilih tiket di sebelah kiri untuk mulai membaca atau membalas pesan, atau buat tiket baru jika Anda butuh bantuan baru.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
