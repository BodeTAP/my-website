"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const STATUS_CONFIG = {
  UNPAID:  { label: "Belum Bayar", cls: "bg-amber-500/10 border-amber-500/20 text-amber-300" },
  PAID:    { label: "Lunas",       cls: "bg-green-500/10 border-green-500/20 text-green-300" },
  EXPIRED: { label: "Kadaluarsa", cls: "bg-gray-500/10 border-gray-500/20 text-gray-400"    },
  FAILED:  { label: "Gagal",       cls: "bg-red-500/10 border-red-500/20 text-red-400"       },
} as const;

type InvoiceStatus = keyof typeof STATUS_CONFIG;

export default function InvoiceStatusToggle({
  invoiceId,
  currentStatus,
}: {
  invoiceId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus]   = useState<InvoiceStatus>((currentStatus as InvoiceStatus) ?? "UNPAID");
  const [open, setOpen]       = useState(false);
  const [saving, setSaving]   = useState(false);

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.UNPAID;

  const handleSelect = async (next: InvoiceStatus) => {
    if (next === status) { setOpen(false); return; }
    setOpen(false);
    setSaving(true);
    setStatus(next);
    await fetch(`/api/admin/invoices/${invoiceId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: next }),
    });
    setSaving(false);
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={saving}
        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all disabled:opacity-50 cursor-pointer ${cfg.cls}`}
      >
        {saving && <Loader2 className="w-3 h-3 animate-spin" />}
        {cfg.label}
        <svg className="w-3 h-3 opacity-60" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 glass border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[140px]">
            {(Object.entries(STATUS_CONFIG) as [InvoiceStatus, typeof STATUS_CONFIG[InvoiceStatus]][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-white/5 flex items-center gap-2 ${val.cls.split(" ").find(c => c.startsWith("text-")) ?? ""} ${key === status ? "bg-white/5" : ""}`}
              >
                {key === status && <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />}
                {key !== status && <span className="w-1.5 h-1.5 shrink-0" />}
                {val.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
