"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FileText, Download, Loader2, AlertCircle, MessageCircle } from "lucide-react";
import { track } from "@vercel/analytics";
import PaywallGate from "@/components/public/PaywallGate";
import EmailCaptureModal from "@/components/public/tools/EmailCaptureModal";
import { buildProposalWaMessage, buildWaShareLink } from "@/lib/waShare";

// ─── Types ───────────────────────────────────────────────────────────────────

type ProposalResult = {
  title: string;
  from: string;
  to: string;
  service: string;
  price: number;
  priceFormatted: string;
  validDays: number;
  createdAt: string;
};

type LocalUsage = {
  count: number;
  resetAt: number;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "mfweb_freemium_proposal_generator";
const DEFAULT_MONTHLY_LIMIT = 1;
const DEFAULT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLocalUsage(): LocalUsage | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalUsage;
  } catch {
    return null;
  }
}

function setLocalUsage(usage: LocalUsage): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch {
    // localStorage might be full or disabled
  }
}

function isLocalLimitReached(limit: number): boolean {
  const usage = getLocalUsage();
  if (!usage) return false;
  if (Date.now() > usage.resetAt) {
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
  return usage.count >= limit;
}

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatResetCountdown(resetAt: number): string {
  const ms = resetAt - Date.now();
  if (ms <= 0) return "";
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000));
  if (days >= 2) return `${days} hari lagi`;
  const hours = Math.ceil(ms / (60 * 60 * 1000));
  if (hours >= 2) return `${hours} jam lagi`;
  const minutes = Math.max(1, Math.ceil(ms / (60 * 1000)));
  return `${minutes} menit lagi`;
}

// ─── Component ───────────────────────────────────────────────────────────────

type PublicProposalFormProps = {
  welcomeCredits?: number;
  welcomeBonusBreakdown?: string;
  freemiumLimit?: number;
};

export default function PublicProposalForm({
  welcomeCredits = 15,
  welcomeBonusBreakdown,
  freemiumLimit = DEFAULT_MONTHLY_LIMIT,
}: PublicProposalFormProps = {}) {
  const [prospectName, setProspectName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProposalResult | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [disabledNotice, setDisabledNotice] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Track quota state in React state so we don't call Date.now() during render.
  // We refresh on mount and after each submission/paywall trigger.
  const [quotaState, setQuotaState] = useState<{ used: boolean; resetCountdown: string }>({
    used: false,
    resetCountdown: "",
  });

  const refreshQuotaState = useCallback(() => {
    if (typeof window === "undefined") return;
    const usage = getLocalUsage();
    if (!usage) {
      setQuotaState({ used: false, resetCountdown: "" });
      return;
    }
    const used = Date.now() < usage.resetAt && usage.count >= freemiumLimit;
    setQuotaState({
      used,
      resetCountdown: used ? formatResetCountdown(usage.resetAt) : "",
    });
  }, [freemiumLimit]);

  useEffect(() => {
    // Defer initial sync to next animation frame so the lint rule
    // (react-hooks/set-state-in-effect) does not flag this as cascading.
    const id = window.requestAnimationFrame(() => refreshQuotaState());
    return () => window.cancelAnimationFrame(id);
  }, [refreshQuotaState]);

  const quotaUsed = quotaState.used;
  const resetCountdown = quotaState.resetCountdown;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (loading) return; // guard against double-submit double-charging quota
      setError(null);
      setResult(null);
      setDisabledNotice(false);

      if (isLocalLimitReached(freemiumLimit)) {
        track("freemium_paywall_shown", { tool: "proposal_generator", reason: "local_limit" });
        setPaywallOpen(true);
        return;
      }

      const priceNum = Number(price);
      if (!prospectName.trim()) return setError("Nama prospek wajib diisi");
      if (!businessName.trim()) return setError("Nama bisnis wajib diisi");
      if (!serviceDescription.trim()) return setError("Deskripsi layanan wajib diisi");
      if (!price || isNaN(priceNum) || priceNum <= 0) return setError("Harga harus berupa angka positif");

      setLoading(true);

      try {
        const res = await fetch("/api/tools/proposal-generator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prospectName: prospectName.trim(),
            businessName: businessName.trim(),
            serviceDescription: serviceDescription.trim(),
            price: priceNum,
          }),
        });

        if (res.status === 429) {
          const data = await res.json().catch(() => null);
          const retryAfterMs: number = (data?.retryAfterMs as number) || DEFAULT_WINDOW_MS;
          setLocalUsage({ count: freemiumLimit, resetAt: Date.now() + retryAfterMs });
          track("freemium_paywall_shown", { tool: "proposal_generator", reason: "server_limit" });
          setPaywallOpen(true);
          refreshQuotaState();
          return;
        }

        if (res.status === 403) {
          setDisabledNotice(true);
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error || "Terjadi kesalahan. Silakan coba lagi.");
          return;
        }

        const data = await res.json();
        setResult(data.proposal as ProposalResult);
        track("freemium_proposal_generated", { price_range: priceNum >= 5_000_000 ? "5jt+" : priceNum >= 1_000_000 ? "1-5jt" : "<1jt" });

        const existing = getLocalUsage();
        const now = Date.now();
        if (existing && now < existing.resetAt) {
          setLocalUsage({ count: existing.count + 1, resetAt: existing.resetAt });
        } else {
          setLocalUsage({ count: 1, resetAt: now + DEFAULT_WINDOW_MS });
        }
        refreshQuotaState();

        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      } catch {
        setError("Gagal menghubungi server. Periksa koneksi internet Anda.");
      } finally {
        setLoading(false);
      }
    },
    [loading, prospectName, businessName, serviceDescription, price, freemiumLimit, refreshQuotaState],
  );

  const triggerPdfDownload = useCallback(
    async (email: string | null) => {
      if (!result) return;
      setDownloading(true);
      try {
        const res = await fetch("/api/tools/proposal-generator/pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prospectName: result.to,
            businessName: result.from,
            serviceDescription: result.service,
            price: result.price,
            validDays: result.validDays,
            createdAt: result.createdAt,
            email,
          }),
        });

        if (res.status === 429) {
          setError("Batas download PDF gratis tercapai. Coba lagi nanti atau daftar untuk akses penuh.");
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error || "Gagal generate PDF. Silakan coba lagi.");
          return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `proposal-${result.to.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 32) || "freemium"}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        track("freemium_pdf_downloaded", { tool: "proposal_generator", email_captured: !!email });
        // Revoke after a tick so Safari/iOS still has time to start the download
        setTimeout(() => URL.revokeObjectURL(url), 2_000);
      } catch {
        setError("Gagal generate PDF. Periksa koneksi internet Anda.");
      } finally {
        setDownloading(false);
        setEmailModalOpen(false);
      }
    },
    [result],
  );

  const handleDownloadClick = useCallback(() => {
    if (!result || downloading) return;
    setEmailModalOpen(true);
  }, [result, downloading]);

  const handleWaShare = useCallback(() => {
    if (!result) return;
    track("freemium_wa_share", { tool: "proposal_generator" });
    const message = buildProposalWaMessage({
      prospectName: result.to,
      businessName: result.from,
      price: result.price,
      validDays: result.validDays,
    });
    const link = buildWaShareLink(message);
    window.open(link, "_blank", "noopener,noreferrer");
  }, [result]);

  return (
    <>
      <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Free tier notice */}
        <div className="mb-6 rounded-xl border border-teal-400/20 bg-teal-400/[0.06] px-4 py-3 flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-teal-400 shrink-0" />
          <p className="text-sm text-teal-100 font-medium">
            Gratis: 1 proposal per bulan (PDF dengan watermark)
          </p>
        </div>

        {/* Quota used banner — surfaced before the user starts typing */}
        {quotaUsed && (
          <div className="mb-6 rounded-xl border border-amber-400/25 bg-amber-400/[0.08] px-4 py-3">
            <p className="text-sm text-amber-100">
              <strong className="font-bold text-amber-300">Kuota gratis bulan ini sudah dipakai.</strong>{" "}
              {resetCountdown ? `Reset ${resetCountdown}, atau ` : ""}
              <a
                href="/portal/register"
                className="text-amber-300 underline underline-offset-2 hover:text-amber-200"
              >
                daftar gratis
              </a>{" "}
              untuk lanjut sekarang.
            </p>
          </div>
        )}

        {disabledNotice && (
          <div className="mb-6 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-100">
              Free tier tidak tersedia saat ini.{" "}
              <a href="/portal/register" className="text-amber-400 underline underline-offset-2 hover:text-amber-300">
                Daftar akun
              </a>{" "}
              untuk menggunakan tool ini.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pf-prospect" className="block text-sm font-medium text-blue-100/80 mb-1.5">
                Nama Prospek
              </label>
              <input
                id="pf-prospect"
                type="text"
                value={prospectName}
                onChange={(e) => setProspectName(e.target.value)}
                placeholder="PT Contoh Jaya"
                disabled={!!quotaUsed}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-blue-200/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="pf-business" className="block text-sm font-medium text-blue-100/80 mb-1.5">
                Nama Bisnis Anda
              </label>
              <input
                id="pf-business"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Studio Kreatif ABC"
                disabled={!!quotaUsed}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-blue-200/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label htmlFor="pf-service" className="block text-sm font-medium text-blue-100/80 mb-1.5">
              Deskripsi Layanan
            </label>
            <textarea
              id="pf-service"
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              placeholder="Jelaskan layanan yang ditawarkan, scope pekerjaan, dan deliverables..."
              rows={4}
              disabled={!!quotaUsed}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-blue-200/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="pf-price" className="block text-sm font-medium text-blue-100/80 mb-1.5">
              Harga (Rupiah)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-blue-200/40">Rp</span>
              <input
                id="pf-price"
                type="number"
                min="1"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="5000000"
                disabled={!!quotaUsed}
                className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-blue-200/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {price && !isNaN(Number(price)) && Number(price) > 0 && (
              <p className="mt-1 text-xs text-blue-200/40">{formatRupiah(Number(price))}</p>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-400/20 bg-red-400/[0.06] px-3.5 py-2.5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!quotaUsed}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 text-sm font-semibold text-white transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Membuat proposal...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Buat Proposal Gratis
              </>
            )}
          </button>

          <p className="text-[11px] text-blue-200/35">
            Data yang kamu input tidak disimpan. Hanya hitungan pemakaian (anonim) yang dicatat untuk batas kuota.
          </p>
        </form>

        {/* Result Card */}
        {result && (
          <div ref={resultRef} className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className="border-b border-white/10 bg-blue-600/10 px-5 py-4">
              <h3 className="text-lg font-bold text-white">{result.title}</h3>
              <p className="text-sm text-blue-200/60 mt-0.5">Dari: {result.from}</p>
            </div>

            <div className="px-5 py-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-blue-200/40 uppercase tracking-wide">Kepada</p>
                  <p className="text-sm text-white font-medium mt-0.5">{result.to}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-200/40 uppercase tracking-wide">Tanggal</p>
                  <p className="text-sm text-white font-medium mt-0.5">
                    {new Date(result.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-200/40 uppercase tracking-wide">Berlaku</p>
                  <p className="text-sm text-white font-medium mt-0.5">{result.validDays} hari</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-blue-200/40 uppercase tracking-wide mb-1">Layanan</p>
                <p className="text-sm text-blue-100/80 whitespace-pre-wrap leading-relaxed">{result.service}</p>
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.06] px-4 py-3 text-center">
                <p className="text-xs text-blue-200/50 mb-0.5">Total Investasi</p>
                <p className="text-xl font-bold text-blue-300">{result.priceFormatted}</p>
              </div>

              <div className="rounded-lg border border-amber-400/15 bg-amber-400/[0.04] px-3.5 py-2.5">
                <p className="text-xs text-amber-200/70">
                  PDF gratis menyertakan watermark MFWEB. Daftar untuk versi tanpa watermark dengan logo bisnis Anda.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 px-5 py-4 grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleDownloadClick}
                disabled={downloading}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition-colors"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyiapkan PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PDF
                  </>
                )}
              </button>
              <button
                onClick={handleWaShare}
                className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Kirim via WhatsApp
              </button>
            </div>

            <div className="border-t border-white/10 px-5 py-3 text-center">
              <a
                href="/portal/register"
                className="text-xs text-blue-300 hover:text-blue-200 underline underline-offset-2"
              >
                Daftar untuk versi tanpa watermark dan brand kit Anda sendiri →
              </a>
            </div>
          </div>
        )}
      </section>

      <PaywallGate
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        toolName="Proposal Generator"
        signupBonus={welcomeCredits}
        signupBonusBreakdown={welcomeBonusBreakdown}
      />

      <EmailCaptureModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onConfirm={triggerPdfDownload}
        toolName="Proposal"
      />
    </>
  );
}
