"use client";

import { useState } from "react";
import { MessageCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type Lead = {
  id: string;
  name: string;
  businessName: string;
  whatsapp: string;
  domain: string | null;
  currentWebsite: string | null;
  message: string | null;
  status: "NEW" | "FOLLOWUP" | "DEAL" | "CLOSED";
  notes: string | null;
  createdAt: Date;
};

const STATUS_LABELS: Record<Lead["status"], string> = {
  NEW: "Baru",
  FOLLOWUP: "Follow-up",
  DEAL: "Deal",
  CLOSED: "Selesai",
};

const STATUS_COLORS: Record<Lead["status"], string> = {
  NEW: "bg-blue-500/15 text-blue-300",
  FOLLOWUP: "bg-amber-500/15 text-amber-300",
  DEAL: "bg-green-500/15 text-green-300",
  CLOSED: "bg-white/5 text-blue-200/50",
};

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const [filter, setFilter] = useState<Lead["status"] | "ALL">("ALL");
  const [statusMap, setStatusMap] = useState<Record<string, Lead["status"]>>(
    Object.fromEntries(leads.map((l) => [l.id, l.status])),
  );

  const filtered = leads.filter(
    (l) => filter === "ALL" || statusMap[l.id] === filter,
  );

  const updateStatus = async (id: string, status: Lead["status"]) => {
    setStatusMap((m) => ({ ...m, [id]: status }));
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const WA = (phone: string, name: string) =>
    `https://wa.me/${phone.replace(/\D/g, "")}?text=Halo%20${encodeURIComponent(name)}%2C%20saya%20dari%20MFWEB%20Tech%20ingin%20menghubungi%20terkait%20pembuatan%20website.`;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Filter tabs */}
      <div className="flex gap-1 p-4 border-b border-white/5 overflow-x-auto">
        {(["ALL", "NEW", "FOLLOWUP", "DEAL", "CLOSED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filter === s
                ? "bg-blue-600 text-white"
                : "text-blue-200/50 hover:text-white hover:bg-white/5"
            }`}
          >
            {s === "ALL" ? "Semua" : STATUS_LABELS[s]}
            {s !== "ALL" && (
              <span className="ml-1.5 opacity-60">
                ({leads.filter((l) => statusMap[l.id] === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-5 py-3 text-blue-200/40 font-medium text-xs">
                Nama / Bisnis
              </th>
              <th className="text-left px-5 py-3 text-blue-200/40 font-medium text-xs">
                WhatsApp
              </th>
              <th className="text-left px-5 py-3 text-blue-200/40 font-medium text-xs">
                Domain
              </th>
              <th className="text-left px-5 py-3 text-blue-200/40 font-medium text-xs">
                Tanggal
              </th>
              <th className="text-left px-5 py-3 text-blue-200/40 font-medium text-xs">
                Status
              </th>
              <th className="text-left px-5 py-3 text-blue-200/40 font-medium text-xs">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-blue-200/30">
                  Tidak ada lead untuk filter ini
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr
                  key={l.id}
                  className="hover:bg-white/2 transition-colors group"
                >
                  <td className="px-5 py-4">
                    <p className="text-white font-medium">{l.name}</p>
                    <p className="text-blue-200/50 text-xs">{l.businessName}</p>
                  </td>
                  <td className="px-5 py-4 text-blue-200/70">{l.whatsapp}</td>
                  <td className="px-5 py-4 text-blue-200/50 text-xs">
                    {l.domain ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-blue-200/50 text-xs">
                    {new Intl.DateTimeFormat("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(l.createdAt))}
                  </td>
                  <td className="px-5 py-4">
                    <div className="relative inline-block">
                      <select
                        value={statusMap[l.id]}
                        onChange={(e) =>
                          updateStatus(l.id, e.target.value as Lead["status"])
                        }
                        className={`appearance-none pr-7 pl-3 py-1 rounded-full text-xs font-medium cursor-pointer border-0 outline-none ${STATUS_COLORS[statusMap[l.id]]} bg-transparent`}
                      >
                        {(Object.keys(STATUS_LABELS) as Lead["status"][]).map(
                          (s) => (
                            <option
                              key={s}
                              value={s}
                              className="bg-[#0d1b35] text-white"
                            >
                              {STATUS_LABELS[s]}
                            </option>
                          ),
                        )}
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-current opacity-60" />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <a
                      href={WA(l.whatsapp, l.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        size="sm"
                        className="bg-green-600/80 hover:bg-green-600 text-white h-8 px-3 text-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5 mr-1" />
                        WA
                      </Button>
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
