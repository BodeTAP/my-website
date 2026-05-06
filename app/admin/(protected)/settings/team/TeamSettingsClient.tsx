"use client";


import { useState, useCallback, useEffect } from "react";
import {
  Shield, Plus, Edit2, Trash2, Loader2, X, Check, ChevronDown,
  Users, Layers, AlertTriangle, Crown,
} from "lucide-react";
import { FadeUp } from "@/components/public/motion";
import type { RoleItem, MemberItem } from "./page";

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_MODULES = [
  "articles", "leads", "broadcast", "clients", "projects",
  "invoices", "proposals", "tickets", "portfolio", "testimonials",
  "hosting", "maintenance", "ai_settings", "analytics", "team",
] as const;

type AdminModule = (typeof VALID_MODULES)[number];

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

// ─── Shared Modal Wrapper ─────────────────────────────────────────────────────

function ModalWrapper({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative glass rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

// ─── Module Toggles ───────────────────────────────────────────────────────────

function ModuleToggles({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (modules: string[]) => void;
}) {
  const allSelected = VALID_MODULES.every((m) => selected.includes(m));

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
        <span className="text-blue-200/60 text-xs font-medium uppercase tracking-wider">Modul yang Diizinkan</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange([...VALID_MODULES])}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded-lg hover:bg-blue-500/10"
          >
            Aktifkan Semua
          </button>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-blue-200/40 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
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
                  ? "border-blue-500/40 bg-blue-500/10 text-white"
                  : "border-white/10 bg-black/20 text-blue-200/50 hover:border-white/20 hover:text-white"
              }`}
            >
              <div
                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                  active ? "bg-blue-600 border-blue-500" : "border-white/20 bg-transparent"
                }`}
              >
                {active && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <span className="truncate text-xs">{MODULE_LABELS[mod]}</span>
            </button>
          );
        })}
      </div>
      <p className="text-blue-200/30 text-xs">
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
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Plus className="w-4 h-4 text-blue-400" />
          </div>
          <h2 className="text-white font-semibold">Buat Role Baru</h2>
        </div>
        <button onClick={onClose} className="text-blue-200/40 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-blue-200/70 text-xs font-medium">Nama Role *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Marketing, Developer, Support"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-blue-200/30 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
          />
        </div>
        <ModuleToggles selected={modules} onChange={setModules} />
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-blue-200/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Edit2 className="w-4 h-4 text-indigo-400" />
          </div>
          <h2 className="text-white font-semibold">Edit Role — {role.name}</h2>
        </div>
        <button onClick={onClose} className="text-blue-200/40 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-blue-200/70 text-xs font-medium">Nama Role *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-blue-200/30 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
          />
        </div>
        {loadingModules ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          </div>
        ) : (
          <ModuleToggles selected={modules} onChange={setModules} />
        )}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-blue-200/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading || loadingModules}
            className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-red-400" />
          </div>
          <h2 className="text-white font-semibold">Hapus Role — {role.name}</h2>
        </div>
        <button onClick={onClose} className="text-blue-200/40 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 space-y-5">
        {hasAffected ? (
          <>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-yellow-300 text-sm font-medium">
                  Role ini masih digunakan oleh {affectedMembers.length} admin
                </p>
                <p className="text-yellow-200/60 text-xs">
                  Pilih role pengganti untuk admin berikut sebelum menghapus:
                </p>
                <ul className="mt-2 space-y-1">
                  {affectedMembers.map((m) => (
                    <li key={m.id} className="text-yellow-200/80 text-xs flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-yellow-400/50" />
                      {m.name ?? m.email}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-blue-200/70 text-xs font-medium">Role Pengganti *</label>
              <div className="relative">
                <select
                  value={replacementRoleId}
                  onChange={(e) => setReplacementRoleId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all appearance-none pr-10"
                >
                  <option value="" className="bg-[#030914]">Pilih role pengganti...</option>
                  {otherRoles.map((r) => (
                    <option key={r.id} value={r.id} className="bg-[#030914]">
                      {r.name} ({r._count.permissions} modul)
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200/40 pointer-events-none" />
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-300 text-sm font-medium">
                Yakin ingin menghapus role &quot;{role.name}&quot;?
              </p>
              <p className="text-blue-200/60 text-xs mt-1">
                Tidak ada admin yang menggunakan role ini. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-blue-200/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Manajemen Role
          </h2>
          <p className="text-blue-200/50 text-sm mt-0.5">
            Buat dan kelola role dengan modul yang diizinkan.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Buat Role Baru
        </button>
      </div>

      {roles.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center border border-white/5">
          <Layers className="w-10 h-10 text-blue-200/20 mx-auto mb-3" />
          <p className="text-blue-200/40 text-sm">Belum ada role. Buat role pertama Anda.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs uppercase tracking-wider">
                  Nama Role
                </th>
                <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">
                  Jumlah Modul
                </th>
                <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs uppercase tracking-wider hidden md:table-cell">
                  Admin Menggunakan
                </th>
                <th className="px-6 py-4 text-blue-200/40 font-medium text-xs uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-indigo-400" />
                      </div>
                      <span className="text-white font-medium">{role.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
                      <Layers className="w-3 h-3" />
                      {role._count.permissions} modul
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-blue-200/60 text-xs font-medium">
                      <Users className="w-3 h-3" />
                      {role._count.adminAssignments} admin
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditRole(role)}
                        className="p-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all"
                        title="Edit role"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteRole(role)}
                        className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
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

// ─── 13.5 MemberRoleAssigner ──────────────────────────────────────────────────

function MemberRoleAssigner({
  members,
  roles,
  onRefresh,
}: {
  members: MemberItem[];
  roles: RoleItem[];
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
      // Show success indicator briefly
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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          Assignment Role Anggota Tim
        </h2>
        <p className="text-blue-200/50 text-sm mt-0.5">
          Assign role ke setiap admin untuk mengatur akses modul mereka.
        </p>
      </div>

      {members.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center border border-white/5">
          <Users className="w-10 h-10 text-blue-200/20 mx-auto mb-3" />
          <p className="text-blue-200/40 text-sm">Belum ada anggota tim.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs uppercase tracking-wider">
                  Admin
                </th>
                <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs uppercase tracking-wider">
                  Role Saat Ini
                </th>
                <th className="px-6 py-4 text-blue-200/40 font-medium text-xs uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <span className="text-indigo-300 text-sm font-bold">
                          {(member.name ?? member.email)[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">
                            {member.name ?? "—"}
                          </span>
                          {member.isSuperAdmin && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                              <Crown className="w-2.5 h-2.5" />
                              Super Admin
                            </span>
                          )}
                        </div>
                        <span className="text-blue-200/40 text-xs sm:hidden">{member.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-blue-200/60 text-sm hidden sm:table-cell">
                    {member.email}
                  </td>
                  <td className="px-6 py-4">
                    {member.isSuperAdmin ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300/80 text-xs font-medium">
                        <Crown className="w-3 h-3" />
                        Akses Penuh
                      </span>
                    ) : member.roleName ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
                        <Shield className="w-3 h-3" />
                        {member.roleName}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-blue-200/40 text-xs font-medium">
                        Tanpa Role
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-end gap-1">
                      {member.isSuperAdmin ? (
                        <span className="text-blue-200/30 text-xs italic">Tidak dapat diubah</span>
                      ) : (
                        <div className="relative">
                          {loadingId === member.id ? (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                              <span className="text-blue-200/50 text-xs">Menyimpan...</span>
                            </div>
                          ) : successIds.has(member.id) ? (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
                              <Check className="w-3.5 h-3.5 text-green-400" />
                              <span className="text-green-400 text-xs">Tersimpan</span>
                            </div>
                          ) : (
                            <div className="relative">
                              <select
                                value={member.roleId ?? ""}
                                onChange={(e) =>
                                  handleRoleChange(member.id, e.target.value || null)
                                }
                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all appearance-none pr-8 min-w-[140px]"
                              >
                                <option value="" className="bg-[#030914]">Tanpa Role</option>
                                {roles.map((r) => (
                                  <option key={r.id} value={r.id} className="bg-[#030914]">
                                    {r.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-200/40 pointer-events-none" />
                            </div>
                          )}
                        </div>
                      )}
                      {errors[member.id] && (
                        <p className="text-red-400 text-xs max-w-[200px] text-right">
                          {errors[member.id]}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── 13.2 TeamSettingsClient (main) ──────────────────────────────────────────

export default function TeamSettingsClient({
  initialRoles,
  initialMembers,
}: {
  initialRoles: RoleItem[];
  initialMembers: MemberItem[];
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
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/20">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              Team Settings
            </h1>
            <p className="text-blue-200/50 text-sm mt-2">
              Kelola role, permission modul, dan assignment role untuk anggota tim admin.
            </p>
          </div>
          {refreshing && (
            <div className="flex items-center gap-2 text-blue-200/50 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Memperbarui...
            </div>
          )}
        </div>
      </FadeUp>

      {/* Stats */}
      <FadeUp delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Layers className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-blue-200/50 text-xs font-medium uppercase tracking-wider">Total Role</span>
            </div>
            <p className="text-3xl font-bold text-white">{roles.length}</p>
          </div>
          <div className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-blue-200/50 text-xs font-medium uppercase tracking-wider">Total Admin</span>
            </div>
            <p className="text-3xl font-bold text-white">{members.length}</p>
          </div>
          <div className="glass rounded-2xl p-5 border border-white/5 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Crown className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-blue-200/50 text-xs font-medium uppercase tracking-wider">Tanpa Role</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {members.filter((m) => !m.isSuperAdmin && !m.roleId).length}
            </p>
          </div>
        </div>
      </FadeUp>

      {/* Role Management Section */}
      <FadeUp delay={0.1}>
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <RoleList roles={roles} members={members} onRefresh={refresh} />
          </div>
        </div>
      </FadeUp>

      {/* Member Role Assignment Section */}
      <FadeUp delay={0.15}>
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <MemberRoleAssigner roles={roles} members={members} onRefresh={refresh} />
          </div>
        </div>
      </FadeUp>

      {/* Info note */}
      <FadeUp delay={0.2}>
        <div className="glass rounded-2xl p-5 border border-blue-500/10 bg-blue-500/5 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400/70 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-blue-300/80 text-sm font-medium">Tentang Sistem Permission</p>
            <p className="text-blue-200/50 text-xs leading-relaxed">
              Permission divalidasi langsung dari database — perubahan role berlaku segera tanpa perlu admin login ulang.
              Super Admin selalu memiliki akses penuh ke semua modul dan tidak dapat di-assign ke role mana pun.
            </p>
          </div>
        </div>
      </FadeUp>
    </div>
  );
}
