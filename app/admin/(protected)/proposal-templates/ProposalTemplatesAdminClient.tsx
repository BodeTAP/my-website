"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, Pencil, Plus, Save, Trash2 } from "lucide-react";
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

type AdminTemplate = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  sections: ProposalSection[];
  variables: ProposalVariable[];
  isActive: boolean;
  createdAt: string;
};

type TemplateDraft = {
  id?: string;
  name: string;
  category: string;
  description: string;
  sections: ProposalSection[];
  variables: ProposalVariable[];
  isActive: boolean;
};

function emptyDraft(): TemplateDraft {
  return {
    name: "",
    category: "General",
    description: "",
    isActive: true,
    variables: [
      { key: "prospectName", label: "Nama calon klien", placeholder: "Budi Santoso" },
      { key: "businessName", label: "Nama bisnis/organisasi", placeholder: "PT Contoh Sukses" },
      { key: "goals", label: "Tujuan", type: "textarea", placeholder: "Tujuan utama proposal" },
    ],
    sections: [
      { title: "Ringkasan", body: "{{businessName}} membutuhkan solusi untuk {{goals}}." },
    ],
  };
}

export default function ProposalTemplatesAdminClient({ initialTemplates }: { initialTemplates: AdminTemplate[] }) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates);
  const [draft, setDraft] = useState<TemplateDraft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateDraft = (patch: Partial<TemplateDraft>) => setDraft((current) => ({ ...current, ...patch }));

  const editTemplate = (template: AdminTemplate) => {
    setDraft({
      id: template.id,
      name: template.name,
      category: template.category,
      description: template.description ?? "",
      sections: template.sections.length ? template.sections : emptyDraft().sections,
      variables: template.variables.length ? template.variables : emptyDraft().variables,
      isActive: template.isActive,
    });
  };

  const duplicateTemplate = (template: AdminTemplate) => {
    setDraft({
      name: `${template.name} Copy`,
      category: template.category,
      description: template.description ?? "",
      sections: template.sections,
      variables: template.variables,
      isActive: true,
    });
  };

  const saveTemplate = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(
        draft.id ? `/api/admin/proposal-templates/${draft.id}` : "/api/admin/proposal-templates",
        {
          method: draft.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan template");

      const nextTemplate: AdminTemplate = {
        ...data.template,
        sections: data.template.sections,
        variables: data.template.variables ?? [],
        createdAt: data.template.createdAt,
      };
      setTemplates((current) => {
        const exists = current.some((template) => template.id === nextTemplate.id);
        return exists
          ? current.map((template) => template.id === nextTemplate.id ? nextTemplate : template)
          : [nextTemplate, ...current];
      });
      editTemplate(nextTemplate);
      setMessage("Template berhasil disimpan.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deactivateTemplate = async (id: string) => {
    if (!confirm("Nonaktifkan template ini dari portal klien?")) return;
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`/api/admin/proposal-templates/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menonaktifkan template");
      setTemplates((current) => current.map((template) => template.id === id ? { ...template, isActive: false } : template));
      setMessage("Template berhasil dinonaktifkan.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[430px_1fr] gap-6">
      <section className="glass rounded-3xl border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-white font-black text-lg">Template Bawaan</h2>
            <p className="text-blue-200/45 text-sm mt-1">{templates.filter((template) => template.isActive).length} aktif</p>
          </div>
          <Button type="button" onClick={() => setDraft(emptyDraft())} className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold">
            <Plus className="w-4 h-4 mr-2" />
            Baru
          </Button>
        </div>

        {(message || error) && (
          <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${error ? "bg-red-500/10 border-red-500/25 text-red-200" : "bg-emerald-500/10 border-emerald-500/25 text-emerald-200"}`}>
            {error || message}
          </div>
        )}

        <div className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className={`rounded-2xl border p-4 ${template.isActive ? "bg-[#07111f]/80 border-white/10" : "bg-white/[0.03] border-white/5 opacity-60"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-white font-black">{template.name}</p>
                  <p className="text-blue-200/40 text-sm mt-1">{template.category}</p>
                </div>
                <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wider border ${template.isActive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200" : "bg-white/5 border-white/10 text-blue-200/40"}`}>
                  {template.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button type="button" onClick={() => editTemplate(template)} className="rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10">
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button type="button" onClick={() => duplicateTemplate(template)} className="rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10">
                  <Copy className="w-4 h-4 mr-2" />
                  Duplikat
                </Button>
                {template.isActive && (
                  <Button type="button" disabled={saving} onClick={() => deactivateTemplate(template.id)} className="rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-200 border border-red-500/20">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Nonaktifkan
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass rounded-3xl border border-blue-500/20 p-5 space-y-5">
        <div>
          <h2 className="text-white font-black text-lg">{draft.id ? "Edit Template" : "Template Baru"}</h2>
          <p className="text-blue-200/45 text-sm mt-1">Template aktif akan tampil sebagai template bawaan di portal klien.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_120px] gap-3">
          <input value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} placeholder="Nama template" className="h-12 rounded-xl bg-[#07111f] border border-white/10 px-4 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500" />
          <input value={draft.category} onChange={(event) => updateDraft({ category: event.target.value })} placeholder="Kategori" className="h-12 rounded-xl bg-[#07111f] border border-white/10 px-4 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500" />
          <label className="h-12 rounded-xl bg-[#07111f] border border-white/10 px-4 text-white flex items-center gap-2">
            <input type="checkbox" checked={draft.isActive} onChange={(event) => updateDraft({ isActive: event.target.checked })} className="accent-blue-500" />
            Aktif
          </label>
        </div>

        <textarea value={draft.description} onChange={(event) => updateDraft({ description: event.target.value })} placeholder="Deskripsi singkat" rows={2} className="w-full rounded-xl bg-[#07111f] border border-white/10 px-4 py-3 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500 resize-none" />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-white font-black">Field Brief</h3>
            <Button type="button" onClick={() => updateDraft({ variables: [...draft.variables, { key: "", label: "", placeholder: "" }] })} className="rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10">
              <Plus className="w-4 h-4 mr-2" />
              Field
            </Button>
          </div>
          {draft.variables.map((variable, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2">
              <input value={variable.key} onChange={(event) => updateDraft({ variables: draft.variables.map((item, itemIndex) => itemIndex === index ? { ...item, key: event.target.value } : item) })} placeholder="key" className="h-11 rounded-xl bg-[#07111f] border border-white/10 px-3 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500" />
              <input value={variable.label} onChange={(event) => updateDraft({ variables: draft.variables.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item) })} placeholder="Label" className="h-11 rounded-xl bg-[#07111f] border border-white/10 px-3 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500" />
              <input value={variable.placeholder ?? ""} onChange={(event) => updateDraft({ variables: draft.variables.map((item, itemIndex) => itemIndex === index ? { ...item, placeholder: event.target.value } : item) })} placeholder="Placeholder" className="h-11 rounded-xl bg-[#07111f] border border-white/10 px-3 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500" />
              <button type="button" onClick={() => updateDraft({ variables: draft.variables.filter((_item, itemIndex) => itemIndex !== index) })} className="h-11 w-11 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 hover:bg-red-500/15 flex items-center justify-center" aria-label="Hapus field">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-white font-black">Section Proposal</h3>
            <Button type="button" onClick={() => updateDraft({ sections: [...draft.sections, { title: "", body: "" }] })} className="rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10">
              <Plus className="w-4 h-4 mr-2" />
              Section
            </Button>
          </div>
          {draft.sections.map((section, index) => (
            <div key={index} className="rounded-2xl bg-[#07111f]/70 border border-white/10 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input value={section.title} onChange={(event) => updateDraft({ sections: draft.sections.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item) })} placeholder="Judul section" className="h-11 flex-1 rounded-xl bg-[#07111f] border border-white/10 px-3 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500" />
                <button type="button" onClick={() => updateDraft({ sections: draft.sections.filter((_item, itemIndex) => itemIndex !== index) })} className="h-11 w-11 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 hover:bg-red-500/15 flex items-center justify-center" aria-label="Hapus section">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea value={section.body} onChange={(event) => updateDraft({ sections: draft.sections.map((item, itemIndex) => itemIndex === index ? { ...item, body: event.target.value } : item) })} placeholder="Isi section. Gunakan placeholder seperti {{businessName}}." rows={5} className="w-full rounded-xl bg-[#07111f] border border-white/10 px-4 py-3 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500 resize-none" />
            </div>
          ))}
        </div>

        <Button type="button" disabled={saving} onClick={saveTemplate} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Simpan Template
        </Button>
      </section>
    </div>
  );
}

