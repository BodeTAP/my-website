"use client";

import { AlertTriangle } from "lucide-react";

type Props = {
  message:       string;
  description?:  string;
  confirmLabel?: string;
  variant?:      "danger" | "warning";
  onConfirm:     () => void;
  onCancel:      () => void;
};

export default function ConfirmDialog({
  message,
  description,
  confirmLabel = "Hapus",
  variant = "danger",
  onConfirm,
  onCancel,
}: Props) {
  const isDanger  = variant === "danger";
  const iconColor = isDanger ? "text-red-400" : "text-amber-400";
  const iconBg    = isDanger ? "bg-red-500/10" : "bg-amber-500/10";
  const btnCls    = isDanger
    ? "bg-red-600 hover:bg-red-500 text-white"
    : "bg-amber-600 hover:bg-amber-500 text-white";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        className="relative glass rounded-2xl p-6 max-w-sm w-full border border-white/10 shadow-2xl shadow-black/50"
        style={{ background: "rgba(8,18,36,0.97)" }}
      >
        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-4`}>
          <AlertTriangle className={`w-6 h-6 ${iconColor}`} />
        </div>

        {/* Text */}
        <h3 className="text-white font-bold text-lg leading-snug mb-2">{message}</h3>
        {description && (
          <p className="text-blue-200/55 text-sm leading-relaxed mb-6">{description}</p>
        )}
        {!description && <div className="mb-6" />}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-blue-200/70 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${btnCls}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
