"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Loader2, Check, AlertCircle, Save, User, Building, Phone, MapPin, Mail, ImageIcon, Palette, Upload, type LucideIcon } from "lucide-react";
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
type BrandKit = {
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  fontStyle: "sans" | "serif" | "mono";
};

export default function ProfileForm({ profile, brandKit }: { profile: Profile; brandKit: BrandKit }) {
  const router           = useRouter();
  const fileRef          = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();

  const [name,         setName]         = useState(profile.name ?? "");
  const [businessName, setBizName]      = useState(profile.businessName);
  const [phone,        setPhone]        = useState(profile.phone);
  const [address,      setAddress]      = useState(profile.address);
  const [avatarUrl,    setAvatarUrl]    = useState(profile.image);
  const [imgError,     setImgError]     = useState(false);
  const [brandLogo,    setBrandLogo]    = useState(brandKit.logoUrl);
  const [primaryColor, setPrimaryColor] = useState(brandKit.primaryColor);
  const [accentColor,  setAccentColor]  = useState(brandKit.accentColor);
  const [fontStyle,    setFontStyle]    = useState<BrandKit["fontStyle"]>(brandKit.fontStyle);

  const [uploading, setUploading]       = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingBrand, setSavingBrand]   = useState(false);
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

  async function handleBrandLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/portal/tools/invoice-generator/logo", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    setUploadingLogo(false);

    if (res.ok) {
      setBrandLogo(data.url);
      showToast(true, "Logo brand kit berhasil diupload.");
    } else {
      showToast(false, data.error ?? "Gagal mengupload logo brand kit.");
    }

    e.target.value = "";
  }

  async function handleBrandSave() {
    setSavingBrand(true);
    const res = await fetch("/api/portal/brand-kit", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoUrl: brandLogo, primaryColor, accentColor, fontStyle }),
    });
    const data = await res.json().catch(() => ({}));
    setSavingBrand(false);

    if (res.ok) {
      showToast(true, "Brand kit disinkronkan ke Proposal dan Invoice Generator.");
      router.refresh();
    } else {
      showToast(false, data.error ?? "Gagal menyimpan brand kit.");
    }
  }

  const initial = (name || profile.email || "U").charAt(0).toUpperCase();

  return (
    <StaggerChildren className="max-w-2xl space-y-6">
      {/* Toast */}
      {toast && (
        <FadeUp>
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-xs ${
            toast.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
            {toast.ok
              ? <Check className="w-5 h-5 shrink-0 text-emerald-600" />
              : <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />}
            <span className="text-xs sm:text-sm font-semibold">{toast.msg}</span>
          </div>
        </FadeUp>
      )}

      {/* Avatar Section */}
      <StaggerItem>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center bg-slate-100 ring-2 ring-slate-200 p-0.5 shadow-2xs">
              <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-200">
                {avatarUrl && !imgError ? (
                  <Image
                    src={avatarUrl}
                    alt={name || "Avatar"}
                    fill
                    className="object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-[#1E242E] flex items-center justify-center text-white text-3xl font-black">
                    {initial}
                  </div>
                )}
              </div>
            </div>

            {/* Upload overlay button */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#1E242E] hover:bg-slate-800 text-white flex items-center justify-center ring-2 ring-white shadow-xs transition-transform hover:scale-105 active:scale-95"
              aria-label="Ganti foto"
            >
              {uploading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Camera className="w-3.5 h-3.5" />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="text-center sm:text-left pt-1">
            <h2 className="text-slate-900 font-black text-xl tracking-tight">{name || profile.email}</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">{profile.email}</p>
            <div className="mt-3 flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 text-xs rounded-xl px-4 h-8 font-semibold shadow-2xs"
              >
                {uploading ? "Mengunggah..." : "Ganti Foto"}
              </Button>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Format JPG, PNG (Maks 2MB)</p>
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* Form Fields Section */}
      <StaggerItem>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-slate-900 font-bold text-base">Informasi Akun & Bisnis</h3>
              <p className="text-slate-500 text-xs">Data identitas klien yang digunakan pada kontrak dan invoice.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <Field icon={User} label="Nama Lengkap" value={name} onChange={setName} placeholder="Nama Anda" />
            <Field icon={Building} label="Nama Bisnis / Usaha" value={businessName} onChange={setBizName} placeholder="PT / CV / Brand Bisnis" />
          </div>
          
          <Field icon={Mail} label="Alamat Email Akun (Terkunci)" value={profile.email} disabled />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <Field icon={Phone} label="Nomor WhatsApp Aktif" value={phone} onChange={setPhone} placeholder="08xxxxxxxxxx" />
            <Field icon={MapPin} label="Kota & Alamat Bisnis" value={address} onChange={setAddress} placeholder="Kota, Provinsi" />
          </div>
        </div>
      </StaggerItem>

      {/* Brand Kit Section */}
      <StaggerItem>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-slate-900 font-bold text-base">Brand Kit Dokumen</h3>
              <p className="text-slate-500 text-xs">Digunakan otomatis sebagai template warna & logo pada Proposal dan Invoice Generator.</p>
            </div>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xs">
              {brandLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={brandLogo} alt="Logo brand kit" className="h-full w-full object-contain p-2" />
              ) : (
                <ImageIcon className="h-8 w-8 text-slate-300" />
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-800 hover:bg-slate-100 shadow-2xs transition-colors">
                  {uploadingLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  Upload Logo Brand
                  <input type="file" accept="image/png,image/jpeg" disabled={uploadingLogo} className="hidden" onChange={handleBrandLogoChange} />
                </label>
                {brandLogo && (
                  <button type="button" onClick={() => setBrandLogo(null)} className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1">
                    Hapus Logo
                  </button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <ColorField label="Warna Utama Brand" value={primaryColor} onChange={setPrimaryColor} />
                <ColorField label="Warna Aksen Brand" value={accentColor} onChange={setAccentColor} />
              </div>
              <div>
                <span className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">Gaya Font Dokumen</span>
                <div className="flex flex-wrap gap-2">
                  {(["sans", "serif", "mono"] as const).map((font) => (
                    <button
                      key={font}
                      type="button"
                      onClick={() => setFontStyle(font)}
                      className={`rounded-xl border px-4 py-1.5 text-xs font-bold capitalize transition-colors ${fontStyle === font ? "border-slate-900 bg-[#1E242E] text-white shadow-xs" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"}`}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleBrandSave}
              disabled={savingBrand}
              className="h-10 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-slate-800 shadow-xs"
            >
              {savingBrand ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
              Simpan Brand Kit
            </Button>
          </div>
        </div>
      </StaggerItem>

      {/* Main Save Button */}
      <StaggerItem>
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={pending}
            className="bg-[#1E242E] hover:bg-slate-800 text-white h-11 px-7 rounded-xl font-bold transition-colors text-xs sm:text-sm w-full sm:w-auto shadow-xs"
          >
            {pending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> : <><Save className="w-4 h-4 mr-2" /> Simpan Semua Perubahan</>}
          </Button>
        </div>
      </StaggerItem>
    </StaggerChildren>
  );
}

function Field({
  icon: Icon, label, value, onChange, placeholder, disabled,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="group">
      <label className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center transition-colors">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon className="w-4 h-4 text-slate-400 group-focus-within:text-slate-800 transition-colors" />
        </div>
        <input
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-300 disabled:opacity-60 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all shadow-2xs"
        />
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center transition-colors">{label}</span>
      <div className="flex h-10 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-2xs">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-12 border-0 bg-transparent p-1 cursor-pointer" />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-xs sm:text-sm font-bold text-slate-900 outline-none uppercase font-mono" />
      </div>
    </label>
  );
}
