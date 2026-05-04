"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, ChevronDown, ScrollText, UserSearch, CheckSquare, Square, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/public/motion";
import { useSearchParams } from "next/navigation";
import LeadsSearch from "./LeadsSearch";
import LeadsPagination from "./LeadsPagination";
import { waMsg } from "@/lib/whatsapp";

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
  NEW: "Baru", FOLLOWUP: "Follow-up", DEAL: "Deal", CLOSED: "Selesai",
};

const STATUS_COLORS: Record<Lead["status"], string> = {
  NEW:      "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  FOLLOWUP: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  DEAL:     "bg-green-500/15 text-green-400 border-green-500/30",
  CLOSED:   "bg-white/5 text-blue-200/50 border-white/10",
};

const DEFAULT_TEMPLATE = waMsg.prospectCold("{businessName}");

function BroadcastModal({ leads, onClose }: { leads: Lead[]; onClose: () => void }) {
  const [message, setMessage] = useState(DEFAULT_TEMPLATE);
  const [status, setStatus]   = useState<"idle" | "sending" | "done">("idle");
  const [result, setResult]   = useState<{ sent: number; failed: number } | null>(null);

  const handleSend = async () => {
    setStatus("sending");
    try {
      const res = await fetch("/api/admin/leads/broadcast", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ leadIds: leads.map((l) => l.id), message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({ sent: data.sent, failed: data.failed });
      setStatus("done");
    } catch (err) {
      alert((err as Error).message);
      setStatus("idle");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-white font-bold">Broadcast WhatsApp</h2>
            <p className="text-blue-200/50 text-xs mt-0.5">{leads.length} lead dipilih · gunakan {"{name}"} atau {"{businessName}"}</p>
          </div>
          <button onClick={onClose} className="text-blue-200/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {status !== "done" ? (
          <div className="p-5 space-y-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-blue-200/30 outline-none focus:border-indigo-500/50 resize-none font-mono"
            />
            <div className="flex items-center gap-3">
              <Button onClick={handleSend} disabled={status === "sending" || !message.trim()}
                className="bg-green-600 hover:bg-green-500 text-white gap-2">
                {status === "sending"
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
                  : <><Send className="w-4 h-4" /> Kirim ke {leads.length} Lead</>}
              </Button>
              <p className="text-blue-200/30 text-xs">Jeda 1.5 dtk antar pesan</p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="text-5xl">✅</div>
            <p className="text-white font-bold text-lg">Broadcast Selesai</p>
            <div className="flex justify-center gap-6">
              <div className="text-center">
                <p className="text-green-400 text-2xl font-bold">{result?.sent}</p>
                <p className="text-blue-200/50 text-xs">Terkirim</p>
              </div>
              <div className="text-center">
                <p className="text-red-400 text-2xl font-bold">{result?.failed}</p>
                <p className="text-blue-200/50 text-xs">Gagal</p>
              </div>
            </div>
            <p className="text-blue-200/40 text-xs">Lead yang berhasil dikirim otomatis dipindah ke status &ldquo;Follow-up&rdquo;</p>
            <Button onClick={onClose} variant="outline"
              className="border-white/10 text-blue-200/60 hover:text-white hover:bg-white/5">
              Tutup
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const searchParams = useSearchParams();
  const q    = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const PER_PAGE = 10;

  const [filter, setFilter]       = useState<Lead["status"] | "ALL">("ALL");
  const [statusMap, setStatusMap] = useState<Record<string, Lead["status"]>>(
    Object.fromEntries(leads.map((l) => [l.id, l.status])),
  );
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [showBroadcast, setShowBroadcast] = useState(false);

  const filtered = leads.filter((l) => {
    const matchSearch = q === "" ||
      l.name.toLowerCase().includes(q.toLowerCase()) ||
      (l.businessName?.toLowerCase().includes(q.toLowerCase())) ||
      (l.domain?.toLowerCase().includes(q.toLowerCase()));
    const matchStatus = filter === "ALL" || statusMap[l.id] === filter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const startIdx   = filtered.length > 0 ? (page - 1) * PER_PAGE + 1 : 0;
  const endIdx     = Math.min(page * PER_PAGE, filtered.length);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const updateStatus = async (id: string, status: Lead["status"]) => {
    setStatusMap((m) => ({ ...m, [id]: status }));
    await fetch(`/api/admin/leads/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status }),
    });
  };

  const toggleSelect  = (id: string) =>
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll     = () =>
    setSelected(selected.size === paginated.length ? new Set() : new Set(paginated.map((l) => l.id)));

  const selectedLeads = leads.filter((l) => selected.has(l.id));

  const WA = (phone: string, name: string) =>
    `https://wa.me/${phone.replace(/\D/g, "")}?text=Halo%20${encodeURIComponent(name)}%2C%20saya%20dari%20MFWEB%20ingin%20menghubungi%20terkait%20pembuatan%20website.`;

  return (
    <>
      {showBroadcast && (
        <BroadcastModal leads={selectedLeads} onClose={() => { setShowBroadcast(false); setSelected(new Set()); }} />
      )}

      <FadeUp delay={0.2} className="glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
        <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 to-transparent pointer-events-none" />

        {/* Filter + Search */}
        <div className="flex flex-col sm:flex-row gap-4 p-5 border-b border-white/10 relative z-10 items-start sm:items-center">
          <LeadsSearch />
          <div className="flex gap-2 overflow-x-auto flex-1 w-full pb-2 sm:pb-0">
            {(["ALL", "NEW", "FOLLOWUP", "DEAL", "CLOSED"] as const).map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                  filter === s
                    ? "bg-indigo-600 text-white border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                    : "bg-white/5 border-white/10 text-blue-200/50 hover:text-white hover:bg-white/10"
                }`}>
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

        {/* Broadcast bar */}
        {selected.size > 0 && (
          <div className="flex items-center justify-between px-5 py-3 bg-green-500/10 border-b border-green-500/20 relative z-10">
            <span className="text-green-300 text-sm font-medium">{selected.size} lead dipilih</span>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setShowBroadcast(true)}
                className="bg-green-600 hover:bg-green-500 text-white gap-1.5 h-8 text-xs">
                <Send className="w-3 h-3" /> Broadcast WA
              </Button>
              <button onClick={() => setSelected(new Set())} className="text-blue-200/40 hover:text-white transition-colors ml-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-4 w-10">
                  <button onClick={toggleAll} className="text-blue-200/40 hover:text-white transition-colors">
                    {selected.size === paginated.length && paginated.length > 0
                      ? <CheckSquare className="w-4 h-4 text-indigo-400" />
                      : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="text-left px-4 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider">Nama / Bisnis</th>
                <th className="text-left px-4 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider">Kontak</th>
                <th className="text-left px-4 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider hidden md:table-cell">Domain</th>
                <th className="text-left px-4 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider hidden lg:table-cell">Tanggal</th>
                <th className="text-left px-4 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-4 text-blue-200/40 font-bold text-[11px] uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <UserSearch className="w-8 h-8 text-blue-200/20" />
                      </div>
                      <p className="text-blue-200/50 font-medium">Tidak ada prospek yang cocok.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((l) => (
                  <tr key={l.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-4">
                      <button onClick={() => toggleSelect(l.id)} className="text-blue-200/40 hover:text-indigo-400 transition-colors">
                        {selected.has(l.id)
                          ? <CheckSquare className="w-4 h-4 text-indigo-400" />
                          : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-5">
                      <p className="text-white font-bold group-hover:text-indigo-300 transition-colors">{l.name}</p>
                      <p className="text-blue-200/50 text-xs mt-0.5">{l.businessName}</p>
                    </td>
                    <td className="px-4 py-5">
                      <a href={WA(l.whatsapp, l.name)} target="_blank" rel="noopener noreferrer"
                        className="text-blue-200/70 hover:text-green-400 transition-colors font-mono text-xs flex items-center gap-1.5 w-fit">
                        {l.whatsapp}
                      </a>
                    </td>
                    <td className="px-4 py-5 text-blue-200/50 text-xs font-mono hidden md:table-cell">
                      {l.domain ? <span className="px-2.5 py-1 bg-white/5 rounded-md border border-white/5 text-blue-200/70">{l.domain}</span> : "—"}
                    </td>
                    <td className="px-4 py-5 text-blue-200/50 text-xs font-medium hidden lg:table-cell">
                      {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(l.createdAt))}
                    </td>
                    <td className="px-4 py-5">
                      <div className="relative inline-block">
                        <select value={statusMap[l.id]} onChange={(e) => updateStatus(l.id, e.target.value as Lead["status"])}
                          className={`appearance-none pr-7 pl-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold cursor-pointer border outline-none transition-all ${STATUS_COLORS[statusMap[l.id]]}`}>
                          {(Object.keys(STATUS_LABELS) as Lead["status"][]).map((s) => (
                            <option key={s} value={s} className="bg-[#0d1b35] text-white">{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-current opacity-60" />
                      </div>
                    </td>
                    <td className="px-4 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <a href={WA(l.whatsapp, l.name)} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="bg-green-600/20 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/30 shadow-none transition-all h-9 px-3 text-xs">
                            <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> WA
                          </Button>
                        </a>
                        <Link href={`/admin/proposals/new?leadId=${l.id}`}>
                          <Button size="sm" variant="outline" className="bg-blue-600/10 border-blue-500/20 text-blue-300 hover:text-white hover:bg-blue-600 shadow-none transition-all h-9 px-3 text-xs">
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

        {filtered.length > 0 && (
          <div className="p-5 border-t border-white/10 bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <p className="text-xs text-blue-200/40 font-medium">
              Menampilkan <span className="text-blue-200">{startIdx}-{endIdx}</span> dari <span className="text-blue-200">{filtered.length}</span> prospek
            </p>
            <LeadsPagination totalPages={totalPages} />
          </div>
        )}
      </FadeUp>
    </>
  );
}
