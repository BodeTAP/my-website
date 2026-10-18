"use client";

import { useRouter, useSearchParams } from "next/navigation";

const FILTERS = [
  { label: "Semua", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Tayang", value: "PUBLISHED" },
  { label: "Dijadwalkan", value: "SCHEDULED" },
];

export default function ArticleFilter() {
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
    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
      {FILTERS.map((f) => (
        <button
          key={f.label}
          onClick={() => setFilter(f.value)}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
            current === f.value
              ? "bg-white text-slate-900 shadow-xs font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
