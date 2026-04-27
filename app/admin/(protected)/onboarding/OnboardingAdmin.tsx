"use client";

import { useState } from "react";
import {
  ClipboardList, Plus, Link2, Eye, Trash2, Loader2,
  CheckCircle, Clock, RotateCcw, X, Copy, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Form = {
  id: string; token: string; status: string; createdAt: string;
  businessName: string | null; websiteType: string | null;
  featuresWanted: string[]; driveLink: string | null;
  notes: string | null; deadline: string | null;
  referenceUrls: string[]; colorStyle: string | null;
  industryType: string | null; businessDesc: string | null;
  targetAudience: string | null; logoUrl: string | null;
  instagram: string | null; facebook: string | null; tiktok: string | null;
  hasDomain: boolean; domainName: string | null;
  client: { businessName: string } | null;
};
type Client = { id: string; businessName: string };

const STATUS = {
  PENDING:   { label: "Menunggu", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Clock },
  REVIEWED:  { label: "Direview", color: "bg-blue-500/10 text-blue-400 border-blue-500/20",   icon: RotateCcw },
  COMPLETED: { label: "Selesai",  color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle },
};

function DetailModal({ form, onClose, onStatusChange }: { form: Form; onClose: () => void; onStatusChange: (id: string, s: string) => void }) {
  const [changing, setChanging] = useState(false);

  const handleStatus = async (status: string) => {
    setChanging(true);
    await fetch(`/api/admin/onboarding/${form.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    });
    onStatusChange(form.id, status);
    setChanging(false);
  };

  const Field = ({ label, value }: { label: string; value?: string | null | string[] }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    const display = Array.isArray(value) ? value.join(", ") : value;
    return (
      <div className="py-2.5 border-b border-white/5 last:border-0 grid grid-cols-3 gap-3">
        <span className="text-blue-200/40 text-xs pt-0.5">{label}</span>
        <span className="text-blue-200/70 text-sm col-span-2 break-words">{display}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="glass rounded-2xl w-full max-w-2xl p-6 relative mb-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-blue-200/40 hover:text-white"><X className="w-5 h-5" /></button>
        <div className="flex items-center gap-3 mb-5">
          <ClipboardList className="w-5 h-5 text-blue-400" />
          <h2 className="text-white font-bold text-lg">{form.businessName ?? "Brief Klien"}</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS[form.status as keyof typeof STATUS]?.color}`}>
            {STATUS[form.status as keyof typeof STATUS]?.label}
          </span>
        </div>

        <div className="space-y-0 mb-6">
          <Field label="Bisnis" value={form.businessName} />
          <Field label="Industri" value={form.industryType} />
          <Field label="Deskripsi" value={form.businessDesc} />
          <Field label="Target Pelanggan" value={form.targetAudience} />
          <Field label="Tipe Website" value={form.websiteType} />
          <Field label="Referensi" value={form.referenceUrls} />
          <Field label="Fitur" value={form.featuresWanted} />
          <Field label="Warna/Gaya" value={form.colorStyle} />
          <Field label="Logo URL" value={form.logoUrl} />
          <Field label="Google Drive" value={form.driveLink} />
          <Field label="Instagram" value={form.instagram} />
          <Field label="Facebook" value={form.facebook} />
          <Field label="TikTok" value={form.tiktok} />
          <Field label="Domain" value={form.hasDomain ? (form.domainName || "Sudah ada") : "Perlu beli baru"} />
          <Field label="Deadline" value={form.deadline ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(form.deadline)) : null} />
          <Field label="Catatan" value={form.notes} />
        </div>

        <div className="flex gap-2 pt-4 border-t border-white/5">
          {form.status !== "REVIEWED" && (
            <Button size="sm" onClick={() => handleStatus("REVIEWED")} disabled={changing}
              className="bg-blue-600/20 text-blue-400 border border-blue-500/20 hover:bg-blue-600/30">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Tandai Direview
            </Button>
          )}
          {form.status !== "COMPLETED" && (
            <Button size="sm" onClick={() => handleStatus("COMPLETED")} disabled={changing}
              className="bg-green-600/20 text-green-400 border border-green-500/20 hover:bg-green-600/30">
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Tandai Selesai
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function CopyLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/onboarding/${token}` : `/onboarding/${token}`;
  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-1.5 rounded-lg text-blue-400/50 hover:text-blue-300 hover:bg-white/5 transition-colors" title="Copy link">
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export default function OnboardingAdmin({ forms: initial, clients }: { forms: Form[]; clients: Client[] }) {
  const [forms, setForms] = useState(initial);
  const [detail, setDetail] = useState<Form | null>(null);
  const [clientId, setClientId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    const res = await fetch("/api/admin/onboarding", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientId: clientId || null }),
    });
    const data = await res.json();
    if (res.ok) setForms((prev) => [{ ...data, client: clients.find((c) => c.id === clientId) ? { businessName: clients.find((c) => c.id === clientId)!.businessName } : null }, ...prev]);
    setClientId("");
    setGenerating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus form ini?")) return;
    setDeleting(id);
    await fetch(`/api/admin/onboarding/${id}`, { method: "DELETE" });
    setForms((prev) => prev.filter((f) => f.id !== id));
    setDeleting(null);
  };

  const handleStatusChange = (id: string, status: string) => {
    setForms((prev) => prev.map((f) => f.id === id ? { ...f, status } : f));
    if (detail?.id === id) setDetail((d) => d ? { ...d, status } : d);
  };

  const counts = { PENDING: 0, REVIEWED: 0, COMPLETED: 0 };
  forms.forEach((f) => { if (f.status in counts) counts[f.status as keyof typeof counts]++; });

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Onboarding Klien</h1>
          <p className="text-blue-200/50 text-sm mt-1">Generate link form brief dan pantau pengisiannya</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={clientId} onChange={(e) => setClientId(e.target.value)}
            className="h-10 rounded-lg px-3 bg-white/5 border border-white/10 text-blue-200/70 text-sm">
            <option value="" className="bg-[#0d1b35]">— Link umum (tanpa klien) —</option>
            {clients.map((c) => <option key={c.id} value={c.id} className="bg-[#0d1b35]">{c.businessName}</option>)}
          </select>
          <Button onClick={handleGenerate} disabled={generating} className="bg-blue-600 hover:bg-blue-500 text-white">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1.5" />Generate Link</>}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {(Object.keys(STATUS) as Array<keyof typeof STATUS>).map((k) => {
          const s = STATUS[k];
          return (
            <div key={k} className="glass rounded-xl p-4 text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color.split(" ")[1]}`} />
              <p className="text-white text-xl font-bold">{counts[k]}</p>
              <p className="text-blue-200/40 text-xs">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* List */}
      {forms.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <ClipboardList className="w-10 h-10 text-blue-500/20 mx-auto mb-3" />
          <p className="text-blue-200/40">Belum ada form onboarding. Generate link pertama di atas!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {forms.map((f) => {
            const s = STATUS[f.status as keyof typeof STATUS];
            return (
              <div key={f.id} className="glass rounded-2xl px-5 py-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white font-medium text-sm">{f.businessName ?? f.client?.businessName ?? "Link Umum"}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${s?.color}`}>{s?.label}</span>
                    {f.websiteType && <span className="text-blue-200/40 text-xs">{f.websiteType}</span>}
                  </div>
                  <div className="flex items-center gap-1 text-blue-200/30 text-xs font-mono truncate max-w-xs">
                    <Link2 className="w-3 h-3 shrink-0" />
                    <span>/onboarding/{f.token.slice(0, 20)}...</span>
                  </div>
                  <p className="text-blue-200/30 text-xs mt-1">
                    {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(f.createdAt))}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <CopyLink token={f.token} />
                  {f.status !== "PENDING" && (
                    <button onClick={() => setDetail(f)}
                      className="p-1.5 rounded-lg text-blue-400/50 hover:text-blue-300 hover:bg-white/5 transition-colors" title="Lihat detail">
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(f.id)} disabled={deleting === f.id}
                    className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/5 transition-colors">
                    {deleting === f.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detail && <DetailModal form={detail} onClose={() => setDetail(null)} onStatusChange={handleStatusChange} />}
    </div>
  );
}
