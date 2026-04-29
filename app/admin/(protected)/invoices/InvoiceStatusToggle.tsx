"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const STATUS_CONFIG = {
  UNPAID:  { label: "Belum Bayar", cls: "text-amber-300 border-amber-500/20 bg-amber-500/10" },
  PAID:    { label: "Lunas",       cls: "text-green-300 border-green-500/20 bg-green-500/10" },
  EXPIRED: { label: "Kadaluarsa", cls: "text-gray-400  border-gray-500/20  bg-gray-500/10"  },
  FAILED:  { label: "Gagal",       cls: "text-red-400   border-red-500/20   bg-red-500/10"   },
} as const;

type InvoiceStatus = keyof typeof STATUS_CONFIG;

type DropdownPos = { top: number; left: number; minWidth: number };

export default function InvoiceStatusToggle({
  invoiceId,
  currentStatus,
}: {
  invoiceId: string;
  currentStatus: string;
}) {
  const router  = useRouter();
  const btnRef  = useRef<HTMLButtonElement>(null);
  const [status,  setStatus]  = useState<InvoiceStatus>((currentStatus as InvoiceStatus) ?? "UNPAID");
  const [open,    setOpen]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [pos,     setPos]     = useState<DropdownPos | null>(null);

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.UNPAID;

  const handleOpen = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({
      top:      rect.bottom + window.scrollY + 4,
      left:     rect.left   + window.scrollX,
      minWidth: rect.width,
    });
    setOpen(true);
  };

  // Close on scroll/resize
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const handleSelect = async (next: InvoiceStatus) => {
    setOpen(false);
    if (next === status) return;
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
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        disabled={saving}
        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all disabled:opacity-50 cursor-pointer ${cfg.cls}`}
      >
        {saving && <Loader2 className="w-3 h-3 animate-spin" />}
        {cfg.label}
        <svg className="w-3 h-3 opacity-60" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      {open && pos && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-9998" onClick={() => setOpen(false)} />

          {/* Dropdown — fixed so it escapes overflow:hidden */}
          <div
            className="fixed z-9999 rounded-xl border border-white/10 shadow-2xl overflow-hidden"
            style={{
              top:      pos.top,
              left:     pos.left,
              minWidth: pos.minWidth,
              background: "rgba(8,18,36,0.85)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            {(Object.entries(STATUS_CONFIG) as [InvoiceStatus, typeof STATUS_CONFIG[InvoiceStatus]][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className={`w-full text-left px-3 py-2.5 text-xs font-medium transition-colors hover:bg-white/8 flex items-center gap-2 whitespace-nowrap ${val.cls.split(" ").find(c => c.startsWith("text-")) ?? ""}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${key === status ? "bg-current" : "opacity-0"}`} />
                {val.label}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
