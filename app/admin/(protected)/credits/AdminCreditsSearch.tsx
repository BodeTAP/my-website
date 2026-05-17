"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminCreditsSearch({
  paramName,
  pageParamName,
  placeholder,
}: {
  paramName: string;
  pageParamName: string;
  placeholder: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);

  const [q, setQ] = useState(searchParams.get(paramName) ?? "");
  const [isPending, startTransition] = useTransition();
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current);
      if (q.trim()) params.set(paramName, q.trim());
      else params.delete(paramName);
      params.set(pageParamName, "1");

      startTransition(() => {
        router.push(`?${params.toString()}`);
        setIsTyping(false);
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [pageParamName, paramName, q, router]);

  return (
    <div className="relative w-full sm:w-72">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200/30" />
      <Input
        value={q}
        onChange={(event) => {
          setQ(event.target.value);
          setIsTyping(true);
        }}
        placeholder={placeholder}
        className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 h-10"
      />
      {(isTyping || isPending) && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
        </div>
      )}
    </div>
  );
}
