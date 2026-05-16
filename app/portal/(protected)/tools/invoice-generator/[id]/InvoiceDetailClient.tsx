"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Download, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type LineItem = {
  description: string;
  quantity: number;
  price: number;
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
  createdAt: string;
};

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Terkirim" },
  { value: "PAID", label: "Lunas" },
  { value: "VOID", label: "Void" },
];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

function moneyInput(value: number) {
  return value > 0 ? value.toLocaleString("id-ID") : "";
}

function parseMoney(value: string) {
  return Number.parseInt(value.replace(/\D/g, "") || "0", 10);
}

export default function InvoiceDetailClient({ invoice: initialInvoice }: { invoice: InvoiceDetailView }) {
  const router = useRouter();
  const [invoice, setInvoice] = useState(initialInvoice);
  const [lineItems, setLineItems] = useState<LineItem[]>(initialInvoice.lineItems);
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + Math.round((Number(item.quantity) || 0) * (Number(item.price) || 0)), 0),
    [lineItems],
  );
  const taxableAmount = Math.max(0, subtotal - invoice.discount);
  const taxAmount = invoice.includeTax ? Math.round(taxableAmount * 0.11) : 0;
  const total = taxableAmount + taxAmount;

  function updateInvoice(key: keyof InvoiceDetailView, value: string | number | boolean) {
    setInvoice((current) => ({ ...current, [key]: value }));
  }

  function updateItem(index: number, patch: Partial<LineItem>) {
    setLineItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  async function saveInvoice() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/portal/tools/invoice-generator/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...invoice, lineItems }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan invoice");

      setMessage("Invoice berhasil diperbarui.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan invoice");
    } finally {
      setSaving(false);
    }
  }

  async function duplicateInvoice() {
    setDuplicating(true);
    setError("");
    setMessage("");

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
    if (!window.confirm("Hapus invoice ini?")) return;
    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/portal/tools/invoice-generator/${invoice.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal menghapus invoice");
      router.push("/portal/tools/invoice-generator");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus invoice");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href="/portal/tools/invoice-generator" className="inline-flex items-center gap-2 text-sm text-blue-200/55 hover:text-blue-200">
            <ArrowLeft className="h-4 w-4" />
            Invoice Generator
          </Link>
          <h1 className="mt-4 text-2xl font-black text-white">{invoice.invoiceNo}</h1>
          <p className="mt-1 text-sm text-blue-200/45">Edit detail, status manual, duplikasi, atau unduh PDF.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/api/portal/tools/invoice-generator/${invoice.id}/pdf`} target="_blank" className="inline-flex h-10 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 text-sm font-black text-emerald-200 hover:bg-emerald-500/15">
            <Download className="mr-2 h-4 w-4" />
            PDF
          </a>
          <Button type="button" onClick={duplicateInvoice} disabled={duplicating} className="h-10 rounded-xl bg-white/10 text-white hover:bg-white/15">
            {duplicating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
            Duplikasi
          </Button>
        </div>
      </div>

      {(message || error) && (
        <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${error ? "border-red-500/25 bg-red-500/10 text-red-200" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"}`}>
          {error || message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-white/10 bg-[#071225] p-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Judul" value={invoice.title} onChange={(value) => updateInvoice("title", value)} />
            <label className="block">
              <span className="text-xs font-black uppercase tracking-widest text-blue-200/40">Status</span>
              <select value={invoice.status} onChange={(event) => updateInvoice("status", event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-blue-500/45">
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} className="bg-[#07111f] text-white" value={status.value}>{status.label}</option>
                ))}
              </select>
            </label>
            <Field label="Tanggal Invoice" type="date" value={invoice.issueDate} onChange={(value) => updateInvoice("issueDate", value)} />
            <Field label="Jatuh Tempo" type="date" value={invoice.dueDate} onChange={(value) => updateInvoice("dueDate", value)} />
            <Field label="Nama Penerima" value={invoice.billToName} onChange={(value) => updateInvoice("billToName", value)} />
            <Field label="Email Penerima" value={invoice.billToEmail} onChange={(value) => updateInvoice("billToEmail", value)} />
            <Field label="Telepon Penerima" value={invoice.billToPhone} onChange={(value) => updateInvoice("billToPhone", value)} />
            <Field label="Nama Pengirim" value={invoice.fromName} onChange={(value) => updateInvoice("fromName", value)} />
          </div>

          <TextArea label="Alamat Penerima" value={invoice.billToAddress} onChange={(value) => updateInvoice("billToAddress", value)} />
          <TextArea label="Alamat Pengirim" value={invoice.fromAddress} onChange={(value) => updateInvoice("fromAddress", value)} />

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-black text-white">Rincian Item</h2>
              <button type="button" onClick={() => setLineItems((current) => [...current, { description: "", quantity: 1, price: 0 }])} className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/25 bg-blue-500/10 px-3 py-1.5 text-xs font-black text-blue-200 hover:bg-blue-500/15">
                <Plus className="h-3.5 w-3.5" />
                Item
              </button>
            </div>
            {lineItems.map((item, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[1fr_90px_150px_36px]">
                <input value={item.description} onChange={(event) => updateItem(index, { description: event.target.value })} placeholder="Deskripsi layanan" className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-blue-500/45" />
                <input type="number" min={1} step={0.01} value={item.quantity} onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })} className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-blue-500/45" />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-blue-200/35">Rp</span>
                  <input value={moneyInput(item.price)} onChange={(event) => updateItem(index, { price: parseMoney(event.target.value) })} className="h-11 w-full rounded-xl border border-white/10 bg-black/20 pl-9 pr-3 text-right text-sm text-white outline-none focus:border-blue-500/45" />
                </div>
                <button type="button" onClick={() => setLineItems((current) => current.length === 1 ? current : current.filter((_item, itemIndex) => itemIndex !== index))} disabled={lineItems.length === 1} className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-red-300/70 hover:bg-red-500/10 disabled:opacity-35">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <MoneyField label="Diskon" value={invoice.discount} onChange={(value) => updateInvoice("discount", value)} />
            <Toggle label={`Sertakan PPN 11% (${formatRupiah(taxAmount)})`} checked={invoice.includeTax} onChange={(checked) => updateInvoice("includeTax", checked)} />
          </div>

          <TextArea label="Catatan" value={invoice.notes} onChange={(value) => updateInvoice("notes", value)} />
          <TextArea label="Footer" value={invoice.footer} onChange={(value) => updateInvoice("footer", value)} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" onClick={saveInvoice} disabled={saving} className="h-12 rounded-xl bg-blue-600 px-6 font-black text-white hover:bg-blue-500">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Simpan Perubahan
            </Button>
            <button type="button" onClick={deleteInvoice} disabled={deleting} className="inline-flex h-12 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 px-5 text-sm font-black text-red-200 hover:bg-red-500/15 disabled:opacity-50">
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Hapus Invoice
            </button>
          </div>
        </section>

        <aside className="rounded-2xl border border-white/10 bg-[#071225] p-5 h-fit space-y-5">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-200/35">Ringkasan</p>
            <h2 className="mt-2 text-2xl font-black text-white">{invoice.title}</h2>
            <p className="mt-1 text-sm text-blue-200/45">Untuk {invoice.billToName || "Nama penerima"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3 text-sm">
            <SummaryRow label="Subtotal" value={formatRupiah(subtotal)} />
            <SummaryRow label="Diskon" value={`-${formatRupiah(invoice.discount)}`} />
            <SummaryRow label="PPN 11%" value={invoice.includeTax ? formatRupiah(taxAmount) : "Tidak disertakan"} />
            <div className="border-t border-white/10 pt-3 flex items-center justify-between">
              <span className="text-blue-200/55 font-bold">Total</span>
              <span className="text-xl font-black text-white">{formatRupiah(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-widest text-blue-200/40">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-blue-500/45" />
    </label>
  );
}

function MoneyField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-widest text-blue-200/40">{label}</span>
      <div className="relative mt-2">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-blue-200/35">Rp</span>
        <input value={moneyInput(value)} onChange={(event) => onChange(parseMoney(event.target.value))} className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-right text-sm text-white outline-none focus:border-blue-500/45" />
      </div>
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="text-sm font-bold text-blue-100/80">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-blue-500" />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-widest text-blue-200/40">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-blue-500/45" />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-blue-200/45">{label}</span>
      <span className="font-bold text-blue-100">{value}</span>
    </div>
  );
}
