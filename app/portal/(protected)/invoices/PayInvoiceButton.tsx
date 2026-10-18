"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PayInvoiceButton({
  invoiceNo,
}: {
  invoiceId: string;
  existingPaymentUrl: string | null;
  invoiceNo: string;
}) {
  return (
    <Link href={`/bayar/${encodeURIComponent(invoiceNo)}`} target="_blank" rel="noopener noreferrer">
      <Button className="bg-[#1E242E] hover:bg-slate-800 text-white h-9 px-4 text-xs whitespace-nowrap font-bold rounded-xl shadow-xs transition-colors">
        <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Bayar Sekarang
      </Button>
    </Link>
  );
}
