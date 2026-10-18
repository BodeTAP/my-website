"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type EditableProject = {
  id: string;
  name: string;
  description: string | null;
  liveUrl: string | null;
  notes: string | null;
};

export default function EditProjectModal({ project }: { project: EditableProject }) {
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
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
        <Edit2 className="w-4 h-4" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl p-6 sm:p-7 bg-white border border-slate-200 shadow-xl">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-5">Edit Proyek</h2>
            
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Nama Proyek</label>
                <input
                  name="name"
                  defaultValue={project.name}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Deskripsi</label>
                <textarea
                  name="description"
                  defaultValue={project.description || ""}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Live URL (Link Staging/Live)</label>
                <input
                  name="liveUrl"
                  type="url"
                  defaultValue={project.liveUrl || ""}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Catatan Tim (Tampil di Portal Klien)</label>
                <textarea
                  name="notes"
                  defaultValue={project.notes || ""}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
                  Batal
                </Button>
                <Button type="submit" disabled={loading} className="rounded-xl bg-[#1E242E] hover:bg-slate-800 text-white shadow-xs font-semibold">
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
