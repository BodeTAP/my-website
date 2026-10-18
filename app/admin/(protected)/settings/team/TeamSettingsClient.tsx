"use client";


import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Shield, Plus, Edit2, Trash2, Loader2, X, Check, ChevronDown,
  Users, Layers, AlertTriangle, Crown, UserPlus, KeyRound,
} from "lucide-react";
import { FadeUp } from "@/components/public/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfirm } from "@/hooks/useConfirm";
import type { RoleItem, MemberItem } from "./page";

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_MODULES = [
  "articles", "leads", "broadcast", "clients", "projects",
  "invoices", "proposals", "tickets", "portfolio", "testimonials",
  "hosting", "maintenance", "ai_settings", "analytics", "team",
] as const;

type AdminModule = (typeof VALID_MODULES)[number];
type Admin = { id: string; name: string | null; email: string; createdAt: string };

const MODULE_LABELS: Record<AdminModule, string> = {
  articles: "Artikel Blog",
  leads: "Inbox Leads",
  broadcast: "Broadcast WA",
  clients: "Klien & Kontak",
  projects: "Manajemen Proyek",
  invoices: "Invoice & Tagihan",
  proposals: "Proposal",
  tickets: "Tiket Dukungan",
  portfolio: "Portofolio",
  testimonials: "Testimoni",
  hosting: "Hosting & Domain",
  maintenance: "Maintenance",
  ai_settings: "Konfigurasi AI",
  analytics: "Analytics",
  team: "Team Settings",
};

// ─── Admin Management Modals ──────────────────────────────────────────────────

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

  const content = open ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setOpen(false)} />
      <div className="relative bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h2 className="text-slate-900 font-semibold">Tambah Admin Baru</h2>
          </div>
          <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-xs">Nama (opsional)</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Budi Santoso"
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-xs">Email *</Label>
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="budi@mfweb.com"
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-xs">Password *</Label>
            <Input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Minimal 8 karakter"
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-xs">Konfirmasi Password *</Label>
            <Input
              type="password"
              required
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              placeholder="Ulangi password"
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-sm"
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-rose-600 text-sm">{error}</p>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs rounded-xl font-medium"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#1E242E] hover:bg-slate-800 text-white shadow-xs font-semibold rounded-xl"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tambahkan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E242E] hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-xs shrink-0"
      >
        <UserPlus className="w-4 h-4" />
        Tambah Admin
      </button>
      {typeof document !== "undefined" && content && createPortal(content, document.body)}
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
    if (form.password.length < 8) { setError("Password minimal 8 karakter."); return; }
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

  const content = open ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setOpen(false)} />
      <div className="relative bg-white rounded-2xl w-full max-w-sm border border-slate-200 shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-slate-900 font-semibold text-sm">Reset Password — {admin.name ?? admin.email}</h2>
          <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-xs">Password Baru *</Label>
            <Input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Minimal 8 karakter"
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-xs">Konfirmasi *</Label>
            <Input
              type="password"
              required
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              placeholder="Ulangi password"
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-sm"
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-rose-600 text-sm">{error}</p>
            </div>
          )}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs rounded-xl font-medium"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#1E242E] hover:bg-slate-800 text-white shadow-xs font-semibold rounded-xl"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
        title="Reset password"
      >
        <KeyRound className="w-3.5 h-3.5" />
      </button>
      {typeof document !== "undefined" && content && createPortal(content, document.body)}
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
      <button
        disabled={loading || isSelf}
        onClick={handleDelete}
        title={isSelf ? "Tidak bisa menghapus akun sendiri" : "Hapus admin"}
        className="p-2 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
      {node}
    </>
  );
}

// ─── Shared Modal Wrapper ─────────────────────────────────────────────────────

function ModalWrapper({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}

// ─── Module Toggles ───────────────────────────────────────────────────────────

function ModuleToggles({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (modules: string[]) => void;
}) {
  const toggle = (mod: string) => {
    if (selected.includes(mod)) {
      onChange(selected.filter((m) => m !== mod));
    } else {
      onChange([...selected, mod]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Modul yang Diizinkan</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange([...VALID_MODULES])}
            className="text-xs text-slate-700 font-semibold hover:text-slate-900 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            Aktifkan Semua
          </button>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-slate-400 hover:text-slate-700 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            Nonaktifkan Semua
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {VALID_MODULES.map((mod) => {
          const active = selected.includes(mod);
          return (
            <button
              key={mod}
              type="button"
              onClick={() => toggle(mod)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-sm transition-all ${
                active
                  ? "border-slate-900 bg-slate-900 text-white font-medium shadow-xs"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs"
              }`}
            >
              <div
                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                  active ? "bg-white border-white text-slate-900" : "border-slate-300 bg-slate-50"
                }`}
              >
                {active && <Check className="w-2.5 h-2.5 text-slate-900 stroke-[3]" />}
              </div>
              <span className="truncate text-xs">{MODULE_LABELS[mod]}</span>
            </button>
          );
        })}
      </div>
      <p className="text-slate-400 text-xs">
        {selected.length} dari {VALID_MODULES.length} modul dipilih
      </p>
    </div>
  );
}

// ─── 13.3 CreateRoleModal ─────────────────────────────────────────────────────

function CreateRoleModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [modules, setModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Nama role tidak boleh kosong."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/team/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), modules }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Terjadi kesalahan.");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <h2 className="text-slate-900 font-semibold">Buat Role Baru</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-slate-700 text-xs font-medium">Nama Role *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Marketing, Developer, Support"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all"
          />
        </div>
        <ModuleToggles selected={modules} onChange={setModules} />
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-rose-600 text-sm">{error}</p>
          </div>
        )}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs text-sm font-medium transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#1E242E] hover:bg-slate-800 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Buat Role
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

// ─── 13.3 EditRoleModal ───────────────────────────────────────────────────────

function EditRoleModal({
  role,
  onClose,
  onSuccess,
}: {
  role: RoleItem;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(role.name);
  const [modules, setModules] = useState<string[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch current modules for this role
  useEffect(() => {
    fetch(`/api/admin/team/roles/${role.id}`)
      .then((r) => r.json())
      .then((data) => {
        setModules(data.modules ?? []);
        setLoadingModules(false);
      })
      .catch(() => setLoadingModules(false));
  }, [role.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Nama role tidak boleh kosong."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/team/roles/${role.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), modules }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Terjadi kesalahan.");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Edit2 className="w-4 h-4" />
          </div>
          <h2 className="text-slate-900 font-semibold">Edit Role — {role.name}</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-slate-700 text-xs font-medium">Nama Role *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all"
          />
        </div>
        {loadingModules ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
          </div>
        ) : (
          <ModuleToggles selected={modules} onChange={setModules} />
        )}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-rose-600 text-sm">{error}</p>
          </div>
        )}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs text-sm font-medium transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading || loadingModules}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#1E242E] hover:bg-slate-800 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

// ─── 13.4 DeleteRoleDialog ────────────────────────────────────────────────────

function DeleteRoleDialog({
  role,
  affectedMembers,
  allRoles,
  onClose,
  onSuccess,
}: {
  role: RoleItem;
  affectedMembers: MemberItem[];
  allRoles: RoleItem[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [replacementRoleId, setReplacementRoleId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasAffected = affectedMembers.length > 0;
  const otherRoles = allRoles.filter((r) => r.id !== role.id);

  const handleDelete = async () => {
    if (hasAffected && !replacementRoleId) {
      setError("Pilih role pengganti untuk admin yang terdampak.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let res: Response;
      if (hasAffected) {
        // Delete with reassign
        res = await fetch(`/api/admin/team/roles/${role.id}/delete-with-reassign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ replacementRoleId }),
        });
      } else {
        // Simple delete
        res = await fetch(`/api/admin/team/roles/${role.id}`, {
          method: "DELETE",
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Terjadi kesalahan.");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <Trash2 className="w-4 h-4" />
          </div>
          <h2 className="text-slate-900 font-semibold">Hapus Role — {role.name}</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 space-y-5">
        {hasAffected ? (
          <>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-amber-900 text-sm font-semibold">
                  Role ini masih digunakan oleh {affectedMembers.length} admin
                </p>
                <p className="text-amber-800 text-xs">
                  Pilih role pengganti untuk admin berikut sebelum menghapus:
                </p>
                <ul className="mt-2 space-y-1">
                  {affectedMembers.map((m) => (
                    <li key={m.id} className="text-amber-900 text-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {m.name ?? m.email}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-700 text-xs font-medium">Role Pengganti *</label>
              <div className="relative">
                <select
                  value={replacementRoleId}
                  onChange={(e) => setReplacementRoleId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all appearance-none pr-10 shadow-2xs"
                >
                  <option value="" className="bg-white text-slate-900">Pilih role pengganti...</option>
                  {otherRoles.map((r) => (
                    <option key={r.id} value={r.id} className="bg-white text-slate-900">
                      {r.name} ({r._count.permissions} modul)
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <AlertTriangle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-900 text-sm font-semibold">
                Yakin ingin menghapus role &quot;{role.name}&quot;?
              </p>
              <p className="text-slate-600 text-xs mt-1">
                Tidak ada admin yang menggunakan role ini. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-rose-600 text-sm">{error}</p>
          </div>
        )}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs text-sm font-medium transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Hapus Role
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ─── 13.2 RoleList ────────────────────────────────────────────────────────────

function RoleList({
  roles,
  members,
  onRefresh,
}: {
  roles: RoleItem[];
  members: MemberItem[];
  onRefresh: () => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editRole, setEditRole] = useState<RoleItem | null>(null);
  const [deleteRole, setDeleteRole] = useState<RoleItem | null>(null);

  const getAffectedMembers = (roleId: string) =>
    members.filter((m) => m.roleId === roleId);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-slate-900 font-semibold text-lg flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-700" />
            Manajemen Role
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Buat dan kelola role dengan modul yang diizinkan.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E242E] hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          Buat Role Baru
        </button>
      </div>

      {roles.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-10 text-center border border-slate-200">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Belum ada role. Buat role pertama Anda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75">
                <th className="text-left px-6 py-3.5 text-slate-500 font-medium text-xs uppercase tracking-wider">
                  Nama Role
                </th>
                <th className="text-left px-6 py-3.5 text-slate-500 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">
                  Jumlah Modul
                </th>
                <th className="text-left px-6 py-3.5 text-slate-500 font-medium text-xs uppercase tracking-wider hidden md:table-cell">
                  Admin Menggunakan
                </th>
                <th className="px-6 py-3.5 text-slate-500 font-medium text-xs uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-slate-700" />
                      </div>
                      <span className="text-slate-900 font-medium">{role.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
                      <Layers className="w-3 h-3 text-slate-500" />
                      {role._count.permissions} modul
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium">
                      <Users className="w-3 h-3 text-slate-500" />
                      {role._count.adminAssignments} admin
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditRole(role)}
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
                        title="Edit role"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteRole(role)}
                        className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-all"
                        title="Hapus role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateRoleModal
          onClose={() => setShowCreate(false)}
          onSuccess={onRefresh}
        />
      )}
      {editRole && (
        <EditRoleModal
          role={editRole}
          onClose={() => setEditRole(null)}
          onSuccess={onRefresh}
        />
      )}
      {deleteRole && (
        <DeleteRoleDialog
          role={deleteRole}
          affectedMembers={getAffectedMembers(deleteRole.id)}
          allRoles={roles}
          onClose={() => setDeleteRole(null)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}

// ─── 13.5 MemberRoleAssigner (merged with admin management) ──────────────────

function MemberRoleAssigner({
  members,
  roles,
  currentUserId,
  onRefresh,
}: {
  members: MemberItem[];
  roles: RoleItem[];
  currentUserId: string;
  onRefresh: () => void;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successIds, setSuccessIds] = useState<Set<string>>(new Set());

  const handleRoleChange = async (memberId: string, roleId: string | null) => {
    setLoadingId(memberId);
    setErrors((prev) => ({ ...prev, [memberId]: "" }));
    try {
      const res = await fetch(`/api/admin/team/members/${memberId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Terjadi kesalahan.");
      setSuccessIds((prev) => new Set(prev).add(memberId));
      setTimeout(() => {
        setSuccessIds((prev) => {
          const next = new Set(prev);
          next.delete(memberId);
          return next;
        });
      }, 2000);
      onRefresh();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [memberId]: err instanceof Error ? err.message : "Terjadi kesalahan.",
      }));
    } finally {
      setLoadingId(null);
    }
  };

  // Convert MemberItem to Admin shape for modals
  const toAdmin = (m: MemberItem): Admin => ({ id: m.id, name: m.name, email: m.email, createdAt: "" });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-slate-900 font-semibold text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-700" />
            Anggota Tim
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Kelola admin, assign role, dan atur akses modul mereka.
          </p>
        </div>
        <AddAdminModal onDone={onRefresh} />
      </div>

      {members.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-10 text-center border border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Belum ada anggota tim.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75">
                <th className="text-left px-6 py-3.5 text-slate-500 font-medium text-xs uppercase tracking-wider">
                  Admin
                </th>
                <th className="text-left px-6 py-3.5 text-slate-500 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">
                  Email
                </th>
                <th className="text-left px-6 py-3.5 text-slate-500 font-medium text-xs uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3.5 text-slate-500 font-medium text-xs uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/60 transition-colors group">
                  {/* Admin */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <span className="text-slate-700 text-sm font-bold">
                          {(member.name ?? member.email)[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 font-medium text-sm">{member.name ?? "—"}</span>
                          {member.isSuperAdmin && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                              <Crown className="w-2.5 h-2.5" />
                              Super Admin
                            </span>
                          )}
                          {member.id === currentUserId && (
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium border border-slate-200">
                              Anda
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 text-xs sm:hidden">{member.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-slate-600 text-sm hidden sm:table-cell">
                    {member.email}
                  </td>

                  {/* Role dropdown */}
                  <td className="px-6 py-4">
                    {member.isSuperAdmin ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                        <Crown className="w-3 h-3" />
                        Akses Penuh
                      </span>
                    ) : loadingId === member.id ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 w-fit">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                        <span className="text-slate-500 text-xs">Menyimpan...</span>
                      </div>
                    ) : successIds.has(member.id) ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 w-fit">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 text-xs font-medium">Tersimpan</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="relative">
                          <select
                            value={member.roleId ?? ""}
                            onChange={(e) => handleRoleChange(member.id, e.target.value || null)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-900 transition-all appearance-none pr-8 min-w-[140px]"
                          >
                            <option value="" className="bg-white text-slate-900">Tanpa Role</option>
                            {roles.map((r) => (
                              <option key={r.id} value={r.id} className="bg-white text-slate-900">{r.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                        {errors[member.id] && (
                          <p className="text-rose-600 text-xs font-medium">{errors[member.id]}</p>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Aksi: reset password + hapus */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <ResetPasswordModal admin={toAdmin(member)} onDone={onRefresh} />
                      <DeleteAdminButton admin={toAdmin(member)} currentId={currentUserId} onDone={onRefresh} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-2xl p-5 border border-amber-200 bg-amber-50/60 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-amber-900 text-sm leading-relaxed">
          <span className="font-bold text-amber-950">Peringatan Keamanan:</span> Seluruh akun yang terdaftar di sini memiliki hak akses ke{" "}
          <strong>semua data proyek, invoice keuangan, keluhan tiket, dan data privasi klien</strong>. Berikan akses ini secara hati-hati.
        </p>
      </div>
    </div>
  );
}

// ─── 13.2 TeamSettingsClient (main) ──────────────────────────────────────────

export default function TeamSettingsClient({
  initialRoles,
  initialMembers,
  currentUserId,
}: {
  initialRoles: RoleItem[];
  initialMembers: MemberItem[];
  currentUserId: string;
}) {
  const [roles, setRoles] = useState<RoleItem[]>(initialRoles);
  const [members, setMembers] = useState<MemberItem[]>(initialMembers);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [rolesRes, membersRes] = await Promise.all([
        fetch("/api/admin/team/roles"),
        fetch("/api/admin/team/members"),
      ]);
      if (rolesRes.ok) setRoles(await rolesRes.json());
      if (membersRes.ok) setMembers(await membersRes.json());
    } catch {
      // silently fail — data stays as-is
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <FadeUp>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                <Shield className="w-5 h-5 text-slate-700" />
              </div>
              Team Settings
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Kelola role, permission modul, dan assignment role untuk anggota tim admin.
            </p>
          </div>
          {refreshing && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Memperbarui...
            </div>
          )}
        </div>
      </FadeUp>

      {/* Stats */}
      <FadeUp delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                <Layers className="w-4 h-4 text-slate-700" />
              </div>
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Role</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{roles.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                <Users className="w-4 h-4 text-slate-700" />
              </div>
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Admin</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{members.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-200">
                <Crown className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Tanpa Role</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {members.filter((m) => !m.isSuperAdmin && !m.roleId).length}
            </p>
          </div>
        </div>
      </FadeUp>

      {/* Role Management Section */}
      <FadeUp delay={0.1}>
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <RoleList roles={roles} members={members} onRefresh={refresh} />
        </div>
      </FadeUp>

      {/* Member Role Assignment + Admin Management (merged) */}
      <FadeUp delay={0.15}>
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <MemberRoleAssigner roles={roles} members={members} currentUserId={currentUserId} onRefresh={refresh} />
        </div>
      </FadeUp>

      {/* Info note */}
      <FadeUp delay={0.2}>
        <div className="rounded-2xl p-5 border border-slate-200 bg-slate-50 flex items-start gap-3">
          <Shield className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-slate-900 text-sm font-semibold">Tentang Sistem Permission</p>
            <p className="text-slate-600 text-xs leading-relaxed">
              Permission divalidasi langsung dari database — perubahan role berlaku segera tanpa perlu admin login ulang.
              Super Admin selalu memiliki akses penuh ke semua modul dan tidak dapat di-assign ke role mana pun.
            </p>
          </div>
        </div>
      </FadeUp>
    </div>
  );
}
