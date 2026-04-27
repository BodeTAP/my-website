import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Download, FileText } from "lucide-react";

function formatRp(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  return "Rp " + n.toLocaleString("id-ID");
}
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

const STATUS_STYLE: Record<string, string> = {
  DRAFT:    "bg-white/10 text-blue-200/70",
  SENT:     "bg-blue-500/15 text-blue-300",
  ACCEPTED: "bg-green-500/15 text-green-300",
  DECLINED: "bg-red-500/15 text-red-300",
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
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Proposal</h1>
          <p className="text-blue-200/50 text-sm mt-1">Kelola proposal & quotation untuk leads.</p>
        </div>
        <Link href="/admin/proposals/new">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm">
            <Plus className="w-4 h-4" /> Buat Proposal
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Proposal", value: stats.total,    color: "text-white" },
          { label: "Terkirim",       value: stats.sent,     color: "text-blue-400" },
          { label: "Diterima",       value: stats.accepted, color: "text-green-400" },
          { label: "Nilai Deal",     value: formatRp(stats.totalValue), color: "text-teal-400" },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-blue-200/50 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {proposals.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-blue-200/20 mx-auto mb-3" />
            <p className="text-blue-200/40 text-sm">Belum ada proposal.</p>
            <Link href="/admin/proposals/new" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block transition-colors">
              Buat proposal pertama →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-blue-200/40 text-xs">
                  <th className="text-left px-5 py-3 font-medium">No. Proposal</th>
                  <th className="text-left px-4 py-3 font-medium">Klien</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Paket</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Tanggal</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {proposals.map(p => (
                  <tr key={p.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/proposals/${p.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs transition-colors">
                        {p.proposalNo}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-white font-medium truncate max-w-[140px]">{p.businessName}</p>
                      <p className="text-blue-200/50 text-xs">{p.clientName}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-blue-200/70 text-xs truncate max-w-[150px]">{p.packageLabel}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <p className="text-white font-bold">{formatRp(p.totalPrice)}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[p.status] ?? ""}`}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell text-blue-200/40 text-xs">
                      {fmtDate(p.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Link href={`/admin/proposals/${p.id}`} className="p-1.5 rounded-lg hover:bg-white/5 text-blue-400/70 hover:text-blue-300 transition-colors" title="Lihat detail">
                          <FileText className="w-4 h-4" />
                        </Link>
                        <a href={`/api/admin/proposals/${p.id}/pdf`} target="_blank" className="p-1.5 rounded-lg hover:bg-white/5 text-blue-400/70 hover:text-blue-300 transition-colors" title="Download PDF">
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
      </div>
    </div>
  );
}
