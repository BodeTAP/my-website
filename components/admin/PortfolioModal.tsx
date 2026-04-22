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
        <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
          <Plus className="w-4 h-4" />
          Portofolio Baru
        </Button>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setOpen(true)}
          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 px-2">
          <Pencil className="w-3.5 h-3.5" />
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-teal-400" />
                </div>
                <h2 className="text-white font-semibold">
                  {mode === "create" ? "Tambah Portofolio" : "Edit Portofolio"}
                </h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-blue-200/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Judul Proyek *</Label>
                <Input value={form.title} onChange={(e) => set("title", e.target.value)}
                  placeholder="Website Toko Online ABC" required
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-500/50" />
              </div>

              {/* Cover image */}
              <ImageUpload
                value={form.coverImage}
                onChange={(url) => set("coverImage", url)}
                label="Gambar Cover"
              />

              {/* Client */}
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Nama Klien</Label>
                <Input value={form.clientName} onChange={(e) => set("clientName", e.target.value)}
                  placeholder="Toko ABC"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-500/50" />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Deskripsi</Label>
                <Textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                  rows={3} placeholder="Ceritakan tentang proyek ini..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-500/50 resize-none" />
              </div>

              {/* Tech stack */}
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Tech Stack</Label>
                <div className="flex gap-2">
                  <Input value={techInput} onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech(); } }}
                    placeholder="Next.js, Tailwind, dll."
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-500/50 flex-1" />
                  <Button type="button" onClick={addTech} variant="outline"
                    className="border-white/10 text-white hover:bg-white/5 shrink-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {form.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.techStack.map((t) => (
                      <span key={t} className="flex items-center gap-1.5 text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full px-3 py-1">
                        {t}
                        <button type="button" onClick={() => removeTech(t)} className="text-blue-400/60 hover:text-red-400 transition-colors">
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
                  <Label className="text-blue-200/70 text-xs">Live URL</Label>
                  <Input value={form.liveUrl} onChange={(e) => set("liveUrl", e.target.value)}
                    placeholder="https://tokooabc.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-500/50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-blue-200/70 text-xs">Metrics / Hasil</Label>
                  <Input value={form.metrics} onChange={(e) => set("metrics", e.target.value)}
                    placeholder="Traffic naik 3x dalam 2 bulan"
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-500/50" />
                </div>
              </div>

              {/* Order & Featured */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-blue-200/70 text-xs">Urutan Tampil</Label>
                  <Input type="number" min={0} value={form.order} onChange={(e) => set("order", e.target.value)}
                    className="bg-white/5 border-white/10 text-white focus:border-blue-500/50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-blue-200/70 text-xs">Featured</Label>
                  <label className="flex items-center gap-3 h-10 cursor-pointer">
                    <div
                      onClick={() => set("featured", !form.featured)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${form.featured ? "bg-teal-500" : "bg-white/10"}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.featured ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                    <span className="text-blue-200/60 text-sm">{form.featured ? "Ya" : "Tidak"}</span>
                  </label>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}
                  className="flex-1 border border-white/10 text-blue-200/60 hover:text-white hover:bg-white/5">
                  Batal
                </Button>
                <Button type="submit" disabled={loading}
                  className="flex-1 bg-teal-600 hover:bg-teal-500 text-white">
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
