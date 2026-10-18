"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/useConfirm";

export default function DeletePortfolioButton({ id, title }: { id: string; title: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { confirm, node } = useConfirm();

  const handleDelete = async () => {
    if (!await confirm(`Hapus portofolio "${title}"?`, { description: "Tindakan ini tidak dapat dibatalkan." })) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/portfolio/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert("Gagal menghapus portofolio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="ghost" disabled={loading} onClick={handleDelete}
        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8 px-2 rounded-lg transition-colors">
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </Button>
      {node}
    </>
  );
}
