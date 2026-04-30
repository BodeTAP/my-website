"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X, Phone, AlertCircle, Building2, User, Send, LayoutGrid, Receipt } from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";

type Client = {
  id: string;
  businessName: string;
  phone: string | null;
  address: string | null;
  user: { name: string | null; email: string };
  _count: { projects: number; invoices: number };
};

function PhoneCell({ client }: { client: Client }) {
  const [editing, setEditing]   = useState(false);
  const [value, setValue]       = useState(client.phone ?? "");
  const [saving, setSaving]     = useState(false);
  const router                  = useRouter();

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: value }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2 group w-fit">
        {client.phone ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
            <Phone className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-blue-100 text-sm font-mono tracking-wide">{client.phone}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Kosong (Isi Sekarang)</span>
          </div>
        )}
        <button
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500 text-sky-400 hover:text-white transition-all shadow-[0_0_10px_rgba(14,165,233,0)] hover:shadow-[0_0_10px_rgba(14,165,233,0.3)]"
          title="Edit nomor HP"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 w-fit">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-blue-200/40 text-sm font-bold">+62</span>
        </div>
        <input
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
          placeholder="8xxxxxxxxxx"
          className="w-44 bg-black/40 border border-sky-500/50 rounded-xl pl-10 pr-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all shadow-[0_0_15px_rgba(14,165,233,0.15)]"
        />
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="p-2 rounded-xl bg-green-500 hover:bg-green-400 text-white transition-colors shadow-[0_0_10px_rgba(34,197,94,0.3)]"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onClick={() => { setValue(client.phone ?? ""); setEditing(false); }}
        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ClientsClient({ clients }: { clients: Client[] }) {
  const noPhone = clients.filter(c => !c.phone).length;

  return (
    <FadeUp delay={0.2} className="space-y-6">
      {noPhone > 0 && (
        <div className="flex items-start gap-4 glass p-5 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent relative overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.05)]">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
            <AlertCircle className="w-6 h-6 text-amber-400" />
          </div>
          <div className="pt-0.5">
            <h3 className="text-amber-300 font-bold mb-1">Terdapat {noPhone} Klien Tanpa Nomor WhatsApp</h3>
            <p className="text-amber-200/70 text-sm leading-relaxed">
              Sistem tidak dapat mengirimkan notifikasi pembuatan proyek atau penagihan otomatis ke klien-klien ini. Silakan sorot (*hover*) pada baris klien terkait di tabel bawah, lalu klik ikon <Pencil className="w-3 h-3 inline mx-1 text-amber-400" /> untuk segera memperbarui data kontak mereka.
            </p>
          </div>
        </div>
      )}

      <div className="glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent pointer-events-none" />
        
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-6 py-5 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider">Profil Klien</th>
                <th className="text-left px-6 py-5 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider hidden md:table-cell">Akun Email</th>
                <th className="text-left px-6 py-5 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider w-72">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Nomor WhatsApp
                  </span>
                </th>
                <th className="text-center px-6 py-5 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider hidden sm:table-cell">Statistik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-20">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-5 ring-1 ring-white/10 shadow-inner">
                        <User className="w-10 h-10 text-blue-200/20" />
                      </div>
                      <p className="text-blue-200/50 font-medium text-base">Belum ada klien yang terdaftar.</p>
                      <p className="text-blue-200/30 text-xs mt-2">Klien otomatis muncul di sini setelah didaftarkan lewat proposal/invoice.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                clients.map(client => (
                  <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/20 flex items-center justify-center shrink-0 shadow-inner">
                          <Building2 className="w-6 h-6 text-sky-400" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-base group-hover:text-sky-300 transition-colors">{client.businessName}</p>
                          <p className="text-blue-200/60 text-xs mt-1 flex items-center gap-1.5 font-medium">
                            <User className="w-3.5 h-3.5 opacity-60 text-sky-400" /> {client.user.name ?? "Tanpa Nama Pribadi"}
                          </p>
                          {/* Mobile Email fallback */}
                          <p className="text-blue-200/40 text-[10px] mt-1.5 md:hidden font-mono truncate max-w-[150px] bg-white/5 px-2 py-0.5 rounded-md w-fit">
                            {client.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-blue-200/70 text-sm hidden md:table-cell font-mono">
                      {client.user.email}
                    </td>
                    <td className="px-6 py-5">
                      <PhoneCell client={client} />
                    </td>
                    <td className="px-6 py-5 hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-5 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5 w-fit mx-auto">
                        <div className="flex flex-col items-center gap-1" title={`${client._count.projects} Proyek Dikerjakan`}>
                          <LayoutGrid className="w-4 h-4 text-sky-400/70" />
                          <span className="text-white font-black text-xs">{client._count.projects}</span>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex flex-col items-center gap-1" title={`${client._count.invoices} Invoice Ditagihkan`}>
                          <Receipt className="w-4 h-4 text-emerald-400/70" />
                          <span className="text-white font-black text-xs">{client._count.invoices}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </FadeUp>
  );
}
