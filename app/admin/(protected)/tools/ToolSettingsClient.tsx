"use client";

import { useState } from "react";
import { AlertTriangle, Coins, FileText, Loader2, ReceiptText, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type ToolSettingKey =
  | "tool_lead_finder_enabled"
  | "tool_lead_finder_standard_cost"
  | "tool_lead_finder_deep_cost"
  | "tool_lead_finder_social_scan_enabled"
  | "tool_lead_finder_social_scan_cost"
  | "tool_proposal_generator_enabled"
  | "tool_proposal_generator_cost"
  | "tool_invoice_generator_enabled"
  | "tool_invoice_generator_cost"
  | "tool_invoice_generator_default_due_days"
  | "tool_invoice_generator_default_footer"
  | "tool_invoice_generator_default_include_tax"
  | "tool_low_credit_warning_threshold";
type SettingsRecord = Record<ToolSettingKey, string>;

function asNumber(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function NumberField({
  label,
  value,
  onChange,
  suffix = "kredit",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-blue-200/45 text-xs font-black uppercase tracking-wider">{label}</span>
      <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-[#07111f] focus-within:border-blue-500/55">
        <input
          type="number"
          min={0}
          max={9999}
          value={asNumber(value)}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full rounded-xl bg-transparent px-4 text-white outline-none"
        />
        <span className="shrink-0 pr-4 text-xs font-bold text-blue-200/35">{suffix}</span>
      </div>
    </label>
  );
}

function ToggleField({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span>
        <span className="block text-sm font-black text-white">{label}</span>
        <span className="block text-xs leading-relaxed text-blue-200/40">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 shrink-0 accent-blue-500"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-blue-200/45 text-xs font-black uppercase tracking-wider">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="mt-2 w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/55"
      />
    </label>
  );
}

export default function ToolSettingsClient({ initialSettings }: { initialSettings: SettingsRecord }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const update = (key: ToolSettingKey, value: string | boolean) => {
    setSettings((current) => ({
      ...current,
      [key]: typeof value === "boolean" ? String(value) : value,
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/tools/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan konfigurasi tools");

      setSettings(data.settings);
      setMessage("Konfigurasi tools berhasil disimpan.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="glass rounded-3xl border border-blue-500/20 overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-black text-white">Prioritas Tools</h2>
          <p className="mt-1 text-sm text-blue-200/45">Atur status aktif dan biaya kredit yang dipakai oleh portal klien.</p>
        </div>
        <Button type="button" disabled={saving} onClick={saveSettings} className="h-11 rounded-xl bg-blue-600 px-5 font-black text-white hover:bg-blue-500">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Simpan
        </Button>
      </div>

      {(message || error) && (
        <div className={`mx-5 mt-5 rounded-2xl border px-4 py-3 text-sm font-bold ${error ? "border-red-500/25 bg-red-500/10 text-red-200" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"}`}>
          {error || message}
        </div>
      )}

      <div className="grid gap-5 p-5 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#07111f]/70 p-5">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/25 bg-blue-500/10">
              <Search className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-black text-white">Lead Finder</h3>
              <p className="mt-1 text-sm text-blue-200/40">Tool pencarian calon pelanggan dari Google Maps.</p>
            </div>
          </div>
          <div className="space-y-4">
            <ToggleField
              checked={settings.tool_lead_finder_enabled === "true"}
              onChange={(value) => update("tool_lead_finder_enabled", value)}
              label="Aktif di portal"
              description="Klien bisa membuka dan menjalankan Lead Finder."
            />
            <NumberField label="Standard Search" value={settings.tool_lead_finder_standard_cost} onChange={(value) => update("tool_lead_finder_standard_cost", value)} />
            <NumberField label="Deep Search" value={settings.tool_lead_finder_deep_cost} onChange={(value) => update("tool_lead_finder_deep_cost", value)} />
            <ToggleField
              checked={settings.tool_lead_finder_social_scan_enabled === "true"}
              onChange={(value) => update("tool_lead_finder_social_scan_enabled", value)}
              label="Social Scan aktif"
              description="Klien bisa menambahkan Social Scan saat menjalankan Lead Finder."
            />
            <NumberField label="Social Scan Add-on" value={settings.tool_lead_finder_social_scan_cost} onChange={(value) => update("tool_lead_finder_social_scan_cost", value)} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#07111f]/70 p-5">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/25 bg-blue-500/10">
              <ReceiptText className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-black text-white">Invoice Generator</h3>
              <p className="mt-1 text-sm text-blue-200/40">Tool portal untuk membuat invoice PDF tanpa payment.</p>
            </div>
          </div>
          <div className="space-y-4">
            <ToggleField
              checked={settings.tool_invoice_generator_enabled === "true"}
              onChange={(value) => update("tool_invoice_generator_enabled", value)}
              label="Aktif di portal"
              description="Klien bisa membuat dan download invoice PDF."
            />
            <NumberField label="Biaya Generate" value={settings.tool_invoice_generator_cost} onChange={(value) => update("tool_invoice_generator_cost", value)} />
            <NumberField label="Default Jatuh Tempo" value={settings.tool_invoice_generator_default_due_days} onChange={(value) => update("tool_invoice_generator_default_due_days", value)} suffix="hari" />
            <ToggleField
              checked={settings.tool_invoice_generator_default_include_tax === "true"}
              onChange={(value) => update("tool_invoice_generator_default_include_tax", value)}
              label="Default sertakan PPN 11%"
              description="Form invoice klien akan otomatis mencentang PPN 11% saat dibuka."
            />
            <TextAreaField
              label="Footer Default"
              value={settings.tool_invoice_generator_default_footer}
              onChange={(value) => update("tool_invoice_generator_default_footer", value)}
              placeholder="Terima kasih atas kepercayaan Anda."
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#07111f]/70 p-5">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/25 bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-black text-white">Proposal Generator</h3>
              <p className="mt-1 text-sm text-blue-200/40">Tool untuk membuat proposal dari template dan desain klien.</p>
            </div>
          </div>
          <div className="space-y-4">
            <ToggleField
              checked={settings.tool_proposal_generator_enabled === "true"}
              onChange={(value) => update("tool_proposal_generator_enabled", value)}
              label="Aktif di portal"
              description="Klien bisa generate proposal dan memakai template."
            />
            <NumberField label="Biaya Generate" value={settings.tool_proposal_generator_cost} onChange={(value) => update("tool_proposal_generator_cost", value)} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#07111f]/70 p-5">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10">
              <Coins className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-white">Kredit & Warning</h3>
              <p className="mt-1 text-sm text-blue-200/40">Ambang saldo untuk banner kredit hampir habis.</p>
            </div>
          </div>
          <div className="space-y-4">
            <NumberField label="Ambang Warning" value={settings.tool_low_credit_warning_threshold} onChange={(value) => update("tool_low_credit_warning_threshold", value)} />
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <p>Jika saldo klien di bawah angka ini, portal akan menampilkan ajakan membeli kredit.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
