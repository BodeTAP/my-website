"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Coins,
  Copy,
  FileText,
  History,
  Loader2,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
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
  title: string;
  prospectName: string | null;
  templateName: string | null;
  content: GeneratedProposalContent;
  createdAt: string;
};

type TemplateDraft = {
  id?: string;
  name: string;
  category: string;
  description: string;
  sections: ProposalSection[];
  variables: ProposalVariable[];
};

const PROPOSAL_COST = 5;

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

export default function ProposalGeneratorClient({
  initialBalance,
  initialTemplates,
  initialProposals,
}: {
  initialBalance: number;
  initialTemplates: TemplateView[];
  initialProposals: ProposalView[];
}) {
  const router = useRouter();
  const [balance, setBalance] = useState(initialBalance);
  const [templates, setTemplates] = useState(initialTemplates);
  const [proposals, setProposals] = useState(initialProposals);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplates[0]?.id ?? "");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"generate" | "templates" | "history">("generate");
  const [draft, setDraft] = useState<TemplateDraft>(emptyDraft());
  const [result, setResult] = useState<ProposalView | null>(initialProposals[0] ?? null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? templates[0],
    [selectedTemplateId, templates],
  );

  const canGenerate = balance >= PROPOSAL_COST;

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
      const res = await fetch("/api/portal/tools/proposal-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedTemplate.id, input: formValues }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat proposal");

      const nextProposal: ProposalView = {
        ...data.proposal,
        content: data.proposal.content,
        createdAt: data.proposal.createdAt,
      };
      setResult(nextProposal);
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
              <p className="text-blue-200/50 text-sm">Buat proposal dari template yang bisa Anda edit sendiri.</p>
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

      <div className="flex flex-wrap gap-2">
        {[
          { id: "generate", label: "Generate", icon: Sparkles },
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
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-5">
          <section className="glass rounded-2xl border border-blue-500/20 p-5 space-y-5">
            <div>
              <h2 className="text-white font-black text-lg">Brief Proposal</h2>
              <p className="text-blue-200/45 text-sm mt-1">{PROPOSAL_COST} kredit per generate.</p>
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
              {(selectedTemplate?.variables ?? []).map((variable) => (
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
            </div>

            {!canGenerate && (
              <Link
                href="/portal/credits"
                className="block rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-100 hover:bg-amber-500/15 transition-colors"
              >
                Kredit tidak cukup. Beli sekarang.
              </Link>
            )}

            <Button
              type="button"
              disabled={!selectedTemplate || !canGenerate || loading}
              onClick={generateProposal}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50"
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
          </section>

          <section className="glass rounded-2xl border border-white/10 p-5 min-h-[560px]">
            {result ? (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/10 pb-5">
                  <div>
                    <p className="text-blue-200/45 text-xs font-black uppercase tracking-widest">Preview</p>
                    <h2 className="text-white font-black text-xl mt-1">{result.content.title}</h2>
                    <p className="text-blue-200/40 text-sm mt-1">{result.templateName ?? "Template custom"} - {formatDate(result.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={copyResult} className="rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10">
                      <Copy className="w-4 h-4 mr-2" />
                      Salin
                    </Button>
                    <Button type="button" onClick={downloadResult} className="rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white">
                      Unduh TXT
                    </Button>
                  </div>
                </div>

                <div className="space-y-5">
                  {result.content.sections.map((section, index) => (
                    <article key={`${section.title}-${index}`} className="rounded-2xl border border-white/10 bg-[#07111f]/70 p-5">
                      <h3 className="text-white font-black">{section.title}</h3>
                      <p className="text-blue-100/65 text-sm leading-7 whitespace-pre-line mt-3">{section.body}</p>
                    </article>
                  ))}
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

      {activeTab === "templates" && (
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-5">
          <section className="glass rounded-2xl border border-white/10 p-5 space-y-3">
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

          <section className="glass rounded-2xl border border-blue-500/20 p-5 space-y-5">
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
        <section className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-white font-black text-lg">Riwayat Proposal</h2>
              <p className="text-blue-200/45 text-sm mt-1">{proposals.length} proposal terakhir</p>
            </div>
            <History className="w-5 h-5 text-blue-200/45" />
          </div>
          <div className="divide-y divide-white/10">
            {proposals.length === 0 ? (
              <div className="p-8 text-center text-blue-200/45">Belum ada proposal.</div>
            ) : proposals.map((proposal) => (
              <button
                key={proposal.id}
                type="button"
                onClick={() => {
                  setResult(proposal);
                  setActiveTab("generate");
                }}
                className="w-full px-5 py-4 text-left hover:bg-white/5 transition-colors flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-white font-bold">{proposal.title}</p>
                  <p className="text-blue-200/40 text-sm mt-1">{proposal.templateName ?? "Template custom"} - {formatDate(proposal.createdAt)}</p>
                </div>
                <Check className="w-4 h-4 text-emerald-300" />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

