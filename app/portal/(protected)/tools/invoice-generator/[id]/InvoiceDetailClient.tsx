"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Download, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type LineItem = {
  description: string;
  quantity: number;
  price: number;
};

export type InvoiceDesign = {
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  fontStyle: "sans" | "serif" | "mono";
  layout: "corporate" | "minimal" | "modern" | "premium";
  logoPosition: "left" | "center" | "right";
  showLogo: boolean;
  showInvoiceNo: boolean;
  showDueDate: boolean;
  showSender: boolean;
  showRecipient: boolean;
  showFooter: boolean;
};

export type InvoiceDetailView = {
  id: string;
  invoiceNo: string;
  title: string;
  fromName: string;
  fromEmail: string;
  fromPhone: string;
  fromAddress: string;
  billToName: string;
  billToEmail: string;
  billToPhone: string;
  billToAddress: string;
  issueDate: string;
  dueDate: string;
  lineItems: LineItem[];
  discount: number;
  includeTax: boolean;
  notes: string;
  footer: string;
  status: string;
  design: InvoiceDesign;
  createdAt: string;
};

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Terkirim" },
  { value: "PAID", label: "Lunas" },
  { value: "VOID", label: "Void" },
];

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "border-white/10 bg-white/5 text-blue-100/70",
  SENT: "border-blue-500/25 bg-blue-500/10 text-blue-200",
  PAID: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
  VOID: "border-red-500/25 bg-red-500/10 text-red-200",
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

function fmtDate(value: string) {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
  } catch {
    return "-";
  }
}

export default function InvoiceDetailClient({ invoice }: { invoice: InvoiceDetailView }) {
  const router = useRouter();
  const [status, setStatus] = useState(invoice.status);
  const [savingStatus, setSavingStatus] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const subtotal = useMemo(
    () => invoice.lineItems.reduce((sum, item) => sum + Math.round((item.quantity || 0) * (item.price || 0)), 0),
    [invoice.lineItems],
  );
  const taxableAmount = Math.max(0, subtotal - invoice.discount);
  const taxAmount = invoice.includeTax ? Math.round(taxableAmount * 0.11) : 0;
  const total = taxableAmount + taxAmount;

  const design = invoice.design;

  async function updateStatus(newStatus: string) {
    setStatus(newStatus);
    setSavingStatus(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/portal/tools/invoice-generator/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status");
      setMessage("Status berhasil diperbarui.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status");
      setStatus(invoice.status);
    } finally {
      setSavingStatus(false);
    }
  }

  async function duplicateInvoice() {
    setDuplicating(true);
    setError("");

    try {
      const res = await fetch(`/api/portal/tools/invoice-generator/${invoice.id}/duplicate`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal menduplikasi invoice");
      router.push(`/portal/tools/invoice-generator/${data.invoice.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menduplikasi invoice");
      setDuplicating(false);
    }
  }

  async function deleteInvoice() {
    if (!window.confirm("Hapus invoice ini? Tindakan ini tidak bisa dibatalkan.")) return;
    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/portal/tools/invoice-generator/${invoice.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus invoice");
      router.push("/portal/tools/invoice-generator");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus invoice");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link href="/portal/tools/invoice-generator" className="inline-flex items-center gap-2 text-sm text-blue-200/55 hover:text-blue-200 mb-3">
            <ArrowLeft className="h-4 w-4" />
            Invoice Generator
          </Link>
          <h1 className="text-2xl font-black text-white">{invoice.invoiceNo}</h1>
          <p className="mt-1 text-sm text-blue-200/45">{invoice.title} — {fmtDate(invoice.issueDate)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Status */}
          <select
            value={status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={savingStatus}
            className={`h-10 rounded-xl border px-3 text-sm font-black outline-none ${STATUS_STYLE[status] ?? STATUS_STYLE.DRAFT}`}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#07111f] text-white">{opt.label}</option>
            ))}
          </select>
          {/* Download */}
          <a
            href={`/api/portal/tools/invoice-generator/${invoice.id}/pdf`}
            target="_blank"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 text-sm font-black text-white transition-colors"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </a>
          {/* Duplicate */}
          <Button type="button" onClick={duplicateInvoice} disabled={duplicating} className="h-10 rounded-xl border border-white/10 bg-white/10 text-white hover:bg-white/15">
            {duplicating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
            Duplikasi
          </Button>
          {/* Delete */}
          <button type="button" onClick={deleteInvoice} disabled={deleting} className="inline-flex h-10 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 px-3 text-sm font-black text-red-200 hover:bg-red-500/15 disabled:opacity-50">
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {(message || error) && (
        <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${error ? "border-red-500/25 bg-red-500/10 text-red-200" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"}`}>
          {error || message}
        </div>
      )}

      {/* Invoice Preview (read-only, full width) */}
      <div className="rounded-2xl border border-white/10 bg-[#071225] p-5">
        <InvoiceReadOnlyPreview
          design={design}
          fromName={invoice.fromName}
          fromEmail={invoice.fromEmail}
          fromPhone={invoice.fromPhone}
          invoiceNo={invoice.invoiceNo}
          billToName={invoice.billToName}
          billToEmail={invoice.billToEmail}
          billToPhone={invoice.billToPhone}
          billToAddress={invoice.billToAddress}
          issueDate={invoice.issueDate}
          dueDate={invoice.dueDate}
          lineItems={invoice.lineItems}
          subtotal={subtotal}
          discount={invoice.discount}
          includeTax={invoice.includeTax}
          taxAmount={taxAmount}
          total={total}
          notes={invoice.notes}
          footer={invoice.footer}
        />
      </div>
    </div>
  );
}

// ─── Read-only Invoice Preview (matches PDF output) ──────────────────────────

type PreviewProps = {
  design: InvoiceDesign;
  fromName: string;
  fromEmail: string;
  fromPhone: string;
  invoiceNo: string;
  billToName: string;
  billToEmail: string;
  billToPhone: string;
  billToAddress: string;
  issueDate: string;
  dueDate: string;
  lineItems: LineItem[];
  subtotal: number;
  discount: number;
  includeTax: boolean;
  taxAmount: number;
  total: number;
  notes: string;
  footer: string;
};

function InvoiceReadOnlyPreview({
  design,
  fromName,
  fromEmail,
  fromPhone,
  invoiceNo,
  billToName,
  billToEmail,
  billToPhone,
  billToAddress,
  issueDate,
  dueDate,
  lineItems,
  subtotal,
  discount,
  includeTax,
  taxAmount,
  total,
  notes,
  footer,
}: PreviewProps) {
  const isMinimal = design.layout === "minimal";
  const isPremium = design.layout === "premium";
  const isModern = design.layout === "modern";
  const headerBg = isMinimal ? "#ffffff" : design.primaryColor;
  const headerTextColor = isMinimal ? "#0f172a" : "#ffffff";
  const headerMutedColor = isMinimal ? "#64748b" : "#bfdbfe";
  const fontFamily = design.fontStyle === "serif" ? "Georgia, serif" : design.fontStyle === "mono" ? "'Courier New', monospace" : "system-ui, -apple-system, sans-serif";

  return (
    <div className="mx-auto max-w-2xl rounded-xl overflow-hidden border border-white/10 shadow-xl" style={{ fontFamily }}>
      <div className="bg-white text-slate-900 relative">
        {/* Modern side accent */}
        {isModern && <div className="absolute left-0 top-0 bottom-0 w-3" style={{ backgroundColor: design.accentColor }} />}

        {/* Header */}
        <div className="relative px-8 py-6" style={{ backgroundColor: headerBg, borderBottom: isMinimal ? `3px solid ${design.primaryColor}` : "none" }}>
          {isPremium && <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: design.accentColor }} />}
          <div className="flex items-start justify-between">
            <div>
              {design.showLogo && design.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={design.logoUrl} alt="Logo" className="h-8 w-auto mb-2 object-contain" />
              )}
              {design.showSender && (
                <>
                  <p className="font-bold text-lg" style={{ color: headerTextColor }}>{fromName}</p>
                  {fromEmail && <p className="text-xs mt-0.5" style={{ color: headerMutedColor }}>{fromEmail}</p>}
                  {fromPhone && <p className="text-xs" style={{ color: headerMutedColor }}>{fromPhone}</p>}
                </>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold text-3xl" style={{ color: headerTextColor }}>INVOICE</p>
              {design.showInvoiceNo && <p className="text-xs mt-1" style={{ color: headerMutedColor }}>{invoiceNo}</p>}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-5">
          {/* Bill To + Dates */}
          <div className="flex justify-between gap-6">
            {design.showRecipient && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ditagihkan Kepada</p>
                <p className="font-bold text-base mt-1">{billToName}</p>
                {billToEmail && <p className="text-xs text-slate-500">{billToEmail}</p>}
                {billToPhone && <p className="text-xs text-slate-500">{billToPhone}</p>}
                {billToAddress && <p className="text-xs text-slate-500 max-w-[240px]">{billToAddress}</p>}
              </div>
            )}
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tanggal Invoice</p>
              <p className="font-bold text-sm mt-1">{fmtDate(issueDate)}</p>
              {design.showDueDate && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-3">Jatuh Tempo</p>
                  <p className="font-bold text-sm mt-1">{fmtDate(dueDate)}</p>
                </>
              )}
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-slate-200" />

          {/* Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200" style={{ backgroundColor: isMinimal ? "#f8fafc" : "#f1f5f9" }}>
                <th className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Deskripsi</th>
                <th className="text-center py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-16">Qty</th>
                <th className="text-right py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-28">Harga</th>
                <th className="text-right py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-32">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => {
                const amount = Math.round((item.quantity || 1) * (item.price || 0));
                return (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-2.5 px-3 font-medium">{item.description}</td>
                    <td className="py-2.5 px-2 text-center text-slate-500">{item.quantity}</td>
                    <td className="py-2.5 px-2 text-right text-slate-500">{formatRupiah(item.price)}</td>
                    <td className="py-2.5 px-3 text-right font-bold">{formatRupiah(amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Diskon</span>
                  <span>-{formatRupiah(discount)}</span>
                </div>
              )}
              {includeTax && taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">PPN 11%</span>
                  <span>{formatRupiah(taxAmount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-3 rounded-lg mt-2" style={{ backgroundColor: isPremium ? design.accentColor : design.primaryColor }}>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#bfdbfe" }}>Total</span>
                <span className="text-xl font-black text-white">{formatRupiah(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Catatan</p>
              <p className="text-sm text-slate-700 mt-1 whitespace-pre-line">{notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {design.showFooter && (
          <div className="px-8 py-3 border-t border-slate-200">
            <div className="flex justify-between text-xs text-slate-400">
              <span>{footer || "Dokumen dibuat otomatis."}</span>
              <span>Halaman 1 dari 1</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
