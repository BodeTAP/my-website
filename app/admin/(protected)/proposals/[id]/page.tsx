import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, MessageCircle, FileText, Send, ScrollText, User, Briefcase, Calendar, PlusCircle } from "lucide-react";
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
  DRAFT:    "bg-white/10 text-blue-200/70 border-white/10",
  SENT:     "bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]",
  ACCEPTED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
  DECLINED: "bg-red-500/15 text-red-300 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
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
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-teal-600/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-start gap-4 relative z-10">
          <Link href="/admin/proposals" className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-blue-400/80 hover:text-blue-300 transition-all group shrink-0">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent flex items-center gap-3">
              {proposal.proposalNo}
            </h1>
            <p className="text-blue-200/60 font-medium mt-1">
              {proposal.businessName} <span className="opacity-40 mx-1">·</span> {proposal.clientName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap relative z-10">
          <ProposalStatusSelect proposalId={id} currentStatus={proposal.status} />
          
          <a
            href={`/api/admin/proposals/${id}/pdf`}
            target="_blank"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-300 text-sm font-semibold transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          >
            <Download className="w-4 h-4" /> PDF
          </a>
          
          <a
            href={`https://wa.me/${WA}?text=${waMsg}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/50 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] text-sm font-semibold transition-all"
          >
            <Send className="w-4 h-4" /> Kirim ke Klien
          </a>
          
          <Link
            href={`/admin/proposals/new`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-white/10 text-blue-200/60 hover:text-white text-sm font-semibold transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Buat Baru
          </Link>
        </div>
      </FadeUp>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Left: detail */}
        <StaggerChildren stagger={0.15} className="lg:col-span-2 space-y-6">
          {/* Header info */}
          <StaggerItem>
            <div className="glass rounded-3xl p-6 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] pointer-events-none" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <p className="text-blue-200/50 text-[11px] font-bold uppercase tracking-wider mb-2">Status Penawaran</p>
                  <span className={`text-[11px] px-3 py-1.5 rounded-lg font-black uppercase tracking-wider border ${STATUS_STYLE[proposal.status] ?? ""}`}>
                    {STATUS_LABEL[proposal.status] ?? proposal.status}
                  </span>
                </div>
                <div>
                  <p className="text-blue-200/50 text-[11px] font-bold uppercase tracking-wider mb-2">Tanggal Dibuat</p>
                  <p className="text-white text-sm font-semibold">{fmtDate(proposal.createdAt)}</p>
                </div>
                <div>
                  <p className="text-blue-200/50 text-[11px] font-bold uppercase tracking-wider mb-2">Timeline Pengerjaan</p>
                  <p className="text-white text-sm font-semibold">{proposal.timeline}</p>
                </div>
                {proposal.validUntil && (
                  <div>
                    <p className="text-blue-200/50 text-[11px] font-bold uppercase tracking-wider mb-2">Berlaku Hingga</p>
                    <p className="text-emerald-400 text-sm font-semibold">{fmtDate(proposal.validUntil)}</p>
                  </div>
                )}
              </div>
            </div>
          </StaggerItem>

          {/* Pricing breakdown */}
          <StaggerItem>
            <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] pointer-events-none" />
              
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2 relative z-10">
                <ScrollText className="w-5 h-5 text-emerald-400" />
                Rincian Tagihan & Layanan
              </h3>
              
              <div className="space-y-4 relative z-10">
                {/* Base package */}
                <div className="flex justify-between items-center py-3 border-b border-white/10 bg-black/20 px-4 rounded-2xl">
                  <div>
                    <p className="text-white font-bold text-base">{proposal.packageLabel}</p>
                    <p className="text-blue-200/40 text-xs mt-0.5">Paket Dasar (Base Package)</p>
                  </div>
                  <p className="text-white font-black text-lg">{formatRp(proposal.basePrice)}</p>
                </div>
                
                {addons.length > 0 && (
                  <div className="px-2 space-y-3 pt-2">
                    <p className="text-blue-200/40 text-[10px] font-bold uppercase tracking-wider mb-1">Add-ons Tambahan</p>
                    {addons.map((a, i) => (
                      <div key={i} className="flex justify-between items-center py-1">
                        <p className="text-blue-200/80 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                          {a.label}
                        </p>
                        <p className="text-blue-400 text-sm font-bold">+{formatRp(a.price)}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {customItems.length > 0 && (
                  <div className="px-2 space-y-3 pt-2">
                    <p className="text-blue-200/40 text-[10px] font-bold uppercase tracking-wider mb-1">Custom Items</p>
                    {customItems.map((c, i) => (
                      <div key={i} className="flex justify-between items-center py-1">
                        <p className="text-blue-200/80 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
                          {c.label}
                        </p>
                        <p className="text-purple-400 text-sm font-bold">+{formatRp(c.price)}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-end pt-6 mt-4 border-t border-white/10">
                  <div>
                    <p className="text-white font-black text-lg">TOTAL INVESTASI</p>
                    <p className="text-blue-200/40 text-xs mt-0.5">Estimasi keseluruhan nilai proyek</p>
                  </div>
                  <p className="text-white font-black text-3xl sm:text-4xl bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent drop-shadow-md">
                    {formatRp(proposal.totalPrice)}
                  </p>
                </div>
              </div>
            </div>
          </StaggerItem>

          {proposal.notes && (
            <StaggerItem>
              <div className="glass rounded-3xl p-6 border border-white/5 bg-[#0a1628]/50">
                <h3 className="text-blue-200/80 font-bold text-sm mb-3 uppercase tracking-wider">Catatan Tambahan</h3>
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                  <p className="text-blue-200/60 text-sm leading-relaxed whitespace-pre-line font-medium italic">{proposal.notes}</p>
                </div>
              </div>
            </StaggerItem>
          )}
        </StaggerChildren>

        {/* Right: client info */}
        <StaggerChildren stagger={0.15} delay={0.2} className="space-y-6">
          <StaggerItem>
            <div className="glass rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none opacity-50" />
              
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2 relative z-10">
                <User className="w-5 h-5 text-blue-400" />
                Informasi Klien
              </h3>
              
              <div className="space-y-5 relative z-10">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-blue-200/40 text-[10px] font-bold uppercase tracking-wider">Nama Kontak</p>
                    <p className="text-white font-bold mt-0.5">{proposal.clientName}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                    <Briefcase className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-blue-200/40 text-[10px] font-bold uppercase tracking-wider">Nama Bisnis</p>
                    <p className="text-white font-bold mt-0.5">{proposal.businessName}</p>
                  </div>
                </div>
                
                {proposal.whatsapp && (
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <MessageCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-blue-200/40 text-[10px] font-bold uppercase tracking-wider">Kontak WhatsApp</p>
                      <a
                        href={`https://wa.me/${proposal.whatsapp.replace(/\D/g, "")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 font-bold font-mono mt-0.5 inline-block transition-colors"
                      >
                        {proposal.whatsapp}
                      </a>
                    </div>
                  </div>
                )}
                
                {proposal.lead && (
                  <div className="pt-4 border-t border-white/10 mt-2">
                    <p className="text-blue-200/40 text-[10px] font-bold uppercase tracking-wider mb-2">Sumber Lead Terkait</p>
                    <Link href="/admin/leads" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                      Lihat di Inbox Leads →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="glass rounded-3xl p-6 border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-transparent">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mb-4 mx-auto border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h4 className="text-white font-bold text-center mb-2">Kirim ke Klien</h4>
              <p className="text-emerald-200/60 text-xs text-center mb-5 leading-relaxed">
                Proposal sudah siap. Download PDF-nya lalu kirimkan pesan auto-format ini via WhatsApp klien.
              </p>
              
              <a
                href={`https://wa.me/${proposal.whatsapp ? proposal.whatsapp.replace(/\D/g, "") : WA}?text=${waMsg}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
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
