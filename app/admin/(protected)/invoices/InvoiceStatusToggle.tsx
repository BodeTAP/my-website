"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InvoiceStatusToggle({
  invoiceId,
  currentStatus,
}: {
  invoiceId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    const newStatus = status === "UNPAID" ? "PAID" : "UNPAID";
    setSaving(true);
    setStatus(newStatus);

    await fetch(`/api/admin/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    setSaving(false);
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all disabled:opacity-50 cursor-pointer ${
        status === "PAID"
          ? "bg-green-500/10 border-green-500/20 text-green-300 hover:bg-green-500/20"
          : "bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20"
      }`}
    >
      {status === "PAID" ? "Lunas" : "Belum Bayar"}
    </button>
  );
}
