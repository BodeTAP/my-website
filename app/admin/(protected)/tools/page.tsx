import { BarChart3, Coins, FileText, ReceiptText, Search, Wrench } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/permissions";
import { ensureDefaultProposalTemplates, parseSections, parseVariables } from "@/lib/proposalTemplates";
import { mergeToolSettingRows, TOOL_SETTING_KEYS } from "@/lib/toolSettings";
import ProposalTemplatesAdminClient from "../proposal-templates/ProposalTemplatesAdminClient";
import ToolSettingsClient from "./ToolSettingsClient";

export default async function AdminToolsPage() {
  await requireModule("proposals");
  await ensureDefaultProposalTemplates();

  const [settingRows, templates, proposalCount, invoiceStats, proposalCreditStats, invoiceCreditStats] = await Promise.all([
    prisma.siteSetting.findMany({
      where: { key: { in: TOOL_SETTING_KEYS } },
      select: { key: true, value: true },
    }),
    prisma.proposalTemplate.findMany({
      where: { clientId: null, isDefault: true },
      orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    }),
    prisma.generatedProposal.count(),
    prisma.generatedInvoice.aggregate({
      _count: { id: true },
      _sum: { total: true },
    }),
    prisma.creditTransaction.aggregate({
      where: { tool: "proposal_generator", type: "USE" },
      _sum: { amount: true },
    }),
    prisma.creditTransaction.aggregate({
      where: { tool: "invoice_generator", type: "USE" },
      _sum: { amount: true },
    }),
  ]);

  const settings = mergeToolSettingRows(settingRows);
  const activeTools = [
    settings.tool_lead_finder_enabled,
    settings.tool_proposal_generator_enabled,
    settings.tool_invoice_generator_enabled,
  ].filter((value) => value === "true").length;
  const proposalCreditsUsed = Math.abs(proposalCreditStats._sum.amount ?? 0);
  const invoiceCreditsUsed = Math.abs(invoiceCreditStats._sum.amount ?? 0);

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-white sm:text-3xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
              <Wrench className="h-5 w-5 text-blue-300" />
            </div>
            Tools
          </h1>
          <p className="mt-2 text-sm text-blue-200/55">
            Pusat konfigurasi tool portal: prioritas kredit, status fitur, dan template proposal bawaan.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
            <Search className="mb-2 h-4 w-4 text-blue-300" />
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200/45">Tools Aktif</p>
            <p className="font-black text-white">{activeTools}/3</p>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
            <Coins className="mb-2 h-4 w-4 text-amber-300" />
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-200/45">Warning</p>
            <p className="font-black text-white">{settings.tool_low_credit_warning_threshold}</p>
          </div>
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
            <FileText className="mb-2 h-4 w-4 text-blue-300" />
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200/45">Template</p>
            <p className="font-black text-white">{templates.length}</p>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
          <BarChart3 className="mb-4 h-5 w-5 text-blue-300" />
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-200/45">Proposal Dibuat</p>
          <p className="mt-1 text-2xl font-black text-white">{proposalCount}</p>
          <p className="mt-1 text-xs font-bold text-blue-200/35">{proposalCreditsUsed} kredit terpakai - semua waktu</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <ReceiptText className="mb-4 h-5 w-5 text-emerald-300" />
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200/45">Invoice Dibuat</p>
          <p className="mt-1 text-2xl font-black text-white">{invoiceStats._count.id}</p>
          <p className="mt-1 text-xs font-bold text-emerald-200/35">{invoiceCreditsUsed} kredit terpakai - semua waktu</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
          <Coins className="mb-4 h-5 w-5 text-amber-300" />
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-200/45">Total Nilai Invoice</p>
          <p className="mt-1 text-2xl font-black text-white">{formatRupiah(invoiceStats._sum.total ?? 0)}</p>
          <p className="mt-1 text-xs font-bold text-amber-200/35">Dari Invoice Generator - semua waktu</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <FileText className="mb-4 h-5 w-5 text-blue-200/70" />
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-200/45">Template Proposal</p>
          <p className="mt-1 text-2xl font-black text-white">{templates.length}</p>
          <p className="mt-1 text-xs font-bold text-blue-200/35">Template bawaan admin</p>
        </div>
      </section>

      <ToolSettingsClient initialSettings={settings} />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-white">Template Proposal</h2>
          <p className="mt-1 text-sm text-blue-200/45">
            Template bawaan yang muncul di Proposal Generator portal klien.
          </p>
        </div>
        <ProposalTemplatesAdminClient
          initialTemplates={templates.map((template) => ({
            id: template.id,
            name: template.name,
            category: template.category,
            description: template.description,
            sections: parseSections(template.sections),
            variables: parseVariables(template.variables),
            isActive: template.isActive,
            createdAt: template.createdAt.toISOString(),
          }))}
        />
      </section>
    </div>
  );
}
