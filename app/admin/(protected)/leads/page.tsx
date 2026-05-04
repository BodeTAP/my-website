import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LeadsTable from "./LeadsTable";
import { FadeUp } from "@/components/public/motion";
import { Magnet, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  const newLeadsCount = leads.filter(l => l.status === "NEW").length;

  return (
    <div>
      <FadeUp className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center ring-1 ring-indigo-500/20">
              <Magnet className="w-5 h-5 text-indigo-400" />
            </div>
            Inbox Leads
          </h1>
          <p className="text-blue-200/60 text-sm mt-2">
            Mengelola <strong className="text-indigo-400">{leads.length} prospek</strong>, dengan {newLeadsCount} prospek baru menunggu.
          </p>
        </div>
        <Link href="/admin/leads/finder" className="relative z-10">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <MapPin className="w-4 h-4" /> Cari Calon Klien
          </Button>
        </Link>
      </FadeUp>

      <div className="relative z-10">
        <LeadsTable leads={leads} />
      </div>
    </div>
  );
}
