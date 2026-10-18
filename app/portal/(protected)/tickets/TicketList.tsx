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
  OPEN: "bg-amber-50 text-amber-800 border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-800 border-blue-200",
  CLOSED: "bg-slate-100 text-slate-600 border-slate-200",
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

    void Promise.resolve().then(() => fetchMessages(openTicket));
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
    <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-220px)] min-h-[520px] shadow-xs">
      
      {/* ─── LEFT PANE: Ticket List ─── */}
      <div className={`w-full lg:w-1/3 flex flex-col border-r border-slate-200/80 bg-white ${openTicket || showNew ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Header Left */}
        <div className="p-4 border-b border-slate-100 shrink-0 flex items-center justify-between bg-slate-50/70">
          <h3 className="text-slate-900 font-bold flex items-center gap-2 text-sm">
            <MessageSquare className="w-4 h-4 text-slate-700" />
            Daftar Tiket
          </h3>
          <Button 
            size="sm" 
            onClick={() => { setShowNew(true); setOpenTicket(null); }} 
            className="bg-[#1E242E] hover:bg-slate-800 text-white h-8 px-3 rounded-xl text-xs font-bold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Buat Tiket
          </Button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {initialTickets.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
              Belum ada tiket masuk. Buat tiket baru jika ada pertanyaan atau permintaan revisi.
            </div>
          ) : (
            initialTickets.map((t) => {
              const messages = liveMessages[t.id] ?? t.messages;
              const unread = messages.length > t.messages.length;
              const isActive = openTicket === t.id;
              
              return (
                <button
                  key={t.id}
                  onClick={() => { setOpenTicket(t.id); setShowNew(false); }}
                  className={`w-full text-left p-4 transition-all ${isActive ? 'bg-slate-50 border-l-3 border-[#1E242E]' : 'hover:bg-slate-50/80 border-l-3 border-transparent'}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`font-semibold line-clamp-1 text-xs sm:text-sm ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                      {t.subject}
                    </span>
                    {unread && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className={`text-[10px] py-0 px-2 h-5 font-bold ${STATUS_COLOR[t.status]}`}>
                      {t.status === "OPEN" ? "Terbuka" : t.status === "IN_PROGRESS" ? "Diproses" : "Selesai"}
                    </Badge>
                    <span className="text-slate-400 text-[10px] font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(t.updatedAt))}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ─── RIGHT PANE: Chat View / Form ─── */}
      <div className={`flex flex-col relative ${!openTicket && !showNew ? 'hidden lg:flex flex-1 bg-slate-50/40' : 'flex'} ${(openTicket || showNew) ? 'fixed inset-0 z-[100] bg-white lg:static lg:z-auto lg:flex-1 lg:bg-slate-50/40 lg:inset-auto' : ''}`}>
        
        {/* State 1: New Ticket Form */}
        {showNew && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-white">
            <div className="max-w-xl mx-auto space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="sm" onClick={() => setShowNew(false)} className="lg:hidden text-slate-500 p-0 h-8 w-8">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h3 className="text-slate-900 font-black text-xl tracking-tight">Buat Tiket Baru</h3>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Sampaikan permintaan revisi, kendala website, atau pertanyaan teknis ke tim MFWEB.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Subjek / Topik</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Contoh: Revisi Teks Halaman Beranda"
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 h-11 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Deskripsi Lengkap</label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={6}
                    placeholder="Sebutkan sedetail mungkin apa yang ingin ditanyakan atau diubah (sertakan link halaman jika ada)..."
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 resize-none p-3.5 rounded-xl"
                  />
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setShowNew(false)} className="text-slate-500 hover:text-slate-800 text-xs font-semibold">
                    Batal
                  </Button>
                  <Button disabled={loading || !subject.trim() || !body.trim()} onClick={createTicket} className="bg-[#1E242E] hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs px-5 h-10">
                    {loading ? "Mengirim..." : (
                      <>
                        Kirim Tiket <Send className="w-3.5 h-3.5 ml-2" />
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
            <div className="h-16 px-4 sm:px-6 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setOpenTicket(null)} className="lg:hidden text-slate-500 p-0 h-8 w-8 shrink-0">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="min-w-0">
                  <h3 className="text-slate-900 font-bold text-sm truncate">{activeTicketInfo.subject}</h3>
                  <p className="text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    Koneksi real-time aktif
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={`${STATUS_COLOR[activeTicketInfo.status]} shrink-0 hidden sm:inline-flex font-bold`}>
                {activeTicketInfo.status === "OPEN" ? "Terbuka" : activeTicketInfo.status === "IN_PROGRESS" ? "Diproses" : "Selesai"}
              </Badge>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-[#F8F9FA]">
              {activeMessages.map((m) => {
                const isMe = m.senderRole === "CLIENT";
                return (
                  <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-xs ${isMe ? "bg-[#1E242E] text-white rounded-tr-xs" : "bg-white border border-slate-200 text-slate-900 rounded-tl-xs"}`}>
                      {!isMe && (
                        <p className="text-[11px] font-bold text-slate-500 mb-1">Tim MFWEB</p>
                      )}
                      <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{m.body}</p>
                      <p className={`text-[10px] mt-1.5 text-right font-medium ${isMe ? "text-slate-400" : "text-slate-400"}`}>
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
              <div className="p-4 sm:p-5 border-t border-slate-200/80 bg-white shrink-0">
                <div className="relative">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Ketik balasan Anda di sini... (Tekan Enter untuk kirim)"
                    className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 resize-none rounded-xl pr-14 min-h-[48px] py-3 text-xs sm:text-sm focus-visible:ring-slate-300 focus:bg-white transition-colors"
                  />
                  <Button
                    disabled={loading || !replyText.trim()}
                    onClick={sendReply}
                    size="sm"
                    className="absolute right-2 bottom-2 bg-[#1E242E] hover:bg-slate-800 text-white h-8 w-8 p-0 rounded-lg shadow-xs transition-transform active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 text-center">Tekan Shift + Enter untuk baris baru</p>
              </div>
            ) : (
              <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 text-center">
                <p className="text-slate-500 text-xs">Tiket ini sudah ditutup. Silakan buat tiket baru jika ada pertanyaan atau permintaan lainnya.</p>
              </div>
            )}
          </>
        )}

        {/* State 3: Empty Placeholder (Desktop Only) */}
        {!openTicket && !showNew && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50/50">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 text-slate-400 shadow-2xs">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h4 className="text-slate-900 font-bold text-base mb-1">Pilih Tiket</h4>
            <p className="text-slate-500 text-xs sm:text-sm max-w-sm">
              Pilih salah satu tiket di sebelah kiri untuk melihat percakapan, atau klik tombol &quot;Buat Tiket&quot; untuk memulai diskusi baru.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
