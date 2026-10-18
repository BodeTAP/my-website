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
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
              <Wrench className="h-5 w-5 text-slate-700" />
            </div>
            Tools
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Pusat konfigurasi tool portal: prioritas kredit, status fitur, dan template proposal bawaan.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xs">
            <Search className="mb-2 h-4 w-4 text-slate-700" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Tools Aktif</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{activeTools}/3</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xs">
            <Coins className="mb-2 h-4 w-4 text-amber-600" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Warning</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{settings.tool_low_credit_warning_threshold}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xs">
            <FileText className="mb-2 h-4 w-4 text-slate-700" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Template</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{templates.length}</p>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 text-slate-700">
            <BarChart3 className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Proposal Dibuat</p>
          <p className="mt-1 text-2xl font-black text-slate-900 tracking-tight">{proposalCount}</p>
          <p className="mt-1 text-xs text-slate-400">{proposalCreditsUsed} kredit terpakai - semua waktu</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3 text-emerald-700">
            <ReceiptText className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Invoice Dibuat</p>
          <p className="mt-1 text-2xl font-black text-slate-900 tracking-tight">{invoiceStats._count.id}</p>
          <p className="mt-1 text-xs text-slate-400">{invoiceCreditsUsed} kredit terpakai - semua waktu</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-3 text-amber-700">
            <Coins className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Nilai Invoice</p>
          <p className="mt-1 text-2xl font-black text-slate-900 tracking-tight">{formatRupiah(invoiceStats._sum.total ?? 0)}</p>
          <p className="mt-1 text-xs text-slate-400">Dari Invoice Generator - semua waktu</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 text-slate-700">
            <FileText className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Template Proposal</p>
          <p className="mt-1 text-2xl font-black text-slate-900 tracking-tight">{templates.length}</p>
          <p className="mt-1 text-xs text-slate-400">Template bawaan admin</p>
        </div>
      </section>

      <ToolSettingsClient initialSettings={settings} />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Template Proposal</h2>
          <p className="mt-1 text-sm text-slate-500">
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
