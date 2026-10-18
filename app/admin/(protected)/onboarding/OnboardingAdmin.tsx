"use client";

import { useState } from "react";
import {
  ClipboardList, Plus, Link2, Eye, Trash2, Loader2,
  CheckCircle, Clock, RotateCcw, X, Copy, Check,
} from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";
import { FadeUp } from "@/components/public/motion";

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
  PENDING:   { label: "Menunggu", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  REVIEWED:  { label: "Direview", color: "bg-blue-50 text-blue-700 border-blue-200",   icon: RotateCcw },
  COMPLETED: { label: "Selesai",  color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
};

function Field({ label, value }: { label: string; value?: string | null | string[] }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const display = Array.isArray(value) ? value.join(", ") : value;
  return (
    <div className="py-2.5 border-b border-slate-100 last:border-0 grid grid-cols-3 gap-3">
      <span className="text-slate-500 text-xs font-medium pt-0.5">{label}</span>
      <span className="text-slate-800 text-sm font-medium col-span-2 break-words">{display}</span>
    </div>
  );
}

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

  const statusConfig = STATUS[form.status as keyof typeof STATUS];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 sm:p-8 relative mb-10 border border-slate-200 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-slate-900 font-bold text-lg">{form.businessName ?? "Brief Klien"}</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${statusConfig?.color}`}>
                {statusConfig?.label}
              </span>
            </div>
            {form.client?.businessName && (
              <p className="text-slate-500 text-xs mt-0.5">Klien: {form.client.businessName}</p>
            )}
          </div>
        </div>

        <div className="space-y-0 mb-6 bg-slate-50/50 rounded-xl p-4 border border-slate-100">
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

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          {form.status !== "REVIEWED" && (
            <button
              onClick={() => handleStatus("REVIEWED")}
              disabled={changing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs text-xs font-semibold transition-all disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Tandai Direview
            </button>
          )}
          {form.status !== "COMPLETED" && (
            <button
              onClick={() => handleStatus("COMPLETED")}
              disabled={changing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs text-xs font-semibold transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Tandai Selesai
            </button>
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
    <button
      onClick={copy}
      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
      title="Copy link"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export default function OnboardingAdmin({ forms: initial, clients }: { forms: Form[]; clients: Client[] }) {
  const [forms, setForms] = useState(initial);
  const [detail, setDetail] = useState<Form | null>(null);
  const [clientId, setClientId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { confirm, node } = useConfirm();

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
    if (!await confirm("Hapus form onboarding ini?")) return;
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
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <FadeUp>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                <ClipboardList className="w-5 h-5 text-slate-700" />
              </div>
              Onboarding Klien
            </h1>
            <p className="text-slate-500 text-sm mt-1.5">
              Generate link form brief dan pantau progres pengisian data proyek oleh klien.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="h-10 rounded-xl px-3.5 bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
            >
              <option value="" className="bg-white text-slate-900">— Link umum (tanpa klien) —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-slate-900">{c.businessName}</option>
              ))}
            </select>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#1E242E] hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs disabled:opacity-50 shrink-0"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Generate Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </FadeUp>

      {/* Stats */}
      <FadeUp delay={0.05}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.keys(STATUS) as Array<keyof typeof STATUS>).map((k) => {
            const s = STATUS[k];
            return (
              <div key={k} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${s.color}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{counts[k]}</p>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </FadeUp>

      {/* List */}
      <FadeUp delay={0.1}>
        {forms.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-200">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Belum ada form onboarding</p>
            <p className="text-slate-400 text-xs mt-1">Generate link pertama menggunakan tombol di atas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {forms.map((f) => {
              const s = STATUS[f.status as keyof typeof STATUS];
              return (
                <div
                  key={f.id}
                  className="bg-white rounded-2xl px-6 py-4.5 border border-slate-200 shadow-xs flex items-center justify-between gap-4 flex-wrap hover:border-slate-300 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                      <span className="text-slate-900 font-semibold text-sm sm:text-base">
                        {f.businessName ?? f.client?.businessName ?? "Link Umum"}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${s?.color}`}>
                        {s?.label}
                      </span>
                      {f.websiteType && (
                        <span className="text-slate-600 bg-slate-100 border border-slate-200 text-xs px-2 py-0.5 rounded-md font-medium">
                          {f.websiteType}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-mono truncate max-w-md">
                      <Link2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>/onboarding/{f.token.slice(0, 24)}...</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1.5">
                      Dibuat pada {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(f.createdAt))}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <CopyLink token={f.token} />
                    {f.status !== "PENDING" && (
                      <button
                        onClick={() => setDetail(f)}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Lihat detail brief"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(f.id)}
                      disabled={deleting === f.id}
                      className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors disabled:opacity-50"
                      title="Hapus form"
                    >
                      {deleting === f.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </FadeUp>

      {detail && <DetailModal form={detail} onClose={() => setDetail(null)} onStatusChange={handleStatusChange} />}
      {node}
    </div>
  );
}
