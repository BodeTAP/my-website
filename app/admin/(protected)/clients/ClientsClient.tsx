"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  Clock,
  CreditCard,
  FileText,
  Globe2,
  LayoutGrid,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Receipt,
  Search,
  User,
  Wallet,
  X,
} from "lucide-react";
import { FadeUp } from "@/components/public/motion";

type ClientStatus = "ACTIVE" | "FOLLOW_UP" | "INACTIVE" | "CHURNED";
type InvoiceStatus = "UNPAID" | "PAID" | "EXPIRED" | "FAILED";
type HostingStatus = "ACTIVE" | "EXPIRED" | "SUSPENDED";

type Client = {
  id: string;
  businessName: string;
  status: ClientStatus;
  phone: string | null;
  alternatePhone: string | null;
  picName: string | null;
  picRole: string | null;
  billingEmail: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  source: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastContactedAt: string | null;
  user: { name: string | null; email: string };
  accountManager: { id: string; name: string | null; email: string } | null;
  credit: { balance: number; updatedAt: string } | null;
  invoices: Array<{ id: string; amount: number; dueDate: string | null; status: InvoiceStatus }>;
  tickets: Array<{ id: string; status: string }>;
  hostingRecords: Array<{
    id: string;
    domainName: string;
    domainExpiry: string | null;
    hostingExpiry: string | null;
    sslExpiry: string | null;
    status: HostingStatus;
  }>;
  _count: {
    projects: number;
    invoices: number;
    tickets: number;
    hostingRecords: number;
    generatedProposals: number;
    generatedInvoices: number;
    leadFinderLists: number;
  };
};

const STATUS_META: Record<ClientStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Aktif", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  FOLLOW_UP: { label: "Follow-up", className: "border-amber-200 bg-amber-50 text-amber-700" },
  INACTIVE: { label: "Pasif", className: "border-slate-200 bg-slate-100 text-slate-600" },
  CHURNED: { label: "Churned", className: "border-rose-200 bg-rose-50 text-rose-700" },
};

function formatRp(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function daysUntil(value: string | null) {
  if (!value) return null;
  const end = new Date(value).getTime();
  if (Number.isNaN(end)) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((end - now.getTime()) / 86_400_000);
}

function getExpiringCount(client: Client) {
  return client.hostingRecords.reduce((count, record) => {
    const candidates = [record.domainExpiry, record.hostingExpiry, record.sslExpiry];
    return count + candidates.filter((date) => {
      const days = daysUntil(date);
      return days !== null && days >= 0 && days <= 30;
    }).length;
  }, 0);
}

function getOverdueInvoices(client: Client) {
  return client.invoices.filter((invoice) => {
    const days = daysUntil(invoice.dueDate);
    return days !== null && days < 0;
  });
}

function RiskBadge({ tone, children }: { tone: "red" | "amber" | "blue"; children: ReactNode }) {
  const classes = {
    red: "border-rose-200 bg-rose-50 text-rose-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    blue: "border-slate-200 bg-slate-100 text-slate-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono ${classes[tone]}`}>
      {children}
    </span>
  );
}

function PhoneCell({ client }: { client: Client }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(client.phone ?? "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: value }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2 group/phone w-fit">
        {client.phone ? (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5">
            <Phone className="h-3.5 w-3.5 text-slate-600" />
            <span className="font-mono text-xs font-semibold text-slate-900">{client.phone}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-800">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-semibold font-mono">WA kosong</span>
          </div>
        )}
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 shadow-2xs hover:text-slate-900 hover:bg-slate-50 transition-colors"
          title="Edit nomor WhatsApp"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 w-fit">
      <input
        autoFocus
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") void save();
          if (event.key === "Escape") setEditing(false);
        }}
        placeholder="08xxxxxxxxxx"
        className="w-44 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs"
      />
      <button onClick={save} disabled={saving} className="rounded-lg bg-[#1E242E] p-1.5 text-white transition-colors hover:bg-slate-800 disabled:opacity-50 shadow-xs">
        <Check className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => {
          setValue(client.phone ?? "");
          setEditing(false);
        }}
        className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:bg-slate-50 shadow-2xs"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function ClientsClient({ clients }: { clients: Client[] }) {
  const summary = useMemo(() => {
    const noPhone = clients.filter((client) => !client.phone).length;
    const followUp = clients.filter((client) => client.status === "FOLLOW_UP").length;
    const overdue = clients.filter((client) => getOverdueInvoices(client).length > 0).length;
    const expiring = clients.filter((client) => getExpiringCount(client) > 0).length;
    const lowCredit = clients.filter((client) => (client.credit?.balance ?? 0) <= 3).length;
    return { noPhone, followUp, overdue, expiring, lowCredit };
  }, [clients]);

  return (
    <FadeUp delay={0.2} className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryTile icon={Building2} label="Total klien" value={clients.length} />
        <SummaryTile icon={Phone} label="WA kosong" value={summary.noPhone} tone={summary.noPhone > 0 ? "amber" : "default"} />
        <SummaryTile icon={Clock} label="Perlu follow-up" value={summary.followUp} tone={summary.followUp > 0 ? "amber" : "default"} />
        <SummaryTile icon={Receipt} label="Invoice overdue" value={summary.overdue} tone={summary.overdue > 0 ? "red" : "default"} />
        <SummaryTile icon={Globe2} label="Aset 30 hari" value={summary.expiring} tone={summary.expiring > 0 ? "amber" : "default"} />
      </div>

      {summary.noPhone > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-xs">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <h3 className="font-bold text-amber-900 text-sm">{summary.noPhone} klien belum punya nomor WhatsApp</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
              Notifikasi invoice, project update, dan reminder otomatis tidak akan terkirim ke klien ini.
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3.5 text-left text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500">Klien</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500">Kontak</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500">Status & Risiko</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500">Operasional</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
                      <User className="h-6 w-6" />
                    </div>
                    <p className="font-bold text-slate-800 text-sm">Belum ada klien yang terdaftar.</p>
                    <p className="mt-1 text-xs text-slate-400 font-mono">Klien akan muncul setelah dibuat dari portal, invoice, atau onboarding.</p>
                  </td>
                </tr>
              ) : (
                clients.map((client) => {
                  const status = STATUS_META[client.status];
                  const overdue = getOverdueInvoices(client);
                  const expiring = getExpiringCount(client);
                  const creditBalance = client.credit?.balance ?? 0;
                  const lowCredit = creditBalance <= 3;
                  const displayName = client.picName || client.user.name || "Tanpa nama PIC";

                  return (
                    <tr key={client.id} className="group hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-5 align-top">
                        <div className="flex gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-700">
                            <Building2 className="h-5 w-5 text-slate-700" />
                          </div>
                          <div className="min-w-0">
                            <Link href={`/admin/clients/${client.id}`} className="font-bold text-slate-900 transition-colors hover:text-slate-700 text-base">
                              {client.businessName}
                            </Link>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              {displayName}{client.picRole ? ` - ${client.picRole}` : ""}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {client.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-700 font-medium">
                                  {tag}
                                </span>
                              ))}
                              {client.source && (
                                <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-700 font-medium">
                                  {client.source}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5 align-top">
                        <div className="space-y-2">
                          <PhoneCell client={client} />
                          <p className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {client.billingEmail || client.user.email}
                          </p>
                          <p className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {[client.city, client.province].filter(Boolean).join(", ") || client.address || "Lokasi belum diisi"}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-5 align-top">
                        <div className="space-y-2">
                          <span className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider font-mono ${status.className}`}>
                            {status.label}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {!client.phone && <RiskBadge tone="amber">WA kosong</RiskBadge>}
                            {overdue.length > 0 && <RiskBadge tone="red">{overdue.length} overdue</RiskBadge>}
                            {client.tickets.length > 0 && <RiskBadge tone="blue">{client.tickets.length} tiket</RiskBadge>}
                            {expiring > 0 && <RiskBadge tone="amber">{expiring} aset expiring</RiskBadge>}
                            {lowCredit && <RiskBadge tone="amber">kredit rendah</RiskBadge>}
                          </div>
                          <p className="text-xs text-slate-400 font-mono">
                            Update {formatDate(client.updatedAt)}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-5 align-top">
                        <div className="grid grid-cols-3 gap-1.5">
                          <MiniStat icon={Wallet} label="Kredit" value={creditBalance.toString()} tone={lowCredit ? "amber" : "default"} />
                          <MiniStat icon={LayoutGrid} label="Proyek" value={client._count.projects.toString()} />
                          <MiniStat icon={Receipt} label="Invoice" value={client._count.invoices.toString()} />
                          <MiniStat icon={FileText} label="Proposal" value={client._count.generatedProposals.toString()} />
                          <MiniStat icon={CreditCard} label="Dokumen" value={client._count.generatedInvoices.toString()} />
                          <MiniStat icon={Search} label="Lead list" value={client._count.leadFinderLists.toString()} />
                        </div>
                        {overdue.length > 0 && (
                          <p className="mt-2 text-xs font-semibold text-rose-600 font-mono">
                            Outstanding {formatRp(overdue.reduce((sum, invoice) => sum + invoice.amount, 0))}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-5 text-right align-top">
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#1E242E] hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
                        >
                          Detail
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        {client.accountManager && (
                          <p className="mt-2 text-[10px] text-slate-400 font-mono">
                            AM: {client.accountManager.name || client.accountManager.email}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </FadeUp>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone?: "default" | "amber" | "red";
}) {
  const toneClass = {
    default: "border-slate-200 bg-white text-slate-900 shadow-xs",
    amber: "border-amber-200 bg-amber-50/70 text-amber-900 shadow-xs",
    red: "border-rose-200 bg-rose-50/70 text-rose-900 shadow-xs",
  };
  return (
    <div className={`rounded-2xl border p-4 ${toneClass[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">{label}</p>
          <p className="mt-1 text-2xl font-bold font-mono tracking-tight">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
          <Icon className="h-5 w-5 text-current" />
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: "default" | "amber";
}) {
  return (
    <div className={`rounded-xl border px-2.5 py-1.5 shadow-2xs ${tone === "amber" ? "border-amber-200 bg-amber-50/70" : "border-slate-200 bg-slate-50/70"}`}>
      <div className="flex items-center gap-1.5 text-slate-500">
        <Icon className="h-3 w-3" />
        <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">{label}</span>
      </div>
      <p className={`mt-0.5 text-xs font-bold font-mono ${tone === "amber" ? "text-amber-800" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}
