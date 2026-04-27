"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight, ArrowLeft, CheckCircle, Loader2,
  Building2, Globe, Package, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const STEPS = [
  { label: "Bisnis",   icon: Building2 },
  { label: "Website",  icon: Globe },
  { label: "Aset",     icon: Package },
  { label: "Timeline", icon: Calendar },
];

const INDUSTRIES = [
  "Kuliner & Restoran", "Kesehatan & Klinik", "Kecantikan & Salon",
  "Otomotif & Bengkel", "Properti & Interior", "Pendidikan & Kursus",
  "Fashion & Butik", "Jasa Profesional", "Retail & Toko",
  "Wisata & Hospitality", "Teknologi & Startup", "Lainnya",
];

const FEATURES = [
  "Form Kontak / WhatsApp CTA",
  "Gallery / Portfolio",
  "Blog / Artikel",
  "Booking / Reservasi Online",
  "Katalog Produk",
  "Live Chat",
  "Multi Bahasa",
  "Integrasi Media Sosial",
  "Google Maps",
  "Pop-up / Promo Banner",
];

type FormData = {
  businessName: string; industryType: string; businessDesc: string; targetAudience: string;
  websiteType: string; referenceUrls: string[]; featuresWanted: string[]; colorStyle: string;
  logoUrl: string; driveLink: string; instagram: string; facebook: string; tiktok: string;
  hasDomain: boolean; domainName: string;
  deadline: string; notes: string;
};

const init: FormData = {
  businessName: "", industryType: "", businessDesc: "", targetAudience: "",
  websiteType: "", referenceUrls: ["", ""], featuresWanted: [], colorStyle: "",
  logoUrl: "", driveLink: "", instagram: "", facebook: "", tiktok: "",
  hasDomain: false, domainName: "",
  deadline: "", notes: "",
};

export default function OnboardingPage() {
  const { token } = useParams<{ token: string }>();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(init);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/onboarding/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setInvalid(true); return; }
        if (d.status === "COMPLETED") setDone(true);
        if (d.businessName) setForm((f) => ({ ...f, businessName: d.businessName }));
      })
      .catch(() => setInvalid(true));
  }, [token]);

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleFeature = (feat: string) =>
    setForm((f) => ({
      ...f,
      featuresWanted: f.featuresWanted.includes(feat)
        ? f.featuresWanted.filter((x) => x !== feat)
        : [...f.featuresWanted, feat],
    }));

  const saveProgress = async (submitFinal = false) => {
    setSaving(true);
    const refUrls = form.referenceUrls.filter(Boolean);
    await fetch(`/api/onboarding/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, referenceUrls: refUrls, submit: submitFinal }),
    });
    setSaving(false);
  };

  const next = async () => {
    await saveProgress();
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    setLoading(true);
    await saveProgress(true);
    setDone(true);
    setLoading(false);
  };

  if (invalid) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-red-400 text-lg font-semibold mb-2">Link tidak valid</p>
        <p className="text-blue-200/50 text-sm">Link ini sudah tidak berlaku atau salah. Hubungi tim MFWEB untuk link baru.</p>
      </div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-5" />
        <h1 className="text-white font-bold text-2xl mb-3">Terima Kasih!</h1>
        <p className="text-blue-200/60 leading-relaxed mb-6">
          Data Anda sudah kami terima. Tim MFWEB akan menghubungi Anda via WhatsApp dalam 1×24 jam untuk konfirmasi dan mulai pengerjaan.
        </p>
        <div className="glass rounded-2xl p-5 text-left space-y-2">
          <p className="text-blue-200/40 text-xs uppercase tracking-wide mb-3">Langkah selanjutnya</p>
          {["Tim kami review brief Anda", "Konsultasi awal via WhatsApp", "Pengerjaan dimulai"].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 text-xs flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="text-blue-200/60 text-sm">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Image src="/logo.png" alt="MFWEB" width={44} height={44} className="mx-auto mb-3" />
          <h1 className="text-white font-bold text-xl">MFWEB</h1>
          <p className="text-blue-200/50 text-sm">Form Brief Klien</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8 gap-0">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center">
              <button onClick={() => i < step && setStep(i)}
                className={`flex flex-col items-center gap-1 ${i <= step ? "cursor-pointer" : "cursor-default"}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  i < step ? "bg-green-500 border-green-500" :
                  i === step ? "bg-blue-600 border-blue-500 ring-4 ring-blue-500/20" :
                  "bg-transparent border-white/10"
                }`}>
                  {i < step ? <CheckCircle className="w-4 h-4 text-white" /> : <s.icon className={`w-4 h-4 ${i === step ? "text-white" : "text-blue-200/30"}`} />}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? "text-white" : i < step ? "text-green-400" : "text-blue-200/30"}`}>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-12 sm:w-20 h-0.5 mx-1 ${i < step ? "bg-green-500" : "bg-white/5"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="glass rounded-2xl p-6 sm:p-8">
          {/* Step 1 — Bisnis */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-white font-bold text-lg mb-1">Informasi Bisnis</h2>
                <p className="text-blue-200/50 text-sm">Ceritakan bisnis Anda agar kami bisa membuat website yang tepat sasaran.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-sm">Nama Bisnis / Usaha *</Label>
                <Input required value={form.businessName} onChange={set("businessName")} placeholder="Toko Maju Jaya"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-sm">Industri / Jenis Usaha *</Label>
                <select required value={form.industryType} onChange={set("industryType")}
                  className="w-full h-10 rounded-md px-3 bg-white/5 border border-white/10 text-white text-sm">
                  <option value="" className="bg-[#0d1b35]">— Pilih industri —</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i} className="bg-[#0d1b35]">{i}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-sm">Deskripsi Bisnis *</Label>
                <Textarea required value={form.businessDesc} onChange={set("businessDesc")} rows={3}
                  placeholder="Ceritakan bisnis Anda: apa yang dijual/ditawarkan, sejak kapan berdiri, apa keunggulan Anda dibanding kompetitor..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 resize-none" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-sm">Target Pelanggan *</Label>
                <Input required value={form.targetAudience} onChange={set("targetAudience")}
                  placeholder="Ibu rumah tangga 25-45 tahun, pemilik UMKM, mahasiswa..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30" />
              </div>
            </div>
          )}

          {/* Step 2 — Website */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-white font-bold text-lg mb-1">Kebutuhan Website</h2>
                <p className="text-blue-200/50 text-sm">Bantu kami memahami apa yang Anda butuhkan dari website ini.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200 text-sm">Tipe Website *</Label>
                {[
                  { v: "landing-page", label: "Landing Page", desc: "1 halaman untuk promosi/iklan" },
                  { v: "company-profile", label: "Company Profile", desc: "Profil bisnis lengkap (3-7 halaman)" },
                  { v: "toko-online", label: "Toko Online", desc: "E-commerce dengan sistem belanja" },
                ].map((opt) => (
                  <label key={opt.v} className={`flex items-center gap-3 glass rounded-xl px-4 py-3 cursor-pointer border transition-colors ${
                    form.websiteType === opt.v ? "border-blue-500/50 bg-blue-600/10" : "border-white/5 hover:border-blue-500/20"
                  }`}>
                    <input type="radio" name="websiteType" value={opt.v} checked={form.websiteType === opt.v}
                      onChange={set("websiteType")} className="accent-blue-500" />
                    <div>
                      <p className="text-white text-sm font-medium">{opt.label}</p>
                      <p className="text-blue-200/40 text-xs">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200 text-sm">Referensi Website yang Disukai <span className="text-blue-200/30 text-xs">(opsional)</span></Label>
                {form.referenceUrls.map((url, i) => (
                  <Input key={i} value={url}
                    onChange={(e) => setForm((f) => { const u = [...f.referenceUrls]; u[i] = e.target.value; return { ...f, referenceUrls: u }; })}
                    placeholder={`https://contoh${i + 1}.com`}
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30" />
                ))}
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200 text-sm">Fitur yang Diinginkan <span className="text-blue-200/30 text-xs">(pilih semua yang relevan)</span></Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FEATURES.map((feat) => (
                    <label key={feat} className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer border text-sm transition-colors ${
                      form.featuresWanted.includes(feat) ? "border-blue-500/40 bg-blue-600/10 text-white" : "border-white/5 text-blue-200/50 hover:border-blue-500/20"
                    }`}>
                      <input type="checkbox" checked={form.featuresWanted.includes(feat)}
                        onChange={() => toggleFeature(feat)} className="accent-blue-500 shrink-0" />
                      {feat}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-sm">Preferensi Warna & Gaya</Label>
                <Input value={form.colorStyle} onChange={set("colorStyle")}
                  placeholder="Contoh: modern minimalis warna biru navy, atau elegan dengan gold dan hitam"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30" />
              </div>
            </div>
          )}

          {/* Step 3 — Aset */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-white font-bold text-lg mb-1">Aset & Konten</h2>
                <p className="text-blue-200/50 text-sm">Kumpulkan materi yang sudah Anda miliki untuk mempercepat pengerjaan.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-sm">Link Google Drive (foto, logo, konten) <span className="text-blue-200/30 text-xs">(opsional)</span></Label>
                <Input value={form.driveLink} onChange={set("driveLink")}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30" />
                <p className="text-blue-200/30 text-xs">Upload semua foto produk, logo, dan teks ke Google Drive lalu share link-nya di sini.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-sm">URL Logo <span className="text-blue-200/30 text-xs">(jika sudah ada)</span></Label>
                <Input value={form.logoUrl} onChange={set("logoUrl")}
                  placeholder="https://... atau kosongkan jika tidak ada"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30" />
              </div>
              <div className="border-t border-white/5 pt-4 space-y-3">
                <Label className="text-blue-200 text-sm">Media Sosial <span className="text-blue-200/30 text-xs">(opsional — untuk ditampilkan di website)</span></Label>
                {[
                  { k: "instagram" as const, placeholder: "@namaakun atau https://instagram.com/..." },
                  { k: "facebook" as const, placeholder: "https://facebook.com/..." },
                  { k: "tiktok" as const, placeholder: "@namaakun atau https://tiktok.com/..." },
                ].map(({ k, placeholder }) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="text-blue-200/40 text-xs w-20 capitalize">{k}</span>
                    <Input value={form[k]} onChange={set(k)} placeholder={placeholder}
                      className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 flex-1" />
                  </div>
                ))}
              </div>
              <div className="border-t border-white/5 pt-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button type="button" onClick={() => setForm((f) => ({ ...f, hasDomain: !f.hasDomain, domainName: !f.hasDomain ? f.domainName : "" }))}
                    className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${form.hasDomain ? "bg-blue-600" : "bg-white/10"}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.hasDomain ? "left-6" : "left-1"}`} />
                  </button>
                  <span className="text-blue-200 text-sm">Saya sudah punya domain</span>
                </label>
                {form.hasDomain && (
                  <Input value={form.domainName} onChange={set("domainName")} placeholder="namatoko.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30" />
                )}
              </div>
            </div>
          )}

          {/* Step 4 — Timeline */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-white font-bold text-lg mb-1">Timeline & Catatan</h2>
                <p className="text-blue-200/50 text-sm">Informasi terakhir untuk membantu kami merencanakan pengerjaan.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-sm">Target Selesai <span className="text-blue-200/30 text-xs">(opsional)</span></Label>
                <Input type="date" value={form.deadline} onChange={set("deadline")}
                  min={new Date().toISOString().split("T")[0]}
                  className="bg-white/5 border-white/10 text-white" />
                <p className="text-blue-200/30 text-xs">Jika ada event atau kampanye dengan deadline tertentu, kami prioritaskan.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-sm">Catatan Tambahan <span className="text-blue-200/30 text-xs">(opsional)</span></Label>
                <Textarea value={form.notes} onChange={set("notes")} rows={4}
                  placeholder="Hal-hal penting yang belum tercakup di atas: permintaan khusus, sistem tertentu yang ingin diintegrasikan, atau pertanyaan untuk tim kami..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 resize-none" />
              </div>

              {/* Summary */}
              <div className="glass rounded-xl p-5 bg-blue-600/5 border border-blue-500/10 space-y-2">
                <p className="text-blue-300 text-sm font-semibold mb-3">Ringkasan Brief</p>
                {[
                  ["Bisnis", form.businessName],
                  ["Industri", form.industryType],
                  ["Tipe Website", form.websiteType],
                  ["Fitur", form.featuresWanted.length > 0 ? `${form.featuresWanted.length} fitur dipilih` : "-"],
                  ["Domain", form.hasDomain ? form.domainName || "Sudah ada" : "Perlu beli baru"],
                ].map(([k, v]) => v ? (
                  <div key={k} className="flex gap-3 text-sm">
                    <span className="text-blue-200/40 w-28 shrink-0">{k}</span>
                    <span className="text-blue-200/70">{v}</span>
                  </div>
                ) : null)}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={back} disabled={step === 0}
              className="text-blue-200/50 hover:text-white disabled:opacity-0">
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
            </Button>
            <div className="flex items-center gap-3">
              {saving && <span className="text-blue-200/40 text-xs">Menyimpan...</span>}
              {step < STEPS.length - 1 ? (
                <Button onClick={next} disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 text-white">
                  Lanjut <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={submit} disabled={loading}
                  className="bg-green-600 hover:bg-green-500 text-white px-8">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Kirim Brief
                </Button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-blue-200/20 text-xs mt-6">
          Progress tersimpan otomatis. Anda bisa kembali ke link ini kapan saja.
        </p>
      </div>
    </div>
  );
}
