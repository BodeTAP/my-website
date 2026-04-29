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
    setIsTyping(true);
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
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {(isTyping || isPending) && (
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
        )}
        {q && !isTyping && !isPending && (
          <button
            onClick={() => setQ("")}
            className="text-blue-200/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
