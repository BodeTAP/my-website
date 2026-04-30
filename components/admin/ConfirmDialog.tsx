"use client";

import { AlertTriangle, Info } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  message:       string;
  description?:  string;
  confirmLabel?: string;
  variant?:      "danger" | "warning" | "info";
  onConfirm:     () => void;
  onCancel:      () => void;
};

export default function ConfirmDialog({
  message,
  description,
  confirmLabel = "Lanjutkan",
  variant = "danger",
  onConfirm,
  onCancel,
}: Props) {
  const isDanger  = variant === "danger";
  const isWarning = variant === "warning";
  const isInfo    = variant === "info";
  
  const iconColor = isDanger ? "text-red-400" : isWarning ? "text-amber-400" : "text-blue-400";
  const iconBg    = isDanger ? "bg-red-500/10 ring-red-500/20" : isWarning ? "bg-amber-500/10 ring-amber-500/20" : "bg-blue-500/10 ring-blue-500/20";
  const glowBg    = isDanger ? "bg-red-600/20" : isWarning ? "bg-amber-600/20" : "bg-blue-600/20";
  
  const btnCls = isDanger
    ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)]"
    : isWarning
    ? "bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.3)] hover:shadow-[0_0_25px_rgba(217,119,6,0.5)]"
    : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]";

  const Icon = isInfo ? Info : AlertTriangle;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onCancel}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative glass rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-white/10 shadow-2xl overflow-hidden"
        style={{ background: "rgba(5, 11, 20, 0.9)" }}
      >
        {/* Subtle glow effect behind the icon */}
        <div className={`absolute -top-10 -left-10 w-40 h-40 rounded-full blur-[60px] pointer-events-none ${glowBg}`} />

        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl ${iconBg} ring-1 flex items-center justify-center mb-5 relative z-10`}>
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>

        {/* Text */}
        <h3 className="text-white font-bold text-xl tracking-tight leading-snug mb-2 relative z-10">{message}</h3>
        
        {description && (
          <p className="text-blue-200/60 text-sm leading-relaxed mb-8 relative z-10">{description}</p>
        )}
        {!description && <div className="mb-8" />}

        {/* Actions */}
        <div className="flex gap-3 justify-end relative z-10">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-blue-200/70 hover:text-white hover:bg-white/10 hover:border-white/20 text-sm font-semibold transition-all active:scale-95"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${btnCls}`}
          >
            {confirmLabel || "Hapus"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
