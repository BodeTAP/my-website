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

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={saving}
      className={`text-xs font-semibold rounded-lg px-2.5 py-1 border transition-opacity disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-900 ${
        status === "DRAFTING"
          ? "border-slate-200 bg-slate-100 text-slate-700"
          : status === "DEVELOPMENT"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : status === "TESTING"
          ? "border-purple-200 bg-purple-50 text-purple-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
