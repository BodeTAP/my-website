"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Coins, Download, FileText, History, Loader2, Plus, ReceiptText, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type LineItem = {
  description: string;
  quantity: number;
  price: number;
};

export type GeneratedInvoiceView = {
  id: string;
  invoiceNo: string;
  title: string;
  billToName: string;
  issueDate: string;
  dueDate: string | null;
  total: number;
  createdAt: string;
};

type ClientDefaults = {
  businessName: string;
  email: string;
  phone: string;
  address: string;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function parseMoney(value: string) {
  return Number.parseInt(value.replace(/\D/g, "") || "0", 10);
}

function moneyInput(value: number) {
  return value > 0 ? value.toLocaleString("id-ID") : "";
}

function fmtDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export default function InvoiceGeneratorClient({
  initialBalance,
  enabled,
  invoiceCost,
  clientDefaults,
  initialInvoices,
}: {
  initialBalance: number;
  enabled: boolean;
  invoiceCost: number;
  clientDefaults: ClientDefaults;
  initialInvoices: GeneratedInvoiceView[];
}) {
  const router = useRouter();
  const [balance, setBalance] = useState(initialBalance);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [latestInvoice, setLatestInvoice] = useState<GeneratedInvoiceView | null>(initialInvoices[0] ?? null);

  const [form, setForm] = useState({
    title: "Invoice",
    fromName: clientDefaults.businessName,
    fromEmail: clientDefaults.email,
    fromPhone: clientDefaults.phone,
    fromAddress: clientDefaults.address,
    billToName: "",
    billToEmail: "",
    billToPhone: "",
    billToAddress: "",
    issueDate: today(),
    dueDate: addDays(7),
    discount: 0,
    taxLabel: "",
    taxAmount: 0,
    notes: "",
    footer: "Terima kasih atas kepercayaan Anda.",
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "Layanan profesional", quantity: 1, price: 1_500_000 },
  ]);

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + Math.round((Number(item.quantity) || 0) * (Number(item.price) || 0)), 0),
    [lineItems],
  );
  const total = Math.max(0, subtotal - form.discount + form.taxAmount);
  const canGenerate = enabled && balance >= invoiceCost;
  const filteredInvoices = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return invoices;
    return invoices.filter((invoice) =>
      [invoice.invoiceNo, invoice.title, invoice.billToName].some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [invoices, query]);

  function updateForm(key: keyof typeof form, value: string | number) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateItem(index: number, patch: Partial<LineItem>) {
    setLineItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  function addItem() {
    setLineItems((current) => [...current, { description: "", quantity: 1, price: 0 }]);
  }

  function removeItem(index: number) {
    setLineItems((current) => current.length === 1 ? current : current.filter((_item, itemIndex) => itemIndex !== index));
  }

  async function generateInvoice() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/portal/tools/invoice-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lineItems }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat invoice");

      const invoice: GeneratedInvoiceView = {
        id: data.invoice.id,
        invoiceNo: data.invoice.invoiceNo,
        title: data.invoice.title,
        billToName: data.invoice.billToName,
        issueDate: data.invoice.issueDate.slice(0, 10),
        dueDate: data.invoice.dueDate ? data.invoice.dueDate.slice(0, 10) : null,
        total: data.invoice.total,
        createdAt: data.invoice.createdAt,
      };

      setLatestInvoice(invoice);
      setInvoices((current) => [invoice, ...current.filter((item) => item.id !== invoice.id)]);
      setBalance(data.balance);
      setMessage("Invoice berhasil dibuat. PDF siap diunduh.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat invoice");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-3">
          <Link href="/portal/tools" className="inline-flex items-center gap-2 text-sm text-blue-200/55 hover:text-blue-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Tools
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center">
              <ReceiptText className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Invoice Generator</h1>
              <p className="text-blue-200/50 text-sm">Buat invoice PDF mandiri tanpa payment link.</p>
            </div>
          </div>
        </div>

        <Link href="/portal/credits" className="w-fit">
          <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 px-4 py-3 hover:bg-amber-500/15 transition-colors">
            <Coins className="w-5 h-5 text-amber-300" />
            <div>
              <p className="text-amber-200/55 text-[10px] uppercase tracking-widest font-black">Saldo</p>
              <p className="text-white font-black">{balance} kredit</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-blue-300">
          <p className="text-2xl font-black">{invoices.length}</p>
          <p className="text-[10px] uppercase tracking-widest font-black opacity-70 mt-1">Total Invoice</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300">
          <p className="text-2xl font-black">{formatRupiah(total)}</p>
          <p className="text-[10px] uppercase tracking-widest font-black opacity-70 mt-1">Draft Saat Ini</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-300">
          <p className="text-2xl font-black">{invoiceCost}</p>
          <p className="text-[10px] uppercase tracking-widest font-black opacity-70 mt-1">Kredit/Invoice</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-blue-100/70">
          <p className="text-2xl font-black">{latestInvoice?.invoiceNo ?? "-"}</p>
          <p className="text-[10px] uppercase tracking-widest font-black opacity-70 mt-1">Terakhir Dibuat</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: "create", label: "Buat Invoice", icon: FileText },
          { id: "history", label: "Riwayat", icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all ${active ? "border-blue-500/35 bg-blue-500/15 text-white" : "border-white/10 bg-white/5 text-blue-200/55 hover:text-white"}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {(message || error || !enabled || balance < invoiceCost) && (
        <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${error || !enabled ? "border-red-500/25 bg-red-500/10 text-red-200" : balance < invoiceCost ? "border-amber-500/25 bg-amber-500/10 text-amber-200" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"}`}>
          {error || (!enabled ? "Invoice Generator sedang nonaktif sementara." : balance < invoiceCost ? `Kredit tidak cukup. Butuh ${invoiceCost} kredit.` : message)}
        </div>
      )}

      {activeTab === "create" && (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="glass rounded-3xl border border-white/5 p-5 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Judul Invoice" value={form.title} onChange={(value) => updateForm("title", value)} />
              <Field label="Tanggal Invoice" type="date" value={form.issueDate} onChange={(value) => updateForm("issueDate", value)} />
              <Field label="Jatuh Tempo" type="date" value={form.dueDate} onChange={(value) => updateForm("dueDate", value)} />
              <Field label="Nama Penerima" value={form.billToName} onChange={(value) => updateForm("billToName", value)} placeholder="Nama perusahaan / klien" />
              <Field label="Email Penerima" value={form.billToEmail} onChange={(value) => updateForm("billToEmail", value)} />
              <Field label="Telepon Penerima" value={form.billToPhone} onChange={(value) => updateForm("billToPhone", value)} />
            </div>

            <TextArea label="Alamat Penerima" value={form.billToAddress} onChange={(value) => updateForm("billToAddress", value)} />

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-black text-white">Rincian Item</h2>
                <button type="button" onClick={addItem} className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/25 bg-blue-500/10 px-3 py-1.5 text-xs font-black text-blue-200 hover:bg-blue-500/15">
                  <Plus className="w-3.5 h-3.5" />
                  Item
                </button>
              </div>
              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={index} className="grid gap-2 sm:grid-cols-[1fr_90px_150px_36px]">
                    <input value={item.description} onChange={(event) => updateItem(index, { description: event.target.value })} placeholder="Deskripsi layanan" className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-blue-500/45" />
                    <input type="number" min={1} step={0.01} value={item.quantity} onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })} className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-blue-500/45" />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-blue-200/35">Rp</span>
                      <input value={moneyInput(item.price)} onChange={(event) => updateItem(index, { price: parseMoney(event.target.value) })} placeholder="0" className="h-11 w-full rounded-xl border border-white/10 bg-black/20 pl-9 pr-3 text-right text-sm text-white outline-none focus:border-blue-500/45" />
                    </div>
                    <button type="button" onClick={() => removeItem(index)} disabled={lineItems.length === 1} className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-red-300/70 hover:bg-red-500/10 disabled:opacity-35">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <MoneyField label="Diskon" value={form.discount} onChange={(value) => updateForm("discount", value)} />
              <Field label="Label Pajak" value={form.taxLabel} onChange={(value) => updateForm("taxLabel", value)} placeholder="PPN 11%" />
              <MoneyField label="Nominal Pajak" value={form.taxAmount} onChange={(value) => updateForm("taxAmount", value)} />
            </div>

            <TextArea label="Catatan" value={form.notes} onChange={(value) => updateForm("notes", value)} placeholder="Instruksi pembayaran, nomor rekening, atau catatan lain." />
            <TextArea label="Footer" value={form.footer} onChange={(value) => updateForm("footer", value)} />

            <Button type="button" onClick={generateInvoice} disabled={loading || !canGenerate} className="h-12 rounded-xl bg-blue-600 px-6 font-black text-white hover:bg-blue-500">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ReceiptText className="mr-2 h-4 w-4" />}
              Buat Invoice ({invoiceCost} kredit)
            </Button>
          </section>

          <aside className="glass rounded-3xl border border-white/5 p-5 h-fit space-y-5">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-200/35">Preview Ringkas</p>
              <h2 className="mt-2 text-2xl font-black text-white">{form.title || "Invoice"}</h2>
              <p className="mt-1 text-sm text-blue-200/45">Untuk {form.billToName || "Nama penerima"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3 text-sm">
              <SummaryRow label="Subtotal" value={formatRupiah(subtotal)} />
              <SummaryRow label="Diskon" value={`-${formatRupiah(form.discount)}`} />
              <SummaryRow label={form.taxLabel || "Pajak"} value={formatRupiah(form.taxAmount)} />
              <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                <span className="text-blue-200/55 font-bold">Total</span>
                <span className="text-xl font-black text-white">{formatRupiah(total)}</span>
              </div>
            </div>
            {latestInvoice && (
              <a href={`/api/portal/tools/invoice-generator/${latestInvoice.id}/pdf`} target="_blank" className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-black text-white hover:bg-emerald-500">
                <Download className="mr-2 h-4 w-4" />
                Download Invoice Terakhir
              </a>
            )}
          </aside>
        </div>
      )}

      {activeTab === "history" && (
        <section className="glass rounded-3xl border border-white/5 p-5 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Riwayat Invoice</h2>
              <p className="text-sm text-blue-200/45">Invoice yang dibuat dari tool ini tidak terhubung ke payment.</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-200/35" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari invoice..." className="h-10 rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none focus:border-blue-500/45" />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {filteredInvoices.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-blue-200/40 md:col-span-2">Belum ada invoice.</div>
            ) : filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-black text-blue-300">{invoice.invoiceNo}</p>
                    <h3 className="mt-1 font-black text-white">{invoice.title}</h3>
                    <p className="mt-1 text-xs text-blue-200/45">{invoice.billToName} - {fmtDate(invoice.issueDate)}</p>
                  </div>
                  <p className="shrink-0 text-sm font-black text-white">{formatRupiah(invoice.total)}</p>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-blue-200/35">Jatuh tempo: {fmtDate(invoice.dueDate)}</p>
                  <a href={`/api/portal/tools/invoice-generator/${invoice.id}/pdf`} target="_blank" className="inline-flex h-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 text-xs font-black text-emerald-200 hover:bg-emerald-500/15">
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-widest text-blue-200/40">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-blue-500/45" />
    </label>
  );
}

function MoneyField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-widest text-blue-200/40">{label}</span>
      <div className="relative mt-2">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-blue-200/35">Rp</span>
        <input value={moneyInput(value)} onChange={(event) => onChange(parseMoney(event.target.value))} placeholder="0" className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-right text-sm text-white outline-none focus:border-blue-500/45" />
      </div>
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-widest text-blue-200/40">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-blue-500/45" />
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
