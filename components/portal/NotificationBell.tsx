"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
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
  const [open, setOpen]       = useState(false);
  const [notifs, setNotifs]   = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  // Position of the fixed dropdown (viewport-relative)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    void Promise.resolve().then(() => setMounted(true));
  }, []);
  const btnRef                = useRef<HTMLButtonElement>(null);
  const panelRef              = useRef<HTMLDivElement>(null);
  const router                = useRouter();

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/notifications", { cache: "no-store" });
      if (res.ok) setNotifs(await res.json());
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchNotifs);
    const t = setInterval(fetchNotifs, 60_000);
    return () => clearInterval(t);
  }, [fetchNotifs]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current   && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on resize to avoid stale positions
  useEffect(() => {
    const handler = () => setOpen(false);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  function handleToggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const panelW = 320; // w-80
      // Try to align right edge with button right edge; clamp to viewport left
      const left = Math.max(8, rect.right - panelW);
      setDropPos({ top: rect.bottom + 8, left });
    }
    setOpen(v => !v);
  }

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
    <>
      {/* Bell button */}
      <button
        ref={btnRef}
        onClick={handleToggle}
        aria-label="Notifikasi"
        className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[15px] h-3.5 bg-rose-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center px-0.5 leading-none shadow-xs">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Fixed dropdown — renders above all overflow containers via portal */}
      {mounted && open && createPortal(
        <div
          ref={panelRef}
          className="fixed w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden"
          style={{
            top:       dropPos.top,
            left:      dropPos.left,
            zIndex:    9999,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-2">
              <h3 className="text-slate-900 font-bold text-sm">Notifikasi</h3>
              {unread > 0 && (
                <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full font-bold">
                  {unread} baru
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAll}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-semibold transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Baca semua
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="py-10 text-center text-slate-400 text-sm">Memuat notifikasi...</div>
            ) : notifs.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm font-medium">Belum ada notifikasi</p>
              </div>
            ) : (
              notifs.map((n) => {
                const Icon = ICON[n.type] ?? Info;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors ${
                      !n.read ? "bg-slate-50/80 hover:bg-slate-100/70" : "bg-white hover:bg-slate-50/80"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      !n.read ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug font-semibold ${!n.read ? "text-slate-900" : "text-slate-700"}`}>
                        {n.title}
                      </p>
                      <p className="text-slate-500 text-xs leading-snug mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-slate-400 text-[11px] mt-1.5 font-medium">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 bg-rose-500 rounded-full shrink-0 mt-2 flex-none" />}
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
