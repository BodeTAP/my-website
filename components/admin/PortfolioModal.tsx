"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/admin/ImageUpload";

type Portfolio = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  clientName: string | null;
  techStack: string[];
  liveUrl: string | null;
  metrics: string | null;
  order: number;
  featured: boolean;
};

type Props = {
  mode: "create" | "edit";
  portfolio?: Portfolio;
};

export default function PortfolioModal({ mode, portfolio }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [techInput, setTechInput] = useState("");
  const router = useRouter();

  const [form, setForm] = useState({
    title: portfolio?.title ?? "",
    description: portfolio?.description ?? "",
    coverImage: portfolio?.coverImage ?? "",
    clientName: portfolio?.clientName ?? "",
    techStack: portfolio?.techStack ?? [] as string[],
    liveUrl: portfolio?.liveUrl ?? "",
    metrics: portfolio?.metrics ?? "",
    order: portfolio?.order ?? 0,
    featured: portfolio?.featured ?? false,
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const addTech = () => {
    const t = techInput.trim();
    if (t && !form.techStack.includes(t)) set("techStack", [...form.techStack, t]);
    setTechInput("");
  };

  const removeTech = (t: string) => set("techStack", form.techStack.filter((x) => x !== t));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Judul wajib diisi."); return; }
    setLoading(true);
    setError("");
    try {
      const url = mode === "create" ? "/api/admin/portfolio" : `/api/admin/portfolio/${portfolio!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Gagal menyimpan"); }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {mode === "create" ? (
        <Button onClick={() => setOpen(true)} className="rounded-xl bg-[#1E242E] hover:bg-slate-800 text-white gap-2 shadow-xs font-semibold">
          <Plus className="w-4 h-4" />
          Portofolio Baru
        </Button>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setOpen(true)}
          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-8 px-2 rounded-lg">
          <Pencil className="w-3.5 h-3.5" />
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-slate-700" />
                </div>
                <h2 className="text-slate-900 font-bold text-lg tracking-tight">
                  {mode === "create" ? "Tambah Portofolio" : "Edit Portofolio"}
                </h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <Label className="text-slate-900 text-xs font-semibold uppercase tracking-wider">Judul Proyek *</Label>
                <Input value={form.title} onChange={(e) => set("title", e.target.value)}
                  placeholder="Website Toko Online ABC" required
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-slate-900 h-11" />
              </div>

              {/* Cover image */}
              <ImageUpload
                value={form.coverImage}
                onChange={(url) => set("coverImage", url)}
                label="Gambar Cover"
              />

              {/* Client */}
              <div className="space-y-1.5">
                <Label className="text-slate-900 text-xs font-semibold uppercase tracking-wider">Nama Klien</Label>
                <Input value={form.clientName} onChange={(e) => set("clientName", e.target.value)}
                  placeholder="Toko ABC"
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-slate-900 h-11" />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-slate-900 text-xs font-semibold uppercase tracking-wider">Deskripsi</Label>
                <Textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                  rows={3} placeholder="Ceritakan tentang proyek ini..."
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-slate-900 resize-none" />
              </div>

              {/* Tech stack */}
              <div className="space-y-1.5">
                <Label className="text-slate-900 text-xs font-semibold uppercase tracking-wider">Tech Stack</Label>
                <div className="flex gap-2">
                  <Input value={techInput} onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech(); } }}
                    placeholder="Next.js, Tailwind, dll."
                    className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-slate-900 flex-1 h-11" />
                  <Button type="button" onClick={addTech} variant="outline"
                    className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl shrink-0 h-11 px-4 shadow-xs">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {form.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.techStack.map((t) => (
                      <span key={t} className="flex items-center gap-1.5 text-xs bg-slate-100 border border-slate-200 text-slate-700 rounded-full px-3 py-1 font-medium">
                        {t}
                        <button type="button" onClick={() => removeTech(t)} className="text-slate-400 hover:text-rose-600 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Live URL & Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-900 text-xs font-semibold uppercase tracking-wider">Live URL</Label>
                  <Input value={form.liveUrl} onChange={(e) => set("liveUrl", e.target.value)}
                    placeholder="https://tokoabc.com"
                    className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-slate-900 font-mono text-xs h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-900 text-xs font-semibold uppercase tracking-wider">Metrics / Hasil</Label>
                  <Input value={form.metrics} onChange={(e) => set("metrics", e.target.value)}
                    placeholder="Traffic naik 3x dalam 2 bulan"
                    className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-slate-900 h-11" />
                </div>
              </div>

              {/* Order & Featured */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-900 text-xs font-semibold uppercase tracking-wider">Urutan Tampil</Label>
                  <Input type="number" min={0} value={form.order} onChange={(e) => set("order", e.target.value)}
                    className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-slate-900 h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-900 text-xs font-semibold uppercase tracking-wider">Featured</Label>
                  <label className="flex items-center gap-3 h-11 cursor-pointer">
                    <div
                      onClick={() => set("featured", !form.featured)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${form.featured ? "bg-slate-900" : "bg-slate-200"}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.featured ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                    <span className="text-slate-700 font-medium text-sm">{form.featured ? "Ya" : "Tidak"}</span>
                  </label>
                </div>
              </div>

              {error && <p className="text-rose-700 text-xs bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5 font-medium">{error}</p>}

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-xs">
                  Batal
                </Button>
                <Button type="submit" disabled={loading}
                  className="flex-1 rounded-xl bg-[#1E242E] hover:bg-slate-800 text-white shadow-xs font-semibold">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "create" ? "Tambahkan" : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
