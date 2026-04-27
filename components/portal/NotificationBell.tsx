"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, Receipt, MessageSquare, Briefcase, CheckCheck, Info } from "lucide-react";

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  link: string | null;
  createdAt: string;
};

const ICON: Record<string, React.ElementType> = {
  INVOICE_NEW:    Receipt,
  TICKET_REPLY:   MessageSquare,
  PROJECT_STATUS: Briefcase,
  GENERAL:        Info,
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

export default function NotificationBell() {
  const [open, setOpen]           = useState(false);
  const [notifs, setNotifs]       = useState<Notif[]>([]);
  const [loading, setLoading]     = useState(true);
  const panelRef                  = useRef<HTMLDivElement>(null);
  const router                    = useRouter();

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/notifications", { cache: "no-store" });
      if (res.ok) setNotifs(await res.json());
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling every 60 s
  useEffect(() => {
    void fetchNotifs();
    const t = setInterval(fetchNotifs, 60_000);
    return () => clearInterval(t);
  }, [fetchNotifs]);

  // Close panel on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifs.filter(n => !n.read).length;

  async function markOne(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await fetch(`/api/portal/notifications/${id}`, { method: "PATCH" });
  }

  async function markAll() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    await fetch("/api/portal/notifications", { method: "PATCH" });
  }

  async function handleClick(n: Notif) {
    await markOne(n.id);
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Notifikasi"
        className="relative p-2 rounded-lg text-blue-200/50 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-blue-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-0.5 leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-50"
          style={{ background: "rgba(8,18,36,0.97)", backdropFilter: "blur(24px)" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold text-sm">Notifikasi</h3>
              {unread > 0 && (
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full font-medium">
                  {unread} baru
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAll}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Baca semua
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-blue-200/40 hover:text-white transition-colors p-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center text-blue-200/30 text-sm">Memuat...</div>
            ) : notifs.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-blue-200/15 mx-auto mb-2" />
                <p className="text-blue-200/30 text-sm">Belum ada notifikasi</p>
              </div>
            ) : (
              notifs.map((n) => {
                const Icon = ICON[n.type] ?? Info;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${
                      !n.read ? "bg-blue-500/5" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      !n.read ? "bg-blue-600/25" : "bg-white/5"
                    }`}>
                      <Icon className={`w-4 h-4 ${!n.read ? "text-blue-400" : "text-blue-200/35"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-snug ${!n.read ? "text-white" : "text-blue-200/65"}`}>
                        {n.title}
                      </p>
                      <p className="text-blue-200/45 text-xs leading-snug mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-blue-200/25 text-[11px] mt-1.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 bg-blue-400 rounded-full shrink-0 mt-2 flex-none" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
