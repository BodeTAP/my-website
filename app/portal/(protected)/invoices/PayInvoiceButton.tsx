"use client";

import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PayInvoiceButton({
  invoiceId,
  existingPaymentUrl,
}: {
  invoiceId: string;
  existingPaymentUrl: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handlePay() {
    setLoading(true);
    setError("");

    try {
      // If payment URL already exists, go directly
      if (existingPaymentUrl) {
        window.open(existingPaymentUrl, "_blank");
        setLoading(false);
        return;
      }

      const res  = await fetch(`/api/portal/invoices/${invoiceId}/pay`, { method: "POST" });
      const data = await res.json() as { paymentUrl?: string; error?: string };

      if (!res.ok || !data.paymentUrl) {
        setError(data.error ?? "Gagal membuka pembayaran. Coba lagi.");
        setLoading(false);
        return;
      }

      window.open(data.paymentUrl, "_blank");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        onClick={handlePay}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-500 text-white h-8 px-4 text-xs whitespace-nowrap font-semibold"
      >
        {loading
          ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Memproses...</>
          : <><CreditCard className="w-3.5 h-3.5 mr-1.5" /> Bayar Sekarang</>
        }
      </Button>
      {error && <p className="text-red-400 text-[11px] text-right">{error}</p>}
    </div>
  );
}
