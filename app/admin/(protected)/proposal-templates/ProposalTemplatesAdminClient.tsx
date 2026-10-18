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
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-slate-900 font-bold text-lg">Template Bawaan</h2>
            <p className="text-slate-500 text-sm mt-1">{templates.filter((template) => template.isActive).length} aktif</p>
          </div>
          <Button type="button" onClick={() => setDraft(emptyDraft())} className="rounded-xl bg-[#1E242E] hover:bg-slate-800 text-white font-semibold shadow-xs">
            <Plus className="w-4 h-4 mr-1.5" />
            Baru
          </Button>
        </div>

        {(message || error) && (
          <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${error ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
            {error || message}
          </div>
        )}

        <div className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className={`rounded-xl border p-4 transition-colors ${template.isActive ? "bg-white border-slate-200 shadow-2xs hover:border-slate-300" : "bg-slate-50 border-slate-200 opacity-60"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-slate-900 font-bold">{template.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{template.category}</p>
                </div>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${template.isActive ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-100 border-slate-200 text-slate-500"}`}>
                  {template.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button type="button" onClick={() => editTemplate(template)} className="rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs text-xs font-semibold">
                  <Pencil className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  Edit
                </Button>
                <Button type="button" onClick={() => duplicateTemplate(template)} className="rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs text-xs font-semibold">
                  <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  Duplikat
                </Button>
                {template.isActive && (
                  <Button type="button" disabled={saving} onClick={() => deactivateTemplate(template.id)} className="rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold">
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Nonaktifkan
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5 shadow-xs">
        <div>
          <h2 className="text-slate-900 font-bold text-lg">{draft.id ? "Edit Template" : "Template Baru"}</h2>
          <p className="text-slate-500 text-sm mt-1">Template aktif akan tampil sebagai template bawaan di portal klien.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_120px] gap-3">
          <input value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} placeholder="Nama template" className="h-11 rounded-xl bg-slate-50 border border-slate-200 px-3.5 text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-slate-900" />
          <input value={draft.category} onChange={(event) => updateDraft({ category: event.target.value })} placeholder="Kategori" className="h-11 rounded-xl bg-slate-50 border border-slate-200 px-3.5 text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-slate-900" />
          <label className="h-11 rounded-xl bg-slate-50 border border-slate-200 px-3.5 text-slate-900 text-sm flex items-center gap-2 font-medium">
            <input type="checkbox" checked={draft.isActive} onChange={(event) => updateDraft({ isActive: event.target.checked })} className="accent-slate-900" />
            Aktif
          </label>
        </div>

        <textarea value={draft.description} onChange={(event) => updateDraft({ description: event.target.value })} placeholder="Deskripsi singkat" rows={2} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 resize-none" />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-slate-900 font-bold text-sm">Field Brief</h3>
            <Button type="button" onClick={() => updateDraft({ variables: [...draft.variables, { key: "", label: "", placeholder: "" }] })} className="rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs text-xs font-semibold">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Field
            </Button>
          </div>
          {draft.variables.map((variable, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2">
              <input value={variable.key} onChange={(event) => updateDraft({ variables: draft.variables.map((item, itemIndex) => itemIndex === index ? { ...item, key: event.target.value } : item) })} placeholder="key" className="h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-slate-900" />
              <input value={variable.label} onChange={(event) => updateDraft({ variables: draft.variables.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item) })} placeholder="Label" className="h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-slate-900" />
              <input value={variable.placeholder ?? ""} onChange={(event) => updateDraft({ variables: draft.variables.map((item, itemIndex) => itemIndex === index ? { ...item, placeholder: event.target.value } : item) })} placeholder="Placeholder" className="h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-slate-900" />
              <button type="button" onClick={() => updateDraft({ variables: draft.variables.filter((_item, itemIndex) => itemIndex !== index) })} className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 flex items-center justify-center transition-colors" aria-label="Hapus field">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-slate-900 font-bold text-sm">Section Proposal</h3>
            <Button type="button" onClick={() => updateDraft({ sections: [...draft.sections, { title: "", body: "" }] })} className="rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs text-xs font-semibold">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Section
            </Button>
          </div>
          {draft.sections.map((section, index) => (
            <div key={index} className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input value={section.title} onChange={(event) => updateDraft({ sections: draft.sections.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item) })} placeholder="Judul section" className="h-10 flex-1 rounded-xl bg-white border border-slate-200 px-3 text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:ring-1 focus:ring-slate-900" />
                <button type="button" onClick={() => updateDraft({ sections: draft.sections.filter((_item, itemIndex) => itemIndex !== index) })} className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 flex items-center justify-center transition-colors" aria-label="Hapus section">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea value={section.body} onChange={(event) => updateDraft({ sections: draft.sections.map((item, itemIndex) => itemIndex === index ? { ...item, body: event.target.value } : item) })} placeholder="Isi section. Gunakan placeholder seperti {{businessName}}." rows={4} className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:ring-1 focus:ring-slate-900 resize-none" />
            </div>
          ))}
        </div>

        <Button type="button" disabled={saving} onClick={saveTemplate} className="w-full h-11 rounded-xl bg-[#1E242E] hover:bg-slate-800 text-white font-semibold shadow-xs">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Simpan Template
        </Button>
      </section>
    </div>
  );
}

