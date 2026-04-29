"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export default function BlogSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQuery);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (q.trim()) {
        params.set("q", q.trim());
      } else {
        params.delete("q");
      }
      
      const queryString = params.toString();
      router.push(`/blog${queryString ? `?${queryString}` : ""}`);
    }, 400);

    return () => clearTimeout(timeout);
  }, [q, router, searchParams]);

  return (
    <div className="relative max-w-md mx-auto mb-8">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200/25">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari artikel..."
        className="w-full glass rounded-2xl pl-12 pr-12 py-3 border border-white/10 text-white placeholder:text-blue-200/25 focus:border-blue-500/40 outline-none transition-all"
      />
      {q && (
        <button
          onClick={() => setQ("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-200/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
