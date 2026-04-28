"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PayInvoiceButton({
  invoiceId: _invoiceId,
  existingPaymentUrl: _existingPaymentUrl,
  invoiceNo,
}: {
  invoiceId: string;
  existingPaymentUrl: string | null;
  invoiceNo: string;
}) {
  return (
    <Link href={`/bayar/${encodeURIComponent(invoiceNo)}`} target="_blank" rel="noopener noreferrer">
      <Button className="bg-blue-600 hover:bg-blue-500 text-white h-8 px-4 text-xs whitespace-nowrap font-semibold">
        <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Bayar Sekarang
      </Button>
    </Link>
  );
}
