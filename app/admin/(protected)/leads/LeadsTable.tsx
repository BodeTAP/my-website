"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, ChevronDown, ScrollText, UserSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/public/motion";
import { useSearchParams } from "next/navigation";
import LeadsSearch from "./LeadsSearch";
import LeadsPagination from "./LeadsPagination";

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
  NEW: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  FOLLOWUP: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  DEAL: "bg-green-500/15 text-green-400 border-green-500/30",
  CLOSED: "bg-white/5 text-blue-200/50 border-white/10",
};

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const PER_PAGE = 10;

  const [filter, setFilter] = useState<Lead["status"] | "ALL">("ALL");
  const [statusMap, setStatusMap] = useState<Record<string, Lead["status"]>>(
    Object.fromEntries(leads.map((l) => [l.id, l.status])),
  );

  const filtered = leads.filter((l) => {
    const matchSearch = q === "" || 
      l.name.toLowerCase().includes(q.toLowerCase()) || 
      (l.businessName && l.businessName.toLowerCase().includes(q.toLowerCase())) ||
      (l.domain && l.domain.toLowerCase().includes(q.toLowerCase()));
    const matchStatus = filter === "ALL" || statusMap[l.id] === filter;
    return matchSearch && matchStatus;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / PER_PAGE);
  const startIdx = totalItems > 0 ? (page - 1) * PER_PAGE + 1 : 0;
  const endIdx = Math.min(page * PER_PAGE, totalItems);

  const paginatedFiltered = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
    <FadeUp delay={0.2} className="glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

      {/* Filter tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 p-5 border-b border-white/10 relative z-10 items-start sm:items-center">
        <LeadsSearch />
        <div className="flex gap-2 overflow-x-auto custom-scrollbar flex-1 w-full pb-2 sm:pb-0">
          {(["ALL", "NEW", "FOLLOWUP", "DEAL", "CLOSED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
              filter === s
                ? "bg-indigo-600 text-white border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                : "bg-white/5 border-white/10 text-blue-200/50 hover:text-white hover:bg-white/10"
            }`}
          >
            {s === "ALL" ? "Semua Prospek" : STATUS_LABELS[s]}
            {s !== "ALL" && (
              <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-mono ${filter === s ? "bg-white/20" : "bg-black/20"}`}>
                {leads.filter((l) => statusMap[l.id] === s).length}
              </span>
            )}
          </button>
        ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto relative z-10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-6 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider">Nama / Bisnis</th>
              <th className="text-left px-6 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider">Kontak</th>
              <th className="text-left px-6 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider">Domain</th>
              <th className="text-left px-6 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider">Tanggal Masuk</th>
              <th className="text-left px-6 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider">Status</th>
              <th className="text-right px-6 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-20">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <UserSearch className="w-8 h-8 text-blue-200/20" />
                    </div>
                    <p className="text-blue-200/50 font-medium">Tidak ada prospek yang cocok dengan pencarian/filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedFiltered.map((l) => (
                <tr
                  key={l.id}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <p className="text-white font-bold group-hover:text-indigo-300 transition-colors">{l.name}</p>
                    <p className="text-blue-200/50 text-xs mt-0.5">{l.businessName}</p>
                  </td>
                  <td className="px-6 py-5">
                    <a href={WA(l.whatsapp, l.name)} target="_blank" rel="noopener noreferrer" className="text-blue-200/70 hover:text-green-400 transition-colors font-mono text-xs flex items-center gap-1.5 w-fit">
                      {l.whatsapp}
                    </a>
                  </td>
                  <td className="px-6 py-5 text-blue-200/50 text-xs font-mono">
                    {l.domain ? <span className="px-2.5 py-1 bg-white/5 rounded-md border border-white/5 text-blue-200/70">{l.domain}</span> : "—"}
                  </td>
                  <td className="px-6 py-5 text-blue-200/50 text-xs font-medium">
                    {new Intl.DateTimeFormat("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(l.createdAt))}
                  </td>
                  <td className="px-6 py-5">
                    <div className="relative inline-block">
                      <select
                        value={statusMap[l.id]}
                        onChange={(e) =>
                          updateStatus(l.id, e.target.value as Lead["status"])
                        }
                        className={`appearance-none pr-7 pl-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold cursor-pointer border outline-none transition-all ${STATUS_COLORS[statusMap[l.id]]}`}
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
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-current opacity-60" />
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <a href={WA(l.whatsapp, l.name)} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="bg-green-600/20 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/30 shadow-none hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all h-9 px-3 text-xs">
                          <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> WA
                        </Button>
                      </a>
                      <Link href={`/admin/proposals/new?leadId=${l.id}`}>
                        <Button size="sm" variant="outline" className="bg-blue-600/10 border-blue-500/20 text-blue-300 hover:text-white hover:bg-blue-600 shadow-none hover:shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all h-9 px-3 text-xs">
                          <ScrollText className="w-3.5 h-3.5 mr-1.5" /> Proposal
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="p-5 border-t border-white/10 bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <p className="text-xs text-blue-200/40 font-medium">
            Menampilkan <span className="text-blue-200">{startIdx}-{endIdx}</span> dari <span className="text-blue-200">{totalItems}</span> prospek
          </p>
          <LeadsPagination totalPages={totalPages} />
        </div>
      )}
    </FadeUp>
  );
}
