"use client";

import { useState } from "react";
import { AlertTriangle, Coins, FileText, Globe, Loader2, ReceiptText, Save, Search } from "lucide-react";
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
  | "tool_signup_bonus_enabled"
  | "tool_signup_bonus_amount"
  | "tool_low_credit_warning_threshold"
  | "tool_lead_finder_freemium_enabled"
  | "tool_lead_finder_freemium_daily_limit"
  | "tool_lead_finder_freemium_result_cap"
  | "tool_proposal_generator_freemium_enabled"
  | "tool_proposal_generator_freemium_monthly_limit"
  | "tool_invoice_generator_freemium_enabled"
  | "tool_invoice_generator_freemium_monthly_limit";
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
  min = 0,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  min?: number;
}) {
  return (
    <label className="block">
      <span className="text-slate-700 text-xs font-semibold uppercase tracking-wider">{label}</span>
      <div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-colors">
        <input
          type="number"
          min={min}
          max={9999}
          value={asNumber(value)}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-xl bg-transparent px-4 text-slate-900 outline-none text-sm font-medium"
        />
        <span className="shrink-0 pr-4 text-xs font-semibold text-slate-400">{suffix}</span>
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
    <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
      <span>
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="block text-xs leading-relaxed text-slate-500 mt-0.5">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 shrink-0 accent-slate-900 cursor-pointer"
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
      <span className="text-slate-700 text-xs font-semibold uppercase tracking-wider">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400 transition-colors"
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
    <section className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 lg:flex-row lg:items-center lg:justify-between bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Konfigurasi Tools</h2>
          <p className="mt-1 text-sm text-slate-500">Atur status aktif dan biaya kredit yang dipakai oleh portal klien.</p>
        </div>
        <Button type="button" disabled={saving} onClick={saveSettings} className="h-10 rounded-xl bg-[#1E242E] px-5 font-semibold text-white hover:bg-slate-800 shadow-xs transition-colors">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Simpan
        </Button>
      </div>

      {(message || error) && (
        <div className={`mx-5 mt-5 rounded-xl border px-4 py-3 text-sm font-medium ${error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          {error || message}
        </div>
      )}

      <div className="grid gap-5 p-5 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 shrink-0">
              <Search className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Lead Finder</h3>
              <p className="mt-0.5 text-xs text-slate-500">Tool pencarian calon pelanggan dari Google Maps.</p>
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

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 shrink-0">
              <ReceiptText className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Invoice Generator</h3>
              <p className="mt-0.5 text-xs text-slate-500">Tool portal untuk membuat invoice PDF tanpa payment.</p>
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
            <NumberField label="Default Jatuh Tempo" value={settings.tool_invoice_generator_default_due_days} onChange={(value) => update("tool_invoice_generator_default_due_days", value)} suffix="hari" min={1} />
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

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 shrink-0">
              <FileText className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Proposal Generator</h3>
              <p className="mt-0.5 text-xs text-slate-500">Tool untuk membuat proposal dari template dan desain klien.</p>
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

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 shrink-0">
              <Coins className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Kredit & Trial</h3>
              <p className="mt-0.5 text-xs text-slate-500">Bonus akun baru dan ambang saldo rendah.</p>
            </div>
          </div>
          <div className="space-y-4">
            <ToggleField
              checked={settings.tool_signup_bonus_enabled === "true"}
              onChange={(value) => update("tool_signup_bonus_enabled", value)}
              label="Bonus pendaftaran aktif"
              description="Akun baru mendapat kredit gratis satu kali untuk mencoba tools."
            />
            <NumberField label="Bonus Akun Baru" value={settings.tool_signup_bonus_amount} onChange={(value) => update("tool_signup_bonus_amount", value)} />
            <NumberField label="Ambang Warning" value={settings.tool_low_credit_warning_threshold} onChange={(value) => update("tool_low_credit_warning_threshold", value)} />
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p>Jika saldo klien di bawah angka ini, portal akan menampilkan ajakan membeli kredit.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Freemium Section */}
      <div className="border-t border-slate-100 px-5 pt-6 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700">
            <Globe className="h-4 w-4 text-slate-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Freemium</h3>
            <p className="text-xs text-slate-500 mt-0.5">Kontrol akses gratis untuk tools premium di halaman publik</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 px-5 pb-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 shrink-0">
              <Search className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Lead Finder Freemium</h3>
              <p className="mt-0.5 text-xs text-slate-500">Akses gratis pencarian lead di halaman publik.</p>
            </div>
          </div>
          <div className="space-y-4">
            <ToggleField
              checked={settings.tool_lead_finder_freemium_enabled === "true"}
              onChange={(value) => update("tool_lead_finder_freemium_enabled", value)}
              label="Lead Finder Freemium"
              description="Pengunjung publik bisa mencoba Lead Finder tanpa login."
            />
            <NumberField label="Pencarian per hari" value={settings.tool_lead_finder_freemium_daily_limit} onChange={(value) => update("tool_lead_finder_freemium_daily_limit", value)} suffix="kali" min={1} />
            <NumberField label="Maks hasil gratis" value={settings.tool_lead_finder_freemium_result_cap} onChange={(value) => update("tool_lead_finder_freemium_result_cap", value)} suffix="leads" min={1} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 shrink-0">
              <FileText className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Proposal Generator Freemium</h3>
              <p className="mt-0.5 text-xs text-slate-500">Akses gratis generate proposal di halaman publik.</p>
            </div>
          </div>
          <div className="space-y-4">
            <ToggleField
              checked={settings.tool_proposal_generator_freemium_enabled === "true"}
              onChange={(value) => update("tool_proposal_generator_freemium_enabled", value)}
              label="Proposal Generator Freemium"
              description="Pengunjung publik bisa mencoba Proposal Generator tanpa login."
            />
            <NumberField label="Generate per bulan" value={settings.tool_proposal_generator_freemium_monthly_limit} onChange={(value) => update("tool_proposal_generator_freemium_monthly_limit", value)} suffix="kali" min={1} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 shrink-0">
              <ReceiptText className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Invoice Generator Freemium</h3>
              <p className="mt-0.5 text-xs text-slate-500">Akses gratis generate invoice di halaman publik.</p>
            </div>
          </div>
          <div className="space-y-4">
            <ToggleField
              checked={settings.tool_invoice_generator_freemium_enabled === "true"}
              onChange={(value) => update("tool_invoice_generator_freemium_enabled", value)}
              label="Invoice Generator Freemium"
              description="Pengunjung publik bisa mencoba Invoice Generator tanpa login."
            />
            <NumberField label="Generate per bulan" value={settings.tool_invoice_generator_freemium_monthly_limit} onChange={(value) => update("tool_invoice_generator_freemium_monthly_limit", value)} suffix="kali" min={1} />
          </div>
        </div>
      </div>
    </section>
  );
}
