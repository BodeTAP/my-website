"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

type PaywallGateProps = {
  open: boolean;
  onClose: () => void;
  toolName: string;
  signupBonus?: number;
  /**
   * Optional concrete breakdown of what the welcome credits buy.
   * Example: "3 proposal + 5 invoice + 5x cari leads".
   * If empty, the bonus chip falls back to "X kredit gratis".
   */
  signupBonusBreakdown?: string;
};

const benefits = [
  "Hasil pencarian lebih banyak",
  "Tanpa watermark pada PDF",
  "Riwayat tersimpan",
  "Akses semua fitur premium",
];

export default function PaywallGate({
  open,
  onClose,
  toolName,
  signupBonus = 15,
  signupBonusBreakdown,
}: PaywallGateProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
    }
  }, [open]);

  // Don't render portal on server
  if (typeof document === "undefined") return null;
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Paywall - ${toolName}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#071225] p-6 sm:p-8 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          ref={closeRef}
          onClick={onClose}
          className="absolute top-4 right-4 text-blue-200/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Heading */}
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Daftar gratis untuk lanjutkan
        </h2>

        <p className="text-blue-200/55 text-sm mb-5">
          Batas penggunaan gratis untuk {toolName} telah tercapai.
        </p>

        {/* Signup bonus highlight */}
        <div className="rounded-xl border border-teal-400/20 bg-teal-400/[0.06] px-4 py-3 mb-6">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-teal-400 shrink-0" />
            <p className="text-sm text-teal-100 font-medium">
              Akun baru dapat{" "}
              <span className="font-bold text-teal-400">{signupBonus} kredit</span>{" "}
              gratis
            </p>
          </div>
          {signupBonusBreakdown && (
            <p className="text-xs text-teal-100/70 mt-1.5 ml-7">
              Cukup untuk {signupBonusBreakdown}
            </p>
          )}
        </div>

        {/* Benefits list */}
        <ul className="space-y-3 mb-7">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3">
              <CheckCircle2 className="w-4.5 h-4.5 text-blue-400 shrink-0" />
              <span className="text-sm text-blue-100/80">{benefit}</span>
            </li>
          ))}
        </ul>

        {/* Primary CTA */}
        <Link
          href="/portal/register"
          className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
        >
          Buat Akun Gratis
          <ArrowRight className="w-4 h-4" />
        </Link>

        {/* Secondary link */}
        <p className="text-center mt-4 text-sm text-blue-200/50">
          Sudah punya akun?{" "}
          <Link
            href="/portal/login"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </div>,
    document.body
  );
}
