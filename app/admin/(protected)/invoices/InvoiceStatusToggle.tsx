"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const STATUS_CONFIG = {
  UNPAID:  { label: "Belum Bayar", cls: "text-amber-800 border-amber-200 bg-amber-50" },
  PAID:    { label: "Lunas",       cls: "text-emerald-800 border-emerald-200 bg-emerald-50" },
  EXPIRED: { label: "Kadaluarsa", cls: "text-slate-600  border-slate-200  bg-slate-100"  },
  FAILED:  { label: "Gagal",       cls: "text-rose-800   border-rose-200   bg-rose-50"   },
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
        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all disabled:opacity-50 cursor-pointer ${cfg.cls}`}
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
            className="fixed z-9999 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden py-1"
            style={{
              top:      pos.top,
              left:     pos.left,
              minWidth: pos.minWidth,
            }}
          >
            {(Object.entries(STATUS_CONFIG) as [InvoiceStatus, typeof STATUS_CONFIG[InvoiceStatus]][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className="w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-slate-50 flex items-center gap-2 whitespace-nowrap text-slate-700"
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${key === status ? "bg-slate-900" : "opacity-0"}`} />
                <span className={val.cls.split(" ").find(c => c.startsWith("text-")) ?? ""}>{val.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
