"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TicketPagination({ totalPages }: { totalPages: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") ?? "1");
  const [isPending, startTransition] = useTransition();
  const [pendingPage, setPendingPage] = useState<number | null>(null);

  const setPage = (p: number) => {
    if (p === currentPage || isPending) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", p.toString());
    setPendingPage(p);
    startTransition(() => {
      router.push(`?${params.toString()}`);
      setPendingPage(null);
    });
  };

  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    if (currentPage <= 2) end = 4;
    if (currentPage >= totalPages - 1) start = totalPages - 3;
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1 || isPending}
        onClick={() => setPage(currentPage - 1)}
        className="h-8 w-8 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40"
      >
        {isPending && pendingPage === currentPage - 1
          ? <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          : <ChevronLeft className="w-4 h-4" />}
      </Button>

      {pages.map((p, i) =>
        typeof p === "number" ? (
          <Button
            key={i}
            variant={currentPage === p ? "default" : "outline"}
            disabled={isPending}
            onClick={() => setPage(p)}
            className={`h-8 w-8 rounded-xl p-0 text-xs font-semibold ${
              currentPage === p
                ? "bg-[#1E242E] text-white hover:bg-slate-800 shadow-xs"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs"
            } disabled:opacity-60`}
          >
            {isPending && pendingPage === p
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : p}
          </Button>
        ) : (
          <span key={i} className="text-slate-400 text-xs px-1">...</span>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages || isPending}
        onClick={() => setPage(currentPage + 1)}
        className="h-8 w-8 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40"
      >
        {isPending && pendingPage === currentPage + 1
          ? <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          : <ChevronRight className="w-4 h-4" />}
      </Button>
    </div>
  );
}
