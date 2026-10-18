"use client";

import { useState } from "react";
import { Star, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useConfirm } from "@/hooks/useConfirm";

type Testimonial = {
  id: string; name: string; business: string; text: string;
  rating: number; order: number; featured: boolean;
};

const empty = (): Omit<Testimonial, "id"> => ({
  name: "", business: "", text: "", rating: 5, order: 0, featured: true,
});

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star className={`w-5 h-5 ${n <= value ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
        </button>
      ))}
    </div>
  );
}

function Modal({
  t, onClose, onSave,
}: {
  t: Partial<Testimonial> & { id?: string };
  onClose: () => void;
  onSave: (t: Testimonial) => void;
}) {
  const [form, setForm] = useState({ ...empty(), ...t });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const isEdit = !!t.id;
    const res = await fetch(
      isEdit ? `/api/admin/testimonials/${t.id}` : "/api/admin/testimonials",
      { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }
    );
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Gagal menyimpan"); setLoading(false); return; }
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative border border-slate-200 shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-slate-900 font-bold text-lg mb-5">{t.id ? "Edit Testimoni" : "Tambah Testimoni"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium text-sm">Nama *</Label>
              <Input required value={form.name} onChange={set("name")} placeholder="Ibu Ratna"
                className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium text-sm">Bisnis *</Label>
              <Input required value={form.business} onChange={set("business")} placeholder="Klinik Gigi Sehat"
                className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-sm">Testimoni *</Label>
            <Textarea required value={form.text} onChange={set("text")} rows={3}
              placeholder="Sejak punya website..."
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none" />
          </div>

          <div className="flex items-center gap-6">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium text-sm">Rating</Label>
              <StarRating value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium text-sm">Urutan</Label>
              <Input type="number" value={form.order} onChange={set("order")} className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl w-20 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900" />
            </div>
            <div className="space-y-1.5 flex flex-col">
              <Label className="text-slate-700 font-medium text-sm">Tampilkan</Label>
              <button type="button" onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${form.featured ? "bg-slate-900" : "bg-slate-200"}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-xs ${form.featured ? "left-7" : "left-1"}`} />
              </button>
            </div>
          </div>

          {error && <p className="text-rose-600 text-sm">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs rounded-xl">Batal</Button>
            <Button type="submit" disabled={loading} className="bg-[#1E242E] hover:bg-slate-800 text-white rounded-xl shadow-xs font-semibold">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TestimonialsClient({ initial }: { initial: Testimonial[] }) {
  const [items, setItems] = useState(initial);
  const [modal, setModal] = useState<Partial<Testimonial> | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { confirm, node } = useConfirm();

  const handleSave = (saved: Testimonial) => {
    setItems((prev) => {
      const idx = prev.findIndex((t) => t.id === saved.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [...prev, saved];
    });
    setModal(null);
  };

  const handleDelete = async (id: string) => {
    if (!await confirm("Hapus testimoni ini?", { description: "Testimoni yang dihapus tidak bisa dikembalikan." })) return;
    setDeleting(id);
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((t) => t.id !== id));
    setDeleting(null);
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Testimoni</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola ulasan klien yang ditampilkan di homepage</p>
        </div>
        <Button onClick={() => setModal({})} className="bg-[#1E242E] hover:bg-slate-800 text-white rounded-xl shadow-xs font-semibold">
          <Plus className="w-4 h-4 mr-2" /> Tambah
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs">
          <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Belum ada testimoni. Tambahkan yang pertama!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="text-slate-900 font-semibold text-base">{t.name}</span>
                  <span className="text-slate-500 text-sm font-medium">{t.business}</span>
                  {!t.featured && <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium">Tersembunyi</span>}
                  <div className="flex">
                    {[1,2,3,4,5].map((n) => (
                      <Star key={n} className={`w-3.5 h-3.5 ${n <= t.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 text-sm line-clamp-2 mt-1">{t.text}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setModal(t)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                  {deleting === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <Modal t={modal} onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {node}
    </div>
  );
}
