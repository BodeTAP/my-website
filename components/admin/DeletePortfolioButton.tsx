"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DeletePortfolioButton({ id, title }: { id: string; title: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Hapus portofolio "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
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
    <Button size="sm" variant="ghost" disabled={loading} onClick={handleDelete}
      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-2">
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </Button>
  );
}
