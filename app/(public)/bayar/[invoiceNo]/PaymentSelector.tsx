"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, ShieldCheck, ChevronDown } from "lucide-react";
import type { PaymentChannel } from "@/lib/tripay";

type Props = {
  invoiceNo: string;
  channels:  PaymentChannel[];
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

function formatFee(ch: PaymentChannel): string {
  const flat    = ch.total_fee.flat;
  const percent = parseFloat(ch.total_fee.percent);
  if (flat > 0 && percent > 0) return `+Rp ${flat.toLocaleString("id-ID")} + ${percent}%`;
  if (flat > 0)    return `+Rp ${flat.toLocaleString("id-ID")}`;
  if (percent > 0) return `+${percent}%`;
  return "Gratis";
}

export default function PaymentSelector({ invoiceNo, channels }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const grouped  = groupChannels(channels);
  const groupKeys = [...grouped.keys()];

  // Auto-open first group
  const firstGroup = openGroup ?? groupKeys[0] ?? null;

  async function handlePay() {
    if (!selected) { setError("Pilih metode pembayaran terlebih dahulu."); return; }
    setLoading(true);
    setError("");
    try {
      const selectedChannel = channels.find(ch => ch.code === selected);
      const res  = await fetch(`/api/pay/${encodeURIComponent(invoiceNo)}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ method: selected, methodName: selectedChannel?.name }),
      });
      const data = await res.json() as { paymentUrl?: string; error?: string };
      if (!res.ok || !data.paymentUrl) {
        setError(data.error ?? "Gagal membuat transaksi. Coba lagi.");
        return;
      }
      window.location.href = data.paymentUrl;
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (channels.length === 0) {
    return (
      <p className="text-center text-blue-200/40 text-sm py-4">
        Metode pembayaran tidak tersedia. Hubungi admin.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-blue-200/70 text-sm font-medium">Pilih Metode Pembayaran</p>

      {/* Grouped channels */}
      <div className="space-y-2">
        {groupKeys.map(group => {
          const isOpen = (openGroup ?? groupKeys[0]) === group;
          const items  = grouped.get(group)!;
          return (
            <div key={group} className="border border-white/10 rounded-xl overflow-hidden">
              {/* Group header */}
              <button
                onClick={() => setOpenGroup(isOpen ? "__none__" : group)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/3 hover:bg-white/5 transition-colors text-left"
              >
                <span className="text-white text-sm font-medium">{group}</span>
                <ChevronDown className={`w-4 h-4 text-blue-200/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Channel list */}
              {isOpen && (
                <div className="divide-y divide-white/5">
                  {items.map(ch => {
                    const isSelected = selected === ch.code;
                    return (
                      <button
                        key={ch.code}
                        onClick={() => { setSelected(ch.code); setError(""); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isSelected ? "bg-blue-600/15" : "hover:bg-white/3"
                        }`}
                      >
                        {/* Radio */}
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                          isSelected ? "border-blue-500 bg-blue-600" : "border-white/20"
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
                          <div className="w-10 h-6 bg-white/10 rounded shrink-0" />
                        )}

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isSelected ? "text-white" : "text-blue-200/80"}`}>
                            {ch.name}
                          </p>
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
      <button
        onClick={handlePay}
        disabled={loading || !selected}
        className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold py-4 rounded-2xl text-lg transition-colors"
      >
        {loading
          ? <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
          : "Bayar Sekarang"}
      </button>

      {error && (
        <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center justify-center gap-2 text-blue-200/40 text-xs">
        <ShieldCheck className="w-3.5 h-3.5" />
        Pembayaran aman diproses oleh Tripay Payment Gateway
      </div>
    </div>
  );
}
