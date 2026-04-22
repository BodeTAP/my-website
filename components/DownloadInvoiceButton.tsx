"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DownloadInvoiceButton({
  invoiceId,
  invoiceNo,
  variant = "default",
}: {
  invoiceId: string;
  invoiceNo: string;
  variant?: "default" | "ghost" | "outline";
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pdf`);
      if (!res.ok) throw new Error("Gagal generate PDF");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${invoiceNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal mengunduh invoice. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={variant}
      disabled={loading}
      onClick={handleDownload}
      className={
        variant === "default"
          ? "bg-blue-600/80 hover:bg-blue-600 text-white h-8 px-3 text-xs"
          : variant === "outline"
          ? "border-white/10 text-white hover:bg-white/5 h-8 px-3 text-xs"
          : "text-blue-400 hover:text-blue-300 hover:bg-white/5 h-8 px-3 text-xs"
      }
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          PDF
        </>
      )}
    </Button>
  );
}
