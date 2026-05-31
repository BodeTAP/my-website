"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Clock, Download, ChevronLeft, ChevronRight, Users, CheckCircle2, XCircle, SkipForward, Eye } from "lucide-react";

type BroadcastLogEntry = {
  id: string;
  sentAt: string;
  totalLeads: number;
  sent: number;
  failed: number;
  skipped: number;
  devices: number;
  delayRange: string;
  messageSnippet: string;
};

type RecipientEntry = {
  id: string;
  phone: string;
  status: string;
  skipReason: string | null;
  messageSnippet: string;
  sentAt: string | null;
  lead: { id: string; name: string; businessName: string; waOptInStatus: string } | null;
};

const STATUS_COLORS: Record<string, string> = {
  QUEUED:    "bg-blue-500/10 text-blue-300 border-blue-500/20",
  SENT:      "bg-green-500/10 text-green-300 border-green-500/20",
  FAILED:    "bg-red-500/10 text-red-300 border-red-500/20",
  SKIPPED:   "bg-amber-500/10 text-amber-300 border-amber-500/20",
  OPTED_OUT: "bg-slate-500/10 text-slate-300 border-slate-500/20",
};

const SKIP_REASON_LABELS: Record<string, string> = {
  COOLDOWN:                    "Cooldown",
  SESSION_LIMIT:               "Batas sesi",
  DAILY_LIMIT:                 "Batas harian",
  OPTED_OUT:                   "Opt-out",
  DO_NOT_CONTACT:              "Do not contact",
  INVALID_PHONE:               "Nomor tidak valid",
  NOT_REGISTERED_ON_WHATSAPP:  "Tidak di WA",
};

function DrillDownModal({ log, onClose }: { log: BroadcastLogEntry; onClose: () => void }) {
  const [recipients, setRecipients] = useState<RecipientEntry[]>([]);
  const [total, setTotal]           = useState(0);
  const [optInCount, setOptInCount] = useState(0);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showMessage, setShowMessage]   = useState<string | null>(null);

  const fetchRecipients = useCallback(async (p: number, sf: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), perPage: "20" });
      if (sf !== "ALL") params.set("status", sf);
      const res = await fetch(`/api/admin/leads/broadcast/${log.id}?${params}`);
      const data = await res.json();
      setRecipients(data.recipients ?? []);
      setTotal(data.total ?? 0);
      setOptInCount(data.optInCount ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [log.id]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => { void fetchRecipients(page, statusFilter); });
    return () => window.cancelAnimationFrame(id);
  }, [fetchRecipients, page, statusFilter]);

  const handleStatusFilter = (sf: string) => {
    setStatusFilter(sf);
    setPage(1);
  };

  // optInCount comes from the server (whole-broadcast aggregate), not the current page.

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl w-full max-w-3xl border border-white/10 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div>
            <h3 className="text-white font-bold">Detail Broadcast</h3>
            <p className="text-blue-200/50 text-xs mt-0.5">
              {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(log.sentAt))}
              {" · "}{log.devices} device · delay {log.delayRange}s
            </p>
          </div>
          <button onClick={onClose} className="text-blue-200/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3 p-4 border-b border-white/5 shrink-0">
          {[
            { label: "Diantrekan", value: log.sent, color: "text-green-400", icon: CheckCircle2 },
            { label: "Gagal", value: log.failed, color: "text-red-400", icon: XCircle },
            { label: "Dilewati", value: log.skipped, color: "text-amber-400", icon: SkipForward },
            { label: "Opt-in setelah", value: optInCount, color: "text-emerald-300", icon: Users },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
              <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-blue-200/40 text-[10px]">{label}</p>
            </div>
          ))}
        </div>

        {/* Conversion rate */}
        {log.sent > 0 && optInCount > 0 && (
          <div className="mx-4 mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 flex items-center justify-between shrink-0">
            <span className="text-emerald-300 text-xs font-semibold">Konversi opt-in dari broadcast ini</span>
            <span className="text-emerald-400 font-bold text-sm">{Math.round((optInCount / log.sent) * 100)}%</span>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 px-4 pt-3 pb-2 shrink-0 overflow-x-auto">
          {["ALL", "QUEUED", "SENT", "FAILED", "SKIPPED", "OPTED_OUT"].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border transition-all ${
                statusFilter === s
                  ? "bg-indigo-600 text-white border-indigo-500/50"
                  : "bg-white/5 border-white/10 text-blue-200/50 hover:text-white"
              }`}
            >
              {s === "ALL" ? `Semua (${total})` : s}
            </button>
          ))}
        </div>

        {/* Recipients list */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-200/40" />
            </div>
          ) : recipients.length === 0 ? (
            <p className="text-blue-200/40 text-sm text-center py-8">Tidak ada data.</p>
          ) : (
            recipients.map((r) => (
              <div key={r.id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white text-sm font-medium truncate">
                      {r.lead?.businessName ?? r.phone}
                    </span>
                    {r.lead?.name && r.lead.name !== r.lead.businessName && (
                      <span className="text-blue-200/40 text-xs">{r.lead.name}</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[r.status] ?? "bg-white/5 text-white/50 border-white/10"}`}>
                      {r.status}
                    </span>
                    {r.skipReason && (
                      <span className="text-amber-300/60 text-[10px]">
                        ({SKIP_REASON_LABELS[r.skipReason] ?? r.skipReason})
                      </span>
                    )}
                    {r.lead?.waOptInStatus === "OPTED_IN" && (r.status === "QUEUED" || r.status === "SENT") && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
                        ✓ Opt-in
                      </span>
                    )}
                  </div>
                  <p className="text-blue-200/40 text-[11px] font-mono mt-0.5">{r.phone}</p>
                </div>
                <button
                  onClick={() => setShowMessage(showMessage === r.id ? null : r.id)}
                  className="shrink-0 text-blue-200/30 hover:text-blue-300 transition-colors"
                  title="Lihat pesan"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
          {showMessage && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/70" onClick={() => setShowMessage(null)} />
              <div className="relative bg-[#071225] border border-white/10 rounded-2xl p-5 max-w-md w-full shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-semibold text-sm">Pesan yang dikirim</p>
                  <button onClick={() => setShowMessage(null)} className="text-blue-200/40 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <pre className="text-blue-100/80 text-xs whitespace-pre-wrap font-sans leading-relaxed max-h-80 overflow-y-auto">
                  {recipients.find((r) => r.id === showMessage)?.messageSnippet ?? ""}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 shrink-0">
            <span className="text-blue-200/40 text-xs">{total} total</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-white/10 text-blue-200/50 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-blue-200/60 text-xs">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-white/10 text-blue-200/50 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default function BroadcastHistoryModal({ onClose }: { onClose: () => void }) {
  const [logs, setLogs]         = useState<BroadcastLogEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]       = useState(0);
  const [drillLog, setDrillLog] = useState<BroadcastLogEntry | null>(null);

  const fetchLogs = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/broadcast?page=${p}&perPage=20`);
      const data = await res.json();
      setLogs(data.logs ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => { void fetchLogs(page); });
    return () => window.cancelAnimationFrame(id);
  }, [fetchLogs, page]);

  const handleExport = () => {
    window.open("/api/admin/leads/broadcast?format=csv", "_blank");
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative glass rounded-2xl w-full max-w-2xl border border-white/10 shadow-2xl max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h2 className="text-white font-bold">Riwayat Broadcast</h2>
              {total > 0 && <span className="text-blue-200/40 text-xs">({total} sesi)</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-white/10 text-blue-200/50 hover:text-white hover:border-white/20 transition-all"
              >
                <Download className="w-3 h-3" /> Export CSV
              </button>
              <button onClick={onClose} className="text-blue-200/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-4 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-200/40" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-blue-200/40 text-sm text-center py-12">Belum ada riwayat broadcast.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-2 hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-white/70 text-xs font-medium flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-blue-200/40" />
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      }).format(new Date(log.sentAt))}
                    </span>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-green-400 font-bold">{log.sent} terkirim</span>
                      {log.failed > 0 && <span className="text-red-400">{log.failed} gagal</span>}
                      {log.skipped > 0 && <span className="text-amber-400/70">{log.skipped} dilewati</span>}
                      <span className="text-blue-200/30">{log.devices} device · {log.delayRange}s</span>
                      <button
                        onClick={() => setDrillLog(log)}
                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
                      >
                        <Eye className="w-3 h-3" /> Detail
                      </button>
                    </div>
                  </div>
                  <p className="text-blue-200/40 text-[11px] font-mono truncate">
                    &ldquo;{log.messageSnippet}{log.messageSnippet.length >= 100 ? "…" : ""}&rdquo;
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 shrink-0">
              <span className="text-blue-200/40 text-xs">{total} total sesi</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-white/10 text-blue-200/50 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-blue-200/60 text-xs">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-white/10 text-blue-200/50 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {drillLog && (
        <DrillDownModal log={drillLog} onClose={() => setDrillLog(null)} />
      )}
    </>,
    document.body,
  );
}
