"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, ChevronDown, ScrollText, UserSearch, CheckSquare, Square, Send, X, Loader2, Trash2, Download, Pencil, History, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/public/motion";
import { useSearchParams } from "next/navigation";
import LeadsSearch from "./LeadsSearch";
import LeadsPagination from "./LeadsPagination";
import { waMsg } from "@/lib/waTemplates";

type Lead = {
  id: string;
  name: string;
  businessName: string;
  whatsapp: string;
  domain: string | null;
  currentWebsite: string | null;
  message: string | null;
  status: "NEW" | "FOLLOWUP" | "DEAL" | "CLOSED";
  notes: string | null;
  lastContactedAt: Date | null;
  createdAt: Date;
};

const STATUS_LABELS: Record<Lead["status"], string> = {
  NEW: "Baru", FOLLOWUP: "Follow-up", DEAL: "Deal", CLOSED: "Selesai",
};

const STATUS_COLORS: Record<Lead["status"], string> = {
  NEW:      "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  FOLLOWUP: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  DEAL:     "bg-green-500/15 text-green-400 border-green-500/30",
  CLOSED:   "bg-white/5 text-blue-200/50 border-white/10",
};

const DEFAULT_TEMPLATE = waMsg.prospectCold("{businessName}");
const WA_TEMPLATE_KEY  = "mfweb_wa_manual_template";
const DEFAULT_WA_MANUAL = "Halo, apakah ini *{businessName}*? 👋\n\nSaya dari *MFWEB*, jasa pembuatan website profesional untuk bisnis lokal.\n\nBoleh saya kirimkan info lengkapnya? 🙏";

const COOLDOWN_HOURS = 24;

function isCoolingDown(lastContactedAt: Date | null): boolean {
  if (!lastContactedAt) return false;
  return Date.now() - new Date(lastContactedAt).getTime() < COOLDOWN_HOURS * 60 * 60 * 1000;
}

function cooldownRemaining(lastContactedAt: Date | null): string {
  if (!lastContactedAt) return "";
  const ms = COOLDOWN_HOURS * 60 * 60 * 1000 - (Date.now() - new Date(lastContactedAt).getTime());
  if (ms <= 0) return "";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}j ${m}m` : `${m}m`;
}

function BroadcastModal({ leads, onClose, onDone }: { leads: Lead[]; onClose: () => void; onDone: () => void }) {
  const [message, setMessage]           = useState(DEFAULT_TEMPLATE);
  const [status, setStatus]             = useState<"idle" | "sending" | "done">("idle");
  const [skipCooldown, setSkipCooldown] = useState(false);
  const [sessionLimit, setSessionLimit] = useState<number>(30); // configurable per-session limit
  const [countdown, setCountdown]       = useState<number | null>(null);
  const [result, setResult]             = useState<{
    sent: number; failed: number; devices: number; skipped: number;
    cooldownLeads?: string[]; invalidPhones?: string[];
    delayRange: string; estimatedSeconds: number;
  } | null>(null);

  const coolingLeads  = leads.filter((l) => isCoolingDown(l.lastContactedAt));
  const eligibleRaw   = skipCooldown ? leads.length : leads.length - coolingLeads.length;
  const eligibleCount = Math.min(eligibleRaw, sessionLimit);

  // Estimate completion time for display
  const estimateSeconds = (count: number, delayRange: string) => {
    const [min, max] = delayRange.split("-").map(Number);
    return Math.round(count * (min + max) / 2);
  };
  const previewDelay = eligibleCount <= 5 ? "15-30" : eligibleCount <= 10 ? "20-40" : "30-60";
  const previewEta   = estimateSeconds(eligibleCount, previewDelay);

  // Countdown timer after send
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSend = async () => {
    setStatus("sending");
    try {
      const res = await fetch("/api/admin/leads/broadcast", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ leadIds: leads.map((l) => l.id), message, skipCooldown, sessionLimit }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({
        sent:             data.sent,
        failed:           data.failed,
        devices:          data.devices ?? 1,
        skipped:          data.skipped ?? 0,
        cooldownLeads:    data.cooldownLeads,
        invalidPhones:    data.invalidPhones,
        delayRange:       data.delayRange ?? "20-40",
        estimatedSeconds: data.estimatedSeconds ?? 0,
      });
      setCountdown(data.estimatedSeconds ?? 0);
      setStatus("done");
    } catch (err) {
      alert((err as Error).message);
      setStatus("idle");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-white font-bold">Broadcast WhatsApp</h2>
            <p className="text-blue-200/50 text-xs mt-0.5">{leads.length} lead dipilih · gunakan {"{name}"} atau {"{businessName}"}</p>
          </div>
          <button onClick={onClose} className="text-blue-200/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {status !== "done" ? (
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Warning banner */}
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 space-y-1.5">
              <p className="text-amber-400 text-xs font-semibold">⚠️ Peringatan Risiko Blokir WhatsApp</p>
              <ul className="text-amber-300/70 text-[11px] space-y-1 list-disc ml-4">
                <li>Gunakan nomor WA <strong>khusus broadcast</strong>, bukan nomor utama bisnis</li>
                <li>Broadcast hanya diizinkan <strong>08.00–20.00 WIB</strong></li>
                <li>Pesan dikirim dengan jeda <strong>{previewDelay} detik acak</strong> antar nomor (adaptif)</li>
                <li>Pesan otomatis divariasikan agar tidak identik satu sama lain</li>
              </ul>
            </div>

            {/* Session limit control */}
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-blue-200/70 text-xs font-medium">Batas per sesi</span>
                <span className="text-white text-xs font-bold tabular-nums">
                  {eligibleCount} dari {eligibleRaw} lead
                  {eligibleRaw > sessionLimit && (
                    <span className="ml-1.5 text-amber-400/70 font-normal">
                      ({eligibleRaw - sessionLimit} dilewati)
                    </span>
                  )}
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={Math.max(eligibleRaw, 5)}
                step={5}
                value={Math.min(sessionLimit, Math.max(eligibleRaw, 5))}
                onChange={(e) => setSessionLimit(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5"
              />
              <div className="flex justify-between text-[10px] text-blue-200/30">
                <span>5 (aman)</span>
                <span className="text-blue-200/50">Rekomendasi: 15–30/sesi</span>
                <span>{Math.max(eligibleRaw, 5)} (semua)</span>
              </div>
            </div>

            {/* ETA preview */}
            {eligibleCount > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-blue-200/60 text-xs">Estimasi selesai:</span>
                <span className="text-blue-300 text-xs font-semibold">
                  ~{previewEta >= 60
                    ? `${Math.floor(previewEta / 60)} menit ${previewEta % 60} detik`
                    : `${previewEta} detik`}
                </span>
              </div>
            )}

            {/* Cooldown info */}
            {coolingLeads.length > 0 && (
              <div className="bg-orange-500/10 border border-orange-500/25 rounded-xl px-4 py-3 space-y-2">
                <p className="text-orange-400 text-xs font-semibold flex items-center gap-1.5">
                  🕐 {coolingLeads.length} lead masih dalam cooldown {COOLDOWN_HOURS} jam
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {coolingLeads.map((l) => (
                    <span key={l.id} className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-300/70 px-2 py-0.5 rounded-full">
                      {l.businessName} · {cooldownRemaining(l.lastContactedAt)}
                    </span>
                  ))}
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input type="checkbox" checked={skipCooldown} onChange={(e) => setSkipCooldown(e.target.checked)}
                    className="w-3.5 h-3.5 accent-orange-500" />
                  <span className="text-orange-300/70 text-[11px]">Kirim tetap ke semua (abaikan cooldown) — risiko lebih tinggi</span>
                </label>
              </div>
            )}

            <div className="bg-indigo-500/10 border border-indigo-500/25 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-lg leading-none">🔄</span>
              <div>
                <p className="text-indigo-300 text-xs font-semibold">Rotator + Variasi + Greeting Aktif</p>
                <p className="text-indigo-200/60 text-[11px] mt-0.5">
                  Device digilir otomatis. Pesan divariasikan suffix, emoji, dan sapaan sesuai waktu (pagi/siang/sore).
                </p>
              </div>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-blue-200/30 outline-none focus:border-indigo-500/50 resize-none font-mono"
            />
            <div className="flex items-center gap-3 flex-wrap">
              <Button onClick={handleSend} disabled={status === "sending" || !message.trim() || eligibleCount === 0}
                className="bg-green-600 hover:bg-green-500 text-white gap-2">
                {status === "sending"
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
                  : <><Send className="w-4 h-4" /> Kirim ke {eligibleCount} Lead</>}
              </Button>
              <p className="text-blue-200/30 text-xs">Delay adaptif · variasi otomatis · dihandle Fonnte</p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="text-5xl">✅</div>
            <p className="text-white font-bold text-lg">Broadcast Dikirim ke Antrian</p>

            {/* Countdown */}
            {countdown !== null && countdown > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
                <p className="text-blue-300 text-xs font-semibold mb-1">Estimasi selesai terkirim semua:</p>
                <p className="text-white text-2xl font-bold font-mono">
                  {countdown >= 60
                    ? `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`
                    : `${countdown}s`}
                </p>
                <p className="text-blue-200/40 text-[10px] mt-1">Fonnte mengirim dengan jeda {result?.delayRange}s antar pesan</p>
              </div>
            )}

            <div className="flex justify-center gap-6 flex-wrap">
              <div className="text-center">
                <p className="text-green-400 text-2xl font-bold">{result?.sent}</p>
                <p className="text-blue-200/50 text-xs">Diantrekan</p>
              </div>
              <div className="text-center">
                <p className="text-red-400 text-2xl font-bold">{result?.failed}</p>
                <p className="text-blue-200/50 text-xs">Gagal</p>
              </div>
              {(result?.skipped ?? 0) > 0 && (
                <div className="text-center">
                  <p className="text-orange-400 text-2xl font-bold">{result?.skipped}</p>
                  <p className="text-blue-200/50 text-xs">Dilewati</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-indigo-400 text-2xl font-bold">{result?.devices ?? 1}</p>
                <p className="text-blue-200/50 text-xs">Device</p>
              </div>
            </div>

            {result?.cooldownLeads && result.cooldownLeads.length > 0 && (
              <p className="text-orange-400/60 text-xs">
                Cooldown: {result.cooldownLeads.join(", ")}
              </p>
            )}
            {result?.invalidPhones && result.invalidPhones.length > 0 && (
              <p className="text-red-400/60 text-xs">
                Nomor tidak valid: {result.invalidPhones.join(", ")}
              </p>
            )}

            <Button onClick={onDone} variant="outline"
              className="border-white/10 text-blue-200/60 hover:text-white hover:bg-white/5">
              Tutup &amp; Refresh
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Broadcast History Modal ────────────────────────────────────────────────────
type BroadcastLogEntry = {
  id: string; sentAt: string; totalLeads: number; sent: number;
  failed: number; skipped: number; devices: number;
  delayRange: string; messageSnippet: string;
};

function BroadcastHistoryModal({ onClose }: { onClose: () => void }) {
  const [logs, setLogs]       = useState<BroadcastLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/leads/broadcast")
      .then((r) => r.json())
      .then((data) => { setLogs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl w-full max-w-2xl border border-white/10 shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <h2 className="text-white font-bold">Riwayat Broadcast</h2>
          </div>
          <button onClick={onClose} className="text-blue-200/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
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
              <div key={log.id} className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-2">
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
                    {log.skipped > 0 && <span className="text-orange-400/70">{log.skipped} dilewati</span>}
                    <span className="text-blue-200/30">{log.devices} device · {log.delayRange}s</span>
                  </div>
                </div>
                <p className="text-blue-200/40 text-[11px] font-mono truncate">
                  &ldquo;{log.messageSnippet}{log.messageSnippet.length >= 100 ? "…" : ""}&rdquo;
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q    = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const [perPage, setPerPage] = useState<number>(10);

  const PER_PAGE_OPTIONS = [10, 25, 50, 100];

  const [filter, setFilter]       = useState<Lead["status"] | "ALL">("ALL");
  const [statusMap, setStatusMap] = useState<Record<string, Lead["status"]>>(
    Object.fromEntries(leads.map((l) => [l.id, l.status])),
  );
  const [selected, setSelected]           = useState<Set<string>>(new Set());
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showHistory, setShowHistory]     = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [bulkUpdating, setBulkUpdating]   = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // Close status dropdown when clicking outside
  useEffect(() => {
    if (!showStatusMenu) return;
    const handler = () => setShowStatusMenu(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showStatusMenu]);
  const [waTemplate, setWaTemplate]       = useState<string>(() =>
    (typeof window !== "undefined" && localStorage.getItem(WA_TEMPLATE_KEY)) || DEFAULT_WA_MANUAL
  );
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [draftTemplate, setDraftTemplate] = useState(waTemplate);

  const filtered = leads.filter((l) => {
    const matchSearch = q === "" ||
      l.name.toLowerCase().includes(q.toLowerCase()) ||
      (l.businessName?.toLowerCase().includes(q.toLowerCase())) ||
      (l.domain?.toLowerCase().includes(q.toLowerCase()));
    const matchStatus = filter === "ALL" || statusMap[l.id] === filter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const startIdx   = filtered.length > 0 ? (page - 1) * perPage + 1 : 0;
  const endIdx     = Math.min(page * perPage, filtered.length);
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);

  const updateStatus = async (id: string, status: Lead["status"]) => {
    setStatusMap((m) => ({ ...m, [id]: status }));
    await fetch(`/api/admin/leads/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status }),
    });
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () =>
    setSelected(selected.size === paginated.length ? new Set() : new Set(paginated.map((l) => l.id)));

  const selectedLeads = leads.filter((l) => selected.has(l.id));

  const handleDelete = async () => {
    if (!window.confirm(`Hapus ${selected.size} lead yang dipilih? Tindakan ini tidak bisa dibatalkan.`)) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ids: [...selected] }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setSelected(new Set());
      router.refresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkStatus = async (status: Lead["status"]) => {
    setShowStatusMenu(false);
    setBulkUpdating(true);
    try {
      await Promise.all(
        [...selected].map((id) =>
          fetch(`/api/admin/leads/${id}`, {
            method:  "PATCH",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ status }),
          })
        )
      );
      // Update local statusMap immediately for instant feedback
      setStatusMap((prev) => {
        const next = { ...prev };
        for (const id of selected) next[id] = status;
        return next;
      });
      setSelected(new Set());
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleExportWati = () => {
    const rows = selectedLeads;
    // Wati format: Name, CountryCode, Phone (no country prefix), AllowCampaign, AllowSMS, Attribute 1
    const headers = ["Name", "CountryCode", "Phone", "AllowCampaign", "AllowSMS", "Attribute 1"];
    const csvRows = rows.map((l) => {
      // Strip "62" prefix → Wati sends with CountryCode separately
      const phone = l.whatsapp.replace(/\D/g, "").replace(/^62/, "");
      return [
        `"${l.businessName.replace(/"/g, '""')}"`,
        "62",
        phone,
        "TRUE",
        "TRUE",
        `"${l.businessName.replace(/"/g, '""')}"`, // {{1}} variable in template
      ].join(",");
    });
    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `leads-wati-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const rows = selectedLeads;
    const headers = ["Nama", "Nama Bisnis", "WhatsApp", "Domain", "Website", "Status", "Catatan", "Tanggal Masuk"];
    const csvRows = rows.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.businessName.replace(/"/g, '""')}"`,
      l.whatsapp,
      `"${(l.domain ?? "").replace(/"/g, '""')}"`,
      `"${(l.currentWebsite ?? "").replace(/"/g, '""')}"`,
      l.status,
      `"${(l.notes ?? "").replace(/"/g, '""')}"`,
      new Intl.DateTimeFormat("id-ID").format(new Date(l.createdAt)),
    ].join(","));
    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `leads-mfweb-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const WA = (phone: string, name: string, businessName: string) => {
    const text = waTemplate
      .replace(/\{name\}/g, name)
      .replace(/\{businessName\}/g, businessName);
    return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  };

  const saveWaTemplate = () => {
    localStorage.setItem(WA_TEMPLATE_KEY, draftTemplate);
    setWaTemplate(draftTemplate);
    setShowTemplateEditor(false);
  };

  return (
    <>
      {/* Template WA Manual Editor */}
      {showTemplateEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowTemplateEditor(false)} />
          <div className="relative glass rounded-2xl w-full max-w-md border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h2 className="text-white font-bold text-sm">Template Pesan WA Manual</h2>
                <p className="text-blue-200/50 text-xs mt-0.5">Gunakan {"{name}"} atau {"{businessName}"} sebagai variabel</p>
              </div>
              <button onClick={() => setShowTemplateEditor(false)} className="text-blue-200/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <textarea
                value={draftTemplate}
                onChange={(e) => setDraftTemplate(e.target.value)}
                rows={8}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-green-500/50 resize-none font-mono"
              />
              <div className="flex gap-3">
                <button onClick={() => setDraftTemplate(DEFAULT_WA_MANUAL)}
                  className="text-xs text-blue-200/40 hover:text-white transition-colors underline">
                  Reset ke default
                </button>
                <div className="flex-1" />
                <button onClick={() => setShowTemplateEditor(false)}
                  className="px-4 py-2 rounded-xl text-xs border border-white/10 text-blue-200/60 hover:text-white hover:bg-white/5 transition-all">
                  Batal
                </button>
                <Button onClick={saveWaTemplate} className="bg-green-600 hover:bg-green-500 text-white gap-2 h-9 text-xs px-4">
                  Simpan Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <BroadcastHistoryModal onClose={() => setShowHistory(false)} />
      )}

      {showBroadcast && (
        <BroadcastModal
          leads={selectedLeads}
          onClose={() => setShowBroadcast(false)}
          onDone={() => { setShowBroadcast(false); setSelected(new Set()); router.refresh(); }}
        />
      )}

      <FadeUp delay={0.2} className="glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
        <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 to-transparent pointer-events-none" />

        {/* Filter + Search */}
        <div className="flex flex-col sm:flex-row gap-4 p-5 border-b border-white/10 relative z-10 items-start sm:items-center">
          <LeadsSearch />
          <button onClick={() => { setDraftTemplate(waTemplate); setShowTemplateEditor(true); }}
            title="Edit template pesan WA manual"
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border border-white/10 text-blue-200/50 hover:text-green-400 hover:border-green-500/30 transition-all bg-white/5">
            <Pencil className="w-3 h-3" /> Template WA
          </button>
          <button onClick={() => setShowHistory(true)}
            title="Riwayat broadcast"
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border border-white/10 text-blue-200/50 hover:text-indigo-400 hover:border-indigo-500/30 transition-all bg-white/5">
            <History className="w-3 h-3" /> Riwayat
          </button>
          <div className="flex gap-2 overflow-x-auto flex-1 w-full pb-2 sm:pb-0">
            {(["ALL", "NEW", "FOLLOWUP", "DEAL", "CLOSED"] as const).map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                  filter === s
                    ? "bg-indigo-600 text-white border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                    : "bg-white/5 border-white/10 text-blue-200/50 hover:text-white hover:bg-white/10"
                }`}>
                {s === "ALL" ? "Semua Prospek" : STATUS_LABELS[s]}
                {s !== "ALL" && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-mono ${filter === s ? "bg-white/20" : "bg-black/20"}`}>
                    {leads.filter((l) => statusMap[l.id] === s).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-indigo-500/10 border-b border-indigo-500/20 relative z-10">
            <span className="text-indigo-300 text-sm font-medium">{selected.size} lead dipilih</span>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Bulk status change */}
              <div className="relative">
                <Button size="sm"
                  disabled={bulkUpdating}
                  onClick={(e) => { e.stopPropagation(); setShowStatusMenu((v) => !v); }}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-1.5 h-8 text-xs shadow-none">
                  {bulkUpdating
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <ChevronDown className="w-3 h-3" />}
                  Ubah Status
                </Button>
                {showStatusMenu && (
                  <div className="absolute top-full mt-1 left-0 glass rounded-xl border border-white/10 shadow-2xl z-50 min-w-[140px] overflow-hidden">
                    {(["NEW", "FOLLOWUP", "DEAL", "CLOSED"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleBulkStatus(s)}
                        className="w-full text-left px-4 py-2.5 text-xs hover:bg-white/10 transition-colors flex items-center gap-2"
                      >
                        <span className={`w-2 h-2 rounded-full ${
                          s === "NEW"      ? "bg-indigo-400" :
                          s === "FOLLOWUP" ? "bg-amber-400"  :
                          s === "DEAL"     ? "bg-green-400"  :
                          "bg-white/30"
                        }`} />
                        <span className="text-white">{STATUS_LABELS[s]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button size="sm" onClick={() => setShowBroadcast(true)}
                className="bg-green-600 hover:bg-green-500 text-white gap-1.5 h-8 text-xs">
                <Send className="w-3 h-3" /> Broadcast WA
              </Button>
              <Button size="sm" onClick={handleExportWati}
                title="Export format Wati untuk broadcast WhatsApp API"
                className="bg-green-600/20 hover:bg-green-600 text-green-300 hover:text-white border border-green-500/30 gap-1.5 h-8 text-xs shadow-none">
                <Download className="w-3 h-3" /> Export Wati
              </Button>
              <Button size="sm" onClick={handleExportCSV}
                className="bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 gap-1.5 h-8 text-xs shadow-none">
                <Download className="w-3 h-3" /> Export CSV
              </Button>
              <Button size="sm" onClick={handleDelete} disabled={deleting}
                className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 gap-1.5 h-8 text-xs shadow-none">
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Hapus
              </Button>
              <button onClick={() => setSelected(new Set())} className="text-blue-200/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-4 w-10">
                  <button onClick={toggleAll} className="text-blue-200/40 hover:text-white transition-colors">
                    {selected.size === paginated.length && paginated.length > 0
                      ? <CheckSquare className="w-4 h-4 text-indigo-400" />
                      : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="text-left px-4 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider">Nama / Bisnis</th>
                <th className="text-left px-4 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider">Kontak</th>
                <th className="text-left px-4 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider hidden md:table-cell">Domain</th>
                <th className="text-left px-4 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider hidden lg:table-cell">Tanggal</th>
                <th className="text-left px-4 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <UserSearch className="w-8 h-8 text-blue-200/20" />
                      </div>
                      <p className="text-blue-200/50 font-medium">Tidak ada prospek yang cocok.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((l) => (
                  <tr key={l.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-4">
                      <button onClick={() => toggleSelect(l.id)} className="text-blue-200/40 hover:text-indigo-400 transition-colors">
                        {selected.has(l.id)
                          ? <CheckSquare className="w-4 h-4 text-indigo-400" />
                          : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-5">
                      <p className="text-white font-bold group-hover:text-indigo-300 transition-colors">{l.name}</p>
                      <p className="text-blue-200/50 text-xs mt-0.5">{l.businessName}</p>
                    </td>
                    <td className="px-4 py-5">
                      <a href={WA(l.whatsapp, l.name, l.businessName)} target="_blank" rel="noopener noreferrer"
                        className="text-blue-200/70 hover:text-green-400 transition-colors font-mono text-xs flex items-center gap-1.5 w-fit">
                        {l.whatsapp}
                      </a>
                    </td>
                    <td className="px-4 py-5 text-blue-200/50 text-xs font-mono hidden md:table-cell">
                      {l.domain ? <span className="px-2.5 py-1 bg-white/5 rounded-md border border-white/5 text-blue-200/70">{l.domain}</span> : "—"}
                    </td>
                    <td className="px-4 py-5 text-blue-200/50 text-xs font-medium hidden lg:table-cell">
                      <div className="space-y-0.5">
                        <p>{new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(l.createdAt))}</p>
                        {l.lastContactedAt && (
                          <p className={`text-[10px] flex items-center gap-1 ${isCoolingDown(l.lastContactedAt) ? "text-orange-400/70" : "text-blue-200/30"}`}>
                            {isCoolingDown(l.lastContactedAt) ? "🕐" : "✉️"}
                            {isCoolingDown(l.lastContactedAt)
                              ? `Cooldown ${cooldownRemaining(l.lastContactedAt)}`
                              : `Terkirim ${new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(l.lastContactedAt))}`}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="relative inline-block">
                        <select value={statusMap[l.id]} onChange={(e) => updateStatus(l.id, e.target.value as Lead["status"])}
                          className={`appearance-none pr-7 pl-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold cursor-pointer border outline-none transition-all ${STATUS_COLORS[statusMap[l.id]]}`}>
                          {(Object.keys(STATUS_LABELS) as Lead["status"][]).map((s) => (
                            <option key={s} value={s} className="bg-[#0d1b35] text-white">{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-current opacity-60" />
                      </div>
                    </td>
                    <td className="px-4 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <a href={WA(l.whatsapp, l.name, l.businessName)} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="bg-green-600/20 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/30 shadow-none transition-all h-9 px-3 text-xs">
                            <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> WA
                          </Button>
                        </a>
                        <Link href={`/admin/proposals/new?leadId=${l.id}`}>
                          <Button size="sm" variant="outline" className="bg-blue-600/10 border-blue-500/20 text-blue-300 hover:text-white hover:bg-blue-600 shadow-none transition-all h-9 px-3 text-xs">
                            <ScrollText className="w-3.5 h-3.5 mr-1.5" /> Proposal
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="p-5 border-t border-white/10 bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <p className="text-xs text-blue-200/40 font-medium">
              Menampilkan <span className="text-blue-200">{startIdx}-{endIdx}</span> dari <span className="text-blue-200">{filtered.length}</span> prospek
            </p>
            <div className="flex items-center gap-4 flex-wrap justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-200/40">Tampilkan</span>
                <div className="flex gap-1">
                  {PER_PAGE_OPTIONS.map((n) => (
                    <button
                      key={n}
                      onClick={() => { setPerPage(n); router.push("?page=1" + (q ? `&q=${encodeURIComponent(q)}` : "")); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                        perPage === n
                          ? "bg-indigo-600 text-white border-indigo-500/50"
                          : "bg-white/5 border-white/10 text-blue-200/50 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <LeadsPagination totalPages={totalPages} />
            </div>
          </div>
        )}
      </FadeUp>
    </>
  );
}
