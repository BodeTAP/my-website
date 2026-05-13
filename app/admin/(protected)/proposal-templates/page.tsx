import { FileText } from "lucide-react";
import { requireModule } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { ensureDefaultProposalTemplates, parseSections, parseVariables } from "@/lib/proposalTemplates";
import ProposalTemplatesAdminClient from "./ProposalTemplatesAdminClient";

export default async function AdminProposalTemplatesPage() {
  await requireModule("proposals");
  await ensureDefaultProposalTemplates();

  const templates = await prisma.proposalTemplate.findMany({
    where: { clientId: null, isDefault: true },
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/20">
              <FileText className="w-5 h-5 text-blue-300" />
            </div>
            Template Proposal
          </h1>
          <p className="text-blue-200/55 text-sm mt-2">
            Kelola template bawaan yang tersedia untuk klien di Proposal Generator.
          </p>
        </div>
        <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 px-4 py-3">
          <p className="text-blue-200/50 text-[10px] uppercase tracking-widest font-black">Total</p>
          <p className="text-white font-black">{templates.length} template</p>
        </div>
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
    </div>
  );
}

