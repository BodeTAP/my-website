"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus, Trash2, KeyRound, Loader2, X, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfirm } from "@/hooks/useConfirm";

type Admin = { id: string; name: string | null; email: string; createdAt: string };

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

export default function TeamClient({ initialAdmins, currentUserId }: { initialAdmins: Admin[]; currentUserId: string }) {
  const [admins, setAdmins] = useState(initialAdmins);
  const router = useRouter();

  const refresh = () => {
    fetch("/api/admin/team")
      .then((r) => r.json())
      .then(setAdmins)
      .catch(() => router.refresh());
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Manajemen Tim</h1>
          <p className="text-blue-200/50 text-sm mt-1">{admins.length} admin aktif</p>
        </div>
        <AddAdminModal onDone={refresh} />
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-5 py-3 text-blue-200/40 font-medium text-xs">Nama</th>
              <th className="text-left px-5 py-3 text-blue-200/40 font-medium text-xs">Email</th>
              <th className="text-left px-5 py-3 text-blue-200/40 font-medium text-xs hidden sm:table-cell">Bergabung</th>
              <th className="px-5 py-3 text-blue-200/40 font-medium text-xs text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-white/2 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <span className="text-blue-300 text-xs font-bold">
                        {(admin.name ?? admin.email)[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{admin.name ?? "—"}</p>
                      {admin.id === currentUserId && (
                        <span className="text-xs text-blue-400/60">(Anda)</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-blue-200/60 text-sm">{admin.email}</td>
                <td className="px-5 py-4 text-blue-200/40 text-xs hidden sm:table-cell">
                  {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(admin.createdAt))}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <ResetPasswordModal admin={admin} onDone={refresh} />
                    <DeleteAdminButton admin={admin} currentId={currentUserId} onDone={refresh} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 glass rounded-xl p-4 border border-yellow-500/10 bg-yellow-500/5">
        <p className="text-yellow-300/70 text-xs">
          <span className="font-semibold text-yellow-300">Catatan keamanan:</span>{" "}
          Bagikan password hanya melalui saluran yang aman. Admin memiliki akses penuh ke semua data klien, proyek, dan invoice.
        </p>
      </div>
    </div>
  );
}
