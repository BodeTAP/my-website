"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Profile = {
  name:         string | null;
  email:        string;
  image:        string | null;
  businessName: string;
  phone:        string;
  address:      string;
};

export default function ProfileForm({ profile }: { profile: Profile }) {
  const router           = useRouter();
  const fileRef          = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();

  const [name,         setName]         = useState(profile.name ?? "");
  const [businessName, setBizName]      = useState(profile.businessName);
  const [phone,        setPhone]        = useState(profile.phone);
  const [address,      setAddress]      = useState(profile.address);
  const [avatarUrl,    setAvatarUrl]    = useState(profile.image);

  const [uploading, setUploading]       = useState(false);
  const [toast,     setToast]           = useState<{ ok: boolean; msg: string } | null>(null);

  function showToast(ok: boolean, msg: string) {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optimistic preview
    const preview = URL.createObjectURL(file);
    setAvatarUrl(preview);
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);
    const res  = await fetch("/api/portal/profile/avatar", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);

    if (res.ok) {
      setAvatarUrl(data.url);
      showToast(true, "Foto profil berhasil diperbarui.");
      router.refresh();
    } else {
      setAvatarUrl(profile.image);
      showToast(false, data.error ?? "Gagal mengunggah foto.");
    }
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  function handleSave() {
    start(async () => {
      const res = await fetch("/api/portal/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, businessName, phone, address }),
      });
      if (res.ok) {
        showToast(true, "Profil berhasil disimpan.");
        router.refresh();
      } else {
        const data = await res.json();
        showToast(false, data.error ?? "Gagal menyimpan profil.");
      }
    });
  }

  const initial = (name || profile.email).charAt(0).toUpperCase();

  return (
    <div className="max-w-xl space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm border ${
          toast.ok
            ? "bg-green-500/10 border-green-500/20 text-green-300"
            : "bg-red-500/10 border-red-500/20 text-red-300"
        }`}>
          {toast.ok
            ? <Check className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Avatar */}
      <div className="glass rounded-2xl p-6 flex items-center gap-6">
        <div className="relative group shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name || "Avatar"}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-500/30"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-300 text-3xl font-bold ring-2 ring-blue-500/30">
              {initial}
            </div>
          )}

          {/* Upload overlay */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Ganti foto"
          >
            {uploading
              ? <Loader2 className="w-6 h-6 text-white animate-spin" />
              : <Camera className="w-6 h-6 text-white" />}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div>
          <p className="text-white font-semibold text-lg">{name || profile.email}</p>
          <p className="text-blue-200/50 text-sm mb-3">{profile.email}</p>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
          >
            {uploading ? "Mengunggah..." : "Ganti foto profil"}
          </button>
          <p className="text-blue-200/30 text-xs mt-0.5">JPG, PNG, WebP — maks 2 MB</p>
        </div>
      </div>

      {/* Form fields */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-semibold mb-1">Informasi Pribadi</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nama Lengkap" value={name} onChange={setName} placeholder="Nama Anda" />
          <Field label="Nama Bisnis"  value={businessName} onChange={setBizName} placeholder="Nama bisnis" />
        </div>
        <Field label="Email" value={profile.email} disabled />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nomor WA / HP" value={phone} onChange={setPhone} placeholder="08xxxxxxxxxx" />
          <Field label="Alamat"        value={address} onChange={setAddress} placeholder="Kota, Provinsi" />
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={pending}
        className="bg-blue-600 hover:bg-blue-500 text-white h-11 px-8 font-semibold"
      >
        {pending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
      </Button>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, disabled,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-blue-200/60 text-xs mb-1.5 block">{label}</label>
      <input
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder:text-blue-200/25 focus:outline-none focus:border-blue-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      />
    </div>
  );
}
