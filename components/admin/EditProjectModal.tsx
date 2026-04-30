"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditProjectModal({ project }: { project: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      liveUrl: formData.get("liveUrl"),
      notes: formData.get("notes"),
    };

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Gagal menyimpan");
      
      setOpen(false);
      router.refresh();
    } catch (err) {
      alert("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="text-blue-400 hover:bg-blue-500/10">
        <Edit2 className="w-4 h-4" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-lg rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Edit Proyek</h2>
            
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-blue-200/60 mb-1">Nama Proyek</label>
                <input
                  name="name"
                  defaultValue={project.name}
                  required
                  className="w-full bg-[#050b14]/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-blue-200/60 mb-1">Deskripsi</label>
                <textarea
                  name="description"
                  defaultValue={project.description || ""}
                  rows={2}
                  className="w-full bg-[#050b14]/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-blue-200/60 mb-1">Live URL (Link Staging/Live)</label>
                <input
                  name="liveUrl"
                  type="url"
                  defaultValue={project.liveUrl || ""}
                  className="w-full bg-[#050b14]/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-blue-200/60 mb-1">Catatan Tim (Tampil di Portal Klien)</label>
                <textarea
                  name="notes"
                  defaultValue={project.notes || ""}
                  rows={3}
                  className="w-full bg-[#050b14]/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
