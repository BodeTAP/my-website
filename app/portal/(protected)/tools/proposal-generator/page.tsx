import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getClientBalance } from "@/lib/credits";
import { prisma } from "@/lib/prisma";
import {
  getVisibleProposalTemplates,
  parseSections,
  parseVariables,
  type GeneratedProposalContent,
} from "@/lib/proposalTemplates";
import ProposalGeneratorClient from "./ProposalGeneratorClient";

export default async function PortalProposalGeneratorPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true } } },
  });
  if (!user?.client) redirect("/portal/dashboard");

  const [balance, templates, proposals] = await Promise.all([
    getClientBalance(user.client.id),
    getVisibleProposalTemplates(user.client.id),
    prisma.generatedProposal.findMany({
      where: { clientId: user.client.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <ProposalGeneratorClient
      initialBalance={balance}
      initialTemplates={templates.map((template) => ({
        id: template.id,
        name: template.name,
        category: template.category,
        description: template.description,
        sections: parseSections(template.sections),
        variables: parseVariables(template.variables),
        isDefault: template.isDefault,
        createdAt: template.createdAt.toISOString(),
      }))}
      initialProposals={proposals.map((proposal) => ({
        id: proposal.id,
        title: proposal.title,
        prospectName: proposal.prospectName,
        templateName: proposal.templateName,
        status: proposal.status,
        content: proposal.content as unknown as GeneratedProposalContent,
        createdAt: proposal.createdAt.toISOString(),
      }))}
    />
  );
}
