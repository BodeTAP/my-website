import { Coins, FileText, Search, Wrench } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/permissions";
import { ensureDefaultProposalTemplates, parseSections, parseVariables } from "@/lib/proposalTemplates";
import { mergeToolSettingRows, TOOL_SETTING_KEYS } from "@/lib/toolSettings";
import ProposalTemplatesAdminClient from "../proposal-templates/ProposalTemplatesAdminClient";
import ToolSettingsClient from "./ToolSettingsClient";

export default async function AdminToolsPage() {
  await requireModule("proposals");
  await ensureDefaultProposalTemplates();

  const [settingRows, templates] = await Promise.all([
    prisma.siteSetting.findMany({
      where: { key: { in: TOOL_SETTING_KEYS } },
      select: { key: true, value: true },
    }),
    prisma.proposalTemplate.findMany({
      where: { clientId: null, isDefault: true },
      orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    }),
  ]);

  const settings = mergeToolSettingRows(settingRows);
  const activeTools = [
    settings.tool_lead_finder_enabled,
    settings.tool_proposal_generator_enabled,
  ].filter((value) => value === "true").length;

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
            <p className="font-black text-white">{activeTools}/2</p>
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
