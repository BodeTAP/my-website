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

function isLocalLimitReached(): boolean {
  const usage = getLocalUsage();
  if (!usage) return false;
  if (Date.now() > usage.resetAt) return false;
  return usage.count >= 1;
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
};

export default function PublicInvoiceForm({
  welcomeCredits = 15,
  welcomeBonusBreakdown,
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
    const used = Date.now() < usage.resetAt && usage.count >= 1;
    setQuotaState({
      used,
      resetCountdown: used ? formatResetCountdown(usage.resetAt) : "",
    });
  }, []);

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
    setError(null);

    if (isLocalLimitReached()) {
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
    <section className="w-full max-w-3xl mx-auto mb-12">
      {/* Free tier notice */}
      <div className="mb-6 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] px-4 py-3">
        <p className="text-sm text-emerald-200/80">
          <ReceiptText className="inline w-4 h-4 mr-1.5 -mt-0.5 text-emerald-400" />
          <span className="font-medium text-emerald-100">Gratis:</span>{" "}
          1 invoice per bulan (PDF dengan watermark)
        </p>
      </div>

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
        <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3">
          <p className="text-sm text-red-200/80">
            Free tier tidak tersedia untuk tool ini.{" "}
            <a
              href="/portal/register"
              className="text-red-400 underline underline-offset-2 hover:text-red-300"
            >
              Daftar akun
            </a>{" "}
            untuk menggunakan Invoice Generator.
          </p>
        </div>
      )}

      {/* Form */}
      {!result && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-100/70 mb-1.5">
                Nama Pengirim
              </label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="PT Contoh Jaya"
                required
                disabled={!!quotaUsed}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-blue-200/30 focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-100/70 mb-1.5">
                Nama Penerima
              </label>
              <input
                type="text"
                value={toName}
                onChange={(e) => setToName(e.target.value)}
                placeholder="CV Maju Bersama"
                required
                disabled={!!quotaUsed}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-blue-200/30 focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-100/70 mb-3">
              Item Invoice
            </label>
            <div className="space-y-3">
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
                    placeholder={`Item ${idx + 1}`}
                    required
                    disabled={!!quotaUsed}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-blue-200/30 focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-blue-200/30 focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-blue-200/30 focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 1 || !!quotaUsed}
                    className="p-2.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                className="mt-3 flex items-center gap-1.5 text-sm text-emerald-400/80 hover:text-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Tambah item
              </button>
            )}
            {items.length >= MAX_ITEMS && (
              <p className="mt-2 text-xs text-blue-200/40">
                Maksimal {MAX_ITEMS} item untuk free tier
              </p>
            )}
          </div>

          {/* Tax toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={includeTax}
              onClick={() => setIncludeTax(!includeTax)}
              disabled={!!quotaUsed}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 focus:ring-offset-[#071225] disabled:opacity-50 disabled:cursor-not-allowed ${
                includeTax ? "bg-emerald-500" : "bg-white/10"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  includeTax ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm text-blue-100/70">
              Sertakan PPN 11%
            </span>
          </div>

          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-200/50">Subtotal</span>
              <span className="text-white font-medium">
                {formatRupiah(subtotal)}
              </span>
            </div>
            {includeTax && (
              <div className="flex justify-between text-sm">
                <span className="text-blue-200/50">PPN 11%</span>
                <span className="text-white font-medium">
                  {formatRupiah(tax)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm pt-2 border-t border-white/5">
              <span className="text-blue-100/80 font-medium">Total</span>
              <span className="text-emerald-400 font-bold text-base">
                {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || disabledNotice || !!quotaUsed}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Membuat invoice...
              </>
            ) : (
              <>
                <ReceiptText className="w-4 h-4" />
                Buat Invoice Gratis
              </>
            )}
          </button>

          <p className="text-[11px] text-blue-200/35">
            Data yang kamu input tidak disimpan. Hanya hitungan pemakaian (anonim) yang dicatat untuk batas kuota.
          </p>
        </form>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-6">
          <div className="relative rounded-xl border border-white/10 bg-white/[0.02] p-6 overflow-hidden print:border-gray-300 print:bg-white">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
              <p className="text-4xl sm:text-5xl font-bold text-white/[0.05] -rotate-45 whitespace-nowrap">
                MFWEB - Free Tier
              </p>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white print:text-gray-900">
                    INVOICE
                  </h3>
                  <p className="text-xs text-blue-200/50 print:text-gray-500 mt-0.5">
                    {result.number}
                  </p>
                </div>
                <p className="text-xs text-blue-200/40 print:text-gray-400">
                  {new Date(result.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-blue-200/40 print:text-gray-400 mb-0.5">
                    Dari
                  </p>
                  <p className="text-sm font-medium text-white print:text-gray-900">
                    {result.from}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-200/40 print:text-gray-400 mb-0.5">
                    Kepada
                  </p>
                  <p className="text-sm font-medium text-white print:text-gray-900">
                    {result.to}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 print:border-gray-200">
                      <th className="text-left py-2 text-blue-200/50 print:text-gray-500 font-medium">
                        Deskripsi
                      </th>
                      <th className="text-center py-2 text-blue-200/50 print:text-gray-500 font-medium w-16">
                        Qty
                      </th>
                      <th className="text-right py-2 text-blue-200/50 print:text-gray-500 font-medium w-28">
                        Harga
                      </th>
                      <th className="text-right py-2 text-blue-200/50 print:text-gray-500 font-medium w-32">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-white/5 print:border-gray-100"
                      >
                        <td className="py-2.5 text-white print:text-gray-800">
                          {item.description}
                        </td>
                        <td className="py-2.5 text-center text-blue-100/70 print:text-gray-600">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 text-right text-blue-100/70 print:text-gray-600">
                          {formatRupiah(item.price)}
                        </td>
                        <td className="py-2.5 text-right text-white print:text-gray-800 font-medium">
                          {item.totalFormatted}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 print:border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-200/50 print:text-gray-500">
                    Subtotal
                  </span>
                  <span className="text-white print:text-gray-800 font-medium">
                    {result.subtotalFormatted}
                  </span>
                </div>
                {result.includeTax && result.taxFormatted && (
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-200/50 print:text-gray-500">
                      PPN 11%
                    </span>
                    <span className="text-white print:text-gray-800 font-medium">
                      {result.taxFormatted}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-white/5 print:border-gray-100">
                  <span className="text-blue-100/80 print:text-gray-700 font-semibold">
                    Total
                  </span>
                  <span className="text-emerald-400 print:text-emerald-700 font-bold text-lg">
                    {result.totalFormatted}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs text-blue-200/30 print:text-gray-400 italic">
                PDF gratis menyertakan watermark MFWEB. Daftar untuk versi tanpa watermark dengan logo bisnis Anda.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={handleDownloadClick}
              disabled={downloading}
              className="flex items-center justify-center gap-2 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
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
              className="flex items-center justify-center gap-2 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-200 font-semibold text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
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
              className="flex items-center justify-center gap-2 h-11 rounded-xl border border-white/10 hover:bg-white/5 text-blue-100/70 font-medium text-sm transition-colors"
            >
              Buat Invoice Baru
            </button>
          </div>

          <p className="text-center text-xs text-blue-200/40">
            <a
              href="/portal/register"
              className="text-blue-300 hover:text-blue-200 underline underline-offset-2"
            >
              Daftar untuk PDF tanpa watermark + logo bisnis Anda →
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
    </section>
  );
}
