"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, ShieldCheck, ChevronDown } from "lucide-react";
import type { PaymentChannel } from "@/lib/tripay";
import { Button } from "@/components/ui/button";

type Props = {
  invoiceNo:  string;
  baseAmount: number;
  channels:   PaymentChannel[];
  feeHandling: "customer" | "merchant" | "split";
};

// Group channels by their group label
function groupChannels(channels: PaymentChannel[]) {
  const map = new Map<string, PaymentChannel[]>();
  for (const ch of channels) {
    const g = ch.group || "Lainnya";
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(ch);
  }
  return map;
}

function formatFee(ch: PaymentChannel): string | null {
  const flat    = ch.fee_customer?.flat ?? 0;
  const percent = ch.fee_customer?.percent ? parseFloat(ch.fee_customer.percent) : 0;
  
  if (flat > 0 && percent > 0) return `+Rp ${flat.toLocaleString("id-ID")} + ${percent}%`;
  if (flat > 0)    return `+Rp ${flat.toLocaleString("id-ID")}`;
  if (percent > 0) return `+${percent}%`;
  return null;
}

function calculateAdminFee(ch: PaymentChannel | null, baseAmount: number, feeHandling: Props["feeHandling"]): number {
  if (!ch || !ch.fee_customer || feeHandling !== "customer") return 0;
  const flat = ch.fee_customer.flat ?? 0;
  const percent = ch.fee_customer.percent ? parseFloat(ch.fee_customer.percent) : 0;
  return flat + Math.round((baseAmount * percent) / 100);
}

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(n);
}

export default function PaymentSelector({ invoiceNo, baseAmount, channels, feeHandling }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const grouped  = groupChannels(channels);
  const groupKeys = [...grouped.keys()];

  const selectedChannel = channels.find(ch => ch.code === selected) ?? null;
  const adminFee = calculateAdminFee(selectedChannel, baseAmount, feeHandling);
  const grandTotal = baseAmount + adminFee;

  async function handlePay() {
    if (!selected) { setError("Silakan pilih metode pembayaran terlebih dahulu."); return; }
    setLoading(true);
    setError("");
    try {
      const ch = channels.find(c => c.code === selected);
      const res  = await fetch(`/api/pay/${encodeURIComponent(invoiceNo)}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ method: selected, methodName: ch?.name }),
      });
      const data = await res.json() as { paymentUrl?: string; error?: string };
      if (!res.ok || !data.paymentUrl) {
        setError(data.error ?? "Gagal memproses transaksi. Silakan coba lagi.");
        return;
      }
      window.location.href = data.paymentUrl;
    } catch {
      setError("Terjadi kendala koneksi ke server gateway. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (channels.length === 0) {
    return (
      <p className="text-center text-slate-500 text-xs font-mono py-4">
        Metode pembayaran online sedang tidak tersedia. Silakan hubungi admin.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Dynamic Total */}
      <div className="border-t border-slate-200 pt-4 mb-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-slate-500 font-mono text-xs uppercase tracking-wider">Total Pembayaran</span>
            {adminFee > 0 && (
              <p className="text-[11px] font-mono text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md block mt-1">
                Termasuk admin +{formatRp(adminFee)}
              </p>
            )}
            {feeHandling === "merchant" && selectedChannel && (
              <p className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md block mt-1">
                Biaya admin ditanggung pihak MFWEB
              </p>
            )}
            {feeHandling === "split" && selectedChannel && (
              <p className="text-[11px] font-mono text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md block mt-1">
                Biaya admin mengikuti pembagian internal
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="text-slate-900 font-bold font-mono text-2xl transition-all">
              {formatRp(grandTotal)}
            </span>
          </div>
        </div>
      </div>

      <p className="text-slate-900 text-xs font-mono uppercase tracking-wider font-bold">Pilih Kanal Pembayaran</p>

      {/* Grouped channels */}
      <div className="space-y-2">
        {groupKeys.map(group => {
          const isOpen = (openGroup ?? groupKeys[0]) === group;
          const items  = grouped.get(group)!;
          return (
            <div key={group} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {/* Group header */}
              <button
                type="button"
                onClick={() => setOpenGroup(isOpen ? "__none__" : group)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100/70 transition-colors text-left"
              >
                <span className="text-slate-900 text-xs font-mono uppercase tracking-wider font-bold">{group}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Channel list */}
              {isOpen && (
                <div className="divide-y divide-slate-100">
                  {items.map(ch => {
                    const isSelected = selected === ch.code;
                    return (
                      <button
                        key={ch.code}
                        type="button"
                        onClick={() => { setSelected(ch.code); setError(""); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isSelected ? "bg-slate-100/80" : "hover:bg-slate-50"
                        }`}
                      >
                        {/* Radio */}
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                          isSelected ? "border-slate-900 bg-slate-900" : "border-slate-300"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>

                        {/* Icon */}
                        {ch.icon_url ? (
                          <Image
                            src={ch.icon_url}
                            alt={ch.name}
                            width={40}
                            height={24}
                            className="h-6 w-auto object-contain shrink-0"
                            unoptimized
                          />
                        ) : (
                          <div className="w-10 h-6 bg-slate-100 border border-slate-200 rounded shrink-0" />
                        )}

                        {/* Name & Fee */}
                        <div className="flex-1 min-w-0 flex flex-col items-start text-left">
                          <p className={`text-sm font-medium ${isSelected ? "text-slate-900 font-bold" : "text-slate-700"}`}>
                            {ch.name}
                          </p>
                          {feeHandling === "customer" && formatFee(ch) && (
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                              Admin: {formatFee(ch)}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pay button */}
      <Button
        onClick={handlePay}
        disabled={loading || !selected}
        className="w-full h-12 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-medium text-base transition-colors mt-2"
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Mengalihkan ke Gerbang Pembayaran...</>
          : "Lanjutkan Pembayaran"}
      </Button>

      {error && (
        <p className="text-rose-700 text-xs text-center bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-mono pt-1">
        <ShieldCheck className="w-3.5 h-3.5" />
        Enkripsi SSL 256-bit terverifikasi Tripay Payment Gateway
      </div>
    </div>
  );
}
