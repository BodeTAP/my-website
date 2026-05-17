import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseSections } from "@/lib/proposalTemplates";
import { parseProposalDesign } from "@/lib/proposalDesign";
import ProposalDetailClient, { type ProposalDetailView } from "./ProposalDetailClient";

type Props = { params: Promise<{ id: string }> };

export default async function PortalGeneratedProposalDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true, businessName: true } } },
  });
  if (!user?.client) redirect("/portal/dashboard");

  const { id } = await params;
  const proposal = await prisma.generatedProposal.findFirst({
    where: { id, clientId: user.client.id },
  });
  if (!proposal) notFound();

  const contentRecord = proposal.content && typeof proposal.content === "object"
    ? proposal.content as Record<string, unknown>
    : {};
  const title = typeof contentRecord.title === "string" ? contentRecord.title : proposal.title;
  const sections = parseSections(contentRecord.sections);
  const design = parseProposalDesign(proposal.design);

  const view: ProposalDetailView = {
    id: proposal.id,
    proposalNo: proposal.proposalNo,
    title,
    prospectName: proposal.prospectName,
    businessName: proposal.businessName,
    whatsapp: proposal.whatsapp,
    validUntil: proposal.validUntil ? proposal.validUntil.toISOString().slice(0, 10) : null,
    notes: proposal.notes,
    templateName: proposal.templateName,
    status: proposal.status,
    design,
    content: { title, sections },
    createdAt: proposal.createdAt.toISOString(),
    senderBusinessName: user.client.businessName,
  };

  return <ProposalDetailClient proposal={view} />;
}
