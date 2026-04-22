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
      <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white">
        <Plus className="w-4 h-4 mr-2" />
        Proyek Baru
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Modal */}
          <div className="relative glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-white font-bold text-lg">Proyek Baru</h2>
              <button onClick={() => setOpen(false)} className="text-blue-200/50 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Klien */}
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-sm">Klien *</Label>
                <select
                  required
                  value={form.clientId}
                  onChange={set("clientId")}
                  className="w-full h-10 rounded-lg px-3 text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="" className="bg-[#0d1b35]">— Pilih klien —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0d1b35]">
                      {c.businessName} ({c.user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Nama proyek */}
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-sm">Nama Proyek *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Website Toko Maju Jaya"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
                />
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-sm">Deskripsi</Label>
                <Textarea
                  value={form.description}
                  onChange={set("description")}
                  rows={2}
                  placeholder="Deskripsi singkat proyek..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div className="space-y-1.5">
                  <Label className="text-blue-200 text-sm">Status</Label>
                  <select
                    value={form.status}
                    onChange={set("status")}
                    className="w-full h-10 rounded-lg px-3 text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value} className="bg-[#0d1b35]">{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* Deadline */}
                <div className="space-y-1.5">
                  <Label className="text-blue-200 text-sm">Deadline</Label>
                  <Input
                    type="date"
                    value={form.deadline}
                    onChange={set("deadline")}
                    className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Live URL */}
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-sm">Live URL</Label>
                <Input
                  value={form.liveUrl}
                  onChange={set("liveUrl")}
                  placeholder="https://tokobaru.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
                />
              </div>

              {/* Catatan internal */}
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-sm">Catatan Internal</Label>
                <Textarea
                  value={form.notes}
                  onChange={set("notes")}
                  rows={2}
                  placeholder="Catatan untuk tim (tidak terlihat klien)..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 resize-none"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                  Batal
                </Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white">
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
