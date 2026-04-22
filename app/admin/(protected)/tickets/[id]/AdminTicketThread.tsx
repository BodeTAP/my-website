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
    <div className="glass rounded-2xl p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-sm">Percakapan</h2>
        <p className="text-blue-200/20 text-xs flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
          Live
        </p>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-blue-200/30 text-sm text-center py-6">Belum ada pesan.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-xl px-4 py-3 text-sm ${
              m.senderRole === "ADMIN" ? "bg-blue-600/15 ml-10" : "bg-white/5 mr-10"
            }`}
          >
            <p className={`font-medium text-xs mb-1 ${m.senderRole === "ADMIN" ? "text-blue-300" : "text-blue-200/50"}`}>
              {m.senderRole === "ADMIN" ? "Tim MFWEB" : clientName}
              <span className="ml-2 font-normal text-blue-200/30">
                {new Intl.DateTimeFormat("id-ID", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(m.createdAt))}
              </span>
            </p>
            <p className="text-blue-100/80 whitespace-pre-wrap">{m.body}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
