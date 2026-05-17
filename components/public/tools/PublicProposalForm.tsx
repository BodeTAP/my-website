"use client";

import { useState, useCallback, useRef } from "react";
import { FileText, Download, Loader2, AlertCircle } from "lucide-react";
import PaywallGate from "@/components/public/PaywallGate";

// ─── Types ───────────────────────────────────────────────────────────────────

type ProposalResult = {
  title: string;
  from: string;
  to: string;
  service: string;
  price: number;
  priceFormatted: string;
  validDays: number;
  createdAt: string;
};

type LocalUsage = {
  count: number;
  resetAt: number;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "mfweb_freemium_proposal_generator";
const MONTHLY_LIMIT = 1;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLocalUsage(): LocalUsage | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalUsage;
  } catch {
    return null;
  }
}

function setLocalUsage(usage: LocalUsage): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch {
    // localStorage might be full or disabled
  }
}

function isLocalLimitReached(): boolean {
  const usage = getLocalUsage();
  if (!usage) return false;
  if (Date.now() > usage.resetAt) {
    // Window expired, reset
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
  return usage.count >= MONTHLY_LIMIT;
}

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

// ─── PDF Generation ──────────────────────────────────────────────────────────

function generateProposalHTML(proposal: ProposalResult): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${proposal.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a2e; position: relative; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 48px; color: rgba(0,0,0,0.03); white-space: nowrap; pointer-events: none; z-index: 1000; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 24px; color: #1e40af; margin-bottom: 8px; }
    .header p { color: #64748b; font-size: 14px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .meta-item { font-size: 13px; color: #475569; }
    .meta-item strong { display: block; font-size: 15px; color: #1a1a2e; margin-top: 4px; }
    .section { margin-bottom: 24px; }
    .section h2 { font-size: 16px; color: #1e40af; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    .section p { font-size: 14px; line-height: 1.7; color: #334155; white-space: pre-wrap; }
    .price-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
    .price-box .label { font-size: 13px; color: #64748b; margin-bottom: 4px; }
    .price-box .amount { font-size: 28px; font-weight: 700; color: #1e40af; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
    @media print { .watermark { position: fixed; } }
  </style>
</head>
<body>
  <div class="watermark">Dibuat dengan MFWEB - mfweb.maffisorp.id</div>
  <div class="header">
    <h1>${proposal.title}</h1>
    <p>Dari: ${proposal.from}</p>
  </div>
  <div class="meta">
    <div class="meta-item">Kepada<strong>${proposal.to}</strong></div>
    <div class="meta-item">Tanggal<strong>${new Date(proposal.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</strong></div>
    <div class="meta-item">Berlaku<strong>${proposal.validDays} hari</strong></div>
  </div>
  <div class="section">
    <h2>Deskripsi Layanan</h2>
    <p>${proposal.service}</p>
  </div>
  <div class="price-box">
    <div class="label">Total Investasi</div>
    <div class="amount">${proposal.priceFormatted}</div>
  </div>
  <div class="footer">
    <p>Dokumen ini dibuat menggunakan MFWEB Proposal Generator (Free Tier)</p>
  </div>
</body>
</html>`;
}

function downloadPDF(proposal: ProposalResult): void {
  const html = generateProposalHTML(proposal);
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  // Give the browser a moment to render before triggering print
  setTimeout(() => {
    printWindow.print();
  }, 300);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PublicProposalForm() {
  const [prospectName, setProspectName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProposalResult | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [disabledNotice, setDisabledNotice] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setResult(null);
      setDisabledNotice(false);

      // Client-side soft-limit check
      if (isLocalLimitReached()) {
        setPaywallOpen(true);
        return;
      }

      // Validate
      const priceNum = Number(price);
      if (!prospectName.trim()) {
        setError("Nama prospek wajib diisi");
        return;
      }
      if (!businessName.trim()) {
        setError("Nama bisnis wajib diisi");
        return;
      }
      if (!serviceDescription.trim()) {
        setError("Deskripsi layanan wajib diisi");
        return;
      }
      if (!price || isNaN(priceNum) || priceNum <= 0) {
        setError("Harga harus berupa angka positif");
        return;
      }

      setLoading(true);

      try {
        const res = await fetch("/api/tools/proposal-generator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prospectName: prospectName.trim(),
            businessName: businessName.trim(),
            serviceDescription: serviceDescription.trim(),
            price: priceNum,
          }),
        });

        if (res.status === 429) {
          // Rate limited — set localStorage and show paywall
          const now = Date.now();
          setLocalUsage({ count: MONTHLY_LIMIT, resetAt: now + 30 * 24 * 60 * 60 * 1000 });
          setPaywallOpen(true);
          return;
        }

        if (res.status === 403) {
          setDisabledNotice(true);
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error || "Terjadi kesalahan. Silakan coba lagi.");
          return;
        }

        const data = await res.json();
        setResult(data.proposal as ProposalResult);

        // Update localStorage usage
        const usage = getLocalUsage();
        const now = Date.now();
        if (usage && now < usage.resetAt) {
          setLocalUsage({ count: usage.count + 1, resetAt: usage.resetAt });
        } else {
          setLocalUsage({ count: 1, resetAt: now + 30 * 24 * 60 * 60 * 1000 });
        }

        // Scroll to result
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      } catch {
        setError("Gagal menghubungi server. Periksa koneksi internet Anda.");
      } finally {
        setLoading(false);
      }
    },
    [prospectName, businessName, serviceDescription, price],
  );

  return (
    <>
      <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Free tier notice */}
        <div className="mb-6 rounded-xl border border-teal-400/20 bg-teal-400/[0.06] px-4 py-3 flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-teal-400 shrink-0" />
          <p className="text-sm text-teal-100 font-medium">
            Gratis: 1 proposal per bulan (dengan watermark)
          </p>
        </div>

        {/* Disabled notice */}
        {disabledNotice && (
          <div className="mb-6 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-100">
              Free tier tidak tersedia saat ini.{" "}
              <a href="/portal/register" className="text-amber-400 underline underline-offset-2 hover:text-amber-300">
                Daftar akun
              </a>{" "}
              untuk menggunakan tool ini.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prospect Name */}
            <div>
              <label htmlFor="pf-prospect" className="block text-sm font-medium text-blue-100/80 mb-1.5">
                Nama Prospek
              </label>
              <input
                id="pf-prospect"
                type="text"
                value={prospectName}
                onChange={(e) => setProspectName(e.target.value)}
                placeholder="PT Contoh Jaya"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-blue-200/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors"
              />
            </div>

            {/* Business Name */}
            <div>
              <label htmlFor="pf-business" className="block text-sm font-medium text-blue-100/80 mb-1.5">
                Nama Bisnis Anda
              </label>
              <input
                id="pf-business"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Studio Kreatif ABC"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-blue-200/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors"
              />
            </div>
          </div>

          {/* Service Description */}
          <div>
            <label htmlFor="pf-service" className="block text-sm font-medium text-blue-100/80 mb-1.5">
              Deskripsi Layanan
            </label>
            <textarea
              id="pf-service"
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              placeholder="Jelaskan layanan yang ditawarkan, scope pekerjaan, dan deliverables..."
              rows={4}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-blue-200/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors resize-none"
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="pf-price" className="block text-sm font-medium text-blue-100/80 mb-1.5">
              Harga (Rupiah)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-blue-200/40">Rp</span>
              <input
                id="pf-price"
                type="number"
                min="1"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="5000000"
                className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-blue-200/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            {price && !isNaN(Number(price)) && Number(price) > 0 && (
              <p className="mt-1 text-xs text-blue-200/40">{formatRupiah(Number(price))}</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-400/20 bg-red-400/[0.06] px-3.5 py-2.5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 text-sm font-semibold text-white transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Membuat proposal...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Buat Proposal Gratis
              </>
            )}
          </button>
        </form>

        {/* Result Card */}
        {result && (
          <div ref={resultRef} className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
            {/* Result Header */}
            <div className="border-b border-white/10 bg-blue-600/10 px-5 py-4">
              <h3 className="text-lg font-bold text-white">{result.title}</h3>
              <p className="text-sm text-blue-200/60 mt-0.5">Dari: {result.from}</p>
            </div>

            {/* Result Body */}
            <div className="px-5 py-5 space-y-4">
              {/* Meta row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-blue-200/40 uppercase tracking-wide">Kepada</p>
                  <p className="text-sm text-white font-medium mt-0.5">{result.to}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-200/40 uppercase tracking-wide">Tanggal</p>
                  <p className="text-sm text-white font-medium mt-0.5">
                    {new Date(result.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-200/40 uppercase tracking-wide">Berlaku</p>
                  <p className="text-sm text-white font-medium mt-0.5">{result.validDays} hari</p>
                </div>
              </div>

              {/* Service */}
              <div>
                <p className="text-xs text-blue-200/40 uppercase tracking-wide mb-1">Layanan</p>
                <p className="text-sm text-blue-100/80 whitespace-pre-wrap leading-relaxed">{result.service}</p>
              </div>

              {/* Price */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.06] px-4 py-3 text-center">
                <p className="text-xs text-blue-200/50 mb-0.5">Total Investasi</p>
                <p className="text-xl font-bold text-blue-300">{result.priceFormatted}</p>
              </div>

              {/* Watermark notice */}
              <div className="rounded-lg border border-amber-400/15 bg-amber-400/[0.04] px-3.5 py-2.5">
                <p className="text-xs text-amber-200/70">
                  ⚠️ PDF ini memiliki watermark. Daftar untuk versi tanpa watermark.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-white/10 px-5 py-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => downloadPDF(result)}
                className="flex items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF (dengan watermark)
              </button>
              <a
                href="/portal/register"
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors"
              >
                Daftar untuk versi tanpa watermark
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Paywall Modal */}
      <PaywallGate
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        toolName="Proposal Generator"
      />
    </>
  );
}
