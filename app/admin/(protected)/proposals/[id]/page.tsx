import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, MessageCircle, FileText } from "lucide-react";
import ProposalStatusSelect from "./ProposalStatusSelect";

type Params = { params: Promise<{ id: string }> };
type LineItem = { label: string; price: number };

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}
function fmtDate(d: Date | string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
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

export default async function ProposalDetailPage({ params }: Params) {
  const { id } = await params;
  const proposal = await prisma.proposal.findUnique({ where: { id }, include: { lead: true } });
  if (!proposal) notFound();

  const addons      = (proposal.addons      as LineItem[]) ?? [];
  const customItems = (proposal.customItems as LineItem[]) ?? [];

  const WA = process.env.WHATSAPP_NUMBER ?? "6282221682343";
  const waMsg = encodeURIComponent(
    `Halo ${proposal.clientName}, berikut proposal kami untuk ${proposal.businessName} (${proposal.proposalNo}). ` +
    `Total estimasi: Rp ${proposal.totalPrice.toLocaleString("id-ID")}. Apakah ada pertanyaan?`
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link href="/admin/proposals" className="text-blue-400/70 hover:text-blue-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white">{proposal.proposalNo}</h1>
          <p className="text-blue-200/50 text-sm">{proposal.businessName} · {proposal.clientName}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ProposalStatusSelect proposalId={id} currentStatus={proposal.status} />
          <a
            href={`https://wa.me/${WA}?text=${waMsg}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600/20 border border-green-500/30 text-green-300 hover:bg-green-600/30 text-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> Kirim WA
          </a>
          <a
            href={`/api/admin/proposals/${id}/pdf`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 text-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Download PDF
          </a>
          <Link
            href={`/admin/proposals/new`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-blue-200/60 hover:text-white text-sm transition-colors"
          >
            <FileText className="w-4 h-4" /> Proposal Baru
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: detail */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header info */}
          <div className="glass rounded-2xl p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-blue-200/40 text-xs mb-1">Status</p>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[proposal.status] ?? ""}`}>
                  {STATUS_LABEL[proposal.status] ?? proposal.status}
                </span>
              </div>
              <div>
                <p className="text-blue-200/40 text-xs mb-1">Dibuat</p>
                <p className="text-white text-sm font-medium">{fmtDate(proposal.createdAt)}</p>
              </div>
              <div>
                <p className="text-blue-200/40 text-xs mb-1">Timeline</p>
                <p className="text-white text-sm font-medium">{proposal.timeline}</p>
              </div>
              {proposal.validUntil && (
                <div>
                  <p className="text-blue-200/40 text-xs mb-1">Berlaku Hingga</p>
                  <p className="text-white text-sm font-medium">{fmtDate(proposal.validUntil)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4">Rincian Harga</h3>
            <div className="space-y-2.5">
              {/* Base package */}
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <div>
                  <p className="text-white font-medium text-sm">{proposal.packageLabel}</p>
                  <p className="text-blue-200/40 text-xs">Paket Dasar</p>
                </div>
                <p className="text-white font-bold">{formatRp(proposal.basePrice)}</p>
              </div>
              {addons.map((a, i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <p className="text-blue-200/70 text-sm">+ {a.label}</p>
                  <p className="text-blue-400 text-sm font-medium">+{formatRp(a.price)}</p>
                </div>
              ))}
              {customItems.map((c, i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <p className="text-blue-200/70 text-sm">+ {c.label}</p>
                  <p className="text-blue-400 text-sm font-medium">+{formatRp(c.price)}</p>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t border-white/10">
                <p className="text-white font-bold">TOTAL</p>
                <p className="text-white font-black text-xl">{formatRp(proposal.totalPrice)}</p>
              </div>
            </div>
          </div>

          {proposal.notes && (
            <div className="glass rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-2">Catatan</h3>
              <p className="text-blue-200/60 text-sm leading-relaxed whitespace-pre-line">{proposal.notes}</p>
            </div>
          )}
        </div>

        {/* Right: client info */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4">Klien</h3>
            <div className="space-y-3">
              <div>
                <p className="text-blue-200/40 text-xs">Nama Kontak</p>
                <p className="text-white font-medium">{proposal.clientName}</p>
              </div>
              <div>
                <p className="text-blue-200/40 text-xs">Nama Bisnis</p>
                <p className="text-white font-medium">{proposal.businessName}</p>
              </div>
              {proposal.whatsapp && (
                <div>
                  <p className="text-blue-200/40 text-xs">WhatsApp</p>
                  <a
                    href={`https://wa.me/${proposal.whatsapp.replace(/\D/g, "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 text-sm transition-colors"
                  >
                    {proposal.whatsapp}
                  </a>
                </div>
              )}
              {proposal.lead && (
                <div>
                  <p className="text-blue-200/40 text-xs">Lead Terkait</p>
                  <Link href="/admin/leads" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                    Lihat lead →
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="glass rounded-2xl p-5 border border-blue-500/10">
            <p className="text-blue-200/50 text-xs mb-3">Kirim proposal ke klien via WhatsApp:</p>
            <a
              href={`https://wa.me/${WA}?text=${waMsg}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm justify-center"
            >
              <MessageCircle className="w-4 h-4" /> Kirim via WhatsApp
            </a>
            <p className="text-blue-200/30 text-xs text-center mt-2">Download PDF dulu, lampirkan di WA</p>
          </div>
        </div>
      </div>
    </div>
  );
}
