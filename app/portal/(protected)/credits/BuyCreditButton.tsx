"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BuyCreditButton({ packageId }: { packageId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buyPackage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/portal/credits/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error ?? "Gagal membuat invoice");
      if (typeof data.paymentUrl !== "string") throw new Error("URL pembayaran tidak valid");

      window.location.assign(data.paymentUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat invoice");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={buyPackage} className="space-y-2">
      <Button
        type="submit"
        disabled={loading}
        className="h-10 w-full rounded-xl bg-amber-500 text-xs font-black text-black hover:bg-amber-400"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Beli <ArrowRight className="w-4 h-4 ml-1" /></>}
      </Button>
      {error && <p className="text-red-300 text-xs leading-relaxed">{error}</p>}
    </form>
  );
}
