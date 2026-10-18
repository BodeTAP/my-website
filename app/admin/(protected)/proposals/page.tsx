import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Download, FileText, ScrollText } from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";
import { requireModule } from "@/lib/permissions";

function formatRp(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  return "Rp " + n.toLocaleString("id-ID");
}
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

const STATUS_STYLE: Record<string, string> = {
  DRAFT:    "bg-slate-100 text-slate-600 border-slate-200",
  SENT:     "bg-sky-50 text-sky-700 border-sky-200",
  ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DECLINED: "bg-rose-50 text-rose-700 border-rose-200",
};
const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft", SENT: "Terkirim", ACCEPTED: "Diterima", DECLINED: "Ditolak",
};

export default async function ProposalsPage() {
  await requireModule("proposals");
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
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
              <ScrollText className="w-5 h-5 text-slate-700" />
            </div>
            Proposal & Quotation
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Kelola penawaran harga untuk klien dan pantau persentase penutupan (closing) Anda.
          </p>
        </div>
        <Link href="/admin/proposals/new" className="relative z-10 shrink-0">
          <button className="flex items-center gap-2 bg-[#1E242E] hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-xs">
            <Plus className="w-4 h-4" /> Buat Proposal Baru
          </button>
        </Link>
      </FadeUp>

      {/* Stats */}
      <StaggerChildren stagger={0.1} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
        {[
          { label: "Total Proposal", value: stats.total },
          { label: "Menunggu (Sent)", value: stats.sent },
          { label: "Deal (Diterima)", value: stats.accepted },
          { label: "Total Nilai Deal", value: formatRp(stats.totalValue) },
        ].map(s => (
          <StaggerItem key={s.label}>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <p className="text-3xl font-bold text-slate-900 mb-1">
                {s.value}
              </p>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{s.label}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>

      {/* Table */}
      <FadeUp delay={0.3} className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden relative z-10">
        {proposals.length === 0 ? (
          <div className="p-16 text-center relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-2xs text-slate-400">
              <FileText className="w-7 h-7" />
            </div>
            <p className="text-slate-500 font-medium text-sm mb-4">Belum ada proposal yang dibuat.</p>
            <Link href="/admin/proposals/new" className="text-slate-700 hover:text-slate-900 text-sm font-semibold inline-flex items-center gap-1.5 transition-colors bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl">
              <Plus className="w-4 h-4" /> Buat proposal pertama
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">No. Seri</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Klien</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Paket</th>
                  <th className="text-right px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Total Harga</th>
                  <th className="text-center px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Dibuat</th>
                  <th className="px-6 py-3.5 text-right text-slate-400 font-semibold text-xs uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proposals.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <Link href={`/admin/proposals/${p.id}`} className="inline-block bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:text-slate-900 font-mono text-xs font-semibold transition-colors">
                        {p.proposalNo}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900 font-semibold truncate max-w-[150px]">{p.businessName}</p>
                      <p className="text-slate-400 text-xs mt-0.5 truncate max-w-[150px]">{p.clientName}</p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-slate-600 text-xs truncate max-w-[160px] font-medium">{p.packageLabel}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-slate-900 font-bold">{formatRp(p.totalPrice)}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border ${STATUS_STYLE[p.status] ?? ""}`}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell text-slate-500 text-xs font-medium">
                      {fmtDate(p.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 justify-end opacity-70 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/proposals/${p.id}`} className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors" title="Buka Detail">
                          <FileText className="w-4 h-4" />
                        </Link>
                        <a href={`/api/admin/proposals/${p.id}/pdf`} target="_blank" className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors" title="Unduh PDF">
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
