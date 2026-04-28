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
      className="h-8 px-2.5 border-white/10 text-blue-400/70 hover:text-blue-300 hover:bg-white/5"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-green-400" />
        : <Link2 className="w-3.5 h-3.5" />}
    </Button>
  );
}
