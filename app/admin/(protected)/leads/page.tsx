import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LeadsTable from "./LeadsTable";
import { FadeUp } from "@/components/public/motion";
import { Magnet, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireModule } from "@/lib/permissions";
import { loadBroadcastSettings } from "@/lib/broadcastSettings.server";

export default async function LeadsPage() {
  await requireModule("leads");

  // Only load aggregate counts server-side — the table fetches paginated data client-side
  const [totalLeads, newLeadsCount, broadcastSettings] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    loadBroadcastSettings(),
  ]);

  return (
    <div className="space-y-6">
      <FadeUp className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-px w-6 bg-slate-400" />
            <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
              Pipeline Prospek
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <Magnet className="w-5 h-5 text-slate-700" />
            </div>
            Inbox Leads
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-normal">
            Mengelola <strong className="text-slate-900 font-semibold">{totalLeads} prospek</strong>, dengan <span className="text-emerald-700 font-medium">{newLeadsCount} prospek baru</span> menunggu tindak lanjut.
          </p>
        </div>
        <Link href="/admin/leads/finder">
          <Button className="bg-[#1E242E] hover:bg-slate-800 text-white gap-2 shadow-xs rounded-xl h-10 px-4 text-xs font-semibold">
            <MapPin className="w-4 h-4" /> Cari Calon Klien
          </Button>
        </Link>
      </FadeUp>

      <div>
        <LeadsTable broadcastSettings={broadcastSettings} />
      </div>
    </div>
  );
}
