"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Download, Loader2, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProposalSection = {
  title: string;
  body: string;
};

type ProposalContent = {
  title: string;
  sections: ProposalSection[];
};

export type ProposalDesign = {
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  fontStyle: "sans" | "serif" | "mono";
  layout: "corporate" | "minimal" | "modern" | "bold";
  logoPosition: "left" | "center" | "right";
  showLogo: boolean;
  showProposalNo: boolean;
  showDate: boolean;
  showRecipient: boolean;
  showFooter: boolean;
};

export type ProposalDetailView = {
  id: string;
  proposalNo: string | null;
  title: string;
  prospectName: string | null;
  businessName: string | null;
  whatsapp: string | null;
  validUntil: string | null;
  notes: string | null;
  templateName: string | null;
  status: string;
  design: ProposalDesign;
  content: ProposalContent;
  createdAt: string;
  senderBusinessName: string;
};

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Terkirim" },
  { value: "ACCEPTED", label: "Diterima" },
  { value: "DECLINED", label: "Ditolak" },
];

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "border-white/10 bg-white/5 text-blue-100/70",
  SENT: "border-blue-500/25 bg-blue-500/10 text-blue-200",
  ACCEPTED: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
  DECLINED: "border-red-500/25 bg-red-500/10 text-red-200",
};

function fmtDate(value: string) {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
  } catch {
    return "-";
  }
}

function buildWhatsAppUrl(proposal: ProposalDetailView) {
  const phone = proposal.whatsapp?.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Halo ${proposal.prospectName ?? "Bapak/Ibu"}, berikut proposal ${proposal.proposalNo ?? proposal.title} untuk ${proposal.businessName ?? "kebutuhan bisnis Anda"}. Silakan dicek, dan kabari saya jika ada pertanyaan.`,
  );
  return phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
}

export default function ProposalDetailClient({ proposal }: { proposal: ProposalDetailView }) {
  const router = useRouter();
  const [status, setStatus] = useState(proposal.status);
  const [savingStatus, setSavingStatus] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function updateStatus(newStatus: string) {
    setStatus(newStatus);
    setSavingStatus(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/portal/tools/proposal-generator/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status");
      setMessage("Status berhasil diperbarui.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status");
      setStatus(proposal.status);
    } finally {
      setSavingStatus(false);
    }
  }

  async function duplicateProposal() {
    setDuplicating(true);
    setError("");

    try {
      const res = await fetch(`/api/portal/tools/proposal-generator/${proposal.id}/duplicate`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal menduplikasi proposal");
      router.push(`/portal/tools/proposal-generator/${data.proposal.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menduplikasi proposal");
      setDuplicating(false);
    }
  }

  async function deleteProposal() {
    if (!window.confirm("Hapus proposal ini? Tindakan ini tidak bisa dibatalkan.")) return;
    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/portal/tools/proposal-generator/${proposal.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus proposal");
      router.push("/portal/tools/proposal-generator");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus proposal");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link href="/portal/tools/proposal-generator" className="inline-flex items-center gap-2 text-sm text-blue-200/55 hover:text-blue-200 mb-3">
            <ArrowLeft className="h-4 w-4" />
            Proposal Generator
          </Link>
          <h1 className="text-2xl font-black text-white">{proposal.title}</h1>
          <p className="mt-1 text-sm text-blue-200/45">{proposal.templateName ?? "Template custom"} — {fmtDate(proposal.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Status */}
          <select
            value={status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={savingStatus}
            className={`h-10 rounded-xl border px-3 text-sm font-black outline-none ${STATUS_STYLE[status] ?? STATUS_STYLE.DRAFT}`}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#07111f] text-white">{opt.label}</option>
            ))}
          </select>
          {/* Download PDF */}
          <a
            href={`/api/portal/tools/proposal-generator/${proposal.id}/pdf`}
            target="_blank"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 text-sm font-black text-white transition-colors"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </a>
          {/* Duplicate */}
          <Button type="button" onClick={duplicateProposal} disabled={duplicating} className="h-10 rounded-xl border border-white/10 bg-white/10 text-white hover:bg-white/15">
            {duplicating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
            Duplikasi
          </Button>
          {/* WhatsApp */}
          <a
            href={buildWhatsAppUrl(proposal)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-200 border border-emerald-500/20 px-3 text-sm font-black transition-colors"
          >
            <Send className="h-4 w-4" />
            Kirim WhatsApp
          </a>
          {/* Delete */}
          <button type="button" onClick={deleteProposal} disabled={deleting} className="inline-flex h-10 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 px-3 text-sm font-black text-red-200 hover:bg-red-500/15 disabled:opacity-50">
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {(message || error) && (
        <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${error ? "border-red-500/25 bg-red-500/10 text-red-200" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"}`}>
          {error || message}
        </div>
      )}

      {/* Proposal Preview (read-only, full width) */}
      <div className="rounded-2xl border border-white/10 bg-[#071225] p-5">
        <ProposalReadOnlyPreview proposal={proposal} />
      </div>
    </div>
  );
}

// ─── Read-only Proposal Preview (matches PDF output) ─────────────────────────

function ProposalReadOnlyPreview({ proposal }: { proposal: ProposalDetailView }) {
  const { design, content } = proposal;
  const isMinimal = design.layout === "minimal";
  const isBold = design.layout === "bold";
  const isModern = design.layout === "modern";
  const headerBg = isMinimal ? "#ffffff" : design.primaryColor;
  const headerTextColor = isMinimal ? "#0f172a" : "#ffffff";
  const headerMutedColor = isMinimal ? "#64748b" : "#bfdbfe";
  const fontFamily = design.fontStyle === "serif"
    ? "Georgia, serif"
    : design.fontStyle === "mono"
      ? "'Courier New', monospace"
      : "system-ui, -apple-system, sans-serif";

  return (
    <div className="mx-auto max-w-2xl rounded-xl overflow-hidden border border-white/10 shadow-xl" style={{ fontFamily }}>
      <div className="bg-white text-slate-900 relative">
        {/* Modern side accent */}
        {isModern && <div className="absolute left-0 top-0 bottom-0 w-3" style={{ backgroundColor: design.accentColor }} />}

        {/* Header */}
        <div
          className="relative px-8 py-6"
          style={{
            backgroundColor: headerBg,
            borderBottom: isMinimal ? `3px solid ${design.primaryColor}` : "none",
          }}
        >
          {/* Minimal top accent bar */}
          {isMinimal && <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: design.accentColor }} />}
          {/* Bold extra height handled by padding */}
          <div className={`flex items-start justify-between ${isBold ? "py-4" : ""}`}>
            <div>
              {design.showLogo && design.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={design.logoUrl} alt="Logo" className="h-8 w-auto mb-2 object-contain" />
              )}
              <p className="font-bold text-lg" style={{ color: headerTextColor }}>
                {proposal.senderBusinessName || "Proposal Bisnis"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: headerMutedColor }}>Proposal</p>
              {design.showDate && (
                <p className="text-xs" style={{ color: headerMutedColor }}>{fmtDate(proposal.createdAt)}</p>
              )}
            </div>
            <div className="text-right">
              <p className={`font-bold ${isBold ? "text-3xl" : "text-2xl"}`} style={{ color: headerTextColor }}>
                PROPOSAL
              </p>
              {design.showProposalNo && (
                <p className="text-xs mt-1" style={{ color: headerMutedColor }}>
                  {proposal.proposalNo || "PREVIEW"}
                </p>
              )}
            </div>
          </div>
          {/* Modern overlay block */}
          {isModern && (
            <div
              className="absolute top-0 right-0 bottom-0 w-[170px] opacity-[0.28]"
              style={{ backgroundColor: design.accentColor }}
            />
          )}
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-5">
          {/* Content title + template info */}
          <div>
            <p className="font-bold text-lg text-slate-900">{content.title}</p>
            <p className="text-xs text-slate-400 mt-1">
              Template: {proposal.templateName ?? "Custom"} | Status: {proposal.status}
            </p>
          </div>

          {/* Recipient block */}
          {design.showRecipient && (
            <div className="rounded-lg p-4" style={{ backgroundColor: isBold ? "#f1f5f9" : "#f8fafc" }}>
              <div className="flex justify-between gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ditujukan Kepada</p>
                  <p className="font-bold text-base mt-1">{proposal.businessName ?? "-"}</p>
                  <p className="text-xs text-slate-500">{proposal.prospectName ?? "-"}</p>
                  {proposal.whatsapp && <p className="text-xs text-slate-500">WA: {proposal.whatsapp}</p>}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Berlaku Hingga</p>
                  <p className="font-bold text-sm mt-1">{proposal.validUntil ? fmtDate(proposal.validUntil) : "-"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sections */}
          {content.sections.map((section, idx) => (
            <div key={idx}>
              <div
                className="rounded-md px-3 py-2 mb-2"
                style={{ backgroundColor: isMinimal ? "#f8fafc" : "#eff6ff" }}
              >
                <p
                  className="font-bold text-sm"
                  style={{ color: isMinimal ? "#0f172a" : design.primaryColor }}
                >
                  {section.title || "Section"}
                </p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line pl-1">
                {section.body}
              </p>
            </div>
          ))}

          {/* Notes */}
          {proposal.notes && (
            <div>
              <div className="rounded-md px-3 py-2 mb-2" style={{ backgroundColor: "#fef9c3" }}>
                <p className="font-bold text-sm" style={{ color: "#92400e" }}>Catatan / Terms</p>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line pl-1">
                {proposal.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {design.showFooter && (
          <div className="px-8 py-3 border-t border-slate-200">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Dibuat dari Portal Tools</span>
              <span>Halaman 1 dari 1</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
