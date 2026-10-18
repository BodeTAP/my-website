import Link from "next/link";
import { MapPin, ChevronLeft } from "lucide-react";
import { FadeUp } from "@/components/public/motion";
import LeadFinder from "./LeadFinder";

export default function LeadFinderPage() {
  return (
    <div className="space-y-6">
      <FadeUp className="flex items-center gap-4">
        <Link href="/admin/leads"
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors text-xs font-mono">
          <ChevronLeft className="w-4 h-4" /> Kembali ke Inbox Leads
        </Link>
      </FadeUp>

      <FadeUp>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <MapPin className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-px w-6 bg-slate-400" />
              <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                Eksplorasi Prospek
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Cari Calon Klien</h1>
            <p className="text-slate-500 text-sm mt-1">
              Temukan bisnis lokal yang belum punya website dari Google Maps, lalu simpan langsung sebagai lead pipeline.
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
