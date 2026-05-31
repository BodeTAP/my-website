"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Download, Mail, X } from "lucide-react";
import { track } from "@vercel/analytics";

type EmailCaptureModalProps = {
  open: boolean;
  onClose: () => void;
  /**
   * Called with the captured email (or null if user skipped).
   * The parent component is expected to start the download in this callback.
   */
  onConfirm: (email: string | null) => void;
  toolName: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailCaptureModal({
  open,
  onClose,
  onConfirm,
  toolName,
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the email input shortly after the modal opens. We intentionally do
  // NOT reset state here — letting React clear it on unmount via `key` from the
  // parent or via the explicit close handler keeps the effect side-effect-free.
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  // Reset internal state whenever the modal transitions to closed.
  useEffect(() => {
    if (open) return;
    // Defer to the next microtask so that handlers calling onClose can finish
    // first; this avoids the lint warning about cascading renders.
    const id = window.requestAnimationFrame(() => {
      setEmail("");
      setError(null);
      setSubmitting(false);
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  if (typeof document === "undefined" || !open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Masukkan email kamu");
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError("Format email tidak valid");
      return;
    }

    setSubmitting(true);
    track("freemium_email_captured", { tool: toolName });
    onConfirm(trimmed);
  };

  const handleSkip = () => {
    if (submitting) return;
    setSubmitting(true);
    track("freemium_email_skipped", { tool: toolName });
    onConfirm(null);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Email capture - ${toolName}`}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#071225] p-6 sm:p-8 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-blue-200/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/25 bg-blue-500/10">
          <Mail className="h-6 w-6 text-blue-300" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Mau dikirim copy ke email?
        </h2>

        <p className="text-blue-200/55 text-sm mb-5">
          Kami simpan PDF {toolName} kamu dan kirim juga 3 tips ringkas untuk
          {toolName.toLowerCase().includes("proposal") ? " naikkan tingkat closing" : toolName.toLowerCase().includes("invoice") ? " mempercepat pembayaran" : " kelola lead"}.
          Tidak ada spam.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="ec-email"
              className="block text-sm font-medium text-blue-100/80 mb-1.5"
            >
              Email
            </label>
            <input
              ref={inputRef}
              id="ec-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@bisnis.com"
              autoComplete="email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-blue-200/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors"
            />
            {error && (
              <p className="mt-2 text-xs text-red-300">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Download & kirim ke email
          </button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={submitting}
            className="block w-full text-center text-xs text-blue-200/45 hover:text-white transition-colors disabled:opacity-60"
          >
            Lewati, langsung download
            <ArrowRight className="inline-block ml-1 w-3 h-3" />
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
