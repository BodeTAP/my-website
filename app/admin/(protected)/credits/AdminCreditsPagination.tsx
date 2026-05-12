"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminCreditsPagination({
  pageParamName,
  totalPages,
}: {
  pageParamName: string;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get(pageParamName) ?? "1");
  const [isPending, startTransition] = useTransition();
  const [pendingPage, setPendingPage] = useState<number | null>(null);

  const setPage = (page: number) => {
    if (page === currentPage || isPending) return;
    const params = new URLSearchParams(searchParams);
    params.set(pageParamName, page.toString());
    setPendingPage(page);
    startTransition(() => {
      router.push(`?${params.toString()}`);
      setPendingPage(null);
    });
  };

  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let page = 1; page <= totalPages; page++) pages.push(page);
  } else {
    pages.push(1);
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    if (currentPage <= 2) end = 4;
    if (currentPage >= totalPages - 1) start = totalPages - 3;
    if (start > 2) pages.push("...");
    for (let page = start; page <= end; page++) pages.push(page);
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

      {pages.map((page, index) =>
        typeof page === "number" ? (
          <Button
            key={index}
            variant={currentPage === page ? "default" : "outline"}
            disabled={isPending}
            onClick={() => setPage(page)}
            className={`h-8 w-8 p-0 text-xs ${
              currentPage === page
                ? "bg-amber-500 text-black hover:bg-amber-400"
                : "border-white/10 text-blue-200/50 hover:text-white hover:bg-white/5"
            } disabled:opacity-60`}
          >
            {isPending && pendingPage === page ? <Loader2 className="w-3 h-3 animate-spin" /> : page}
          </Button>
        ) : (
          <span key={index} className="text-blue-200/30 text-xs px-1">...</span>
        ),
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
