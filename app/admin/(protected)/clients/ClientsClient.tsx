"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X, Phone, AlertCircle } from "lucide-react";

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
      <div className="flex items-center gap-2 group">
        {client.phone ? (
          <span className="text-white text-sm font-mono">{client.phone}</span>
        ) : (
          <span className="flex items-center gap-1.5 text-amber-400/70 text-xs">
            <AlertCircle className="w-3.5 h-3.5" /> Belum diisi
          </span>
        )}
        <button
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/5 text-blue-400/60 hover:text-blue-300 transition-all"
          title="Edit nomor HP"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        autoFocus
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
        placeholder="628xxxxxxxxxx"
        className="w-36 bg-white/5 border border-blue-500/40 rounded-lg px-2.5 py-1.5 text-white text-sm font-mono focus:outline-none"
      />
      <button
        onClick={save}
        disabled={saving}
        className="p-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/40 text-green-400 transition-colors"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => { setValue(client.phone ?? ""); setEditing(false); }}
        className="p-1.5 rounded-lg hover:bg-white/5 text-blue-200/40 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function ClientsClient({ clients }: { clients: Client[] }) {
  const noPhone = clients.filter(c => !c.phone).length;

  return (
    <div>
      {noPhone > 0 && (
        <div className="flex items-start gap-3 glass p-4 rounded-xl border border-amber-500/20 mb-5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-300/80 text-sm">
            <span className="font-semibold">{noPhone} klien</span> belum punya nomor HP —
            notifikasi WhatsApp tidak akan terkirim ke mereka.
            Hover baris klien dan klik ikon pensil untuk mengisi.
          </p>
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-blue-200/40 text-xs">
                <th className="text-left px-5 py-3 font-medium">Klien</th>
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Nomor WA / HP
                  </span>
                </th>
                <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Proyek</th>
                <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-blue-200/30">
                    Belum ada klien terdaftar.
                  </td>
                </tr>
              ) : (
                clients.map(client => (
                  <tr key={client.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-white font-medium">{client.businessName}</p>
                      {client.user.name && (
                        <p className="text-blue-200/40 text-xs">{client.user.name}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-blue-200/60 text-xs">{client.user.email}</td>
                    <td className="px-5 py-3.5">
                      <PhoneCell client={client} />
                    </td>
                    <td className="px-5 py-3.5 text-blue-200/50 hidden sm:table-cell">
                      {client._count.projects}
                    </td>
                    <td className="px-5 py-3.5 text-blue-200/50 hidden sm:table-cell">
                      {client._count.invoices}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
