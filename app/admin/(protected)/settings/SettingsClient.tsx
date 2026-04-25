"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsClient({ initial }: { initial: Record<string, string> }) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    else setError("Gagal menyimpan pengaturan.");
    setLoading(false);
  };

  const stats = [
    { numKey: "hero_stat_1_num", labelKey: "hero_stat_1_label", title: "Stat 1 (Proyek)" },
    { numKey: "hero_stat_2_num", labelKey: "hero_stat_2_label", title: "Stat 2 (Kepuasan)" },
    { numKey: "hero_stat_3_num", labelKey: "hero_stat_3_label", title: "Stat 3 (Delivery)" },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Pengaturan Situs</h1>
        <p className="text-blue-200/50 text-sm mt-1">Konfigurasi konten yang tampil di homepage</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hero Stats */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1">Statistik Hero</h2>
          <p className="text-blue-200/40 text-xs mb-5">Angka yang tampil di bawah tombol CTA homepage</p>
          <div className="space-y-4">
            {stats.map((s) => (
              <div key={s.numKey} className="grid grid-cols-2 gap-3 items-end">
                <div className="space-y-1.5">
                  <Label className="text-blue-200/70 text-xs">{s.title} — Nilai</Label>
                  <Input
                    value={form[s.numKey] ?? ""}
                    onChange={set(s.numKey)}
                    placeholder="50+"
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-blue-200/70 text-xs">{s.title} — Label</Label>
                  <Input
                    value={form[s.labelKey] ?? ""}
                    onChange={set(s.labelKey)}
                    placeholder="Proyek selesai"
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Simpan Pengaturan
          </Button>
          {saved && <span className="text-green-400 text-sm">✓ Tersimpan</span>}
        </div>
      </form>
    </div>
  );
}
