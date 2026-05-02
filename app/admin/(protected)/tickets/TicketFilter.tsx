"use client";

import { useRouter, useSearchParams } from "next/navigation";

const FILTERS = [
  { label: "Semua", value: "" },
  { label: "Terbuka", value: "OPEN" },
  { label: "Diproses", value: "IN_PROGRESS" },
  { label: "Selesai", value: "CLOSED" },
];

export default function TicketFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") ?? "";

  const setFilter = (val: string) => {
    const params = new URLSearchParams(searchParams);
    if (val) params.set("status", val);
    else params.delete("status");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-1 bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto">
      {FILTERS.map((f) => (
        <button
          key={f.label}
          onClick={() => setFilter(f.value)}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
            current === f.value
              ? "bg-pink-600 text-white shadow-lg"
              : "text-blue-200/40 hover:text-white"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
