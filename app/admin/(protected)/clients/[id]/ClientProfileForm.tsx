"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, Clock, Loader2, Save } from "lucide-react";

type ClientStatus = "ACTIVE" | "FOLLOW_UP" | "INACTIVE" | "CHURNED";
type ContactPreference = "WHATSAPP" | "EMAIL" | "PHONE";

type EditableClient = {
  id: string;
  businessName: string;
  status: ClientStatus;
  picName: string | null;
  picRole: string | null;
  phone: string | null;
  alternatePhone: string | null;
  billingEmail: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  preferredContact: ContactPreference;
  contactHours: string | null;
  source: string | null;
  tags: string[];
  internalNotes: string | null;
  accountManagerId: string | null;
  lastContactedAt: string | null;
};

type AdminUser = { id: string; name: string | null; email: string };

function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export default function ClientProfileForm({ client, adminUsers }: { client: EditableClient; adminUsers: AdminUser[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    businessName: client.businessName,
    status: client.status,
    picName: client.picName ?? "",
    picRole: client.picRole ?? "",
    phone: client.phone ?? "",
    alternatePhone: client.alternatePhone ?? "",
    billingEmail: client.billingEmail ?? "",
    address: client.address ?? "",
    city: client.city ?? "",
    province: client.province ?? "",
    preferredContact: client.preferredContact,
    contactHours: client.contactHours ?? "",
    source: client.source ?? "",
    tags: client.tags.join(", "),
    internalNotes: client.internalNotes ?? "",
    accountManagerId: client.accountManagerId ?? "",
    lastContactedAt: toDatetimeLocal(client.lastContactedAt),
  });

  const tagPreview = useMemo(
    () => form.tags.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 12),
    [form.tags],
  );

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
    setError("");
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    setError("");

    const res = await fetch(`/api/admin/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tags: tagPreview,
        accountManagerId: form.accountManagerId || null,
        lastContactedAt: fromDatetimeLocal(form.lastContactedAt),
      }),
    });
    const data = await res.json().catch(() => ({}));

    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Gagal menyimpan detail klien.");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  function markContactedNow() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    setField("lastContactedAt", new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 16));
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#071225] p-5">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-white">Detail Akun Klien</h2>
          <p className="mt-1 text-sm text-blue-200/50">Data master untuk kontak, billing, preferensi komunikasi, dan catatan internal.</p>
        </div>
        <button
          onClick={save}
          disabled={saving || !form.businessName.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Nama bisnis" value={form.businessName} onChange={(value) => setField("businessName", value)} required />
        <SelectField
          label="Status klien"
          value={form.status}
          onChange={(value) => setField("status", value as ClientStatus)}
          options={[
            ["ACTIVE", "Aktif"],
            ["FOLLOW_UP", "Perlu follow-up"],
            ["INACTIVE", "Pasif"],
            ["CHURNED", "Churned"],
          ]}
        />
        <Field label="PIC utama" value={form.picName} onChange={(value) => setField("picName", value)} placeholder="Nama kontak utama" />
        <Field label="Jabatan PIC" value={form.picRole} onChange={(value) => setField("picRole", value)} placeholder="Owner, admin, finance..." />
        <Field label="WhatsApp utama" value={form.phone} onChange={(value) => setField("phone", value)} placeholder="08xxxxxxxxxx" />
        <Field label="Nomor alternatif" value={form.alternatePhone} onChange={(value) => setField("alternatePhone", value)} placeholder="Opsional" />
        <Field label="Email billing" value={form.billingEmail} onChange={(value) => setField("billingEmail", value)} placeholder="finance@bisnis.com" />
        <SelectField
          label="Preferensi kontak"
          value={form.preferredContact}
          onChange={(value) => setField("preferredContact", value as ContactPreference)}
          options={[
            ["WHATSAPP", "WhatsApp"],
            ["EMAIL", "Email"],
            ["PHONE", "Telepon"],
          ]}
        />
        <Field label="Kota" value={form.city} onChange={(value) => setField("city", value)} />
        <Field label="Provinsi" value={form.province} onChange={(value) => setField("province", value)} />
        <Field label="Jam kontak" value={form.contactHours} onChange={(value) => setField("contactHours", value)} placeholder="Senin-Jumat, 09.00-17.00" />
        <Field label="Sumber klien" value={form.source} onChange={(value) => setField("source", value)} placeholder="Referral, organic, ads..." />
        <SelectField
          label="Account manager"
          value={form.accountManagerId}
          onChange={(value) => setField("accountManagerId", value)}
          options={[
            ["", "Belum ditentukan"],
            ...adminUsers.map((admin) => [admin.id, admin.name || admin.email] as [string, string]),
          ]}
        />
        <div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Field
                label="Terakhir dihubungi"
                type="datetime-local"
                value={form.lastContactedAt}
                onChange={(value) => setField("lastContactedAt", value)}
              />
            </div>
            <button
              onClick={markContactedNow}
              className="mb-0.5 inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-bold text-blue-100 transition-colors hover:bg-white/10"
              title="Tandai sudah dihubungi sekarang"
            >
              <Clock className="h-3.5 w-3.5" />
              Hari ini
            </button>
          </div>
        </div>
        <div className="md:col-span-2">
          <Field label="Alamat lengkap" value={form.address} onChange={(value) => setField("address", value)} />
        </div>
        <div className="md:col-span-2">
          <Field label="Tags" value={form.tags} onChange={(value) => setField("tags", value)} placeholder="VIP, maintenance, upsell" />
          {tagPreview.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tagPreview.map((tag) => (
                <span key={tag} className="rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-[11px] font-semibold text-sky-200">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wide text-blue-200/45">Catatan internal</label>
          <textarea
            value={form.internalNotes}
            onChange={(event) => setField("internalNotes", event.target.value)}
            rows={5}
            placeholder="Konteks penting, preferensi, risiko, atau catatan follow-up."
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-blue-200/25 focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/15"
          />
        </div>
      </div>

      {(saved || error) && (
        <div className={`mt-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${saved ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200" : "border-red-500/25 bg-red-500/10 text-red-200"}`}>
          {saved ? <Check className="h-4 w-4" /> : null}
          {saved ? "Detail klien tersimpan." : error}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-blue-200/45">
        {label}{required ? " *" : ""}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-white outline-none transition-colors placeholder:text-blue-200/25 focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/15"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-blue-200/45">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-white outline-none transition-colors focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/15"
      >
        {options.map(([optionValue, labelText]) => (
          <option key={optionValue || "empty"} value={optionValue} className="bg-[#071225]">
            {labelText}
          </option>
        ))}
      </select>
    </label>
  );
}
