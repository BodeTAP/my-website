"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ToolActionButton({
  href,
  label,
  loadingLabel,
  className,
}: {
  href: string;
  label: string;
  loadingLabel?: string;
  className: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        router.push(href);
      }}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          {loadingLabel ?? "Memuat..."}
        </>
      ) : (
        <>
          {label}
          <ArrowRight className="w-4 h-4 ml-1" />
        </>
      )}
    </Button>
  );
}
