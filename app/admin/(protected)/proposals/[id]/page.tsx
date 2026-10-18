import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, MessageCircle, Send, ScrollText, User, Briefcase, PlusCircle } from "lucide-react";
import ProposalStatusSelect from "./ProposalStatusSelect";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";

type Params = { params: Promise<{ id: string }> };
type LineItem = { label: string; price: number };

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}
function fmtDate(d: Date | string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
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

export default async function ProposalDetailPage({ params }: Params) {
  const { id } = await params;
  const proposal = await prisma.proposal.findUnique({ where: { id }, include: { lead: true } });
  if (!proposal) notFound();

  const addons      = (proposal.addons      as LineItem[]) ?? [];
  const customItems = (proposal.customItems as LineItem[]) ?? [];

  const WA = process.env.WHATSAPP_NUMBER ?? "6282221682343";
  const waMsg = encodeURIComponent(
    `Halo ${proposal.clientName}, berikut proposal penawaran kami untuk ${proposal.businessName} (${proposal.proposalNo}). ` +
    `Total estimasi investasi: Rp ${proposal.totalPrice.toLocaleString("id-ID")}. Apakah ada pertanyaan mengenai rincian tersebut?`
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <FadeUp className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2 relative">
        <div className="flex items-start gap-4 relative z-10">
          <Link href="/admin/proposals" className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:text-slate-900 shadow-2xs transition-all group shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              {proposal.proposalNo}
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              {proposal.businessName} <span className="opacity-40 mx-1">·</span> {proposal.clientName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap relative z-10">
          <ProposalStatusSelect proposalId={id} currentStatus={proposal.status} />
          
          <a
            href={`/api/admin/proposals/${id}/pdf`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs text-sm font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" /> PDF
          </a>
          
          <a
            href={`https://wa.me/${WA}?text=${waMsg}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs text-sm font-semibold transition-colors"
          >
            <Send className="w-4 h-4" /> Kirim ke Klien
          </a>
          
          <Link
            href={`/admin/proposals/new`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs text-sm font-semibold transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-slate-500" /> Buat Baru
          </Link>
        </div>
      </FadeUp>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Left: detail */}
        <StaggerChildren stagger={0.15} className="lg:col-span-2 space-y-6">
          {/* Header info */}
          <StaggerItem>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs relative overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-2">Status Penawaran</p>
                  <span className={`text-[11px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider border ${STATUS_STYLE[proposal.status] ?? ""}`}>
                    {STATUS_LABEL[proposal.status] ?? proposal.status}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-2">Tanggal Dibuat</p>
                  <p className="text-slate-900 text-sm font-semibold">{fmtDate(proposal.createdAt)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-2">Timeline Pengerjaan</p>
                  <p className="text-slate-900 text-sm font-semibold">{proposal.timeline}</p>
                </div>
                {proposal.validUntil && (
                  <div>
                    <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-2">Berlaku Hingga</p>
                    <p className="text-emerald-700 text-sm font-semibold">{fmtDate(proposal.validUntil)}</p>
                  </div>
                )}
              </div>
            </div>
          </StaggerItem>

          {/* Pricing breakdown */}
          <StaggerItem>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
              <h3 className="text-slate-900 font-bold text-lg mb-6 flex items-center gap-2 relative z-10">
                <ScrollText className="w-5 h-5 text-slate-700" />
                Rincian Tagihan & Layanan
              </h3>
              
              <div className="space-y-4 relative z-10">
                {/* Base package */}
                <div className="flex justify-between items-center py-3 border-b border-slate-100 bg-slate-50/60 px-4 rounded-xl">
                  <div>
                    <p className="text-slate-900 font-bold text-base">{proposal.packageLabel}</p>
                    <p className="text-slate-400 text-xs mt-0.5">Paket Dasar (Base Package)</p>
                  </div>
                  <p className="text-slate-900 font-bold text-lg">{formatRp(proposal.basePrice)}</p>
                </div>
                
                {addons.length > 0 && (
                  <div className="px-2 space-y-3 pt-2">
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Add-ons Tambahan</p>
                    {addons.map((a, i) => (
                      <div key={i} className="flex justify-between items-center py-1">
                        <p className="text-slate-700 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                          {a.label}
                        </p>
                        <p className="text-sky-700 text-sm font-semibold">+{formatRp(a.price)}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {customItems.length > 0 && (
                  <div className="px-2 space-y-3 pt-2">
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Custom Items</p>
                    {customItems.map((c, i) => (
                      <div key={i} className="flex justify-between items-center py-1">
                        <p className="text-slate-700 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          {c.label}
                        </p>
                        <p className="text-purple-700 text-sm font-semibold">+{formatRp(c.price)}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-end pt-6 mt-4 border-t border-slate-100">
                  <div>
                    <p className="text-slate-900 font-bold text-lg">TOTAL INVESTASI</p>
                    <p className="text-slate-400 text-xs mt-0.5">Estimasi keseluruhan nilai proyek</p>
                  </div>
                  <p className="text-slate-900 font-bold text-3xl sm:text-4xl">
                    {formatRp(proposal.totalPrice)}
                  </p>
                </div>
              </div>
            </div>
          </StaggerItem>

          {proposal.notes && (
            <StaggerItem>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <h3 className="text-slate-700 font-bold text-xs mb-3 uppercase tracking-wider">Catatan Tambahan</h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium italic">{proposal.notes}</p>
                </div>
              </div>
            </StaggerItem>
          )}
        </StaggerChildren>

        {/* Right: client info */}
        <StaggerChildren stagger={0.15} delay={0.2} className="space-y-6">
          <StaggerItem>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs relative overflow-hidden">
              <h3 className="text-slate-900 font-bold text-lg mb-6 flex items-center gap-2 relative z-10">
                <User className="w-5 h-5 text-slate-700" />
                Informasi Klien
              </h3>
              
              <div className="space-y-5 relative z-10">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-slate-700 shadow-2xs">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Nama Kontak</p>
                    <p className="text-slate-900 font-bold mt-0.5">{proposal.clientName}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-slate-700 shadow-2xs">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Nama Bisnis</p>
                    <p className="text-slate-900 font-bold mt-0.5">{proposal.businessName}</p>
                  </div>
                </div>
                
                {proposal.whatsapp && (
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-slate-700 shadow-2xs">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Kontak WhatsApp</p>
                      <a
                        href={`https://wa.me/${proposal.whatsapp.replace(/\D/g, "")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-emerald-700 hover:text-emerald-800 font-bold font-mono mt-0.5 inline-block transition-colors"
                      >
                        {proposal.whatsapp}
                      </a>
                    </div>
                  </div>
                )}
                
                {proposal.lead && (
                  <div className="pt-4 border-t border-slate-100 mt-2">
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-2">Sumber Lead Terkait</p>
                    <Link href="/admin/leads" className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 text-sm font-semibold transition-colors bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      Lihat di Inbox Leads →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mb-4 mx-auto border border-emerald-200 shadow-2xs">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h4 className="text-emerald-950 font-bold text-center mb-1">Kirim ke Klien</h4>
              <p className="text-emerald-800 text-xs text-center mb-5 leading-relaxed">
                Proposal sudah siap. Download PDF-nya lalu kirimkan pesan auto-format ini via WhatsApp klien.
              </p>
              
              <a
                href={`https://wa.me/${proposal.whatsapp ? proposal.whatsapp.replace(/\D/g, "") : WA}?text=${waMsg}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" /> Buka WhatsApp Web
              </a>
            </div>
          </StaggerItem>
        </StaggerChildren>
      </div>
    </div>
  );
}
