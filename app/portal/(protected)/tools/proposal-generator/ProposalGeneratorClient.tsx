"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  Coins,
  Copy,
  Download,
  Eye,
  FileText,
  History,
  ImageIcon,
  Loader2,
  Palette,
  Pencil,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  Send,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ProposalSection = {
  title: string;
  body: string;
};

type ProposalVariable = {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "textarea";
};

type TemplateView = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  sections: ProposalSection[];
  variables: ProposalVariable[];
  isDefault: boolean;
  createdAt: string;
};

type GeneratedProposalContent = {
  title: string;
  sections: ProposalSection[];
};

type ProposalView = {
  id: string;
  proposalNo: string | null;
  title: string;
  prospectName: string | null;
  businessName: string | null;
  whatsapp: string | null;
  validUntil: string | null;
  notes: string | null;
  templateName: string | null;
  status: string;
  design: ProposalDesign;
  content: GeneratedProposalContent;
  createdAt: string;
};

type ProposalDesign = {
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  fontStyle: "sans" | "serif" | "mono";
  layout: "corporate" | "minimal" | "modern" | "bold";
  logoPosition: "left" | "center" | "right";
  showLogo: boolean;
  showProposalNo: boolean;
  showDate: boolean;
  showRecipient: boolean;
  showFooter: boolean;
};

type TemplateDraft = {
  id?: string;
  name: string;
  category: string;
  description: string;
  sections: ProposalSection[];
  variables: ProposalVariable[];
};

const HISTORY_PAGE_SIZE = 6;

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Terkirim" },
  { value: "ACCEPTED", label: "Diterima" },
  { value: "DECLINED", label: "Ditolak" },
];

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-white/10 border-white/10 text-blue-100/70",
  SENT: "bg-blue-500/10 border-blue-500/25 text-blue-200",
  ACCEPTED: "bg-emerald-500/10 border-emerald-500/25 text-emerald-200",
  DECLINED: "bg-red-500/10 border-red-500/25 text-red-200",
};

const LAYOUT_OPTIONS: Array<{ value: ProposalDesign["layout"]; label: string; hint: string }> = [
  { value: "corporate", label: "Corporate", hint: "Header kuat, cocok untuk proposal formal." },
  { value: "minimal", label: "Minimal", hint: "Rapi, putih, dan ringan untuk dibaca." },
  { value: "modern", label: "Modern", hint: "Aksen visual lebih dinamis." },
  { value: "bold", label: "Bold", hint: "Judul besar dan tampilan lebih tegas." },
];

const FONT_OPTIONS: Array<{ value: ProposalDesign["fontStyle"]; label: string }> = [
  { value: "sans", label: "Sans" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
];

const CORE_FIELD_KEYS = new Set(["prospectName", "businessName", "whatsapp", "validUntil", "notes"]);

function emptyDraft(): TemplateDraft {
  return {
    name: "",
    category: "Custom",
    description: "",
    variables: [
      { key: "prospectName", label: "Nama calon klien", placeholder: "Budi Santoso" },
      { key: "businessName", label: "Nama bisnis", placeholder: "Nama bisnis klien" },
      { key: "goals", label: "Tujuan", type: "textarea", placeholder: "Tujuan utama proyek" },
    ],
    sections: [
      {
        title: "Ringkasan",
        body: "{{businessName}} membutuhkan solusi untuk {{goals}}.",
      },
    ],
  };
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function proposalToText(proposal: ProposalView | { title: string; content: GeneratedProposalContent }) {
  const content = "content" in proposal ? proposal.content : proposal;
  return [
    content.title,
    "",
    ...content.sections.flatMap((section) => [
      section.title,
      section.body,
      "",
    ]),
  ].join("\n");
}

function buildWhatsAppUrl(proposal: ProposalView) {
  const phone = proposal.whatsapp?.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Halo ${proposal.prospectName ?? "Bapak/Ibu"}, berikut proposal ${proposal.proposalNo ?? proposal.title} untuk ${proposal.businessName ?? "kebutuhan bisnis Anda"}. Silakan dicek, dan kabari saya jika ada pertanyaan.`,
  );
  return phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
}

export default function ProposalGeneratorClient({
  initialBalance,
  initialTemplates,
  initialProposals,
  initialDesign,
  enabled,
  proposalCost,
}: {
  initialBalance: number;
  initialTemplates: TemplateView[];
  initialProposals: ProposalView[];
  initialDesign: ProposalDesign;
  enabled: boolean;
  proposalCost: number;
}) {
  const router = useRouter();
  const [balance, setBalance] = useState(initialBalance);
  const [templates, setTemplates] = useState(initialTemplates);
  const [proposals, setProposals] = useState(initialProposals);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplates[0]?.id ?? "");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"generate" | "design" | "templates" | "history">("generate");
  const [draft, setDraft] = useState<TemplateDraft>(emptyDraft());
  const [result, setResult] = useState<ProposalView | null>(initialProposals[0] ?? null);
  const [design, setDesign] = useState<ProposalDesign>(initialProposals[0]?.design ?? initialDesign);
  const [resultTitle, setResultTitle] = useState(initialProposals[0]?.title ?? "");
  const [resultStatus, setResultStatus] = useState(initialProposals[0]?.status ?? "DRAFT");
  const [resultMeta, setResultMeta] = useState({
    prospectName: initialProposals[0]?.prospectName ?? "",
    businessName: initialProposals[0]?.businessName ?? "",
    whatsapp: initialProposals[0]?.whatsapp ?? "",
    validUntil: initialProposals[0]?.validUntil ?? "",
    notes: initialProposals[0]?.notes ?? "",
  });
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [pdfPreviewVersion, setPdfPreviewVersion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingDesign, setSavingDesign] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? templates[0],
    [selectedTemplateId, templates],
  );
  const templateVariables = useMemo(
    () => (selectedTemplate?.variables ?? []).filter((variable) => !CORE_FIELD_KEYS.has(variable.key)),
    [selectedTemplate],
  );

  const canGenerate = enabled && balance >= proposalCost;
  const stats = useMemo(() => ({
    total: proposals.length,
    sent: proposals.filter((proposal) => proposal.status === "SENT").length,
    accepted: proposals.filter((proposal) => proposal.status === "ACCEPTED").length,
    draft: proposals.filter((proposal) => proposal.status === "DRAFT").length,
  }), [proposals]);

  const filteredProposals = useMemo(() => {
    const query = historyQuery.trim().toLowerCase();
    if (!query) return proposals;

    return proposals.filter((proposal) => {
      return [
        proposal.title,
        proposal.proposalNo ?? "",
        proposal.prospectName ?? "",
        proposal.businessName ?? "",
        proposal.templateName ?? "",
        proposal.status,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [historyQuery, proposals]);

  const historyPageCount = Math.max(1, Math.ceil(filteredProposals.length / HISTORY_PAGE_SIZE));
  const pagedProposals = filteredProposals.slice(
    (historyPage - 1) * HISTORY_PAGE_SIZE,
    historyPage * HISTORY_PAGE_SIZE,
  );

  const selectProposal = (proposal: ProposalView) => {
    setResult(proposal);
    setResultTitle(proposal.title);
    setResultStatus(proposal.status);
    setDesign(proposal.design ?? initialDesign);
    setResultMeta({
      prospectName: proposal.prospectName ?? "",
      businessName: proposal.businessName ?? "",
      whatsapp: proposal.whatsapp ?? "",
      validUntil: proposal.validUntil ?? "",
      notes: proposal.notes ?? "",
    });
  };

  const updateDraft = (patch: Partial<TemplateDraft>) => setDraft((current) => ({ ...current, ...patch }));

  const startEdit = (template?: TemplateView) => {
    if (!template) {
      setDraft(emptyDraft());
      setActiveTab("templates");
      return;
    }

    setDraft({
      id: template.id,
      name: template.name,
      category: template.category,
      description: template.description ?? "",
      sections: template.sections.length ? template.sections : emptyDraft().sections,
      variables: template.variables.length ? template.variables : emptyDraft().variables,
    });
    setActiveTab("templates");
  };

  const duplicateTemplate = async (templateId: string) => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/portal/tools/proposal-generator/templates/${templateId}/duplicate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyalin template");

      setTemplates((current) => [...current, data.template]);
      startEdit({
        ...data.template,
        sections: data.template.sections,
        variables: data.template.variables ?? [],
        createdAt: data.template.createdAt,
      });
      setMessage("Template berhasil disalin.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const saveTemplate = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(
        draft.id
          ? `/api/portal/tools/proposal-generator/templates/${draft.id}`
          : "/api/portal/tools/proposal-generator/templates",
        {
          method: draft.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan template");

      setTemplates((current) => {
        const nextTemplate: TemplateView = {
          ...data.template,
          sections: data.template.sections,
          variables: data.template.variables ?? [],
          createdAt: data.template.createdAt,
        };
        const exists = current.some((template) => template.id === nextTemplate.id);
        return exists
          ? current.map((template) => (template.id === nextTemplate.id ? nextTemplate : template))
          : [...current, nextTemplate];
      });
      setDraft({
        id: data.template.id,
        name: data.template.name,
        category: data.template.category,
        description: data.template.description ?? "",
        sections: data.template.sections,
        variables: data.template.variables ?? [],
      });
      setSelectedTemplateId(data.template.id);
      setMessage("Template berhasil disimpan.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm("Hapus template ini dari daftar Anda?")) return;
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/portal/tools/proposal-generator/templates/${templateId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menghapus template");

      setTemplates((current) => current.filter((template) => template.id !== templateId));
      if (draft.id === templateId) setDraft(emptyDraft());
      if (selectedTemplateId === templateId) setSelectedTemplateId(templates.find((template) => template.id !== templateId)?.id ?? "");
      setMessage("Template berhasil dihapus.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const generateProposal = async () => {
    if (!selectedTemplate) return;
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payloadInput = {
        ...formValues,
        prospectName: formValues.prospectName ?? "",
        businessName: formValues.businessName ?? "",
        whatsapp: formValues.whatsapp ?? "",
        validUntil: formValues.validUntil ?? "",
        notes: formValues.notes ?? "",
      };
      const res = await fetch("/api/portal/tools/proposal-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedTemplate.id, input: payloadInput, design }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat proposal");

      const nextProposal: ProposalView = {
        ...data.proposal,
        design: data.proposal.design ?? design,
        content: data.proposal.content,
        createdAt: data.proposal.createdAt,
      };
      selectProposal(nextProposal);
      setPdfPreviewVersion((version) => version + 1);
      setProposals((current) => [nextProposal, ...current.filter((proposal) => proposal.id !== nextProposal.id)]);
      setBalance(data.balance);
      setMessage("Proposal berhasil dibuat.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(proposalToText(result));
    setMessage("Proposal disalin ke clipboard.");
  };

  const saveResultMeta = async () => {
    if (!result) return;
    setSavingMeta(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/portal/tools/proposal-generator/${result.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: resultTitle, status: resultStatus, ...resultMeta, design }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan perubahan proposal");

      const updated: ProposalView = {
        ...result,
        ...data.proposal,
        design: data.proposal.design ?? design,
        content: data.proposal.content,
        createdAt: data.proposal.createdAt,
      };

      selectProposal(updated);
      setPdfPreviewVersion((version) => version + 1);
      setProposals((current) => current.map((proposal) => proposal.id === updated.id ? updated : proposal));
      setMessage("Perubahan proposal berhasil disimpan.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingMeta(false);
    }
  };

  const saveDesignDefaults = async () => {
    setSavingDesign(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/portal/tools/proposal-generator/design", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(design),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan desain");

      setDesign(data.design);
      setMessage("Brand kit proposal berhasil disimpan.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingDesign(false);
    }
  };

  const applyDesignToProposal = async () => {
    if (!result) return saveDesignDefaults();
    await saveResultMeta();
  };

  const uploadLogo = async (file: File | null) => {
    if (!file) return;
    setUploadingLogo(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/portal/tools/proposal-generator/logo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengupload logo");

      setDesign((current) => ({ ...current, logoUrl: data.url, showLogo: true }));
      setMessage("Logo berhasil diupload. Simpan brand kit atau terapkan ke proposal untuk memakainya.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const blob = new Blob([proposalToText(result)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${result.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-3">
          <Link href="/portal/tools" className="inline-flex items-center gap-2 text-sm text-blue-200/55 hover:text-blue-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Tools
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Proposal Generator</h1>
              <p className="text-blue-200/50 text-sm">Buat proposal PDF dari template, lalu edit detailnya sebelum dikirim.</p>
            </div>
          </div>
        </div>

        <Link href="/portal/credits" className="w-fit">
          <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 px-4 py-3 hover:bg-amber-500/15 transition-colors">
            <Coins className="w-5 h-5 text-amber-300" />
            <div>
              <p className="text-amber-200/55 text-[10px] uppercase tracking-widest font-black">Saldo</p>
              <p className="text-white font-black">{balance} kredit</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Proposal", value: stats.total, tone: "text-blue-300 bg-blue-500/10 border-blue-500/20" },
          { label: "Draft", value: stats.draft, tone: "text-blue-100/70 bg-white/5 border-white/10" },
          { label: "Terkirim", value: stats.sent, tone: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20" },
          { label: "Diterima", value: stats.accepted, tone: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl border p-4 ${item.tone}`}>
            <p className="text-2xl font-black">{item.value}</p>
            <p className="text-[10px] uppercase tracking-widest font-black opacity-70 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: "generate", label: "Generate", icon: Sparkles },
          { id: "design", label: "Desain", icon: Palette },
          { id: "templates", label: "Template", icon: Pencil },
          { id: "history", label: "Riwayat", icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`h-10 px-4 rounded-xl border inline-flex items-center gap-2 text-sm font-bold transition-colors ${
                active
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-white/5 border-white/10 text-blue-200/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {(message || error) && (
        <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
          error ? "bg-red-500/10 border-red-500/25 text-red-200" : "bg-emerald-500/10 border-emerald-500/25 text-emerald-200"
        }`}
        >
          {error || message}
        </div>
      )}

      {activeTab === "generate" && (
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-5 items-start">
          <section className="rounded-2xl border border-blue-500/20 bg-[#071225] p-5 space-y-5 xl:sticky xl:top-5">
            <div>
              <h2 className="text-white font-black text-lg">Brief Proposal</h2>
              <p className="text-blue-200/45 text-sm mt-1">{proposalCost} kredit per generate.</p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-blue-200/45">Template</label>
              <select
                value={selectedTemplate?.id ?? ""}
                onChange={(event) => setSelectedTemplateId(event.target.value)}
                className="w-full h-12 rounded-xl bg-[#07111f] border border-white/10 px-4 text-white outline-none focus:border-blue-500"
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id} className="bg-[#07111f] text-white">
                    {template.name}
                  </option>
                ))}
              </select>
              {selectedTemplate && (
                <p className="text-blue-200/45 text-sm leading-relaxed">{selectedTemplate.description}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-blue-200/45">Nama calon klien</label>
                <input
                  value={formValues.prospectName ?? ""}
                  onChange={(event) => setFormValues((current) => ({ ...current, prospectName: event.target.value }))}
                  placeholder="Budi Santoso"
                  className="w-full h-12 rounded-xl bg-[#07111f] border border-white/10 px-4 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-blue-200/45">Nama bisnis/organisasi</label>
                <input
                  value={formValues.businessName ?? ""}
                  onChange={(event) => setFormValues((current) => ({ ...current, businessName: event.target.value }))}
                  placeholder="PT Sukses Bersama"
                  className="w-full h-12 rounded-xl bg-[#07111f] border border-white/10 px-4 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-blue-200/45">WhatsApp</label>
                  <input
                    value={formValues.whatsapp ?? ""}
                    onChange={(event) => setFormValues((current) => ({ ...current, whatsapp: event.target.value }))}
                    placeholder="08xxxxxxxxxx"
                    className="w-full h-12 rounded-xl bg-[#07111f] border border-white/10 px-4 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-blue-200/45">Berlaku hingga</label>
                  <input
                    type="date"
                    value={formValues.validUntil ?? ""}
                    onChange={(event) => setFormValues((current) => ({ ...current, validUntil: event.target.value }))}
                    className="w-full h-12 rounded-xl bg-[#07111f] border border-white/10 px-4 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              {templateVariables.map((variable) => (
                <div key={variable.key} className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-blue-200/45">
                    {variable.label}
                  </label>
                  {variable.type === "textarea" ? (
                    <textarea
                      value={formValues[variable.key] ?? ""}
                      onChange={(event) => setFormValues((current) => ({ ...current, [variable.key]: event.target.value }))}
                      placeholder={variable.placeholder}
                      rows={3}
                      className="w-full rounded-xl bg-[#07111f] border border-white/10 px-4 py-3 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500 resize-none"
                    />
                  ) : (
                    <input
                      value={formValues[variable.key] ?? ""}
                      onChange={(event) => setFormValues((current) => ({ ...current, [variable.key]: event.target.value }))}
                      placeholder={variable.placeholder}
                      className="w-full h-12 rounded-xl bg-[#07111f] border border-white/10 px-4 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500"
                    />
                  )}
                </div>
              ))}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-blue-200/45">Catatan / Terms</label>
                <textarea
                  value={formValues.notes ?? ""}
                  onChange={(event) => setFormValues((current) => ({ ...current, notes: event.target.value }))}
                  placeholder="Tambahkan syarat pembayaran, masa berlaku, atau catatan khusus."
                  rows={3}
                  className="w-full rounded-xl bg-[#07111f] border border-white/10 px-4 py-3 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {!enabled ? (
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-blue-100/70">
                Proposal Generator sedang nonaktif sementara.
              </div>
            ) : !canGenerate && (
              <Link
                href="/portal/credits"
                className="block rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-100 hover:bg-amber-500/15 transition-colors"
              >
                Kredit tidak cukup. Butuh {proposalCost} kredit untuk membuat proposal.
              </Link>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                disabled={!selectedTemplate || !canGenerate || loading}
                onClick={generateProposal}
                className="h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Membuat proposal...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Proposal
                  </>
                )}
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#071225] p-5">
            {result ? (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/10 pb-5">
                  <div className="flex-1 space-y-3">
                    <p className="text-blue-200/45 text-xs font-black uppercase tracking-widest">Preview</p>
                    <input
                      value={resultTitle}
                      onChange={(event) => setResultTitle(event.target.value)}
                      className="w-full rounded-xl bg-[#07111f] border border-white/10 px-4 py-3 text-white font-black text-lg outline-none focus:border-blue-500"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        value={resultMeta.prospectName}
                        onChange={(event) => setResultMeta((current) => ({ ...current, prospectName: event.target.value }))}
                        placeholder="Nama calon klien"
                        className="h-10 rounded-xl bg-[#07111f] border border-white/10 px-3 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500"
                      />
                      <input
                        value={resultMeta.businessName}
                        onChange={(event) => setResultMeta((current) => ({ ...current, businessName: event.target.value }))}
                        placeholder="Nama bisnis/organisasi"
                        className="h-10 rounded-xl bg-[#07111f] border border-white/10 px-3 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500"
                      />
                      <input
                        value={resultMeta.whatsapp}
                        onChange={(event) => setResultMeta((current) => ({ ...current, whatsapp: event.target.value }))}
                        placeholder="WhatsApp"
                        className="h-10 rounded-xl bg-[#07111f] border border-white/10 px-3 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500"
                      />
                      <input
                        type="date"
                        value={resultMeta.validUntil}
                        onChange={(event) => setResultMeta((current) => ({ ...current, validUntil: event.target.value }))}
                        className="h-10 rounded-xl bg-[#07111f] border border-white/10 px-3 text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <textarea
                      value={resultMeta.notes}
                      onChange={(event) => setResultMeta((current) => ({ ...current, notes: event.target.value }))}
                      placeholder="Catatan / terms proposal"
                      rows={2}
                      className="w-full rounded-xl bg-[#07111f] border border-white/10 px-3 py-2 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500 resize-none"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-blue-200/40 text-sm">{result.proposalNo ?? "Belum bernomor"} - {result.templateName ?? "Template custom"} - {formatDate(result.createdAt)}</p>
                      <select
                        value={resultStatus}
                        onChange={(event) => setResultStatus(event.target.value)}
                        className={`h-9 rounded-xl border px-3 text-xs font-black outline-none ${STATUS_STYLE[resultStatus] ?? STATUS_STYLE.DRAFT}`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status.value} value={status.value} className="bg-[#07111f] text-white">
                            {status.label}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        disabled={savingMeta}
                        onClick={saveResultMeta}
                        className="h-9 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10"
                      >
                        {savingMeta ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Simpan
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/portal/tools/proposal-generator/${result.id}`} className="inline-flex h-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 px-3 text-sm font-bold">
                      <Eye className="w-4 h-4 mr-2" />
                      Detail
                    </Link>
                    <Button type="button" onClick={copyResult} className="rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10">
                      <Copy className="w-4 h-4 mr-2" />
                      Salin
                    </Button>
                    <a
                      href={`/api/portal/tools/proposal-generator/${result.id}/pdf`}
                      target="_blank"
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white px-3 text-sm font-bold transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </a>
                    <a
                      href={buildWhatsAppUrl({ ...result, ...resultMeta })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-200 border border-emerald-500/20 px-3 text-sm font-bold transition-colors"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      WhatsApp
                    </a>
                    <Button type="button" onClick={downloadResult} className="rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white">
                      Unduh TXT
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden bg-white shadow-2xl ring-1 ring-white/10">
                  <iframe
                    key={`${result.id}-${pdfPreviewVersion}`}
                    src={`/api/portal/tools/proposal-generator/${result.id}/pdf?preview=1&v=${pdfPreviewVersion}`}
                    title={`Preview PDF ${result.title}`}
                    className="w-full h-[calc(100vh-12rem)] min-h-[760px] bg-white"
                  />
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[420px] flex items-center justify-center text-center">
                <div>
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <FileText className="w-7 h-7 text-blue-200/45" />
                  </div>
                  <p className="text-white font-black">Belum ada preview</p>
                  <p className="text-blue-200/45 text-sm mt-1">Isi brief dan generate proposal pertama Anda.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === "design" && (
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-5 items-start">
          <section className="rounded-2xl border border-blue-500/20 bg-[#071225] p-5 space-y-5">
            <div>
              <h2 className="text-white font-black text-lg">Brand Kit Proposal</h2>
              <p className="text-blue-200/45 text-sm mt-1">Atur tampilan PDF tanpa mengubah isi template.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#07111f]/70 p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                  {design.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={design.logoUrl} alt="Logo proposal" className="w-full h-full object-contain p-2" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-blue-200/35" />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 px-3 text-sm font-bold transition-colors">
                    {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload Logo
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      disabled={uploadingLogo}
                      className="hidden"
                      onChange={(event) => {
                        void uploadLogo(event.target.files?.[0] ?? null);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                  {design.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setDesign((current) => ({ ...current, logoUrl: null }))}
                      className="block text-sm font-bold text-red-200/80 hover:text-red-100"
                    >
                      Hapus logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-2">
                <span className="block text-xs font-black uppercase tracking-widest text-blue-200/45">Warna utama</span>
                <div className="flex h-12 rounded-xl bg-[#07111f] border border-white/10 overflow-hidden">
                  <input
                    type="color"
                    value={design.primaryColor}
                    onChange={(event) => setDesign((current) => ({ ...current, primaryColor: event.target.value }))}
                    className="w-14 h-full bg-transparent"
                  />
                  <input
                    value={design.primaryColor}
                    onChange={(event) => setDesign((current) => ({ ...current, primaryColor: event.target.value }))}
                    className="flex-1 bg-transparent px-3 text-white outline-none"
                  />
                </div>
              </label>
              <label className="space-y-2">
                <span className="block text-xs font-black uppercase tracking-widest text-blue-200/45">Warna aksen</span>
                <div className="flex h-12 rounded-xl bg-[#07111f] border border-white/10 overflow-hidden">
                  <input
                    type="color"
                    value={design.accentColor}
                    onChange={(event) => setDesign((current) => ({ ...current, accentColor: event.target.value }))}
                    className="w-14 h-full bg-transparent"
                  />
                  <input
                    value={design.accentColor}
                    onChange={(event) => setDesign((current) => ({ ...current, accentColor: event.target.value }))}
                    className="flex-1 bg-transparent px-3 text-white outline-none"
                  />
                </div>
              </label>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-blue-200/45">Layout PDF</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LAYOUT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDesign((current) => ({ ...current, layout: option.value }))}
                    className={`rounded-2xl border p-4 text-left transition-colors ${
                      design.layout === option.value
                        ? "bg-blue-600/20 border-blue-500/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <p className="text-white font-black">{option.label}</p>
                    <p className="text-blue-200/45 text-sm mt-1">{option.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-2">
                <span className="block text-xs font-black uppercase tracking-widest text-blue-200/45">Font</span>
                <select
                  value={design.fontStyle}
                  onChange={(event) => setDesign((current) => ({ ...current, fontStyle: event.target.value as ProposalDesign["fontStyle"] }))}
                  className="w-full h-12 rounded-xl bg-[#07111f] border border-white/10 px-4 text-white outline-none focus:border-blue-500"
                >
                  {FONT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#07111f] text-white">{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="block text-xs font-black uppercase tracking-widest text-blue-200/45">Posisi logo</span>
                <select
                  value={design.logoPosition}
                  onChange={(event) => setDesign((current) => ({ ...current, logoPosition: event.target.value as ProposalDesign["logoPosition"] }))}
                  className="w-full h-12 rounded-xl bg-[#07111f] border border-white/10 px-4 text-white outline-none focus:border-blue-500"
                >
                  <option value="left" className="bg-[#07111f] text-white">Kiri</option>
                  <option value="center" className="bg-[#07111f] text-white">Tengah</option>
                  <option value="right" className="bg-[#07111f] text-white">Kanan</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                ["showLogo", "Tampilkan logo"],
                ["showProposalNo", "Tampilkan nomor proposal"],
                ["showDate", "Tampilkan tanggal"],
                ["showRecipient", "Tampilkan data penerima"],
                ["showFooter", "Tampilkan footer"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-bold text-blue-100/75">
                  <input
                    type="checkbox"
                    checked={Boolean(design[key as keyof ProposalDesign])}
                    onChange={(event) => setDesign((current) => ({ ...current, [key]: event.target.checked }))}
                    className="accent-blue-500"
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                type="button"
                disabled={savingDesign}
                onClick={saveDesignDefaults}
                className="h-12 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 font-bold"
              >
                {savingDesign ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Simpan Brand Kit
              </Button>
              <Button
                type="button"
                disabled={savingMeta}
                onClick={applyDesignToProposal}
                className="h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                {savingMeta ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Palette className="w-4 h-4 mr-2" />}
                Terapkan ke Preview
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#071225] p-5 min-h-[620px]">
            {result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-blue-200/45 text-xs font-black uppercase tracking-widest">Preview Desain</p>
                    <h2 className="text-white font-black mt-1">{result.title}</h2>
                  </div>
                  <a
                    href={`/api/portal/tools/proposal-generator/${result.id}/pdf`}
                    target="_blank"
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white px-3 text-sm font-bold transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </a>
                </div>
                <div className="rounded-2xl overflow-hidden bg-white shadow-2xl ring-1 ring-white/10">
                  <iframe
                    key={`design-${result.id}-${pdfPreviewVersion}`}
                    src={`/api/portal/tools/proposal-generator/${result.id}/pdf?preview=1&v=${pdfPreviewVersion}`}
                    title={`Preview desain ${result.title}`}
                    className="w-full h-[calc(100vh-12rem)] min-h-[760px] bg-white"
                  />
                </div>
              </div>
            ) : (
              <div className="min-h-[540px] flex items-center justify-center text-center">
                <div>
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <Palette className="w-7 h-7 text-blue-200/45" />
                  </div>
                  <p className="text-white font-black">Belum ada proposal untuk preview</p>
                  <p className="text-blue-200/45 text-sm mt-1">Simpan brand kit, lalu generate proposal untuk melihat hasil desainnya.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === "templates" && (
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-5">
          <section className="rounded-2xl border border-white/10 bg-[#071225] p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-white font-black text-lg">Daftar Template</h2>
                <p className="text-blue-200/45 text-sm mt-1">{templates.length} template tersedia</p>
              </div>
              <Button type="button" onClick={() => startEdit()} className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Baru
              </Button>
            </div>

            <div className="space-y-3 pt-2">
              {templates.map((template) => (
                <div key={template.id} className="rounded-2xl bg-[#07111f]/70 border border-white/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-white font-black">{template.name}</h3>
                        <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wider border ${
                          template.isDefault
                            ? "bg-blue-500/10 border-blue-500/20 text-blue-200"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                        }`}
                        >
                          {template.isDefault ? "Bawaan" : "Custom"}
                        </span>
                      </div>
                      <p className="text-blue-200/40 text-sm mt-1">{template.category}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {template.isDefault ? (
                      <Button
                        type="button"
                        disabled={saving}
                        onClick={() => duplicateTemplate(template.id)}
                        className="rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Duplikat
                      </Button>
                    ) : (
                      <>
                        <Button type="button" onClick={() => startEdit(template)} className="rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10">
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          disabled={saving}
                          onClick={() => deleteTemplate(template.id)}
                          className="rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-200 border border-red-500/20"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-blue-500/20 bg-[#071225] p-5 space-y-5">
            <div>
              <h2 className="text-white font-black text-lg">{draft.id ? "Edit Template" : "Template Baru"}</h2>
              <p className="text-blue-200/45 text-sm mt-1">Template custom tersimpan khusus untuk akun Anda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={draft.name}
                onChange={(event) => updateDraft({ name: event.target.value })}
                placeholder="Nama template"
                className="h-12 rounded-xl bg-[#07111f] border border-white/10 px-4 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500"
              />
              <input
                value={draft.category}
                onChange={(event) => updateDraft({ category: event.target.value })}
                placeholder="Kategori"
                className="h-12 rounded-xl bg-[#07111f] border border-white/10 px-4 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500"
              />
            </div>

            <textarea
              value={draft.description}
              onChange={(event) => updateDraft({ description: event.target.value })}
              placeholder="Deskripsi singkat"
              rows={2}
              className="w-full rounded-xl bg-[#07111f] border border-white/10 px-4 py-3 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500 resize-none"
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-white font-black">Field Brief</h3>
                <Button
                  type="button"
                  onClick={() => updateDraft({
                    variables: [...draft.variables, { key: "", label: "", placeholder: "" }],
                  })}
                  className="rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Field
                </Button>
              </div>
              {draft.variables.map((variable, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2">
                  <input
                    value={variable.key}
                    onChange={(event) => updateDraft({
                      variables: draft.variables.map((item, itemIndex) => itemIndex === index ? { ...item, key: event.target.value } : item),
                    })}
                    placeholder="key"
                    className="h-11 rounded-xl bg-[#07111f] border border-white/10 px-3 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500"
                  />
                  <input
                    value={variable.label}
                    onChange={(event) => updateDraft({
                      variables: draft.variables.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item),
                    })}
                    placeholder="Label"
                    className="h-11 rounded-xl bg-[#07111f] border border-white/10 px-3 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500"
                  />
                  <input
                    value={variable.placeholder ?? ""}
                    onChange={(event) => updateDraft({
                      variables: draft.variables.map((item, itemIndex) => itemIndex === index ? { ...item, placeholder: event.target.value } : item),
                    })}
                    placeholder="Placeholder"
                    className="h-11 rounded-xl bg-[#07111f] border border-white/10 px-3 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => updateDraft({ variables: draft.variables.filter((_item, itemIndex) => itemIndex !== index) })}
                    className="h-11 w-11 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 hover:bg-red-500/15 flex items-center justify-center"
                    aria-label="Hapus field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-white font-black">Section Proposal</h3>
                <Button
                  type="button"
                  onClick={() => updateDraft({
                    sections: [...draft.sections, { title: "", body: "" }],
                  })}
                  className="rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Section
                </Button>
              </div>
              {draft.sections.map((section, index) => (
                <div key={index} className="rounded-2xl bg-[#07111f]/70 border border-white/10 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      value={section.title}
                      onChange={(event) => updateDraft({
                        sections: draft.sections.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item),
                      })}
                      placeholder="Judul section"
                      className="h-11 flex-1 rounded-xl bg-[#07111f] border border-white/10 px-3 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => updateDraft({ sections: draft.sections.filter((_item, itemIndex) => itemIndex !== index) })}
                      className="h-11 w-11 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 hover:bg-red-500/15 flex items-center justify-center"
                      aria-label="Hapus section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={section.body}
                    onChange={(event) => updateDraft({
                      sections: draft.sections.map((item, itemIndex) => itemIndex === index ? { ...item, body: event.target.value } : item),
                    })}
                    placeholder="Isi section"
                    rows={5}
                    className="w-full rounded-xl bg-[#07111f] border border-white/10 px-4 py-3 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              ))}
            </div>

            <Button
              type="button"
              disabled={saving}
              onClick={saveTemplate}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Template
            </Button>
          </section>
        </div>
      )}

      {activeTab === "history" && (
        <section className="rounded-2xl border border-white/10 bg-[#071225] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-white font-black text-lg">Riwayat Proposal</h2>
              <p className="text-blue-200/45 text-sm mt-1">{filteredProposals.length} dari {proposals.length} proposal</p>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200/35" />
              <input
                value={historyQuery}
                onChange={(event) => {
                  setHistoryQuery(event.target.value);
                  setHistoryPage(1);
                }}
                placeholder="Cari judul, template, status..."
                className="w-full h-11 rounded-xl bg-[#07111f] border border-white/10 pl-11 pr-4 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="divide-y divide-white/10">
            {proposals.length === 0 ? (
              <div className="p-8 text-center text-blue-200/45">Belum ada proposal.</div>
            ) : filteredProposals.length === 0 ? (
              <div className="p-8 text-center text-blue-200/45">Tidak ada proposal yang cocok.</div>
            ) : pagedProposals.map((proposal) => (
              <div key={proposal.id} className="px-5 py-4 hover:bg-white/5 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    selectProposal(proposal);
                    setActiveTab("generate");
                  }}
                  className="text-left flex-1"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-white font-bold">{proposal.title}</p>
                    {proposal.proposalNo && (
                      <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-200/70">
                        {proposal.proposalNo}
                      </span>
                    )}
                    <span className={`rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-wider ${STATUS_STYLE[proposal.status] ?? STATUS_STYLE.DRAFT}`}>
                      {STATUS_OPTIONS.find((status) => status.value === proposal.status)?.label ?? proposal.status}
                    </span>
                  </div>
                  <p className="text-blue-200/40 text-sm mt-1">{proposal.businessName ?? proposal.prospectName ?? proposal.templateName ?? "Template custom"} - {formatDate(proposal.createdAt)}</p>
                </button>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/portal/tools/proposal-generator/${proposal.id}`} className="inline-flex h-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 px-3 text-xs font-bold">
                    <Eye className="w-4 h-4 mr-2" />
                    Detail
                  </Link>
                  <a href={`/api/portal/tools/proposal-generator/${proposal.id}/pdf`} target="_blank" className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-200 border border-emerald-500/20 px-3 text-xs font-bold">
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </a>
                  <a href={buildWhatsAppUrl(proposal)} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-200 border border-emerald-500/20 px-3 text-xs font-bold">
                    <Send className="w-4 h-4 mr-2" />
                    WA
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      selectProposal(proposal);
                      setActiveTab("generate");
                    }}
                    className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 hover:bg-blue-500/15 flex items-center justify-center"
                    aria-label="Pilih proposal"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filteredProposals.length > HISTORY_PAGE_SIZE && (
            <div className="px-5 py-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-blue-200/45 text-sm">Halaman {historyPage} dari {historyPageCount}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={historyPage <= 1}
                  onClick={() => setHistoryPage((page) => Math.max(1, page - 1))}
                  className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 text-blue-200/70 disabled:opacity-40 hover:bg-white/10 flex items-center justify-center"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: historyPageCount }, (_item, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setHistoryPage(page)}
                    className={`h-9 min-w-9 rounded-xl border px-3 text-sm font-bold ${page === historyPage ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-white/10 text-blue-200/70 hover:bg-white/10"}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={historyPage >= historyPageCount}
                  onClick={() => setHistoryPage((page) => Math.min(historyPageCount, page + 1))}
                  className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 text-blue-200/70 disabled:opacity-40 hover:bg-white/10 flex items-center justify-center"
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
