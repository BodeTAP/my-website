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
      <Button onClick={() => setOpen(true)} className="bg-[#1E242E] hover:bg-slate-800 text-white rounded-xl shadow-xs font-semibold gap-2">
        <UserPlus className="w-4 h-4" /> Tambah Admin
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-slate-700" />
                </div>
                <h2 className="text-slate-900 font-bold text-base">Tambah Admin Baru</h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium text-xs">Nama (opsional)</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Budi Santoso"
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium text-xs">Email *</Label>
                <Input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="budi@mfweb.com"
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium text-xs">Password *</Label>
                <Input type="password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Minimal 8 karakter"
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium text-xs">Konfirmasi Password *</Label>
                <Input type="password" required value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                  placeholder="Ulangi password"
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900" />
              </div>
              {error && <p className="text-rose-600 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}
                  className="flex-1 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs rounded-xl">
                  Batal
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-[#1E242E] hover:bg-slate-800 text-white rounded-xl shadow-xs font-semibold">
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
        className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 h-8 px-2 rounded-lg transition-colors" title="Reset password">
        <KeyRound className="w-3.5 h-3.5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative bg-white rounded-2xl w-full max-w-sm border border-slate-200 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-slate-900 font-bold text-sm">Reset Password — {admin.name ?? admin.email}</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium text-xs">Password Baru *</Label>
                <Input type="password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Minimal 8 karakter"
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium text-xs">Konfirmasi *</Label>
                <Input type="password" required value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                  placeholder="Ulangi password"
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900" />
              </div>
              {error && <p className="text-rose-600 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}
                  className="flex-1 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs rounded-xl">Batal</Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-[#1E242E] hover:bg-slate-800 text-white rounded-xl shadow-xs font-semibold">
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
        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8 px-2 rounded-lg transition-colors disabled:opacity-30">
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manajemen Tim</h1>
          <p className="text-slate-500 text-sm mt-1">{admins.length} admin aktif</p>
        </div>
        <AddAdminModal onDone={refresh} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="text-left px-5 py-3.5 text-slate-500 font-semibold text-xs tracking-wider uppercase">Nama</th>
              <th className="text-left px-5 py-3.5 text-slate-500 font-semibold text-xs tracking-wider uppercase">Email</th>
              <th className="text-left px-5 py-3.5 text-slate-500 font-semibold text-xs tracking-wider uppercase hidden sm:table-cell">Bergabung</th>
              <th className="px-5 py-3.5 text-slate-500 font-semibold text-xs tracking-wider uppercase text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      <span className="text-slate-700 text-xs font-bold">
                        {(admin.name ?? admin.email)[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-900 font-semibold text-sm">{admin.name ?? "—"}</p>
                      {admin.id === currentUserId && (
                        <span className="text-xs text-slate-400 font-normal">(Anda)</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600 text-sm">{admin.email}</td>
                <td className="px-5 py-4 text-slate-500 text-xs hidden sm:table-cell font-medium">
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

      <div className="mt-4 rounded-xl p-4 border border-amber-200 bg-amber-50/60 shadow-2xs">
        <p className="text-amber-800 text-xs leading-relaxed">
          <span className="font-semibold text-amber-900">Catatan keamanan:</span>{" "}
          Bagikan password hanya melalui saluran yang aman. Admin memiliki akses penuh ke semua data klien, proyek, dan invoice.
        </p>
      </div>
    </div>
  );
}
