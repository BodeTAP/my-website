"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, Loader2, Download, ReceiptText } from "lucide-react";
import PaywallGate from "@/components/public/PaywallGate";

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
  // If reset time has passed, limit is no longer active
  if (Date.now() > usage.resetAt) return false;
  return usage.count >= 1;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PublicInvoiceForm() {
  const [fromName, setFromName] = useState("");
  const [toName, setToName] = useState("");
  const [items, setItems] = useState<LineItem[]>([createEmptyItem()]);
  const [includeTax, setIncludeTax] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InvoiceResult | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [disabledNotice, setDisabledNotice] = useState(false);

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

    // localStorage soft-limit check
    if (isLocalLimitReached()) {
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
        // Rate limit exceeded — set localStorage flag and show paywall
        const data = await res.json();
        const retryAfterMs = data.retryAfterMs || 30 * 24 * 60 * 60 * 1000;
        setLocalUsage(1, Date.now() + retryAfterMs);
        setPaywallOpen(true);
        return;
      }

      if (res.status === 403) {
        setDisabledNotice(true);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Terjadi kesalahan");
        return;
      }

      const data = await res.json();
      setResult(data.invoice);

      // Update localStorage usage
      const usage = getLocalUsage();
      const resetAt = usage?.resetAt || Date.now() + 30 * 24 * 60 * 60 * 1000;
      setLocalUsage((usage?.count || 0) + 1, resetAt);
    } catch {
      setError("Gagal menghubungi server. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  // --- Print/download handler ---

  const handleDownload = () => {
    if (!result) return;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${result.number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 48px; color: #1a1a2e; position: relative; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 52px; color: rgba(0,0,0,0.04); white-space: nowrap; pointer-events: none; z-index: 0; }
    .content { position: relative; z-index: 1; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0d9488; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 22px; color: #0d9488; letter-spacing: 2px; }
    .header .number { font-size: 12px; color: #64748b; margin-top: 4px; }
    .header .date { font-size: 13px; color: #475569; text-align: right; }
    .parties { display: flex; gap: 40px; margin-bottom: 28px; }
    .parties .party { flex: 1; }
    .parties .label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .parties .name { font-size: 15px; font-weight: 600; color: #1e293b; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    th:last-child { text-align: right; }
    td { padding: 12px; font-size: 13px; color: #334155; border-bottom: 1px solid #f1f5f9; }
    td:nth-child(2) { text-align: center; }
    td:nth-child(3), td:nth-child(4) { text-align: right; }
    .totals { margin-left: auto; width: 260px; }
    .totals .row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #475569; }
    .totals .row.grand { border-top: 2px solid #0d9488; padding-top: 12px; margin-top: 4px; font-size: 16px; font-weight: 700; color: #0d9488; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
    @media print { body { padding: 24px; } .watermark { position: fixed; } }
  </style>
</head>
<body>
  <div class="watermark">Dibuat dengan MFWEB - mfweb.maffisorp.id</div>
  <div class="content">
    <div class="header">
      <div>
        <h1>INVOICE</h1>
        <div class="number">${result.number}</div>
      </div>
      <div class="date">${new Date(result.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
    </div>
    <div class="parties">
      <div class="party"><div class="label">Dari</div><div class="name">${result.from}</div></div>
      <div class="party"><div class="label">Kepada</div><div class="name">${result.to}</div></div>
    </div>
    <table>
      <thead><tr><th>Deskripsi</th><th>Qty</th><th>Harga</th><th>Total</th></tr></thead>
      <tbody>${result.items.map((item) => `<tr><td>${item.description}</td><td style="text-align:center">${item.quantity}</td><td style="text-align:right">${formatRupiah(item.price)}</td><td style="text-align:right">${item.totalFormatted}</td></tr>`).join("")}</tbody>
    </table>
    <div class="totals">
      <div class="row"><span>Subtotal</span><span>${result.subtotalFormatted}</span></div>
      ${result.includeTax && result.taxFormatted ? `<div class="row"><span>PPN 11%</span><span>${result.taxFormatted}</span></div>` : ""}
      <div class="row grand"><span>Total</span><span>${result.totalFormatted}</span></div>
    </div>
    <div class="footer">Dibuat dengan MFWEB Invoice Generator (Free Tier) &mdash; mfweb.maffisorp.id</div>
  </div>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 400);
  };

  // --- Render ---

  return (
    <section className="w-full max-w-3xl mx-auto mb-12">
      {/* Free tier notice */}
      <div className="mb-6 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] px-4 py-3">
        <p className="text-sm text-emerald-200/80">
          <ReceiptText className="inline w-4 h-4 mr-1.5 -mt-0.5 text-emerald-400" />
          <span className="font-medium text-emerald-100">Gratis:</span>{" "}
          1 invoice per bulan (dengan watermark)
        </p>
      </div>

      {/* Disabled notice */}
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
          {/* Sender & Recipient */}
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
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-blue-200/30 focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition-colors"
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
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-blue-200/30 focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition-colors"
              />
            </div>
          </div>

          {/* Line Items */}
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
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-blue-200/30 focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition-colors"
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
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-blue-200/30 focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition-colors text-center"
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
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-blue-200/30 focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 1}
                    className="p-2.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label={`Hapus item ${idx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add item button */}
            {items.length < MAX_ITEMS && (
              <button
                type="button"
                onClick={addItem}
                className="mt-3 flex items-center gap-1.5 text-sm text-emerald-400/80 hover:text-emerald-400 transition-colors"
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
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 focus:ring-offset-[#071225] ${
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

          {/* Running totals */}
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

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || disabledNotice}
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
        </form>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Invoice preview */}
          <div className="relative rounded-xl border border-white/10 bg-white/[0.02] p-6 overflow-hidden print:border-gray-300 print:bg-white">
            {/* Watermark overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
              <p className="text-4xl sm:text-5xl font-bold text-white/[0.03] -rotate-45 whitespace-nowrap">
                MFWEB - mfweb.maffisorp.id
              </p>
            </div>

            {/* Invoice header */}
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

              {/* From / To */}
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

              {/* Items table */}
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

              {/* Totals */}
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

              {/* Watermark notice */}
              <p className="mt-4 text-xs text-blue-200/30 print:text-gray-400 italic">
                Dibuat dengan MFWEB - mfweb.maffisorp.id (watermark free tier)
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download / Print PDF
            </button>
            <button
              onClick={() => {
                setResult(null);
                setFromName("");
                setToName("");
                setItems([createEmptyItem()]);
                setIncludeTax(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-white/10 hover:bg-white/5 text-blue-100/70 font-medium text-sm transition-colors"
            >
              Buat Invoice Baru
            </button>
          </div>
        </div>
      )}

      {/* Paywall Gate */}
      <PaywallGate
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        toolName="Invoice Generator"
      />
    </section>
  );
}
