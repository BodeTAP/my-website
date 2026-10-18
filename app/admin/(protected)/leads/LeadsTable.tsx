"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, ChevronDown, ScrollText, UserSearch, CheckSquare, Square, Send, X, Loader2, Trash2, Download, Pencil, History, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/public/motion";
import BroadcastHistoryModal from "./BroadcastHistoryModal";
import type { BroadcastRuntimeSettings, DelayRange } from "@/lib/broadcastSettings";

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
  waOptInStatus: "UNKNOWN" | "OPTED_IN" | "OPTED_OUT";
  doNotContact: boolean;
  createdAt: Date;
};

const STATUS_LABELS: Record<Lead["status"], string> = {
  NEW: "Baru", FOLLOWUP: "Follow-up", DEAL: "Deal", CLOSED: "Selesai",
};

const STATUS_COLORS: Record<Lead["status"], string> = {
  NEW:      "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  FOLLOWUP: "bg-amber-50 text-amber-700 border-amber-200/80",
  DEAL:     "bg-blue-50 text-blue-700 border-blue-200/80",
  CLOSED:   "bg-slate-100 text-slate-600 border-slate-200",
};

const WA_TEMPLATE_KEY  = "mfweb_wa_manual_template";

function formatRange(range: DelayRange): string {
  return `${range.min}-${range.max}`;
}

const CONSENT_LABELS: Record<Lead["waOptInStatus"], string> = {
  UNKNOWN:   "Belum opt-in",
  OPTED_IN:  "Opt-in",
  OPTED_OUT: "Opt-out",
};

const CONSENT_COLORS: Record<Lead["waOptInStatus"], string> = {
  UNKNOWN:   "bg-slate-100 text-slate-600 border-slate-200",
  OPTED_IN:  "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  OPTED_OUT: "bg-rose-50 text-rose-700 border-rose-200/80",
};

function isCoolingDown(lastContactedAt: Date | null, cooldownHours: number): boolean {
  if (!lastContactedAt) return false;
  return Date.now() - new Date(lastContactedAt).getTime() < cooldownHours * 60 * 60 * 1000;
}

function cooldownRemaining(lastContactedAt: Date | null, cooldownHours: number): string {
  if (!lastContactedAt) return "";
  const ms = cooldownHours * 60 * 60 * 1000 - (Date.now() - new Date(lastContactedAt).getTime());
  if (ms <= 0) return "";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}j ${m}m` : `${m}m`;
}

function BroadcastModal({ leads, settings, onClose, onDone }: { leads: Lead[]; settings: BroadcastRuntimeSettings; onClose: () => void; onDone: () => void }) {
  const [message, setMessage]           = useState(settings.consentTemplate);
  const [activeTab, setActiveTab]       = useState<"compose" | "preview">("compose");
  const [previewIdx, setPreviewIdx]     = useState(0);
  const [status, setStatus]             = useState<"idle" | "sending" | "done">("idle");
  const [skipCooldown, setSkipCooldown] = useState(false);
  const [sessionLimit, setSessionLimit] = useState<number>(settings.defaultSessionLimit);
  const [countdown, setCountdown]       = useState<number | null>(null);
  const [result, setResult]             = useState<{
    sent: number; failed: number; devices: number; skipped: number;
    cooldownLeads?: string[]; invalidPhones?: string[]; consentSkippedLeads?: string[];
    consentSkipped?: number; sessionSkipped?: number; dailyLimitSkipped?: number;
    delayRange: string; estimatedSeconds: number;
  } | null>(null);

  const coolingLeads  = leads.filter((l) => isCoolingDown(l.lastContactedAt, settings.cooldownHours));
  const consentBlocked = leads.filter((l) => l.doNotContact || l.waOptInStatus === "OPTED_OUT");
  const consentEligible = leads.filter((l) => !l.doNotContact && l.waOptInStatus !== "OPTED_OUT");
  const eligibleRaw   = skipCooldown ? consentEligible.length : consentEligible.length - consentEligible.filter((l) => isCoolingDown(l.lastContactedAt, settings.cooldownHours)).length;
  const eligibleCount = Math.min(eligibleRaw, sessionLimit, settings.maxSessionLimit);

  // Preview: render message for a specific lead (simplified — no 12-layer variation, just template substitution)
  const previewLeads = consentEligible.slice(0, Math.min(5, consentEligible.length));
  const previewLead  = previewLeads[previewIdx] ?? previewLeads[0];
  const previewMessage = previewLead
    ? message
        .replace(/\{name\}/g, previewLead.name)
        .replace(/\{businessName\}/g, previewLead.businessName)
    : message;

  // Estimate completion time for display
  const estimateSeconds = (count: number, delayRange: string) => {
    const [min, max] = delayRange.split("-").map(Number);
    return Math.round(count * (min + max) / 2);
  };
  const previewDelay = eligibleCount <= 5 ? formatRange(settings.delaySmall) : eligibleCount <= 10 ? formatRange(settings.delayMedium) : formatRange(settings.delayLarge);
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
        consentSkipped:   data.consentSkipped ?? 0,
        sessionSkipped:   data.sessionSkipped ?? 0,
        dailyLimitSkipped: data.dailyLimitSkipped ?? 0,
        consentSkippedLeads: data.consentSkippedLeads,
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
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-slate-900 font-bold text-base tracking-tight">Broadcast WhatsApp</h2>
            <p className="text-slate-500 text-xs mt-0.5 font-mono">{leads.length} lead dipilih · gunakan {"{name}"} atau {"{businessName}"}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        {status !== "done" && (
          <div className="flex border-b border-slate-100 bg-slate-50/30">
            {(["compose", "preview"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === tab
                    ? "text-slate-900 border-b-2 border-slate-900 bg-white"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab === "compose" ? "Tulis Pesan" : "Preview"}
              </button>
            ))}
          </div>
        )}

        {status !== "done" ? (
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Preview tab */}
            {activeTab === "preview" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 text-xs font-medium">Preview pesan untuk lead:</p>
                  <div className="flex items-center gap-1">
                    {previewLeads.map((l, i) => (
                      <button
                        key={l.id}
                        onClick={() => setPreviewIdx(i)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                          previewIdx === i
                            ? "bg-[#1E242E] text-white border-slate-800 shadow-xs"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {l.businessName.slice(0, 12)}
                      </button>
                    ))}
                  </div>
                </div>
                {previewLead && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold font-mono">
                        {previewLead.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-slate-900 text-xs font-semibold">{previewLead.businessName}</p>
                        <p className="text-slate-400 text-[10px] font-mono">{previewLead.whatsapp}</p>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl rounded-tl-none p-3 max-w-[85%] shadow-2xs">
                      <pre className="text-slate-800 text-xs whitespace-pre-wrap font-sans leading-relaxed">
                        {previewMessage}
                      </pre>
                    </div>
                    <p className="text-slate-400 text-[10px] mt-2 italic font-mono">
                      * Preview menampilkan substitusi variabel. Pesan terkirim akan divariasikan otomatis oleh sistem.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
            {/* Warning banner */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl px-4 py-3 space-y-1.5">
              <p className="text-amber-800 text-xs font-semibold">⚠️ Peringatan Risiko Blokir WhatsApp</p>
              <ul className="text-amber-700 text-[11px] space-y-1 list-disc ml-4">
                <li>Gunakan nomor WA <strong>khusus broadcast</strong>, bukan nomor utama bisnis</li>
                <li>Broadcast hanya diizinkan <strong>{String(settings.allowedStartHour).padStart(2, "0")}.00-{String(settings.allowedEndHour).padStart(2, "0")}.00 WIB</strong></li>
                <li>Pesan dikirim dengan jeda <strong>{previewDelay} detik acak</strong> antar nomor (adaptif)</li>
                <li>Lead berstatus <strong>Belum opt-in</strong> tetap bisa dibroadcast; opt-out tidak dikirim</li>
                <li>Setiap pesan menyertakan instruksi opt-out {settings.optOutKeywords[0]?.toUpperCase() ?? "STOP"}</li>
              </ul>
            </div>

            {consentBlocked.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 space-y-2">
                <p className="text-rose-700 text-xs font-semibold">
                  {consentBlocked.length} lead opt-out atau do-not-contact
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {consentBlocked.slice(0, 12).map((l) => (
                    <span key={l.id} className="text-[10px] bg-rose-100/70 border border-rose-200 text-rose-800 px-2 py-0.5 rounded-full font-mono">
                      {l.businessName} · {CONSENT_LABELS[l.waOptInStatus]}
                    </span>
                  ))}
                  {consentBlocked.length > 12 && (
                    <span className="text-[10px] text-rose-500 px-2 py-0.5 font-mono">
                      +{consentBlocked.length - 12} lainnya
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Session limit control */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 text-xs font-medium">Batas per sesi</span>
                <span className="text-slate-900 text-xs font-bold tabular-nums font-mono">
                  {eligibleCount} dari {eligibleRaw} lead
                  {eligibleRaw > eligibleCount && (
                    <span className="ml-1.5 text-amber-700 font-normal">
                      ({eligibleRaw - eligibleCount} dilewati)
                    </span>
                  )}
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={Math.max(Math.min(eligibleRaw, settings.maxSessionLimit), 5)}
                step={5}
                value={Math.min(sessionLimit, Math.max(Math.min(eligibleRaw, settings.maxSessionLimit), 5))}
                onChange={(e) => setSessionLimit(Number(e.target.value))}
                className="w-full accent-slate-900 h-1.5"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>5 (aman)</span>
                <span className="text-slate-600 font-medium">Default: {settings.defaultSessionLimit}/sesi</span>
                <span>{Math.max(Math.min(eligibleRaw, settings.maxSessionLimit), 5)} (maks)</span>
              </div>
            </div>

            {/* ETA preview */}
            {eligibleCount > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-slate-500 text-xs font-medium">Estimasi selesai:</span>
                <span className="text-slate-900 text-xs font-semibold font-mono">
                  ~{previewEta >= 60
                    ? `${Math.floor(previewEta / 60)} menit ${previewEta % 60} detik`
                    : `${previewEta} detik`}
                </span>
              </div>
            )}

            {/* Cooldown info */}
            {coolingLeads.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 space-y-2">
                <p className="text-orange-800 text-xs font-semibold flex items-center gap-1.5">
                  🕐 {coolingLeads.length} lead masih dalam cooldown {settings.cooldownHours} jam
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {coolingLeads.map((l) => (
                    <span key={l.id} className="text-[10px] bg-orange-100/70 border border-orange-200 text-orange-900 px-2 py-0.5 rounded-full font-mono">
                      {l.businessName} · {cooldownRemaining(l.lastContactedAt, settings.cooldownHours)}
                    </span>
                  ))}
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input type="checkbox" checked={skipCooldown} onChange={(e) => setSkipCooldown(e.target.checked)}
                    className="w-3.5 h-3.5 accent-orange-600" />
                  <span className="text-orange-800 text-[11px]">Kirim tetap ke semua (abaikan cooldown) — risiko lebih tinggi</span>
                </label>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
              <span className="text-lg leading-none">🔄</span>
              <div>
                <p className="text-slate-900 text-xs font-semibold">Rotator + Variasi + Greeting Aktif</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Device digilir otomatis. Pesan divariasikan suffix, emoji, dan sapaan sesuai waktu (pagi/siang/sore).
                </p>
              </div>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 resize-none font-mono transition-all"
            />
            <div className="flex items-center gap-3 flex-wrap">
              <Button onClick={handleSend} disabled={status === "sending" || !message.trim() || eligibleCount === 0}
                className="bg-[#1E242E] hover:bg-slate-800 text-white gap-2 rounded-xl shadow-xs text-xs font-semibold h-10 px-4">
                {status === "sending"
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
                  : <><Send className="w-4 h-4" /> Kirim ke {eligibleCount} Lead</>}
              </Button>
              <p className="text-slate-400 text-xs font-mono">Delay adaptif · variasi otomatis · dihandle Fonnte</p>
            </div>
            </>
            )}
          </div>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="text-5xl">✅</div>
            <p className="text-slate-900 font-bold text-lg tracking-tight">Broadcast Dikirim ke Antrian</p>

            {/* Countdown */}
            {countdown !== null && countdown > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <p className="text-slate-600 text-xs font-semibold mb-1">Estimasi selesai terkirim semua:</p>
                <p className="text-slate-900 text-2xl font-bold font-mono">
                  {countdown >= 60
                    ? `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`
                    : `${countdown}s`}
                </p>
                <p className="text-slate-400 text-[10px] mt-1 font-mono">Fonnte mengirim dengan jeda {result?.delayRange}s antar pesan</p>
              </div>
            )}

            <div className="flex justify-center gap-6 flex-wrap">
              <div className="text-center">
                <p className="text-emerald-700 text-2xl font-bold font-mono">{result?.sent}</p>
                <p className="text-slate-500 text-xs font-mono">Diantrekan</p>
              </div>
              <div className="text-center">
                <p className="text-rose-600 text-2xl font-bold font-mono">{result?.failed}</p>
                <p className="text-slate-500 text-xs font-mono">Gagal</p>
              </div>
              {(result?.skipped ?? 0) > 0 && (
                <div className="text-center">
                  <p className="text-amber-700 text-2xl font-bold font-mono">{result?.skipped}</p>
                  <p className="text-slate-500 text-xs font-mono">Dilewati</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-slate-900 text-2xl font-bold font-mono">{result?.devices ?? 1}</p>
                <p className="text-slate-500 text-xs font-mono">Device</p>
              </div>
            </div>

            {result?.cooldownLeads && result.cooldownLeads.length > 0 && (
              <p className="text-orange-700 text-xs font-mono">
                Cooldown: {result.cooldownLeads.join(", ")}
              </p>
            )}
            {result?.consentSkippedLeads && result.consentSkippedLeads.length > 0 && (
              <p className="text-rose-700 text-xs font-mono">
                Opt-out/do-not-contact: {result.consentSkippedLeads.join(", ")}
              </p>
            )}
            {result?.invalidPhones && result.invalidPhones.length > 0 && (
              <p className="text-rose-600 text-xs font-mono">
                Nomor tidak valid: {result.invalidPhones.join(", ")}
              </p>
            )}
            {(result?.dailyLimitSkipped ?? 0) > 0 && (
              <p className="text-amber-700 text-xs font-mono">
                Limit harian: {result?.dailyLimitSkipped} lead dilewati
              </p>
            )}

            <Button onClick={onDone} variant="outline"
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-xl shadow-2xs text-xs font-semibold">
              Tutup &amp; Refresh
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeadsTable({ broadcastSettings }: { broadcastSettings: BroadcastRuntimeSettings }) {
  const router = useRouter();

  // ── Server-side data state ──────────────────────────────────────────────────
  const [leads, setLeads]         = useState<Lead[]>([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]     = useState(true);

  // ── Filter state ────────────────────────────────────────────────────────────
  const [page, setPage]           = useState(1);
  const [perPage, setPerPage]     = useState(25);
  const [q, setQ]                 = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<Lead["status"] | "ALL">("ALL");
  const [consentFilter, setConsentFilter] = useState("ALL");
  const [hasWebsiteFilter, setHasWebsiteFilter] = useState("ALL");
  const [neverContacted, setNeverContacted] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const PER_PAGE_OPTIONS = [10, 25, 50, 100];
  const CATEGORY_OPTIONS = [
    { value: "ALL", label: "Semua Kategori" },
    { value: "food", label: "🍜 Kuliner" },
    { value: "retail", label: "🛍️ Retail" },
    { value: "health", label: "🏥 Kesehatan" },
    { value: "beauty", label: "💄 Kecantikan" },
    { value: "service", label: "🔧 Jasa" },
    { value: "property", label: "🏠 Properti" },
    { value: "edu", label: "📚 Pendidikan" },
  ];

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  // Reset page when filters change
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setPage(1));
    return () => window.cancelAnimationFrame(id);
  }, [debouncedQ, statusFilter, consentFilter, hasWebsiteFilter, neverContacted, categoryFilter, perPage]);

  // Fetch leads from API
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        perPage: String(perPage),
        ...(debouncedQ ? { q: debouncedQ } : {}),
        ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
        ...(consentFilter !== "ALL" ? { consent: consentFilter } : {}),
        ...(hasWebsiteFilter !== "ALL" ? { hasWebsite: hasWebsiteFilter } : {}),
        ...(neverContacted ? { neverContacted: "true" } : {}),
        ...(categoryFilter !== "ALL" ? { category: categoryFilter } : {}),
      });
      const res = await fetch(`/api/admin/leads?${params}`);
      const data = await res.json();
      setLeads(data.leads ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, debouncedQ, statusFilter, consentFilter, hasWebsiteFilter, neverContacted, categoryFilter]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => { void fetchLeads(); });
    return () => window.cancelAnimationFrame(id);
  }, [fetchLeads]);

  // ── Local state for optimistic UI ───────────────────────────────────────────
  const [statusMap, setStatusMap] = useState<Record<string, Lead["status"]>>({});
  const [consentMap, setConsentMap] = useState<Record<string, Lead["waOptInStatus"]>>({});

  // Sync maps when leads change
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      setStatusMap(Object.fromEntries(leads.map((l) => [l.id, l.status])));
      setConsentMap(Object.fromEntries(leads.map((l) => [l.id, l.waOptInStatus])));
    });
    return () => window.cancelAnimationFrame(id);
  }, [leads]);

  // Keyed by lead id → full Lead snapshot so selections survive pagination.
  // Using a Set of ids would lose off-page leads when broadcasting/exporting/deleting.
  const [selected, setSelected]           = useState<Map<string, Lead>>(new Map());
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showHistory, setShowHistory]     = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [bulkUpdating, setBulkUpdating]   = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [statusMenuPos, setStatusMenuPos] = useState({ top: 0, left: 0 });
  const statusBtnRef = useRef<HTMLButtonElement>(null);

  // Close status dropdown when clicking outside
  useEffect(() => {
    if (!showStatusMenu) return;
    const handler = () => setShowStatusMenu(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showStatusMenu]);

  const [waTemplate, setWaTemplate]       = useState<string>(() =>
    (typeof window !== "undefined" && localStorage.getItem(WA_TEMPLATE_KEY)) || broadcastSettings.consentTemplate
  );
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [draftTemplate, setDraftTemplate] = useState(waTemplate);

  const startIdx = total > 0 ? (page - 1) * perPage + 1 : 0;
  const endIdx   = Math.min(page * perPage, total);
  const paginated = leads; // already paginated from server

  const updateStatus = async (id: string, status: Lead["status"]) => {
    setStatusMap((m) => ({ ...m, [id]: status }));
    await fetch(`/api/admin/leads/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status }),
    });
  };

  const updateConsent = async (id: string, waOptInStatus: Lead["waOptInStatus"]) => {
    setConsentMap((m) => ({ ...m, [id]: waOptInStatus }));
    await fetch(`/api/admin/leads/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ waOptInStatus }),
    });
  };

  const toggleSelect = (lead: Lead) =>
    setSelected((prev) => {
      const s = new Map(prev);
      if (s.has(lead.id)) s.delete(lead.id);
      else s.set(lead.id, lead);
      return s;
    });
  const toggleAll = () =>
    setSelected((prev) => {
      const allOnPage = paginated.length > 0 && paginated.every((l) => prev.has(l.id));
      const s = new Map(prev);
      if (allOnPage) {
        // Deselect current page only (keep off-page selections).
        for (const l of paginated) s.delete(l.id);
      } else {
        for (const l of paginated) s.set(l.id, l);
      }
      return s;
    });

  const selectedLeads = [...selected.values()].map((l) => {
    const localStatus = consentMap[l.id];
    const waOptInStatus = localStatus ?? l.waOptInStatus;
    const doNotContact = localStatus
      ? waOptInStatus === "OPTED_OUT"
      : l.doNotContact || waOptInStatus === "OPTED_OUT";
    return { ...l, waOptInStatus, doNotContact };
  });

  const handleDelete = async () => {
    if (!window.confirm(`Hapus ${selected.size} lead yang dipilih? Tindakan ini tidak bisa dibatalkan.`)) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ids: [...selected.keys()] }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setSelected(new Map());
      void fetchLeads();
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
        [...selected.keys()].map((id) =>
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
        for (const id of selected.keys()) next[id] = status;
        return next;
      });
      setSelected(new Map());
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkConsent = async (waOptInStatus: Lead["waOptInStatus"]) => {
    setBulkUpdating(true);
    try {
      await Promise.all(
        [...selected.keys()].map((id) =>
          fetch(`/api/admin/leads/${id}`, {
            method:  "PATCH",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ waOptInStatus }),
          })
        )
      );
      setConsentMap((prev) => {
        const next = { ...prev };
        for (const id of selected.keys()) next[id] = waOptInStatus;
        return next;
      });
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
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowTemplateEditor(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-slate-900 font-bold text-sm tracking-tight">Template Pesan WA Manual</h2>
                <p className="text-slate-500 text-xs mt-0.5 font-mono">Gunakan {"{name}"} atau {"{businessName}"} sebagai variabel</p>
              </div>
              <button onClick={() => setShowTemplateEditor(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <textarea
                value={draftTemplate}
                onChange={(e) => setDraftTemplate(e.target.value)}
                rows={8}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 resize-none font-mono transition-all"
              />
              <div className="flex gap-3 items-center">
                <button onClick={() => setDraftTemplate(broadcastSettings.consentTemplate)}
                  className="text-xs text-slate-500 hover:text-slate-800 transition-colors underline font-mono">
                  Reset ke default
                </button>
                <div className="flex-1" />
                <button onClick={() => setShowTemplateEditor(false)}
                  className="px-3.5 py-2 rounded-xl text-xs border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-semibold">
                  Batal
                </button>
                <Button onClick={saveWaTemplate} className="bg-[#1E242E] hover:bg-slate-800 text-white rounded-xl gap-2 h-9 text-xs px-4 shadow-xs font-semibold">
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
          settings={broadcastSettings}
          onClose={() => setShowBroadcast(false)}
          onDone={() => { setShowBroadcast(false); setSelected(new Map()); router.refresh(); }}
        />
      )}

      <FadeUp delay={0.2} className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden relative">
        {/* Filter + Search */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/40 space-y-3">
          {/* Row 1: search + action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 w-full">
              <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama, bisnis, nomor, domain..."
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
              />
            </div>
            <div className="flex gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => setShowAdvancedFilters((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  showAdvancedFilters || consentFilter !== "ALL" || hasWebsiteFilter !== "ALL" || neverContacted || categoryFilter !== "ALL"
                    ? "bg-[#1E242E] text-white border-slate-800 shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs"
                }`}
              >
                <Filter className="w-3.5 h-3.5" /> Filter
                {(consentFilter !== "ALL" || hasWebsiteFilter !== "ALL" || neverContacted || categoryFilter !== "ALL") && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
              <button onClick={() => { setDraftTemplate(waTemplate); setShowTemplateEditor(true); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all bg-white shadow-2xs">
                <Pencil className="w-3.5 h-3.5 text-slate-500" /> Template WA
              </button>
              <button onClick={() => setShowHistory(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all bg-white shadow-2xs">
                <History className="w-3.5 h-3.5 text-slate-500" /> Riwayat
              </button>
            </div>
          </div>

          {/* Row 2: status filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {(["ALL", "NEW", "FOLLOWUP", "DEAL", "CLOSED"] as const).map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                  statusFilter === s
                    ? "bg-[#1E242E] text-white border-slate-800 shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-2xs"
                }`}>
                {s === "ALL" ? `Semua (${total})` : STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Row 3: advanced filters (collapsible) */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200/60">
              <div className="space-y-1">
                <p className="text-slate-500 text-[10px] uppercase font-mono tracking-wider font-semibold">Consent WA</p>
                <select
                  value={consentFilter}
                  onChange={(e) => setConsentFilter(e.target.value)}
                  className="w-full h-9 rounded-xl px-2.5 bg-white border border-slate-200 text-slate-900 text-xs focus:ring-1 focus:ring-slate-900 font-mono"
                >
                  <option value="ALL">Semua</option>
                  <option value="UNKNOWN">Belum opt-in</option>
                  <option value="OPTED_IN">Opt-in</option>
                  <option value="OPTED_OUT">Opt-out</option>
                </select>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 text-[10px] uppercase font-mono tracking-wider font-semibold">Website</p>
                <select
                  value={hasWebsiteFilter}
                  onChange={(e) => setHasWebsiteFilter(e.target.value)}
                  className="w-full h-9 rounded-xl px-2.5 bg-white border border-slate-200 text-slate-900 text-xs focus:ring-1 focus:ring-slate-900 font-mono"
                >
                  <option value="ALL">Semua</option>
                  <option value="yes">Punya website</option>
                  <option value="no">Belum punya website</option>
                </select>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 text-[10px] uppercase font-mono tracking-wider font-semibold">Kategori Bisnis</p>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full h-9 rounded-xl px-2.5 bg-white border border-slate-200 text-slate-900 text-xs focus:ring-1 focus:ring-slate-900 font-mono"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 text-[10px] uppercase font-mono tracking-wider font-semibold">Kontak</p>
                <label className="flex items-center gap-2 h-9 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={neverContacted}
                    onChange={(e) => setNeverContacted(e.target.checked)}
                    className="w-4 h-4 accent-slate-900 rounded"
                  />
                  <span className="text-slate-700 text-xs font-medium">Belum pernah dihubungi</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-100 border-b border-slate-200">
            <span className="text-slate-900 text-xs font-semibold font-mono">{selected.size} lead dipilih</span>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Bulk status change */}
              <div className="relative">
                <Button
                  ref={statusBtnRef}
                  size="sm"
                  disabled={bulkUpdating}
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setStatusMenuPos({ top: rect.bottom + 4, left: rect.left });
                    setShowStatusMenu((v) => !v);
                  }}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 gap-1.5 h-8 text-xs rounded-lg shadow-2xs font-semibold">
                  {bulkUpdating
                    ? <Loader2 className="w-3 h-3 animate-spin text-slate-600" />
                    : <ChevronDown className="w-3 h-3 text-slate-600" />}
                  Ubah Status
                </Button>
                {showStatusMenu && typeof document !== "undefined" && createPortal(
                  <div
                    style={{
                      position: "fixed",
                      top: statusMenuPos.top,
                      left: statusMenuPos.left,
                      zIndex: 9999,
                    }}
                    className="bg-white rounded-xl border border-slate-200 shadow-xl min-w-[140px] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(["NEW", "FOLLOWUP", "DEAL", "CLOSED"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleBulkStatus(s)}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-700 font-medium"
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          s === "NEW"      ? "bg-emerald-500" :
                          s === "FOLLOWUP" ? "bg-amber-500"  :
                          s === "DEAL"     ? "bg-blue-500"   :
                          "bg-slate-400"
                        }`} />
                        <span>{STATUS_LABELS[s]}</span>
                      </button>
                    ))}
                  </div>,
                  document.body
                )}
              </div>

              <Button size="sm" onClick={() => handleBulkConsent("OPTED_IN")} disabled={bulkUpdating}
                title="Tandai lead terpilih sudah memberi izin WhatsApp"
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 gap-1.5 h-8 text-xs rounded-lg shadow-2xs font-semibold">
                Opt-in
              </Button>
              <Button size="sm" onClick={() => handleBulkConsent("OPTED_OUT")} disabled={bulkUpdating}
                title="Jangan hubungi lead terpilih via WhatsApp"
                className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 gap-1.5 h-8 text-xs rounded-lg shadow-2xs font-semibold">
                Opt-out
              </Button>

              <Button size="sm" onClick={() => setShowBroadcast(true)}
                className="bg-[#1E242E] hover:bg-slate-800 text-white gap-1.5 h-8 text-xs rounded-lg shadow-xs font-semibold">
                <Send className="w-3 h-3" /> Broadcast WA
              </Button>
              <Button size="sm" onClick={handleExportWati}
                title="Export format Wati untuk broadcast WhatsApp API"
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 gap-1.5 h-8 text-xs rounded-lg shadow-2xs font-semibold">
                <Download className="w-3 h-3 text-slate-500" /> Export Wati
              </Button>
              <Button size="sm" onClick={handleExportCSV}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 gap-1.5 h-8 text-xs rounded-lg shadow-2xs font-semibold">
                <Download className="w-3 h-3 text-slate-500" /> Export CSV
              </Button>
              <Button size="sm" onClick={handleDelete} disabled={deleting}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 gap-1.5 h-8 text-xs rounded-lg shadow-2xs font-semibold">
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Hapus
              </Button>
              <button onClick={() => setSelected(new Map())} className="text-slate-400 hover:text-slate-700 transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-4 py-3.5 w-10">
                  <button onClick={toggleAll} className="text-slate-400 hover:text-slate-800 transition-colors">
                    {paginated.length > 0 && paginated.every((l) => selected.has(l.id))
                      ? <CheckSquare className="w-4 h-4 text-slate-900" />
                      : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="text-left px-4 py-3.5 text-slate-500 font-mono font-medium text-[10px] uppercase tracking-wider">Nama / Bisnis</th>
                <th className="text-left px-4 py-3.5 text-slate-500 font-mono font-medium text-[10px] uppercase tracking-wider">Kontak</th>
                <th className="text-left px-4 py-3.5 text-slate-500 font-mono font-medium text-[10px] uppercase tracking-wider hidden md:table-cell">Domain</th>
                <th className="text-left px-4 py-3.5 text-slate-500 font-mono font-medium text-[10px] uppercase tracking-wider hidden lg:table-cell">Tanggal</th>
                <th className="text-left px-4 py-3.5 text-slate-500 font-mono font-medium text-[10px] uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3.5 text-slate-500 font-mono font-medium text-[10px] uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                      <p className="text-slate-400 text-xs font-mono">Memuat data prospek...</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-3">
                        <UserSearch className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-slate-700 font-semibold text-sm">Tidak ada prospek yang cocok.</p>
                      <p className="text-slate-400 text-xs font-mono mt-1">Coba sesuaikan kata kunci pencarian atau filter status.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-4 py-4">
                      <button onClick={() => toggleSelect(l)} className="text-slate-400 hover:text-slate-800 transition-colors">
                        {selected.has(l.id)
                          ? <CheckSquare className="w-4 h-4 text-slate-900" />
                          : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-900 font-bold group-hover:text-slate-950 transition-colors">{l.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{l.businessName}</p>
                    </td>
                    <td className="px-4 py-4">
                      <a href={WA(l.whatsapp, l.name, l.businessName)} target="_blank" rel="noopener noreferrer"
                        className="text-slate-700 hover:text-emerald-700 transition-colors font-mono text-xs flex items-center gap-1.5 w-fit font-medium">
                        {l.whatsapp}
                      </a>
                      <select
                        value={consentMap[l.id] ?? l.waOptInStatus}
                        onChange={(e) => updateConsent(l.id, e.target.value as Lead["waOptInStatus"])}
                        className={`mt-1.5 appearance-none px-2 py-0.5 rounded-md text-[10px] font-bold border outline-none font-mono ${CONSENT_COLORS[consentMap[l.id] ?? l.waOptInStatus]}`}
                        title="Status izin broadcast WhatsApp"
                      >
                        {(Object.keys(CONSENT_LABELS) as Lead["waOptInStatus"][]).map((s) => (
                          <option key={s} value={s}>{CONSENT_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-xs font-mono hidden md:table-cell">
                      {l.domain ? <span className="px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200 text-slate-700">{l.domain}</span> : "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-xs font-medium hidden lg:table-cell">
                      <div className="space-y-0.5 font-mono">
                        <p>{new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(l.createdAt))}</p>
                        {l.lastContactedAt && (
                          <p className={`text-[10px] flex items-center gap-1 ${isCoolingDown(l.lastContactedAt, broadcastSettings.cooldownHours) ? "text-orange-700" : "text-slate-400"}`}>
                            {isCoolingDown(l.lastContactedAt, broadcastSettings.cooldownHours) ? "🕐" : "✉️"}
                            {isCoolingDown(l.lastContactedAt, broadcastSettings.cooldownHours)
                              ? `Cooldown ${cooldownRemaining(l.lastContactedAt, broadcastSettings.cooldownHours)}`
                              : `Terkirim ${new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(l.lastContactedAt))}`}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative inline-block">
                        <select value={statusMap[l.id]} onChange={(e) => updateStatus(l.id, e.target.value as Lead["status"])}
                          className={`appearance-none pr-6 pl-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold cursor-pointer border outline-none transition-all font-mono ${STATUS_COLORS[statusMap[l.id]]}`}>
                          {(Object.keys(STATUS_LABELS) as Lead["status"][]).map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-current opacity-60" />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a href={WA(l.whatsapp, l.name, l.businessName)} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs transition-all h-8 px-2.5 text-xs font-semibold rounded-xl">
                            <MessageCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" /> WA
                          </Button>
                        </a>
                        <Link href={`/admin/proposals/new?leadId=${l.id}`}>
                          <Button size="sm" variant="outline" className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 shadow-2xs transition-all h-8 px-2.5 text-xs font-semibold rounded-xl">
                            <ScrollText className="w-3.5 h-3.5 mr-1 text-slate-600" /> Proposal
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

        {total > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-mono">
              Menampilkan <span className="text-slate-900 font-semibold">{startIdx}-{endIdx}</span> dari <span className="text-slate-900 font-semibold">{total}</span> prospek
            </p>
            <div className="flex items-center gap-4 flex-wrap justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono">Per halaman:</span>
                <div className="flex gap-1">
                  {PER_PAGE_OPTIONS.map((n) => (
                    <button
                      key={n}
                      onClick={() => setPerPage(n)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border font-mono ${
                        perPage === n
                          ? "bg-[#1E242E] text-white border-slate-800 shadow-xs"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100 shadow-2xs"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              {/* Server-side pagination controls */}
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
          </div>
        )}
      </FadeUp>
    </>
  );
}
