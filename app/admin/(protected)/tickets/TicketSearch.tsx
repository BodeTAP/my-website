"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function TicketSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [isPending, startTransition] = useTransition();
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsTyping(true);
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
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200/30" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari subjek / klien..."
        className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 h-10"
      />
      {(isTyping || isPending) && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
        </div>
      )}
    </div>
  );
}
