import { prisma } from "@/lib/prisma";
import LeadsTable from "./LeadsTable";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Inbox Leads</h1>
        <p className="text-blue-200/50 text-sm mt-1">{leads.length} lead masuk</p>
      </div>
      <LeadsTable leads={leads} />
    </div>
  );
}
