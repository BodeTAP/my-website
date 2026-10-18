"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const OPTIONS = [
  { value: "DRAFT",    label: "Draft" },
  { value: "SENT",     label: "Terkirim" },
  { value: "ACCEPTED", label: "Diterima" },
  { value: "DECLINED", label: "Ditolak" },
];

export default function ProposalStatusSelect({
  proposalId,
  currentStatus,
}: {
  proposalId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const router = useRouter();

  async function handleChange(val: string) {
    setStatus(val);
    await fetch(`/api/admin/proposals/${proposalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: val }),
    });
    router.refresh();
  }

  return (
    <select
      value={status}
      onChange={e => handleChange(e.target.value)}
      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 cursor-pointer"
    >
      {OPTIONS.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
