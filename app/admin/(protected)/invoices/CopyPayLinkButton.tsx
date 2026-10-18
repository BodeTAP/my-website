"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CopyPayLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleCopy}
      title="Salin link pembayaran"
      className="h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-emerald-600" />
        : <Link2 className="w-3.5 h-3.5 text-slate-500" />}
    </Button>
  );
}
