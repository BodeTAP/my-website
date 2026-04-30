import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Download, FileText, ScrollText } from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";

function formatRp(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  return "Rp " + n.toLocaleString("id-ID");
}
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

const STATUS_STYLE: Record<string, string> = {
  DRAFT:    "bg-white/10 text-blue-200/70 border-white/10",
  SENT:     "bg-blue-500/15 text-blue-300 border-blue-500/30",
  ACCEPTED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  DECLINED: "bg-red-500/15 text-red-300 border-red-500/30",
};
const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft", SENT: "Terkirim", ACCEPTED: "Diterima", DECLINED: "Ditolak",
};

export default async function ProposalsPage() {
  const proposals = await prisma.proposal.findMany({
    orderBy: { createdAt: "desc" },
    include: { lead: { select: { name: true } } },
  });

  const stats = {
    total:    proposals.length,
    sent:     proposals.filter(p => p.status === "SENT").length,
    accepted: proposals.filter(p => p.status === "ACCEPTED").length,
    totalValue: proposals.filter(p => p.status === "ACCEPTED").reduce((s, p) => s + p.totalPrice, 0),
  };

  return (
    <div>
      <FadeUp className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-600/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center ring-1 ring-teal-500/20">
              <ScrollText className="w-5 h-5 text-teal-400" />
            </div>
            Proposal & Quotation
          </h1>
          <p className="text-blue-200/60 text-sm mt-2">
            Kelola penawaran harga untuk klien dan pantau persentase penutupan (closing) Anda.
          </p>
        </div>
        <Link href="/admin/proposals/new" className="relative z-10 shrink-0">
          <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(13,148,136,0.3)] hover:shadow-[0_0_30px_rgba(13,148,136,0.5)]">
            <Plus className="w-4 h-4" /> Buat Proposal Baru
          </button>
        </Link>
      </FadeUp>

      {/* Stats */}
      <StaggerChildren stagger={0.1} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
        {[
          { label: "Total Proposal", value: stats.total,    color: "from-blue-500 to-cyan-400", bg: "bg-blue-500/5" },
          { label: "Menunggu (Sent)",value: stats.sent,     color: "from-amber-500 to-orange-400", bg: "bg-amber-500/5" },
          { label: "Deal (Diterima)",value: stats.accepted, color: "from-emerald-500 to-teal-400", bg: "bg-emerald-500/5" },
          { label: "Total Nilai Deal",value: formatRp(stats.totalValue), color: "from-purple-500 to-pink-400", bg: "bg-purple-500/5" },
        ].map(s => (
          <StaggerItem key={s.label}>
            <div className={`glass rounded-3xl p-5 border border-white/5 relative overflow-hidden group ${s.bg}`}>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className={`text-3xl font-black bg-gradient-to-br ${s.color} bg-clip-text text-transparent mb-1 drop-shadow-md`}>
                {s.value}
              </p>
              <p className="text-blue-200/50 text-xs font-bold uppercase tracking-wider">{s.label}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>

      {/* Table */}
      <FadeUp delay={0.3} className="glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent pointer-events-none" />
        
        {proposals.length === 0 ? (
          <div className="p-16 text-center relative z-10">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 ring-1 ring-white/10 shadow-inner">
              <FileText className="w-10 h-10 text-blue-200/20" />
            </div>
            <p className="text-blue-200/40 font-medium mb-4">Belum ada proposal yang dibuat.</p>
            <Link href="/admin/proposals/new" className="text-teal-400 hover:text-teal-300 text-sm font-bold inline-flex items-center gap-1 transition-colors bg-teal-500/10 px-4 py-2 rounded-full border border-teal-500/20">
              <Plus className="w-4 h-4" /> Buat proposal pertama
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-6 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider">No. Seri</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider">Klien</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider hidden md:table-cell">Paket</th>
                  <th className="text-right px-6 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider">Total Harga</th>
                  <th className="text-center px-6 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider hidden sm:table-cell">Dibuat</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {proposals.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5">
                      <Link href={`/admin/proposals/${p.id}`} className="inline-block bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-teal-400 hover:text-teal-300 font-mono text-xs font-bold transition-all hover:bg-white/10 hover:shadow-[0_0_10px_rgba(45,212,191,0.2)]">
                        {p.proposalNo}
                      </Link>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-white font-bold truncate max-w-[150px] group-hover:text-teal-300 transition-colors">{p.businessName}</p>
                      <p className="text-blue-200/50 text-xs mt-0.5 truncate max-w-[150px]">{p.clientName}</p>
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                      <p className="text-blue-200/70 text-xs truncate max-w-[160px] font-medium">{p.packageLabel}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-white font-bold">{formatRp(p.totalPrice)}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`text-[10px] px-2.5 py-1.5 rounded-md font-bold uppercase tracking-wider border ${STATUS_STYLE[p.status] ?? ""}`}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 hidden sm:table-cell text-blue-200/50 text-xs font-medium">
                      {fmtDate(p.createdAt)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 justify-end opacity-70 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/proposals/${p.id}`} className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 hover:bg-blue-600/20 hover:border-blue-500/30 hover:text-blue-400 transition-all" title="Buka Detail">
                          <FileText className="w-4 h-4" />
                        </Link>
                        <a href={`/api/admin/proposals/${p.id}/pdf`} target="_blank" className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 hover:bg-emerald-600/20 hover:border-emerald-500/30 hover:text-emerald-400 transition-all" title="Unduh PDF">
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </FadeUp>
    </div>
  );
}
