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
  
  const iconColor = isDanger ? "text-rose-600" : isWarning ? "text-amber-600" : "text-slate-700";
  const iconBg    = isDanger ? "bg-rose-50 ring-rose-100" : isWarning ? "bg-amber-50 ring-amber-100" : "bg-slate-100 ring-slate-200";
  
  const btnCls = isDanger
    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
    : isWarning
    ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
    : "bg-slate-900 hover:bg-slate-800 text-white shadow-xs";

  const Icon = isInfo ? Info : AlertTriangle;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={onCancel}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative rounded-3xl p-6 sm:p-7 max-w-sm w-full bg-white border border-slate-200 shadow-xl overflow-hidden"
      >
        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl ${iconBg} ring-1 flex items-center justify-center mb-4 relative z-10`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>

        {/* Text */}
        <h3 className="text-slate-900 font-bold text-lg tracking-tight leading-snug mb-1.5 relative z-10">{message}</h3>
        
        {description && (
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6 relative z-10 whitespace-pre-line">{description}</p>
        )}
        {!description && <div className="mb-6" />}

        {/* Actions */}
        <div className="flex gap-2.5 justify-end relative z-10">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs sm:text-sm font-semibold transition-all shadow-xs"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${btnCls}`}
          >
            {confirmLabel || "Hapus"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
