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
        className="h-8 w-8 border-white/10 text-white hover:bg-white/5 disabled:opacity-30"
      >
        {isPending && pendingPage === currentPage - 1
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <ChevronLeft className="w-4 h-4" />}
      </Button>

      {pages.map((p, i) =>
        typeof p === "number" ? (
          <Button
            key={i}
            variant={currentPage === p ? "default" : "outline"}
            disabled={isPending}
            onClick={() => setPage(p)}
            className={`h-8 w-8 p-0 text-xs ${
              currentPage === p
                ? "bg-pink-600 text-white"
                : "border-white/10 text-blue-200/50 hover:text-white hover:bg-white/5"
            } disabled:opacity-60`}
          >
            {isPending && pendingPage === p
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : p}
          </Button>
        ) : (
          <span key={i} className="text-blue-200/30 text-xs px-1">...</span>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages || isPending}
        onClick={() => setPage(currentPage + 1)}
        className="h-8 w-8 border-white/10 text-white hover:bg-white/5 disabled:opacity-30"
      >
        {isPending && pendingPage === currentPage + 1
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <ChevronRight className="w-4 h-4" />}
      </Button>
    </div>
  );
}
