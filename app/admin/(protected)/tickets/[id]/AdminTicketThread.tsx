"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Message = {
  id: string;
  body: string;
  senderRole: string;
  createdAt: string;
};

export default function AdminTicketThread({
  ticketId,
  initialMessages,
  clientName,
}: {
  ticketId: string;
  initialMessages: Message[];
  clientName: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`);
      if (!res.ok) return;
      const data: Message[] = await res.json();
      setMessages((prev) => (prev.length === data.length ? prev : data));
    } catch {
      // silent
    }
  }, [ticketId]);

  useEffect(() => {
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative z-10 scroll-smooth bg-slate-50/50">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center">
          <p className="text-slate-400 text-sm bg-white border border-slate-200 px-6 py-2 rounded-full shadow-2xs">Belum ada percakapan.</p>
        </div>
      )}

      {/* Date Divider */}
      {messages.length > 0 && (
        <div className="flex justify-center sticky top-0 z-20">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-2xs">
            Riwayat Obrolan
          </span>
        </div>
      )}

      {messages.map((m) => {
        const isAdmin = m.senderRole === "ADMIN";
        return (
          <div key={m.id} className={`flex flex-col ${isAdmin ? "items-end" : "items-start"} group`}>
            <div className="flex items-baseline gap-2 mb-1.5 opacity-60 group-hover:opacity-100 transition-opacity px-1">
              <span className={`text-xs font-semibold ${isAdmin ? "text-slate-800" : "text-slate-600"}`}>
                {isAdmin ? "Anda (Tim MFWEB)" : clientName}
              </span>
              <span className="text-[10px] text-slate-400">
                {new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date(m.createdAt))}
              </span>
            </div>
            
            <div
              className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-5 py-3 text-sm ${
                isAdmin 
                  ? "bg-[#1E242E] text-white rounded-tr-xs shadow-xs" 
                  : "bg-white border border-slate-200 text-slate-900 rounded-tl-xs shadow-2xs"
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
