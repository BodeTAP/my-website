"use client";

import { useState } from "react";
import { Loader2, CreditCard, ShieldCheck } from "lucide-react";

export default function PayNowButton({ invoiceNo }: { invoiceNo: string }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handlePay() {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`/api/pay/${encodeURIComponent(invoiceNo)}`, { method: "POST" });
      const data = await res.json() as { paymentUrl?: string; error?: string };
      if (!res.ok || !data.paymentUrl) {
        setError(data.error ?? "Gagal membuka halaman pembayaran. Coba lagi.");
        return;
      }
      window.location.href = data.paymentUrl;
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-colors shadow-lg shadow-blue-500/25"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
        ) : (
          <><CreditCard className="w-5 h-5" /> Bayar Sekarang</>
        )}
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
