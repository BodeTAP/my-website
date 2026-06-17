import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Coins,
  CreditCard,
  ExternalLink,
  FileText,
  Globe2,
  Inbox,
  LayoutGrid,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Receipt,
  Search,
  ShieldCheck,
  Ticket,
  UserRound,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/permissions";
import ClientProfileForm from "./ClientProfileForm";

type Params = { params: Promise<{ id: string }> };

const STATUS_META = {
  ACTIVE: { label: "Aktif", className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" },
  FOLLOW_UP: { label: "Perlu follow-up", className: "border-amber-500/25 bg-amber-500/10 text-amber-300" },
  INACTIVE: { label: "Pasif", className: "border-white/10 bg-white/5 text-blue-200/60" },
  CHURNED: { label: "Churned", className: "border-red-500/25 bg-red-500/10 text-red-300" },
} as const;

const PROJECT_LABEL = {
  DRAFTING: "Drafting",
  DEVELOPMENT: "Development",
  TESTING: "Testing",
  LIVE: "Live",
} as const;

const INVOICE_LABEL = {
  UNPAID: "Belum bayar",
  PAID: "Lunas",
  EXPIRED: "Expired",
  FAILED: "Gagal",
} as const;

const TICKET_LABEL = {
  OPEN: "Terbuka",
  IN_PROGRESS: "Diproses",
  CLOSED: "Selesai",
} as const;

function formatRp(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function daysUntil(value: Date | string | null | undefined) {
  if (!value) return null;
  const end = new Date(value).getTime();
  if (Number.isNaN(end)) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((end - now.getTime()) / 86_400_000);
}

function latestDate(values: Array<Date | null | undefined>) {
  const times = values.filter(Boolean).map((value) => value!.getTime());
  if (times.length === 0) return null;
  return new Date(Math.max(...times));
}

function statusPill(className: string, label: string) {
  return (
    <span className={`inline-flex rounded-md border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${className}`}>
      {label}
    </span>
  );
}

export default async function AdminClientDetailPage({ params }: Params) {
  await requireModule("clients");
  const { id } = await params;

  const [client, adminUsers, creditUsage] = await Promise.all([
    prisma.client.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            accounts: { select: { provider: true }, orderBy: { provider: "asc" } },
            sessions: { select: { expires: true }, orderBy: { expires: "desc" }, take: 1 },
          },
        },
        accountManager: { select: { id: true, name: true, email: true } },
        credit: true,
        creditTxs: { orderBy: { createdAt: "desc" }, take: 10 },
        projects: { orderBy: { updatedAt: "desc" } },
        invoices: { orderBy: { createdAt: "desc" } },
        tickets: {
          orderBy: { updatedAt: "desc" },
          include: { _count: { select: { messages: true } } },
        },
        hostingRecords: { orderBy: [{ status: "asc" }, { domainExpiry: "asc" }] },
        subscriptions: {
          orderBy: { nextBillingDate: "asc" },
          include: { package: true },
        },
        generatedProposals: {
          orderBy: { createdAt: "desc" },
          take: 8,
          select: { id: true, proposalNo: true, title: true, prospectName: true, businessName: true, status: true, createdAt: true },
        },
        generatedInvoices: {
          orderBy: { createdAt: "desc" },
          take: 8,
          select: { id: true, invoiceNo: true, billToName: true, total: true, status: true, createdAt: true },
        },
        leadFinderLists: {
          orderBy: { createdAt: "desc" },
          take: 8,
          select: { id: true, name: true, query: true, city: true, mode: true, socialScan: true, total: true, createdAt: true },
        },
        proposalBrandKit: true,
        invoiceBrandKit: true,
        onboardings: { orderBy: { createdAt: "desc" }, take: 5 },
        _count: {
          select: {
            projects: true,
            invoices: true,
            tickets: true,
            subscriptions: true,
            hostingRecords: true,
            generatedProposals: true,
            generatedInvoices: true,
            leadFinderLists: true,
            onboardings: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, name: true, email: true },
      orderBy: { email: "asc" },
    }),
    prisma.creditTransaction.aggregate({
      where: { clientId: id, type: "USE" },
      _sum: { amount: true },
      _count: { id: true },
    }),
  ]);

  if (!client) notFound();

  const status = STATUS_META[client.status];
  const now = new Date();
  const unpaidInvoices = client.invoices.filter((invoice) => invoice.status === "UNPAID");
  const overdueInvoices = unpaidInvoices.filter((invoice) => {
    const days = daysUntil(invoice.dueDate);
    return days !== null && days < 0;
  });
  const paidInvoices = client.invoices.filter((invoice) => invoice.status === "PAID");
  const totalPaid = paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalOutstanding = unpaidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const activeProjects = client.projects.filter((project) => project.status !== "LIVE");
  const openTickets = client.tickets.filter((ticket) => ticket.status !== "CLOSED");
  const activeSubscriptions = client.subscriptions.filter((subscription) => subscription.status === "ACTIVE");
  const creditBalance = client.credit?.balance ?? 0;
  const creditsUsed = Math.abs(creditUsage._sum.amount ?? 0);

  const assetExpiries = client.hostingRecords.flatMap((record) => [
    { id: `${record.id}-domain`, type: "Domain", name: record.domainName, date: record.domainExpiry },
    { id: `${record.id}-hosting`, type: "Hosting", name: record.domainName, date: record.hostingExpiry },
    { id: `${record.id}-ssl`, type: "SSL", name: record.domainName, date: record.sslExpiry },
  ]).filter((asset) => {
    const days = daysUntil(asset.date);
    return days !== null && days >= 0 && days <= 30;
  });

  const latestActivity = latestDate([
    client.updatedAt,
    ...client.projects.map((item) => item.updatedAt),
    ...client.invoices.map((item) => item.updatedAt),
    ...client.tickets.map((item) => item.updatedAt),
    ...client.creditTxs.map((item) => item.createdAt),
    ...client.generatedProposals.map((item) => item.createdAt),
    ...client.generatedInvoices.map((item) => item.createdAt),
    ...client.leadFinderLists.map((item) => item.createdAt),
  ]);

  const risks = [
    !client.phone ? "Nomor WhatsApp utama belum diisi." : null,
    !client.address ? "Alamat bisnis belum lengkap." : null,
    creditBalance <= 3 ? "Saldo kredit rendah." : null,
    overdueInvoices.length > 0 ? `${overdueInvoices.length} invoice sudah overdue.` : null,
    openTickets.length > 0 ? `${openTickets.length} tiket masih terbuka.` : null,
    assetExpiries.length > 0 ? `${assetExpiries.length} aset domain/hosting/SSL akan expired dalam 30 hari.` : null,
    !client.proposalBrandKit || !client.invoiceBrandKit ? "Brand kit dokumen belum lengkap." : null,
    client.status === "FOLLOW_UP" ? "Klien ditandai perlu follow-up." : null,
  ].filter(Boolean) as string[];

  const encodedName = encodeURIComponent(client.businessName);
  const loginProvider = client.user.accounts.map((account) => account.provider).join(", ") || "Credentials/email";
  const activeSession = client.user.sessions[0]?.expires ?? null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <Link
            href="/admin/clients"
            className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-blue-100 transition-colors hover:bg-white/10"
            title="Kembali ke daftar klien"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {statusPill(status.className, status.label)}
              {client.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-md border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-200">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="mt-3 text-2xl font-black text-white sm:text-3xl">{client.businessName}</h1>
            <p className="mt-1 text-sm text-blue-200/55">
              {client.picName || client.user.name || "PIC belum diisi"} - {client.user.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <QuickLink href={`/admin/invoices?q=${encodedName}`} icon={<Receipt className="h-4 w-4" />}>Invoice</QuickLink>
          <QuickLink href={`/admin/credits?clientQ=${encodedName}`} icon={<Coins className="h-4 w-4" />}>Kredit</QuickLink>
          <QuickLink href={`/admin/hosting?q=${encodedName}`} icon={<Globe2 className="h-4 w-4" />}>Hosting</QuickLink>
          <QuickLink href={`/admin/tickets?q=${encodedName}`} icon={<Ticket className="h-4 w-4" />}>Tiket</QuickLink>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Metric icon={<Wallet className="h-5 w-5" />} label="Saldo kredit" value={creditBalance.toString()} tone={creditBalance <= 3 ? "amber" : "default"} />
        <Metric icon={<CircleDollarSign className="h-5 w-5" />} label="Outstanding" value={formatRp(totalOutstanding)} tone={totalOutstanding > 0 ? "amber" : "default"} />
        <Metric icon={<AlertCircle className="h-5 w-5" />} label="Overdue" value={overdueInvoices.length.toString()} tone={overdueInvoices.length > 0 ? "red" : "default"} />
        <Metric icon={<LayoutGrid className="h-5 w-5" />} label="Proyek aktif" value={activeProjects.length.toString()} />
        <Metric icon={<MessageSquare className="h-5 w-5" />} label="Tiket terbuka" value={openTickets.length.toString()} tone={openTickets.length > 0 ? "amber" : "default"} />
        <Metric icon={<Clock className="h-5 w-5" />} label="Aktivitas terakhir" value={latestActivity ? formatDate(latestActivity) : "-"} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ClientProfileForm
          client={{
            id: client.id,
            businessName: client.businessName,
            status: client.status,
            picName: client.picName,
            picRole: client.picRole,
            phone: client.phone,
            alternatePhone: client.alternatePhone,
            billingEmail: client.billingEmail,
            address: client.address,
            city: client.city,
            province: client.province,
            preferredContact: client.preferredContact,
            contactHours: client.contactHours,
            source: client.source,
            tags: client.tags,
            internalNotes: client.internalNotes,
            accountManagerId: client.accountManagerId,
            lastContactedAt: client.lastContactedAt?.toISOString() ?? null,
          }}
          adminUsers={adminUsers}
        />

        <div className="space-y-5">
          <Panel title="Health Check" icon={<ShieldCheck className="h-5 w-5" />}>
            {risks.length === 0 ? (
              <EmptyState icon={<CheckCircle2 className="h-6 w-6" />} title="Tidak ada risiko utama" description="Profil, billing, layanan, dan support terlihat aman." />
            ) : (
              <div className="space-y-2">
                {risks.map((risk) => (
                  <div key={risk} className="flex gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-100/85">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Akses Portal" icon={<UserRound className="h-5 w-5" />}>
            <InfoRow icon={<Mail className="h-4 w-4" />} label="Email login" value={client.user.email} />
            <InfoRow icon={<ShieldCheck className="h-4 w-4" />} label="Provider" value={loginProvider} />
            <InfoRow icon={<CalendarClock className="h-4 w-4" />} label="Akun dibuat" value={formatDate(client.user.createdAt)} />
            <InfoRow icon={<Clock className="h-4 w-4" />} label="Sesi aktif sampai" value={activeSession ? formatDateTime(activeSession) : "Tidak ada sesi aktif"} />
            <InfoRow icon={<BriefcaseBusiness className="h-4 w-4" />} label="Account manager" value={client.accountManager?.name || client.accountManager?.email || "Belum ditentukan"} />
          </Panel>

          <Panel title="Kontak Cepat" icon={<Phone className="h-5 w-5" />}>
            <InfoRow icon={<Phone className="h-4 w-4" />} label="WhatsApp" value={client.phone || "Belum diisi"} />
            <InfoRow icon={<Phone className="h-4 w-4" />} label="Alternatif" value={client.alternatePhone || "Belum diisi"} />
            <InfoRow icon={<Mail className="h-4 w-4" />} label="Billing email" value={client.billingEmail || client.user.email} />
            <InfoRow icon={<MapPin className="h-4 w-4" />} label="Lokasi" value={[client.city, client.province].filter(Boolean).join(", ") || client.address || "Belum diisi"} />
          </Panel>
        </div>
      </div>

      <Section title="Billing & Kredit" icon={<Receipt className="h-5 w-5" />}>
        <div className="grid gap-5 lg:grid-cols-3">
          <Panel title="Ringkasan Tagihan">
            <MetricGrid>
              <MiniMetric label="Total invoice" value={client._count.invoices.toString()} />
              <MiniMetric label="Total terbayar" value={formatRp(totalPaid)} />
              <MiniMetric label="Belum bayar" value={formatRp(totalOutstanding)} tone={totalOutstanding > 0 ? "amber" : "default"} />
              <MiniMetric label="Overdue" value={overdueInvoices.length.toString()} tone={overdueInvoices.length > 0 ? "red" : "default"} />
            </MetricGrid>
          </Panel>
          <Panel title="Kredit Tools">
            <MetricGrid>
              <MiniMetric label="Saldo" value={`${creditBalance} kredit`} tone={creditBalance <= 3 ? "amber" : "default"} />
              <MiniMetric label="Total dipakai" value={`${creditsUsed} kredit`} />
              <MiniMetric label="Transaksi pakai" value={creditUsage._count.id.toString()} />
              <MiniMetric label="Update saldo" value={client.credit ? formatDate(client.credit.updatedAt) : "-"} />
            </MetricGrid>
          </Panel>
          <Panel title="Maintenance Aktif">
            {activeSubscriptions.length === 0 ? (
              <EmptyState icon={<CreditCard className="h-6 w-6" />} title="Belum ada maintenance aktif" description="Tambahkan dari menu Maintenance jika klien memakai retainer." />
            ) : (
              <div className="space-y-3">
                {activeSubscriptions.map((subscription) => (
                  <ListRow
                    key={subscription.id}
                    title={subscription.package.name}
                    subtitle={`Next billing ${formatDate(subscription.nextBillingDate)}`}
                    meta={formatRp(subscription.package.price)}
                  />
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Invoice Terbaru">
            {client.invoices.length === 0 ? (
              <EmptyState icon={<Receipt className="h-6 w-6" />} title="Belum ada invoice" description="Invoice admin yang diterbitkan untuk klien akan muncul di sini." />
            ) : (
              <div className="space-y-2">
                {client.invoices.slice(0, 8).map((invoice) => (
                  <ListRow
                    key={invoice.id}
                    title={invoice.invoiceNo}
                    subtitle={`${INVOICE_LABEL[invoice.status]} - jatuh tempo ${formatDate(invoice.dueDate)}`}
                    meta={formatRp(invoice.amount)}
                    href={`/admin/invoices?q=${encodeURIComponent(invoice.invoiceNo)}`}
                    tone={invoice.status === "UNPAID" ? "amber" : invoice.status === "PAID" ? "green" : "red"}
                  />
                ))}
              </div>
            )}
          </Panel>
          <Panel title="Riwayat Kredit">
            {client.creditTxs.length === 0 ? (
              <EmptyState icon={<Coins className="h-6 w-6" />} title="Belum ada transaksi kredit" description="Topup, bonus, refund, dan pemakaian tools akan muncul di sini." />
            ) : (
              <div className="space-y-2">
                {client.creditTxs.map((tx) => (
                  <ListRow
                    key={tx.id}
                    title={tx.description}
                    subtitle={`${tx.type}${tx.tool ? ` - ${tx.tool}` : ""} - ${formatDateTime(tx.createdAt)}`}
                    meta={`${tx.amount > 0 ? "+" : ""}${tx.amount}`}
                    tone={tx.amount < 0 ? "amber" : "green"}
                  />
                ))}
              </div>
            )}
          </Panel>
        </div>
      </Section>

      <Section title="Layanan Aktif" icon={<Globe2 className="h-5 w-5" />}>
        <div className="grid gap-5 lg:grid-cols-3">
          <Panel title="Proyek">
            {client.projects.length === 0 ? (
              <EmptyState icon={<LayoutGrid className="h-6 w-6" />} title="Belum ada proyek" description="Proyek dari admin akan tampil sebagai riwayat layanan klien." />
            ) : (
              <div className="space-y-2">
                {client.projects.slice(0, 6).map((project) => (
                  <ListRow
                    key={project.id}
                    title={project.name}
                    subtitle={`${PROJECT_LABEL[project.status]} - deadline ${formatDate(project.deadline)}`}
                    meta={formatDate(project.updatedAt)}
                    href="/admin/projects"
                    tone={project.status === "LIVE" ? "green" : "blue"}
                  />
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Hosting, Domain, SSL">
            {client.hostingRecords.length === 0 ? (
              <EmptyState icon={<Globe2 className="h-6 w-6" />} title="Belum ada aset hosting" description="Domain, hosting, dan SSL klien bisa ditambahkan dari menu Hosting." />
            ) : (
              <div className="space-y-2">
                {client.hostingRecords.map((record) => {
                  const nearest = [record.domainExpiry, record.hostingExpiry, record.sslExpiry]
                    .filter(Boolean)
                    .sort((a, b) => a!.getTime() - b!.getTime())[0] ?? null;
                  const days = daysUntil(nearest);
                  return (
                    <ListRow
                      key={record.id}
                      title={record.domainName}
                      subtitle={`Domain ${formatDate(record.domainExpiry)} - Hosting ${formatDate(record.hostingExpiry)} - SSL ${formatDate(record.sslExpiry)}`}
                      meta={days === null ? record.status : `${days} hari`}
                      href={`/admin/hosting?q=${encodeURIComponent(record.domainName)}`}
                      tone={days !== null && days <= 30 ? "amber" : record.status === "ACTIVE" ? "green" : "red"}
                    />
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel title="Onboarding">
            {client.onboardings.length === 0 ? (
              <EmptyState icon={<Inbox className="h-6 w-6" />} title="Belum ada onboarding" description="Form onboarding yang terhubung ke klien akan tampil di sini." />
            ) : (
              <div className="space-y-2">
                {client.onboardings.map((form) => (
                  <ListRow
                    key={form.id}
                    title={form.businessName || client.businessName}
                    subtitle={`${form.status} - ${form.websiteType || "Tipe website belum diisi"}`}
                    meta={formatDate(form.updatedAt)}
                    href="/admin/onboarding"
                    tone={form.status === "COMPLETED" ? "green" : "amber"}
                  />
                ))}
              </div>
            )}
          </Panel>
        </div>
      </Section>

      <Section title="Tools Portal" icon={<FileText className="h-5 w-5" />}>
        <div className="grid gap-5 lg:grid-cols-3">
          <Panel title="Proposal Generator">
            <MetricGrid>
              <MiniMetric label="Total proposal" value={client._count.generatedProposals.toString()} />
              <MiniMetric label="Brand kit" value={client.proposalBrandKit ? "Siap" : "Belum"} tone={client.proposalBrandKit ? "green" : "amber"} />
            </MetricGrid>
            <RecentTools items={client.generatedProposals.map((item) => ({
              id: item.id,
              title: item.proposalNo || item.title,
              subtitle: item.businessName || item.prospectName || "Tanpa prospek",
              date: item.createdAt,
            }))} emptyIcon={<FileText className="h-6 w-6" />} emptyTitle="Belum ada proposal portal" />
          </Panel>

          <Panel title="Invoice Generator">
            <MetricGrid>
              <MiniMetric label="Total invoice" value={client._count.generatedInvoices.toString()} />
              <MiniMetric label="Brand kit" value={client.invoiceBrandKit ? "Siap" : "Belum"} tone={client.invoiceBrandKit ? "green" : "amber"} />
            </MetricGrid>
            <RecentTools items={client.generatedInvoices.map((item) => ({
              id: item.id,
              title: item.invoiceNo,
              subtitle: `${item.billToName} - ${formatRp(item.total)}`,
              date: item.createdAt,
            }))} emptyIcon={<CreditCard className="h-6 w-6" />} emptyTitle="Belum ada invoice portal" />
          </Panel>

          <Panel title="Lead Finder">
            <MetricGrid>
              <MiniMetric label="List tersimpan" value={client._count.leadFinderLists.toString()} />
              <MiniMetric label="Total leads" value={client.leadFinderLists.reduce((sum, list) => sum + list.total, 0).toString()} />
            </MetricGrid>
            <RecentTools items={client.leadFinderLists.map((list) => ({
              id: list.id,
              title: list.name,
              subtitle: `${list.query}${list.city ? ` di ${list.city}` : ""} - ${list.total} leads`,
              date: list.createdAt,
            }))} emptyIcon={<Search className="h-6 w-6" />} emptyTitle="Belum ada lead list" />
          </Panel>
        </div>
      </Section>

      <Section title="Support" icon={<Ticket className="h-5 w-5" />}>
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Tiket Support">
            {client.tickets.length === 0 ? (
              <EmptyState icon={<Ticket className="h-6 w-6" />} title="Belum ada tiket" description="Percakapan support dari portal akan muncul di sini." />
            ) : (
              <div className="space-y-2">
                {client.tickets.slice(0, 8).map((ticket) => (
                  <ListRow
                    key={ticket.id}
                    title={ticket.subject}
                    subtitle={`${TICKET_LABEL[ticket.status]} - ${ticket._count.messages} pesan`}
                    meta={formatDateTime(ticket.updatedAt)}
                    href={`/admin/tickets/${ticket.id}`}
                    tone={ticket.status === "CLOSED" ? "green" : "amber"}
                  />
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Aktivitas Follow-up">
            <InfoRow icon={<Clock className="h-4 w-4" />} label="Terakhir dihubungi" value={formatDateTime(client.lastContactedAt)} />
            <InfoRow icon={<CalendarClock className="h-4 w-4" />} label="Klien dibuat" value={formatDateTime(client.createdAt)} />
            <InfoRow icon={<Clock className="h-4 w-4" />} label="Profil diupdate" value={formatDateTime(client.updatedAt)} />
            <InfoRow icon={<BriefcaseBusiness className="h-4 w-4" />} label="Sumber klien" value={client.source || "Belum diisi"} />
            <InfoRow icon={<MessageSquare className="h-4 w-4" />} label="Preferensi kontak" value={client.preferredContact} />
            <InfoRow icon={<Clock className="h-4 w-4" />} label="Jam kontak" value={client.contactHours || "Belum diisi"} />
          </Panel>
        </div>
      </Section>

      <p className="pb-4 text-xs text-blue-200/30">
        Data dihitung pada {formatDateTime(now)} dari relasi invoice, proyek, hosting, tiket, kredit, dan aktivitas tools portal.
      </p>
    </div>
  );
}

function QuickLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-blue-100 transition-colors hover:bg-white/10"
    >
      {icon}
      {children}
    </Link>
  );
}

function Metric({ icon, label, value, tone = "default" }: { icon: ReactNode; label: string; value: string; tone?: "default" | "amber" | "red" }) {
  const className = {
    default: "border-white/10 bg-[#071225] text-white",
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-200",
    red: "border-red-500/25 bg-red-500/10 text-red-200",
  }[tone];

  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-200/45">{label}</p>
          <p className="mt-1 text-xl font-black">{value}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-current">{icon}</div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-sky-300">{icon}</div>
        <h2 className="text-xl font-black text-white">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Panel({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#071225] p-5">
      <div className="mb-4 flex items-center gap-2">
        {icon ? <div className="text-sky-300">{icon}</div> : null}
        <h3 className="font-black text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function MetricGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function MiniMetric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "amber" | "red" | "green" }) {
  const className = {
    default: "border-white/10 bg-white/[0.03] text-white",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-200",
    red: "border-red-500/20 bg-red-500/10 text-red-200",
    green: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  }[tone];

  return (
    <div className={`rounded-lg border p-3 ${className}`}>
      <p className="text-[11px] font-bold uppercase tracking-wide text-blue-200/45">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-white/5 py-3 first:pt-0 last:border-0 last:pb-0">
      <div className="mt-0.5 text-blue-200/40">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-blue-200/40">{label}</p>
        <p className="mt-0.5 break-words text-sm font-semibold text-blue-100/80">{value}</p>
      </div>
    </div>
  );
}

function ListRow({
  title,
  subtitle,
  meta,
  href,
  tone = "default",
}: {
  title: string;
  subtitle: string;
  meta?: string;
  href?: string;
  tone?: "default" | "blue" | "amber" | "red" | "green";
}) {
  const dotClass = {
    default: "bg-white/30",
    blue: "bg-sky-400",
    amber: "bg-amber-400",
    red: "bg-red-400",
    green: "bg-emerald-400",
  }[tone];
  const content = (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.05]">
      <div className="flex min-w-0 gap-3">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{title}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-blue-200/45">{subtitle}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-right">
        {meta ? <span className="text-xs font-bold text-blue-100/65">{meta}</span> : null}
        {href ? <ExternalLink className="h-3.5 w-3.5 text-blue-200/35" /> : null}
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5 text-center">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-blue-200/40">
        {icon}
      </div>
      <p className="font-bold text-blue-100">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-blue-200/40">{description}</p>
    </div>
  );
}

function RecentTools({
  items,
  emptyIcon,
  emptyTitle,
}: {
  items: Array<{ id: string; title: string; subtitle: string; date: Date; href?: string }>;
  emptyIcon: ReactNode;
  emptyTitle: string;
}) {
  if (items.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description="Aktivitas terbaru akan muncul setelah klien memakai tool ini." />;
  }

  return (
    <div className="mt-4 space-y-2">
      {items.slice(0, 5).map((item) => (
        <ListRow
          key={item.id}
          title={item.title}
          subtitle={item.subtitle}
          meta={formatDate(item.date)}
          href={item.href}
          tone="blue"
        />
      ))}
    </div>
  );
}
