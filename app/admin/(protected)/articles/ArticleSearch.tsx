"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ArticleSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (q) params.set("q", q);
      else params.delete("q");
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timeout);
  }, [q, router, searchParams]);

  return (
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200/30" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari judul artikel..."
        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 h-10"
      />
    </div>
  );
}
