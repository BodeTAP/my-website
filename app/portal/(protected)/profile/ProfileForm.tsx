"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Loader2, Check, AlertCircle, Save, User, Building, Phone, MapPin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";

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
  const [imgError,     setImgError]     = useState(false);

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
    setImgError(false);
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);
    const res  = await fetch("/api/portal/profile/avatar", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);

    if (res.ok) {
      setAvatarUrl(data.url);
      setImgError(false);
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

  const initial = (name || profile.email || "U").charAt(0).toUpperCase();

  return (
    <StaggerChildren className="max-w-2xl space-y-6">
      {/* Toast */}
      {toast && (
        <FadeUp>
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-lg backdrop-blur-md ${
            toast.ok
              ? "bg-green-500/10 border-green-500/30 text-green-300 shadow-green-500/10"
              : "bg-red-500/10 border-red-500/30 text-red-300 shadow-red-500/10"
          }`}>
            {toast.ok
              ? <Check className="w-5 h-5 shrink-0" />
              : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="text-sm font-medium">{toast.msg}</span>
          </div>
        </FadeUp>
      )}

      {/* Avatar Section */}
      <StaggerItem>
        <div className="glass rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 relative overflow-hidden group">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-700" />
          
          <div className="relative shrink-0 z-10">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center bg-[#050b14] ring-1 ring-white/10 p-1">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 opacity-20 blur-md" />
              <div className="w-full h-full rounded-full overflow-hidden relative z-10 bg-[#050b14]">
                {avatarUrl && !imgError ? (
                  <Image
                    src={avatarUrl}
                    alt={name || "Avatar"}
                    fill
                    className="object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                    {initial}
                  </div>
                )}
              </div>
            </div>

            {/* Upload overlay button */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 ring-4 ring-[#050b14] transition-transform hover:scale-110 active:scale-95 z-20"
              aria-label="Ganti foto"
            >
              {uploading
                ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                : <Camera className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="text-center sm:text-left z-10 pt-2 sm:pt-4">
            <h2 className="text-white font-bold text-xl sm:text-2xl tracking-tight">{name || profile.email}</h2>
            <p className="text-blue-300/80 text-sm mt-1">{profile.email}</p>
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs rounded-full px-5 h-8"
              >
                {uploading ? "Mengunggah..." : "Ubah Foto"}
              </Button>
              <p className="text-blue-200/30 text-[10px] uppercase tracking-wider font-semibold">Maks 2MB (JPG, PNG)</p>
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* Form Fields Section */}
      <StaggerItem>
        <div className="glass rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold text-lg">Informasi Pribadi</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <Field icon={User} label="Nama Lengkap" value={name} onChange={setName} placeholder="Nama Anda" />
            <Field icon={Building} label="Nama Bisnis"  value={businessName} onChange={setBizName} placeholder="PT / CV Bisnis Anda" />
          </div>
          
          <Field icon={Mail} label="Alamat Email (Tidak bisa diubah)" value={profile.email} disabled />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <Field icon={Phone} label="Nomor WA / HP" value={phone} onChange={setPhone} placeholder="08xxxxxxxxxx" />
            <Field icon={MapPin} label="Alamat Lengkap" value={address} onChange={setAddress} placeholder="Kota, Provinsi" />
          </div>
        </div>
      </StaggerItem>

      {/* Save Button */}
      <StaggerItem>
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={pending}
            className="bg-blue-600 hover:bg-blue-500 text-white h-12 px-8 rounded-xl font-semibold shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm w-full sm:w-auto"
          >
            {pending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> : <><Save className="w-4 h-4 mr-2" /> Simpan Perubahan</>}
          </Button>
        </div>
      </StaggerItem>
    </StaggerChildren>
  );
}

function Field({
  icon: Icon, label, value, onChange, placeholder, disabled,
}: {
  icon: any;
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="group">
      <label className="text-blue-200/50 group-focus-within:text-blue-400 text-xs font-medium mb-2 flex items-center transition-colors">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon className="w-4 h-4 text-blue-200/30 group-focus-within:text-blue-400 transition-colors" />
        </div>
        <input
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-[#050b14]/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-blue-200/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:bg-white/5 disabled:cursor-not-allowed transition-all"
        />
      </div>
    </div>
  );
}
