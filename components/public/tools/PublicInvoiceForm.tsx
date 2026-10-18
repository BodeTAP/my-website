"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Loader2, Download, ReceiptText, MessageCircle } from "lucide-react";
import { track } from "@vercel/analytics";
import PaywallGate from "@/components/public/PaywallGate";
import EmailCaptureModal from "@/components/public/tools/EmailCaptureModal";
import { buildInvoiceWaMessage, buildWaShareLink } from "@/lib/waShare";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  price: number;
};

type InvoiceResult = {
  number: string;
  from: string;
  to: string;
  items: {
    description: string;
    quantity: number;
    price: number;
    total: number;
    totalFormatted: string;
  }[];
  subtotal: number;
  subtotalFormatted: string;
  tax: number;
  taxFormatted: string | null;
  total: number;
  totalFormatted: string;
  includeTax: boolean;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "mfweb_freemium_invoice_generator";
const MAX_ITEMS = 10;
const DEFAULT_MONTHLY_LIMIT = 1;
const DEFAULT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function createEmptyItem(): LineItem {
  return { id: generateId(), description: "", quantity: 1, price: 0 };
}

function getLocalUsage(): { count: number; resetAt: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setLocalUsage(count: number, resetAt: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ count, resetAt }));
  } catch {
    // localStorage might be full or disabled
  }
}

function isLocalLimitReached(limit: number): boolean {
  const usage = getLocalUsage();
  if (!usage) return false;
  if (Date.now() > usage.resetAt) return false;
  return usage.count >= limit;
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type PublicInvoiceFormProps = {
  welcomeCredits?: number;
  welcomeBonusBreakdown?: string;
  freemiumLimit?: number;
};

export default function PublicInvoiceForm({
  welcomeCredits = 15,
  welcomeBonusBreakdown,
  freemiumLimit = DEFAULT_MONTHLY_LIMIT,
}: PublicInvoiceFormProps = {}) {
  const [fromName, setFromName] = useState("");
  const [toName, setToName] = useState("");
  const [items, setItems] = useState<LineItem[]>([createEmptyItem()]);
  const [includeTax, setIncludeTax] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InvoiceResult | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [disabledNotice, setDisabledNotice] = useState(false);

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
    const id = window.requestAnimationFrame(() => refreshQuotaState());
    return () => window.cancelAnimationFrame(id);
  }, [refreshQuotaState]);

  const quotaUsed = quotaState.used;
  const resetCountdown = quotaState.resetCountdown;

  // --- Line item handlers ---

  const addItem = useCallback(() => {
    setItems((prev) => {
      if (prev.length >= MAX_ITEMS) return prev;
      return [...prev, createEmptyItem()];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const updateItem = useCallback(
    (id: string, field: keyof Omit<LineItem, "id">, value: string | number) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

  // --- Calculations ---

  const subtotal = items.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.price),
    0
  );
  const tax = includeTax ? Math.round(subtotal * 0.11) : 0;
  const grandTotal = subtotal + tax;

  // --- Submit handler ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // guard against double-submit double-charging quota
    setError(null);

    if (isLocalLimitReached(freemiumLimit)) {
      track("freemium_paywall_shown", { tool: "invoice_generator", reason: "local_limit" });
      setPaywallOpen(true);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/tools/invoice-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromName: fromName.trim(),
          toName: toName.trim(),
          items: items.map((item) => ({
            description: item.description.trim(),
            quantity: item.quantity,
            price: item.price,
          })),
          includeTax,
        }),
      });

      if (res.status === 429) {
        const data = await res.json().catch(() => null);
        const retryAfterMs: number = (data?.retryAfterMs as number) || DEFAULT_WINDOW_MS;
        setLocalUsage(1, Date.now() + retryAfterMs);
        track("freemium_paywall_shown", { tool: "invoice_generator", reason: "server_limit" });
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
        setError(data?.error || "Terjadi kesalahan");
        return;
      }

      const data = await res.json();
      setResult(data.invoice);
      track("freemium_invoice_generated", { item_count: items.length, include_tax: includeTax });

      const existing = getLocalUsage();
      const resetAt = existing && Date.now() < existing.resetAt
        ? existing.resetAt
        : Date.now() + DEFAULT_WINDOW_MS;
      setLocalUsage((existing?.count || 0) + 1, resetAt);
      refreshQuotaState();
    } catch {
      setError("Gagal menghubungi server. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  // --- PDF download (real PDF via server) ---

  const triggerPdfDownload = useCallback(
    async (email: string | null) => {
      if (!result) return;
      setDownloading(true);
      try {
        const res = await fetch("/api/tools/invoice-generator/pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiceNo: result.number,
            fromName: result.from,
            toName: result.to,
            items: result.items.map((it) => ({
              description: it.description,
              quantity: it.quantity,
              price: it.price,
            })),
            subtotal: result.subtotal,
            tax: result.tax,
            total: result.total,
            includeTax: result.includeTax,
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
        a.download = `invoice-${result.number.toLowerCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        track("freemium_pdf_downloaded", { tool: "invoice_generator", email_captured: !!email });
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
    track("freemium_wa_share", { tool: "invoice_generator" });
    const message = buildInvoiceWaMessage({
      invoiceNo: result.number,
      fromName: result.from,
      toName: result.to,
      total: result.total,
    });
    const link = buildWaShareLink(message);
    window.open(link, "_blank", "noopener,noreferrer");
  }, [result]);

  // --- Render ---

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs mb-8">
      {/* Free tier notice */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-2">
        <ReceiptText className="w-4 h-4 text-slate-700 shrink-0" />
        <p className="text-xs sm:text-sm text-slate-700 font-mono">
          Uji Coba Gratis: 1 invoice per bulan (PDF dengan watermark)
        </p>
      </div>

      {quotaUsed && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs sm:text-sm text-amber-800">
            <strong className="font-bold text-amber-900">Kuota gratis bulan ini sudah digunakan.</strong>{" "}
            {resetCountdown ? `Reset ${resetCountdown}, atau ` : ""}
            <a
              href="/portal/register"
              className="font-bold text-amber-900 underline underline-offset-2 hover:text-amber-800"
            >
              daftar akun portal
            </a>{" "}
            untuk akses penuh tanpa batas.
          </p>
        </div>
      )}

      {disabledNotice && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs sm:text-sm text-amber-800">
            Uji coba gratis sedang dinonaktifkan sementara.{" "}
            <a
              href="/portal/register"
              className="font-bold text-amber-900 underline underline-offset-2 hover:text-amber-800"
            >
              Daftar akun portal
            </a>{" "}
            untuk menggunakan Invoice Generator.
          </p>
        </div>
      )}

      {/* Form */}
      {!result && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Pengirim / Bisnis Anda
              </label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="Cth: PT Contoh Jaya"
                required
                disabled={!!quotaUsed}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Penerima / Klien
              </label>
              <input
                type="text"
                value={toName}
                onChange={(e) => setToName(e.target.value)}
                placeholder="Cth: CV Maju Bersama"
                required
                disabled={!!quotaUsed}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Item Tagihan
            </label>
            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_80px_120px_auto] sm:grid-cols-[1fr_80px_140px_auto] gap-2 items-start"
                >
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(item.id, "description", e.target.value)
                    }
                    placeholder={`Deskripsi item ${idx + 1}`}
                    required
                    disabled={!!quotaUsed}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <input
                    type="number"
                    value={item.quantity || ""}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "quantity",
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    min={1}
                    placeholder="Qty"
                    required
                    disabled={!!quotaUsed}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                  />
                  <input
                    type="number"
                    value={item.price || ""}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "price",
                        Math.max(0, parseInt(e.target.value) || 0)
                      )
                    }
                    min={0}
                    placeholder="Harga"
                    required
                    disabled={!!quotaUsed}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono text-right"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 1 || !!quotaUsed}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label={`Hapus item ${idx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {items.length < MAX_ITEMS && (
              <button
                type="button"
                onClick={addItem}
                disabled={!!quotaUsed}
                className="mt-3 flex items-center gap-1.5 text-xs font-mono font-medium text-slate-800 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                + Tambah Item
              </button>
            )}
            {items.length >= MAX_ITEMS && (
              <p className="mt-2 text-xs font-mono text-slate-400">
                Maksimal {MAX_ITEMS} item untuk versi gratis
              </p>
            )}
          </div>

          {/* Tax toggle */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              role="switch"
              aria-checked={includeTax}
              onClick={() => setIncludeTax(!includeTax)}
              disabled={!!quotaUsed}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-slate-800 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                includeTax ? "bg-slate-900" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  includeTax ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Sertakan PPN 11%
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex justify-between text-xs sm:text-sm font-mono">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-slate-900 font-medium">
                {formatRupiah(subtotal)}
              </span>
            </div>
            {includeTax && (
              <div className="flex justify-between text-xs sm:text-sm font-mono">
                <span className="text-slate-500">PPN 11%</span>
                <span className="text-slate-900 font-medium">
                  {formatRupiah(tax)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm sm:text-base pt-2 border-t border-slate-200 font-mono">
              <span className="text-slate-900 font-bold">Total Tagihan</span>
              <span className="text-slate-900 font-bold">
                {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5">
              <p className="text-xs sm:text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || disabledNotice || !!quotaUsed}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Membuat invoice...
              </>
            ) : (
              <>
                <ReceiptText className="w-4 h-4" />
                Generate Invoice Gratis
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-400 font-mono">
            Data yang Anda masukkan tidak disimpan permanen di server. Hanya kuota pemakaian anonim yang dicatat.
          </p>
        </form>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-6">
          <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-mono">
                    INVOICE
                  </h3>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">
                    {result.number}
                  </p>
                </div>
                <p className="text-xs font-mono text-slate-500">
                  {new Date(result.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">
                    Dari
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {result.from}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">
                    Kepada
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {result.to}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 font-mono text-slate-500">
                      <th className="text-left py-2 font-medium">
                        Deskripsi
                      </th>
                      <th className="text-center py-2 font-medium w-16">
                        Qty
                      </th>
                      <th className="text-right py-2 font-medium w-28">
                        Harga
                      </th>
                      <th className="text-right py-2 font-medium w-32">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-100"
                      >
                        <td className="py-2.5 text-slate-800">
                          {item.description}
                        </td>
                        <td className="py-2.5 text-center text-slate-600 font-mono">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 text-right text-slate-600 font-mono">
                          {formatRupiah(item.price)}
                        </td>
                        <td className="py-2.5 text-right text-slate-900 font-mono font-medium">
                          {item.totalFormatted}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 font-mono text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-800 font-medium">
                    {result.subtotalFormatted}
                  </span>
                </div>
                {result.includeTax && result.taxFormatted && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">PPN 11%</span>
                    <span className="text-slate-800 font-medium">
                      {result.taxFormatted}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm sm:text-base">
                  <span className="text-slate-900 font-bold">Total</span>
                  <span className="text-slate-900 font-bold">
                    {result.totalFormatted}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400 italic">
                PDF gratis menyertakan watermark MFWEB. Daftar akun portal untuk mengunduh versi bersih dengan logo bisnis Anda sendiri.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={handleDownloadClick}
              disabled={downloading}
              className="flex items-center justify-center gap-2 h-11 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyiapkan PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download File PDF
                </>
              )}
            </button>
            <button
              onClick={handleWaShare}
              className="flex items-center justify-center gap-2 h-11 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              Kirim via WhatsApp
            </button>
            <button
              onClick={() => {
                setResult(null);
                setFromName("");
                setToName("");
                setItems([createEmptyItem()]);
                setIncludeTax(false);
              }}
              className="flex items-center justify-center gap-2 h-11 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Buat Invoice Baru
            </button>
          </div>

          <p className="text-center text-xs text-slate-500">
            <a
              href="/portal/register"
              className="text-slate-800 hover:text-slate-900 font-medium underline underline-offset-2"
            >
              Daftar akun portal untuk PDF tanpa watermark + brand kit bisnis Anda →
            </a>
          </p>
        </div>
      )}

      <PaywallGate
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        toolName="Invoice Generator"
        signupBonus={welcomeCredits}
        signupBonusBreakdown={welcomeBonusBreakdown}
      />

      <EmailCaptureModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onConfirm={triggerPdfDownload}
        toolName="Invoice"
      />
    </div>
  );
}
