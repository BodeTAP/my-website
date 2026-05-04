"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, UserPlus, Trash2, KeyRound, X, Shield, Settings as SettingsIcon, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfirm } from "@/hooks/useConfirm";

type Admin = { id: string; name: string | null; email: string; createdAt: string };

// --- Modals for Team Management ---

function AddAdminModal({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Password tidak cocok."); return; }
    if (form.password.length < 8) { setError("Password minimal 8 karakter."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOpen(false);
      setForm({ name: "", email: "", password: "", confirm: "" });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally { setLoading(false); }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
        <UserPlus className="w-4 h-4" /> Tambah Admin
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative glass rounded-2xl w-full max-w-md border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-400" />
                </div>
                <h2 className="text-white font-semibold">Tambah Admin Baru</h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-blue-200/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Nama (opsional)</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Budi Santoso"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Email *</Label>
                <Input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="budi@mfweb.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Password *</Label>
                <Input type="password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Minimal 8 karakter"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Konfirmasi Password *</Label>
                <Input type="password" required value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                  placeholder="Ulangi password"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30" />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}
                  className="flex-1 border border-white/10 text-blue-200/60 hover:text-white hover:bg-white/5">
                  Batal
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tambahkan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function ResetPasswordModal({ admin, onDone }: { admin: Admin; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Password tidak cocok."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/admin/team/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOpen(false);
      setForm({ password: "", confirm: "" });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally { setLoading(false); }
  };

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}
        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 px-2" title="Reset password">
        <KeyRound className="w-3.5 h-3.5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative glass rounded-2xl w-full max-w-sm border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-white font-semibold text-sm">Reset Password — {admin.name ?? admin.email}</h2>
              <button onClick={() => setOpen(false)} className="text-blue-200/40 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Password Baru *</Label>
                <Input type="password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Minimal 8 karakter"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Konfirmasi *</Label>
                <Input type="password" required value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                  placeholder="Ulangi password"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30" />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}
                  className="flex-1 border border-white/10 text-blue-200/60 hover:text-white hover:bg-white/5">Batal</Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function DeleteAdminButton({ admin, currentId, onDone }: { admin: Admin; currentId: string; onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const isSelf = admin.id === currentId;
  const { confirm, node } = useConfirm();

  const handleDelete = async () => {
    if (isSelf) return;
    if (!await confirm(`Hapus akses admin untuk ${admin.name ?? admin.email}?`, { description: "Admin ini tidak akan bisa login lagi." })) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/team/${admin.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onDone();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus admin");
    } finally { setLoading(false); }
  };

  return (
    <>
      <Button size="sm" variant="ghost" disabled={loading || isSelf} onClick={handleDelete}
        title={isSelf ? "Tidak bisa menghapus akun sendiri" : "Hapus admin"}
        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-2 disabled:opacity-30">
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </Button>
      {node}
    </>
  );
}

// --- Main Settings Component ---

export default function SettingsClient({ 
  initial, 
  initialAdmins, 
  currentUserId 
}: { 
  initial: Record<string, string>; 
  initialAdmins: Admin[]; 
  currentUserId: string; 
}) {
  const [activeTab, setActiveTab] = useState<"umum" | "ai" | "tim">("umum");
  
  // Settings State
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Team State
  const [admins, setAdmins] = useState(initialAdmins);
  const router = useRouter();

  const refreshAdmins = () => {
    fetch("/api/admin/team")
      .then((r) => r.json())
      .then(setAdmins)
      .catch(() => router.refresh());
  };

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
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/20">
            <SettingsIcon className="w-5 h-5 text-blue-400" />
          </div>
          Pengaturan & Konfigurasi
        </h1>
        <p className="text-blue-200/50 text-sm mt-2">Kelola konten situs, statistik hero, dan akses tim admin.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-8">
        <button
          onClick={() => setActiveTab("umum")}
          className={`pb-3 text-sm font-medium transition-all border-b-2 ${activeTab === "umum" ? "border-blue-500 text-white" : "border-transparent text-blue-200/50 hover:text-white"}`}
        >
          Pengaturan Situs
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`pb-3 text-sm font-medium transition-all border-b-2 flex items-center gap-2 ${activeTab === "ai" ? "border-purple-500 text-white" : "border-transparent text-blue-200/50 hover:text-white"}`}
        >
          <Bot className="w-3.5 h-3.5" /> Konfigurasi AI
        </button>
        <button
          onClick={() => setActiveTab("tim")}
          className={`pb-3 text-sm font-medium transition-all border-b-2 flex items-center gap-2 ${activeTab === "tim" ? "border-blue-500 text-white" : "border-transparent text-blue-200/50 hover:text-white"}`}
        >
          Manajemen Tim
          <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded-full">{admins.length}</span>
        </button>
      </div>

      {/* Tab: Umum */}
      {activeTab === "umum" && (
        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="glass rounded-3xl p-6 border border-white/5">
            <h2 className="text-white font-semibold text-lg mb-1">Statistik Hero</h2>
            <p className="text-blue-200/40 text-sm mb-6">Angka yang tampil di bawah tombol &quot;Mulai Proyek&quot; di beranda situs.</p>
            
            <div className="grid sm:grid-cols-3 gap-6">
              {stats.map((s, idx) => (
                <div key={s.numKey} className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-2 text-blue-200/50 font-medium text-xs mb-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white">{idx + 1}</span>
                    {s.title}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-blue-200/70 text-xs">Nilai (Angka)</Label>
                    <Input
                      value={form[s.numKey] ?? ""}
                      onChange={set(s.numKey)}
                      placeholder="50+"
                      className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20 text-lg font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-blue-200/70 text-xs">Label (Teks Bawah)</Label>
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

          {/* Tracking & Analytics */}
          <div className="glass rounded-3xl p-6 border border-white/5">
            <h2 className="text-white font-semibold text-lg mb-1">Tracking &amp; Analytics</h2>
            <p className="text-blue-200/40 text-sm mb-6">ID pixel untuk mengukur performa dan konversi. Kosongkan untuk menonaktifkan.</p>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Facebook Pixel ID</Label>
                <Input
                  value={form.facebook_pixel_id ?? ""}
                  onChange={set("facebook_pixel_id")}
                  placeholder="Contoh: 123456789012345"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200/70 text-xs">Google Analytics ID</Label>
                <Input
                  value={form.google_analytics_id ?? ""}
                  onChange={set("google_analytics_id")}
                  placeholder="Contoh: G-XXXXXXXXXX"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

          <div className="flex items-center gap-4 pt-2">
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-11 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Pengaturan
            </Button>
            {saved && <span className="text-green-400 text-sm font-medium flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Tersimpan</span>}
          </div>
        </form>
      )}

      {/* Tab: Konfigurasi AI */}
      {activeTab === "ai" && (
        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Model Selector */}
          <div className="glass rounded-3xl p-6 border border-white/5">
            <h2 className="text-white font-semibold text-lg mb-1">Model AI</h2>
            <p className="text-blue-200/40 text-sm mb-6">Model yang lebih canggih menghasilkan konten lebih baik, namun lebih mahal per-request.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { value: "claude-haiku-4-5-20251001", label: "Claude Haiku", desc: "Cepat & hemat. Cocok untuk penggunaan tinggi.", badge: "Direkomendasikan", badgeColor: "text-green-400 bg-green-500/10 border-green-500/20" },
                { value: "claude-sonnet-4-5-20251001", label: "Claude Sonnet", desc: "Kualitas lebih tinggi. Cocok untuk konten premium.", badge: "Kualitas Lebih Baik", badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
              ].map((m) => (
                <button key={m.value} type="button"
                  onClick={() => setForm((f) => ({ ...f, ai_model: m.value }))}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    form.ai_model === m.value
                      ? "border-purple-500/50 bg-purple-500/10"
                      : "border-white/10 bg-black/20 hover:border-white/20"
                  }`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-white font-semibold text-sm">{m.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${m.badgeColor}`}>{m.badge}</span>
                  </div>
                  <p className="text-blue-200/50 text-xs">{m.desc}</p>
                  <p className="text-blue-200/30 text-[10px] mt-1 font-mono">{m.value}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="glass rounded-3xl p-6 border border-white/5">
            <h2 className="text-white font-semibold text-lg mb-1">Fitur AI Aktif</h2>
            <p className="text-blue-200/40 text-sm mb-6">Nonaktifkan fitur untuk menghentikan konsumsi token AI secara sementara.</p>
            <div className="space-y-4">
              {[
                { key: "ai_feature_article",           label: "Pembuatan & Analisis Artikel",  desc: "Draft artikel, saran topik, analisis SEO, dan draft balasan tiket." },
                { key: "ai_feature_portal_chat",       label: "Chat AI di Portal Klien",        desc: "Widget Tanya AI di dashboard portal klien." },
                { key: "ai_feature_name_generator",    label: "Generator Nama Bisnis",          desc: "Tool publik generator nama bisnis & slogan." },
                { key: "ai_feature_pricing_estimator", label: "Estimasi Harga Website",         desc: "Tool publik estimasi harga pembuatan website." },
              ].map((feat) => (
                <div key={feat.key} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                  <div>
                    <p className="text-white text-sm font-medium">{feat.label}</p>
                    <p className="text-blue-200/40 text-xs mt-0.5">{feat.desc}</p>
                  </div>
                  <button type="button"
                    onClick={() => setForm((f) => ({ ...f, [feat.key]: f[feat.key] === "false" ? "true" : "false" }))}
                    className={`relative w-11 h-6 rounded-full border transition-all shrink-0 ${
                      form[feat.key] !== "false"
                        ? "bg-purple-600 border-purple-500/50"
                        : "bg-white/10 border-white/10"
                    }`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form[feat.key] !== "false" ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

          <div className="flex items-center gap-4 pt-2">
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-500 text-white px-8 h-11 rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.3)]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Pengaturan AI
            </Button>
            {saved && <span className="text-green-400 text-sm font-medium flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Tersimpan</span>}
          </div>
        </form>
      )}

      {/* Tab: Tim Admin */}
      {activeTab === "tim" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-white font-semibold text-lg">Daftar Admin</h2>
              <p className="text-blue-200/50 text-sm">Kelola siapa saja yang bisa masuk ke dashboard panel admin ini.</p>
            </div>
            <AddAdminModal onDone={refreshAdmins} />
          </div>

          <div className="glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs uppercase tracking-wider">Profil Admin</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Kontak Email</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Bergabung</th>
                  <th className="px-6 py-4 text-blue-200/40 font-medium text-xs uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 relative">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                          <span className="text-blue-300 text-sm font-bold">
                            {(admin.name ?? admin.email)[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm group-hover:text-blue-300 transition-colors">{admin.name ?? "—"}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {admin.id === currentUserId && (
                              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-medium border border-blue-500/20">Anda</span>
                            )}
                            <span className="text-blue-200/40 text-xs sm:hidden">{admin.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-blue-200/70 text-sm hidden sm:table-cell">{admin.email}</td>
                    <td className="px-6 py-5 text-blue-200/40 text-xs hidden md:table-cell font-medium">
                      {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(admin.createdAt))}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <ResetPasswordModal admin={admin} onDone={refreshAdmins} />
                        <DeleteAdminButton admin={admin} currentId={currentUserId} onDone={refreshAdmins} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass rounded-2xl p-5 border border-yellow-500/10 bg-yellow-500/5 flex items-start gap-3">
            <Shield className="w-5 h-5 text-yellow-500/70 shrink-0 mt-0.5" />
            <p className="text-yellow-300/80 text-sm leading-relaxed">
              <span className="font-bold text-yellow-400">Peringatan Keamanan:</span> Seluruh akun yang terdaftar di sini memiliki hak akses absolut ke <strong>semua data proyek, invoice keuangan, keluhan tiket, dan data privasi klien</strong>. Berikan akses ini secara hati-hati.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
