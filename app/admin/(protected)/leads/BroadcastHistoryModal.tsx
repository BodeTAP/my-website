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
  QUEUED:    "bg-blue-50 text-blue-700 border-blue-200",
  SENT:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED:    "bg-rose-50 text-rose-700 border-rose-200",
  SKIPPED:   "bg-amber-50 text-amber-700 border-amber-200",
  OPTED_OUT: "bg-slate-100 text-slate-600 border-slate-200",
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

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-3xl border border-slate-200 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-slate-900 font-bold tracking-tight">Detail Broadcast</h3>
            <p className="text-slate-500 text-xs mt-0.5 font-mono">
              {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(log.sentAt))}
              {" · "}{log.devices} device · delay {log.delayRange}s
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3 p-4 border-b border-slate-100 bg-slate-50/30 shrink-0">
          {[
            { label: "Diantrekan", value: log.sent, color: "text-emerald-700", icon: CheckCircle2 },
            { label: "Gagal", value: log.failed, color: "text-rose-600", icon: XCircle },
            { label: "Dilewati", value: log.skipped, color: "text-amber-700", icon: SkipForward },
            { label: "Opt-in setelah", value: optInCount, color: "text-slate-900", icon: Users },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-2xs">
              <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
              <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
              <p className="text-slate-500 text-[10px] uppercase font-mono tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {/* Conversion rate */}
        {log.sent > 0 && optInCount > 0 && (
          <div className="mx-4 mt-3 rounded-xl bg-emerald-50 border border-emerald-200/80 px-4 py-2.5 flex items-center justify-between shrink-0">
            <span className="text-emerald-800 text-xs font-semibold">Konversi opt-in dari broadcast ini</span>
            <span className="text-emerald-700 font-bold font-mono text-sm">{Math.round((optInCount / log.sent) * 100)}%</span>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1.5 px-4 pt-3 pb-2 shrink-0 overflow-x-auto">
          {["ALL", "QUEUED", "SENT", "FAILED", "SKIPPED", "OPTED_OUT"].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap border transition-all ${
                statusFilter === s
                  ? "bg-[#1E242E] text-white border-slate-800 shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100 shadow-2xs"
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
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : recipients.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8 font-mono">Tidak ada data penerima.</p>
          ) : (
            recipients.map((r) => (
              <div key={r.id} className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 flex items-start gap-3 hover:bg-white transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-900 text-sm font-semibold truncate">
                      {r.lead?.businessName ?? r.phone}
                    </span>
                    {r.lead?.name && r.lead.name !== r.lead.businessName && (
                      <span className="text-slate-500 text-xs font-medium">{r.lead.name}</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[r.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {r.status}
                    </span>
                    {r.skipReason && (
                      <span className="text-amber-700 text-[10px] font-mono">
                        ({SKIP_REASON_LABELS[r.skipReason] ?? r.skipReason})
                      </span>
                    )}
                    {r.lead?.waOptInStatus === "OPTED_IN" && (r.status === "QUEUED" || r.status === "SENT") && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                        ✓ Opt-in
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] font-mono mt-0.5">{r.phone}</p>
                </div>
                <button
                  onClick={() => setShowMessage(showMessage === r.id ? null : r.id)}
                  className="shrink-0 text-slate-400 hover:text-slate-800 transition-colors p-1"
                  title="Lihat pesan"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
          {showMessage && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowMessage(null)} />
              <div className="relative bg-white border border-slate-200 rounded-2xl p-5 max-w-md w-full shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-900 font-bold text-sm">Pesan yang dikirim</p>
                  <button onClick={() => setShowMessage(null)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <pre className="text-slate-800 text-xs whitespace-pre-wrap font-sans leading-relaxed max-h-80 overflow-y-auto bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {recipients.find((r) => r.id === showMessage)?.messageSnippet ?? ""}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
            <span className="text-slate-500 text-xs font-mono">{total} total penerima</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-slate-600 text-xs font-mono px-2">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors shadow-2xs"
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
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
        <div className="relative bg-white rounded-3xl w-full max-w-2xl border border-slate-200 shadow-2xl max-h-[80vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                <Clock className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <h2 className="text-slate-900 font-bold text-sm tracking-tight">Riwayat Broadcast</h2>
                {total > 0 && <p className="text-slate-500 text-xs font-mono">{total} sesi tersimpan</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs font-semibold transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-4 space-y-2.5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-12 font-mono">Belum ada riwayat broadcast.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-2 hover:bg-white hover:border-slate-300 transition-all shadow-2xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-slate-700 text-xs font-medium flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      }).format(new Date(log.sentAt))}
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-emerald-700 font-bold">{log.sent} terkirim</span>
                      {log.failed > 0 && <span className="text-rose-600 font-medium">{log.failed} gagal</span>}
                      {log.skipped > 0 && <span className="text-amber-700 font-medium">{log.skipped} dilewati</span>}
                      <span className="text-slate-400 font-mono text-[11px]">{log.devices} device · {log.delayRange}s</span>
                      <button
                        onClick={() => setDrillLog(log)}
                        className="flex items-center gap-1 text-slate-900 hover:text-slate-700 font-semibold text-xs ml-1 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-2xs"
                      >
                        <Eye className="w-3 h-3 text-slate-500" /> Detail
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs font-mono truncate">
                    &ldquo;{log.messageSnippet}{log.messageSnippet.length >= 100 ? "…" : ""}&rdquo;
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
              <span className="text-slate-500 text-xs font-mono">{total} total sesi</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-slate-600 text-xs font-mono px-2">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors shadow-2xs"
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
