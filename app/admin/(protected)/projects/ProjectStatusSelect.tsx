"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "DRAFTING",    label: "Drafting",    color: "text-blue-300" },
  { value: "DEVELOPMENT", label: "Development", color: "text-amber-300" },
  { value: "TESTING",     label: "Testing",     color: "text-violet-300" },
  { value: "LIVE",        label: "Live",        color: "text-green-300" },
];

export default function ProjectStatusSelect({
  projectId,
  currentStatus,
}: {
  projectId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setSaving(true);
    setStatus(newStatus);

    await fetch(`/api/admin/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    setSaving(false);
    router.refresh();
  };

  const current = STATUS_OPTIONS.find((s) => s.value === status);

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={saving}
      className={`text-xs font-medium rounded-lg px-2.5 py-1.5 border bg-transparent focus:outline-none focus:border-blue-500/50 cursor-pointer transition-opacity disabled:opacity-50 ${
        status === "DRAFTING"
          ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
          : status === "DEVELOPMENT"
          ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
          : status === "TESTING"
          ? "border-violet-500/20 bg-violet-500/10 text-violet-300"
          : "border-green-500/20 bg-green-500/10 text-green-300"
      }`}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s.value} value={s.value} className="bg-[#0d1b35] text-white">
          {s.label}
        </option>
      ))}
    </select>
  );
}
