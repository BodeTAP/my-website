"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Brush, Coins, Download, Eye, FileText, History, ImageIcon, Loader2, Plus, ReceiptText, Save, Search, Trash2, Upload } from "lucide-react";
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

export type GeneratedInvoiceView = {
  id: string;
  invoiceNo: string;
  templateName: string | null;
  title: string;
  billToName: string;
  issueDate: string;
  dueDate: string | null;
  total: number;
  design: InvoiceDesign;
  createdAt: string;
};

type ClientDefaults = {
  businessName: string;
  email: string;
  phone: string;
  address: string;
};

type InvoiceDefaults = {
  dueDays: number;
  footer: string;
  includeTax: boolean;
};

const DESIGN_TEMPLATES: Array<{ value: InvoiceDesign["layout"]; label: string; hint: string; primary: string; accent: string }> = [
  { value: "corporate", label: "Corporate", hint: "Header kuat untuk invoice formal.", primary: "#1d4ed8", accent: "#0d9488" },
  { value: "minimal", label: "Minimal", hint: "Putih bersih, cocok untuk invoice sederhana.", primary: "#0f172a", accent: "#2563eb" },
  { value: "modern", label: "Modern", hint: "Aksen samping dan warna lebih tegas.", primary: "#155e75", accent: "#f59e0b" },
  { value: "premium", label: "Formal", hint: "Nuansa rapi untuk invoice bernilai besar.", primary: "#312e81", accent: "#c026d3" },
];

const FONT_OPTIONS: Array<{ value: InvoiceDesign["fontStyle"]; label: string }> = [
  { value: "sans", label: "Sans" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
];

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
  invoiceDefaults,
  initialDesign,
  clientDefaults,
  initialInvoices,
}: {
  initialBalance: number;
  enabled: boolean;
  invoiceCost: number;
  invoiceDefaults: InvoiceDefaults;
  initialDesign: InvoiceDesign;
  clientDefaults: ClientDefaults;
  initialInvoices: GeneratedInvoiceView[];
}) {
  const router = useRouter();
  const [balance, setBalance] = useState(initialBalance);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [activeTab, setActiveTab] = useState<"create" | "design" | "history">("create");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [savingDesign, setSavingDesign] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [latestInvoice, setLatestInvoice] = useState<GeneratedInvoiceView | null>(initialInvoices[0] ?? null);
  const [design, setDesign] = useState<InvoiceDesign>(initialDesign);

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
    dueDate: addDays(invoiceDefaults.dueDays),
    discount: 0,
    includeTax: invoiceDefaults.includeTax,
    notes: "",
    footer: invoiceDefaults.footer,
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "Layanan website", quantity: 1, price: 1_500_000 },
  ]);

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + Math.round((Number(item.quantity) || 0) * (Number(item.price) || 0)), 0),
    [lineItems],
  );
  const taxableAmount = Math.max(0, subtotal - form.discount);
  const taxAmount = form.includeTax ? Math.round(taxableAmount * 0.11) : 0;
  const total = taxableAmount + taxAmount;
  const canGenerate = enabled && balance >= invoiceCost;
  const filteredInvoices = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return invoices;
    return invoices.filter((invoice) =>
      [invoice.invoiceNo, invoice.title, invoice.billToName].some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [invoices, query]);

  function updateForm(key: keyof typeof form, value: string | number | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateDesign(patch: Partial<InvoiceDesign>) {
    setDesign((current) => ({ ...current, ...patch }));
  }

  function applyDesignTemplate(template: (typeof DESIGN_TEMPLATES)[number]) {
    setDesign((current) => ({
      ...current,
      layout: template.value,
      primaryColor: template.primary,
      accentColor: template.accent,
    }));
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
        body: JSON.stringify({
          ...form,
          lineItems,
          design,
          templateName: DESIGN_TEMPLATES.find((template) => template.value === design.layout)?.label ?? design.layout,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat invoice");

      const invoice: GeneratedInvoiceView = {
        id: data.invoice.id,
        invoiceNo: data.invoice.invoiceNo,
        templateName: data.invoice.templateName ?? null,
        title: data.invoice.title,
        billToName: data.invoice.billToName,
        issueDate: data.invoice.issueDate.slice(0, 10),
        dueDate: data.invoice.dueDate ? data.invoice.dueDate.slice(0, 10) : null,
        total: data.invoice.total,
        design,
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

  async function previewPdf() {
    setPreviewing(true);
    setError("");

    try {
      const res = await fetch("/api/portal/tools/invoice-generator/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lineItems,
          design,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal membuat preview");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat preview");
    } finally {
      setPreviewing(false);
    }
  }

  async function saveDesign() {
    setSavingDesign(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/portal/tools/invoice-generator/design", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(design),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan desain");
      setDesign(data.design);
      setMessage("Template desain invoice berhasil disimpan.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan desain");
    } finally {
      setSavingDesign(false);
    }
  }

  async function uploadLogo(file: File | null) {
    if (!file) return;
    setUploadingLogo(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/portal/tools/invoice-generator/logo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengupload logo");

      setDesign((current) => ({ ...current, logoUrl: data.url, showLogo: true }));
      setMessage("Logo berhasil diupload. Simpan template desain untuk memakai logo ini di invoice berikutnya.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengupload logo");
    } finally {
      setUploadingLogo(false);
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
              <p className="text-blue-200/50 text-sm">Buat invoice PDF mandiri untuk dikirim ke klien.</p>
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
          { id: "design", label: "Template Desain", icon: Brush },
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
          <section className="rounded-2xl border border-white/10 bg-[#071225] p-5 space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-black uppercase tracking-widest text-blue-200/35">Template Desain Aktif</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-black text-white">{DESIGN_TEMPLATES.find((template) => template.value === design.layout)?.label ?? "Custom"}</h2>
                  <p className="mt-1 text-sm text-blue-200/45">PDF invoice akan memakai warna, font, logo, dan visibilitas dari tab desain.</p>
                </div>
                <button type="button" onClick={() => setActiveTab("design")} className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/10 px-4 text-sm font-black text-blue-200 hover:bg-blue-500/15">
                  <Brush className="mr-2 h-4 w-4" />
                  Edit Desain
                </button>
              </div>
            </div>

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

            <div className="grid sm:grid-cols-2 gap-4">
              <MoneyField label="Diskon" value={form.discount} onChange={(value) => updateForm("discount", value)} />
              <Toggle label={`Sertakan PPN 11% (${formatRupiah(taxAmount)})`} checked={form.includeTax} onChange={(checked) => updateForm("includeTax", checked)} />
            </div>

            <TextArea label="Catatan" value={form.notes} onChange={(value) => updateForm("notes", value)} placeholder="Instruksi pembayaran, nomor rekening, atau catatan lain." />
            <TextArea label="Footer" value={form.footer} onChange={(value) => updateForm("footer", value)} />

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" onClick={previewPdf} disabled={previewing || !form.billToName.trim() || lineItems.every((item) => !item.description || item.price <= 0)} className="h-12 rounded-xl border border-white/10 bg-white/10 px-6 font-black text-white hover:bg-white/15">
                {previewing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                Preview PDF
              </Button>
              <Button type="button" onClick={generateInvoice} disabled={loading || !canGenerate} className="h-12 rounded-xl bg-blue-600 px-6 font-black text-white hover:bg-blue-500">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ReceiptText className="mr-2 h-4 w-4" />}
                Buat Invoice ({invoiceCost} kredit)
              </Button>
            </div>
          </section>

          <aside className="rounded-2xl border border-white/10 bg-[#071225] p-5 h-fit space-y-5">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-200/35">Preview Ringkas</p>
              <h2 className="mt-2 text-2xl font-black text-white">{form.title || "Invoice"}</h2>
              <p className="mt-1 text-sm text-blue-200/45">Untuk {form.billToName || "Nama penerima"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3 text-sm">
              <SummaryRow label="Subtotal" value={formatRupiah(subtotal)} />
              <SummaryRow label="Diskon" value={`-${formatRupiah(form.discount)}`} />
              <SummaryRow label="PPN 11%" value={form.includeTax ? formatRupiah(taxAmount) : "Tidak disertakan"} />
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

      {activeTab === "design" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <section className="rounded-2xl border border-white/10 bg-[#071225] p-5 space-y-5">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-200/35">Template</p>
              <h2 className="mt-2 text-xl font-black text-white">Pilih Preset Desain</h2>
              <p className="mt-1 text-sm text-blue-200/45">Preset mengatur layout dan palet awal. Setelah itu tetap bisa diedit manual.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {DESIGN_TEMPLATES.map((template) => {
                const active = design.layout === template.value;
                return (
                  <button
                    key={template.value}
                    type="button"
                    onClick={() => applyDesignTemplate(template)}
                    className={`rounded-2xl border p-4 text-left transition-all ${active ? "border-blue-500/45 bg-blue-500/15" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full border border-white/20" style={{ backgroundColor: template.primary }} />
                      <span className="h-5 w-5 rounded-full border border-white/20" style={{ backgroundColor: template.accent }} />
                    </div>
                    <h3 className="mt-3 font-black text-white">{template.label}</h3>
                    <p className="mt-1 text-sm text-blue-200/45">{template.hint}</p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-black uppercase tracking-widest text-blue-200/35">Logo Invoice</p>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  {design.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={design.logoUrl} alt="Logo invoice" className="h-full w-full object-contain p-2" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-blue-200/35" />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 text-sm font-bold text-white transition-colors hover:bg-white/15">
                    {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload Logo
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      disabled={uploadingLogo}
                      className="hidden"
                      onChange={(event) => {
                        void uploadLogo(event.target.files?.[0] ?? null);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                  {design.logoUrl && (
                    <button
                      type="button"
                      onClick={() => updateDesign({ logoUrl: null })}
                      className="block text-sm font-bold text-red-200/80 hover:text-red-100"
                    >
                      Hapus logo
                    </button>
                  )}
                  <p className="text-xs text-blue-200/35">PNG/JPG maksimal 2MB.</p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Posisi Logo" value={design.logoPosition} onChange={(value) => updateDesign({ logoPosition: value as InvoiceDesign["logoPosition"] })} />
              <ColorField label="Warna Utama" value={design.primaryColor} onChange={(value) => updateDesign({ primaryColor: value })} />
              <ColorField label="Warna Aksen" value={design.accentColor} onChange={(value) => updateDesign({ accentColor: value })} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-200/35">Font</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {FONT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateDesign({ fontStyle: option.value })}
                    className={`rounded-xl border px-4 py-2 text-sm font-black ${design.fontStyle === option.value ? "border-blue-500/45 bg-blue-500/15 text-white" : "border-white/10 bg-white/5 text-blue-200/55"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle label="Tampilkan logo" checked={design.showLogo} onChange={(checked) => updateDesign({ showLogo: checked })} />
              <Toggle label="Tampilkan nomor invoice" checked={design.showInvoiceNo} onChange={(checked) => updateDesign({ showInvoiceNo: checked })} />
              <Toggle label="Tampilkan jatuh tempo" checked={design.showDueDate} onChange={(checked) => updateDesign({ showDueDate: checked })} />
              <Toggle label="Tampilkan pengirim" checked={design.showSender} onChange={(checked) => updateDesign({ showSender: checked })} />
              <Toggle label="Tampilkan penerima" checked={design.showRecipient} onChange={(checked) => updateDesign({ showRecipient: checked })} />
              <Toggle label="Tampilkan footer" checked={design.showFooter} onChange={(checked) => updateDesign({ showFooter: checked })} />
            </div>

            <Button type="button" onClick={saveDesign} disabled={savingDesign} className="h-12 rounded-xl bg-blue-600 px-6 font-black text-white hover:bg-blue-500">
              {savingDesign ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Simpan Template Desain
            </Button>
          </section>

          <aside className="rounded-2xl border border-white/10 bg-[#071225] p-5 h-fit">
            <p className="text-xs font-black uppercase tracking-widest text-blue-200/35">Preview Desain</p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-900">
              <div className={`p-5 ${design.layout === "minimal" ? "bg-white" : ""}`} style={{ backgroundColor: design.layout === "minimal" ? "#ffffff" : design.primaryColor }}>
                <div className={`flex gap-3 ${design.logoPosition === "center" ? "justify-center text-center" : design.logoPosition === "right" ? "justify-between flex-row-reverse text-right" : "justify-between"}`}>
                  <div>
                    {design.showLogo && (
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black text-white" style={{ backgroundColor: design.accentColor }}>
                        LOGO
                      </div>
                    )}
                    {design.showSender && <p className={`font-black ${design.layout === "minimal" ? "text-slate-950" : "text-white"}`}>{form.fromName || clientDefaults.businessName}</p>}
                    <p className={`text-xs ${design.layout === "minimal" ? "text-slate-500" : "text-blue-100"}`}>{form.fromEmail || clientDefaults.email}</p>
                  </div>
                  <div>
                    <p className={`text-2xl font-black ${design.layout === "minimal" ? "text-slate-950" : "text-white"}`}>INVOICE</p>
                    {design.showInvoiceNo && <p className={`text-xs ${design.layout === "minimal" ? "text-slate-500" : "text-blue-100"}`}>IG-YYYYMMDD-001</p>}
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                {design.showRecipient && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ditagihkan Kepada</p>
                    <p className="mt-1 font-black">{form.billToName || "Nama Klien"}</p>
                  </div>
                )}
                <div className="rounded-xl bg-slate-100 p-3 text-sm">
                  <div className="flex justify-between font-bold"><span>Layanan website</span><span>{formatRupiah(1_500_000)}</span></div>
                </div>
                <div className="flex items-center justify-between rounded-xl px-4 py-3 text-white" style={{ backgroundColor: design.primaryColor }}>
                  <span className="text-xs font-black uppercase tracking-widest opacity-70">Total</span>
                  <span className="text-lg font-black">{formatRupiah(total)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {activeTab === "history" && (
        <section className="rounded-2xl border border-white/10 bg-[#071225] p-5 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Riwayat Invoice</h2>
              <p className="text-sm text-blue-200/45">Invoice dari tool ini berupa PDF dan tidak terhubung ke pembayaran online.</p>
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
                  <div className="flex items-center gap-2">
                    <Link href={`/portal/tools/invoice-generator/${invoice.id}`} className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 text-xs font-black text-blue-200 hover:bg-blue-500/15">
                      Detail
                    </Link>
                    <a href={`/api/portal/tools/invoice-generator/${invoice.id}/pdf`} target="_blank" className="inline-flex h-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 text-xs font-black text-emerald-200 hover:bg-emerald-500/15">
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      PDF
                    </a>
                  </div>
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

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-widest text-blue-200/40">{label}</span>
      <div className="mt-2 flex h-11 overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-14 border-0 bg-transparent p-1" />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-bold text-white outline-none" />
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
