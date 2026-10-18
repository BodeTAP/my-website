"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/hooks/useConfirm";

export default function DeleteArticleButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { confirm, node } = useConfirm();

  const handleDelete = async () => {
    if (!await confirm("Hapus artikel ini?", { description: "Tindakan ini tidak bisa dibatalkan." })) return;
    setLoading(true);
    await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        disabled={loading}
        onClick={handleDelete}
        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      {node}
    </>
  );
}
