"use client";

import { useState } from "react";
import { Tag, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/useConfirm";

type Category = { id: string; name: string; slug: string; _count: { articles: number } };

export default function CategoriesClient({ initial }: { initial: Category[] }) {
  const [items, setItems] = useState(initial);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { confirm, node } = useConfirm();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true); setError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setItems((prev) => [...prev, { ...data, _count: { articles: 0 } }].sort((a, b) => a.name.localeCompare(b.name)));
    setNewName("");
    setLoading(false);
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    setLoading(true); setError("");
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setItems((prev) => prev.map((c) => c.id === id ? { ...data, _count: c._count } : c).sort((a, b) => a.name.localeCompare(b.name)));
    setEditId(null);
    setLoading(false);
  };

  const handleDelete = async (id: string, articleCount: number) => {
    if (articleCount > 0 && !await confirm(`Hapus kategori ini?`, { description: `Kategori digunakan oleh ${articleCount} artikel. Artikel akan kehilangan kategorinya.`, confirmLabel: "Hapus", variant: "warning" })) return;
    if (articleCount === 0 && !await confirm("Hapus kategori ini?")) return;
    setLoading(true);
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((c) => c.id !== id));
    setLoading(false);
  };

  return (
    <>
    {node}
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kategori Artikel</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola kategori untuk mengorganisir artikel blog</p>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-white rounded-2xl p-4 sm:p-5 mb-5 flex gap-3 border border-slate-200 shadow-2xs">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nama kategori baru... (e.g. Tips SEO)"
          className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 rounded-xl h-10 text-sm flex-1"
        />
        <Button type="submit" disabled={loading || !newName.trim()} className="bg-[#1E242E] hover:bg-slate-800 text-white rounded-xl shadow-xs font-semibold shrink-0">
          <Plus className="w-4 h-4 mr-1.5" /> Tambah
        </Button>
      </form>
      {error && <p className="text-rose-600 text-sm mb-4">{error}</p>}

      {/* List */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs">
          <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Belum ada kategori. Tambahkan di atas!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((c) => (
            <div key={c.id} className="bg-white rounded-xl px-5 py-3.5 flex items-center gap-3 border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
              {editId === c.id ? (
                <>
                  <Input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleEdit(c.id); if (e.key === "Escape") setEditId(null); }}
                    className="bg-slate-50 border-slate-200 text-slate-900 rounded-lg flex-1 h-8 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <button onClick={() => handleEdit(c.id)} disabled={loading}
                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditId(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-900 font-medium text-sm flex-1">{c.name}</span>
                  <span className="text-slate-400 text-xs font-mono">/{c.slug}</span>
                  <span className="text-slate-500 text-xs bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">{c._count.articles} artikel</span>
                  <button onClick={() => { setEditId(c.id); setEditName(c.name); }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(c.id, c._count.articles)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
