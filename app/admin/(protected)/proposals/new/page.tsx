import { prisma } from "@/lib/prisma";
import ProposalForm from "@/components/admin/ProposalForm";

export default async function NewProposalPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>;
}) {
  const { leadId } = await searchParams;

  const leads = await prisma.lead.findMany({
    select: { id: true, name: true, businessName: true, whatsapp: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Buat Proposal Baru</h1>
        <p className="text-blue-200/50 text-sm mt-1">Pilih paket dan tambahkan add-on sesuai kebutuhan klien.</p>
      </div>
      <ProposalForm leads={leads} defaultLeadId={leadId} />
    </div>
  );
}
