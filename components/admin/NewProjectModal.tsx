"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Client = { id: string; businessName: string; user: { name: string | null; email: string } };

const STATUS_OPTIONS = [
  { value: "DRAFTING",    label: "Drafting" },
  { value: "DEVELOPMENT", label: "Development" },
  { value: "TESTING",     label: "Testing" },
  { value: "LIVE",        label: "Live" },
];

export default function NewProjectModal({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    clientId: "",
    name: "",
    description: "",
    status: "DRAFTING",
    deadline: "",
    liveUrl: "",
    notes: "",
  });

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Gagal membuat proyek.");
      setLoading(false);
      return;
    }

    setOpen(false);
    setForm({ clientId: "", name: "", description: "", status: "DRAFTING", deadline: "", liveUrl: "", notes: "" });
    setLoading(false);
    router.refresh();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="rounded-xl bg-[#1E242E] hover:bg-slate-800 text-white shadow-xs font-semibold">
        <Plus className="w-4 h-4 mr-1.5" />
        Proyek Baru
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setOpen(false)} />

          {/* Modal */}
          <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-slate-900 font-bold text-lg tracking-tight">Proyek Baru</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Klien */}
              <div className="space-y-1.5">
                <Label className="text-slate-900 text-xs font-semibold uppercase tracking-wider">Klien *</Label>
                <select
                  required
                  value={form.clientId}
                  onChange={set("clientId")}
                  className="w-full h-11 rounded-xl px-3.5 text-sm bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all cursor-pointer"
                >
                  <option value="" className="bg-white text-slate-500">— Pilih klien —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white text-slate-900">
                      {c.businessName} ({c.user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Nama proyek */}
              <div className="space-y-1.5">
                <Label className="text-slate-900 text-xs font-semibold uppercase tracking-wider">Nama Proyek *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Website Toko Maju Jaya"
                  className="h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                />
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <Label className="text-slate-900 text-xs font-semibold uppercase tracking-wider">Deskripsi</Label>
                <Textarea
                  value={form.description}
                  onChange={set("description")}
                  rows={2}
                  placeholder="Deskripsi singkat proyek..."
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div className="space-y-1.5">
                  <Label className="text-slate-900 text-xs font-semibold uppercase tracking-wider">Status</Label>
                  <select
                    value={form.status}
                    onChange={set("status")}
                    className="w-full h-11 rounded-xl px-3.5 text-sm bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value} className="bg-white text-slate-900">{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* Deadline */}
                <div className="space-y-1.5">
                  <Label className="text-slate-900 text-xs font-semibold uppercase tracking-wider">Deadline</Label>
                  <Input
                    type="date"
                    value={form.deadline}
                    onChange={set("deadline")}
                    className="h-11 bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                  />
                </div>
              </div>

              {/* Live URL */}
              <div className="space-y-1.5">
                <Label className="text-slate-900 text-xs font-semibold uppercase tracking-wider">Live URL</Label>
                <Input
                  value={form.liveUrl}
                  onChange={set("liveUrl")}
                  placeholder="https://tokobaru.com"
                  className="h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono text-xs"
                />
              </div>

              {/* Catatan internal */}
              <div className="space-y-1.5">
                <Label className="text-slate-900 text-xs font-semibold uppercase tracking-wider">Catatan Internal</Label>
                <Textarea
                  value={form.notes}
                  onChange={set("notes")}
                  rows={2}
                  placeholder="Catatan untuk tim (tidak terlihat klien)..."
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all resize-none"
                />
              </div>

              {error && (
                <p className="text-rose-700 text-xs font-semibold bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs">
                  Batal
                </Button>
                <Button type="submit" disabled={loading} className="rounded-xl bg-[#1E242E] hover:bg-slate-800 text-white shadow-xs font-semibold">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buat Proyek"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
