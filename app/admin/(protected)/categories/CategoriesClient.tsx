"use client";

import { useState } from "react";
import { Tag, Plus, Pencil, Trash2, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = { id: string; name: string; slug: string; _count: { articles: number } };

export default function CategoriesClient({ initial }: { initial: Category[] }) {
  const [items, setItems] = useState(initial);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    if (articleCount > 0 && !confirm(`Kategori ini digunakan oleh ${articleCount} artikel. Artikel akan kehilangan kategorinya. Lanjutkan?`)) return;
    if (articleCount === 0 && !confirm("Hapus kategori ini?")) return;
    setLoading(true);
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((c) => c.id !== id));
    setLoading(false);
  };

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Kategori Artikel</h1>
        <p className="text-blue-200/50 text-sm mt-1">Kelola kategori untuk mengorganisir artikel blog</p>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="glass rounded-2xl p-5 mb-5 flex gap-3">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nama kategori baru... (e.g. Tips SEO)"
          className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 flex-1"
        />
        <Button type="submit" disabled={loading || !newName.trim()} className="bg-blue-600 hover:bg-blue-500 text-white shrink-0">
          <Plus className="w-4 h-4 mr-1.5" /> Tambah
        </Button>
      </form>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {/* List */}
      {items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Tag className="w-10 h-10 text-blue-500/20 mx-auto mb-3" />
          <p className="text-blue-200/40">Belum ada kategori. Tambahkan di atas!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((c) => (
            <div key={c.id} className="glass rounded-xl px-5 py-3.5 flex items-center gap-3">
              {editId === c.id ? (
                <>
                  <Input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleEdit(c.id); if (e.key === "Escape") setEditId(null); }}
                    className="bg-white/5 border-white/10 text-white flex-1 h-8 text-sm"
                  />
                  <button onClick={() => handleEdit(c.id)} disabled={loading}
                    className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditId(null)}
                    className="p-1.5 rounded-lg text-blue-200/40 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Tag className="w-4 h-4 text-blue-400/50 shrink-0" />
                  <span className="text-white font-medium text-sm flex-1">{c.name}</span>
                  <span className="text-blue-200/30 text-xs font-mono">/{c.slug}</span>
                  <span className="text-blue-200/40 text-xs">{c._count.articles} artikel</span>
                  <button onClick={() => { setEditId(c.id); setEditName(c.name); }}
                    className="p-1.5 rounded-lg text-blue-400/50 hover:text-blue-300 hover:bg-white/5 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(c.id, c._count.articles)}
                    className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/5 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
