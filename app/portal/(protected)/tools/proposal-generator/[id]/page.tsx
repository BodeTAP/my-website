import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Download, FileText, Send } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseSections } from "@/lib/proposalTemplates";

type Props = { params: Promise<{ id: string }> };

function fmtDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value);
}

function waUrl(proposal: {
  proposalNo: string | null;
  title: string;
  prospectName: string | null;
  businessName: string | null;
  whatsapp: string | null;
}) {
  const phone = proposal.whatsapp?.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Halo ${proposal.prospectName ?? "Bapak/Ibu"}, berikut proposal ${proposal.proposalNo ?? proposal.title} untuk ${proposal.businessName ?? "kebutuhan bisnis Anda"}. Silakan dicek, dan kabari saya jika ada pertanyaan.`,
  );
  return phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
}

export default async function PortalGeneratedProposalDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true } } },
  });
  if (!user?.client) redirect("/portal/dashboard");

  const { id } = await params;
  const proposal = await prisma.generatedProposal.findFirst({
    where: { id, clientId: user.client.id },
  });
  if (!proposal) notFound();

  const contentRecord = proposal.content && typeof proposal.content === "object"
    ? proposal.content as Record<string, unknown>
    : {};
  const title = typeof contentRecord.title === "string" ? contentRecord.title : proposal.title;
  const sections = parseSections(contentRecord.sections);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link href="/portal/tools/proposal-generator" className="inline-flex items-center gap-2 text-sm text-blue-200/55 hover:text-blue-200 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Proposal Generator
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{title}</h1>
              <p className="text-blue-200/45 text-sm mt-1">
                {proposal.templateName ?? "Template custom"} - {fmtDate(proposal.createdAt)}
              </p>
            </div>
          </div>
        </div>
        <a
          href={`/api/portal/tools/proposal-generator/${proposal.id}/pdf`}
          target="_blank"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 font-bold transition-colors"
        >
          <Download className="w-4 h-4" />
          Unduh PDF
        </a>
        <a
          href={waUrl(proposal)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-200 border border-emerald-500/20 px-4 font-bold transition-colors"
        >
          <Send className="w-4 h-4" />
          Kirim WhatsApp
        </a>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#071225] p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <p className="text-blue-200/45 text-[10px] font-black uppercase tracking-widest">No. Proposal</p>
          <p className="text-white font-bold mt-1">{proposal.proposalNo ?? "-"}</p>
        </div>
        <div>
          <p className="text-blue-200/45 text-[10px] font-black uppercase tracking-widest">Calon Klien</p>
          <p className="text-white font-bold mt-1">{proposal.prospectName ?? "-"}</p>
        </div>
        <div>
          <p className="text-blue-200/45 text-[10px] font-black uppercase tracking-widest">Bisnis</p>
          <p className="text-white font-bold mt-1">{proposal.businessName ?? "-"}</p>
        </div>
        <div>
          <p className="text-blue-200/45 text-[10px] font-black uppercase tracking-widest">Berlaku Hingga</p>
          <p className="text-white font-bold mt-1">{proposal.validUntil ? fmtDate(proposal.validUntil) : "-"}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#071225] p-5 space-y-5">
        {sections.map((section, index) => (
          <article key={`${section.title}-${index}`} className="rounded-2xl border border-white/10 bg-[#07111f]/70 p-5">
            <h2 className="text-white font-black">{section.title}</h2>
            <p className="text-blue-100/65 text-sm leading-7 whitespace-pre-line mt-3">{section.body}</p>
          </article>
        ))}
      </section>

      {proposal.notes && (
        <section className="rounded-2xl border border-white/10 bg-[#071225] p-5">
          <p className="text-blue-200/45 text-[10px] font-black uppercase tracking-widest">Catatan / Terms</p>
          <p className="text-blue-100/65 text-sm leading-7 whitespace-pre-line mt-3">{proposal.notes}</p>
        </section>
      )}
    </div>
  );
}
