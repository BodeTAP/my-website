"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

export default function BlogSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (q.trim()) {
        params.set("q", q.trim());
      } else {
        params.delete("q");
      }
      
      const queryString = params.toString();
      startTransition(() => {
        router.push(`/blog${queryString ? `?${queryString}` : ""}`);
        setIsTyping(false);
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, [q, router, searchParams]);

  return (
    <div className="relative max-w-lg mx-auto">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setIsTyping(true);
        }}
        placeholder="Cari artikel, panduan, atau tips..."
        className="w-full rounded-full border border-slate-700 bg-slate-900/90 py-3 pl-11 pr-11 text-sm text-white placeholder:text-slate-400 outline-hidden transition-colors focus:border-slate-400"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {(isTyping || isPending) && (
          <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
        )}
        {q && !isTyping && !isPending && (
          <button
            onClick={() => setQ("")}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Hapus pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
