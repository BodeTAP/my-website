import Link from "next/link";
import { MapPin, ChevronLeft } from "lucide-react";
import { FadeUp } from "@/components/public/motion";
import LeadFinder from "./LeadFinder";

export default function LeadFinderPage() {
  return (
    <div className="space-y-6">
      <FadeUp className="flex items-center gap-4">
        <Link href="/admin/leads"
          className="flex items-center gap-1.5 text-blue-200/50 hover:text-white transition-colors text-sm">
          <ChevronLeft className="w-4 h-4" /> Inbox Leads
        </Link>
      </FadeUp>

      <FadeUp>
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center ring-1 ring-indigo-500/20 shrink-0">
            <MapPin className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Cari Calon Klien</h1>
            <p className="text-blue-200/50 text-sm mt-1">
              Temukan bisnis lokal yang belum punya website dari Google Maps, lalu simpan langsung sebagai lead.
            </p>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <LeadFinder />
      </FadeUp>
    </div>
  );
}
