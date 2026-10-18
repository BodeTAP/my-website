"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function MaintenanceSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [isPending, startTransition] = useTransition();
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current);
      if (q) params.set("q", q);
      else params.delete("q");
      params.set("page", "1");
      
      startTransition(() => {
        router.push(`?${params.toString()}`);
        setIsTyping(false);
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [q, router]);

  return (
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <Input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setIsTyping(true);
        }}
        placeholder="Cari klien / paket..."
        className="pl-10 pr-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 rounded-xl h-10 text-sm"
      />
      {(isTyping || isPending) && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
        </div>
      )}
    </div>
  );
}
