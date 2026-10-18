"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, MessageCircle, CheckCircle, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StaggerChildren, StaggerItem, FadeUp, ScaleIn } from "@/components/public/motion";
import Breadcrumb from "@/components/public/Breadcrumb";

function ContactForm() {
  const searchParams = useSearchParams();
  const domainParam = searchParams.get("domain") ?? "";

  const [form, setForm] = useState({
    name: "",
    businessName: "",
    whatsapp: "",
    domain: domainParam,
    currentWebsite: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim pesan");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex h-full min-h-[460px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs">
        <ScaleIn>
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6 mx-auto border border-slate-200">
            <CheckCircle className="w-8 h-8 text-slate-900" />
          </div>
          <h3 className="text-slate-900 text-2xl font-bold mb-3 tracking-tight">Pesan Berhasil Terkirim</h3>
          <p className="text-slate-600 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            Terima kasih atas pesan Anda. Tim kami akan meninjau rincian kebutuhan dan segera menghubungi Anda via WhatsApp.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6282221682343"}?text=Halo%20MFWEB%2C%20saya%20sudah%20mengisi%20formulir%20kontak`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-slate-900 hover:bg-slate-800 text-white h-12 px-8 font-medium text-sm rounded-full transition-colors">
              <MessageCircle className="w-4 h-4 mr-2" />
              Buka Chat WhatsApp Sekarang
            </Button>
          </a>
        </ScaleIn>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-10 shadow-xs"
    >
      <StaggerChildren stagger={0.04} className="space-y-6">
        <StaggerItem>
          <div className="border-b border-slate-100 pb-5">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Formulir Konsultasi</h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Sampaikan kebutuhan website Anda. Kami akan mempelajari dan memberikan rekomendasi teknis & estimasi.
            </p>
          </div>
        </StaggerItem>

        <StaggerItem className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-slate-700 text-xs font-semibold uppercase tracking-wider">
              Nama Lengkap <span className="text-red-500">*</span>
            </Label>
            <Input
              required
              value={form.name}
              onChange={set("name")}
              placeholder="Cth: Budi Santoso"
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-11 rounded-xl focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 text-xs font-semibold uppercase tracking-wider">
              Nama Bisnis / Brand <span className="text-red-500">*</span>
            </Label>
            <Input
              required
              value={form.businessName}
              onChange={set("businessName")}
              placeholder="Cth: Kopi Maju Bersama"
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-11 rounded-xl focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-sm"
            />
          </div>
        </StaggerItem>

        <StaggerItem className="space-y-2">
          <Label className="text-slate-700 text-xs font-semibold uppercase tracking-wider">
            Nomor WhatsApp Aktif <span className="text-red-500">*</span>
          </Label>
          <Input
            required
            type="tel"
            value={form.whatsapp}
            onChange={set("whatsapp")}
            placeholder="Cth: 081234567890"
            className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-11 rounded-xl focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-sm"
          />
        </StaggerItem>

        <StaggerItem className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-slate-700 text-xs font-semibold uppercase tracking-wider flex items-center">
              Domain Incaran
              {domainParam && (
                <span className="ml-2 text-slate-600 text-[10px] bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 font-mono">
                  Auto-fill
                </span>
              )}
            </Label>
            <Input
              value={form.domain}
              onChange={set("domain")}
              placeholder="Cth: kopimaju.com"
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-11 rounded-xl focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-sm font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 text-xs font-semibold uppercase tracking-wider">
              Website / Sosmed Saat Ini
            </Label>
            <Input
              value={form.currentWebsite}
              onChange={set("currentWebsite")}
              placeholder="Cth: instagram.com/kopimaju"
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-11 rounded-xl focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-sm"
            />
          </div>
        </StaggerItem>

        <StaggerItem className="space-y-2">
          <Label className="text-slate-700 text-xs font-semibold uppercase tracking-wider">
            Rincian Kebutuhan (Opsional)
          </Label>
          <Textarea
            value={form.message}
            onChange={set("message")}
            rows={4}
            placeholder="Ceritakan gambaran halaman, fitur yang diinginkan, atau referensi desain yang Anda sukai."
            className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 resize-none p-3.5 text-sm"
          />
        </StaggerItem>

        {error && (
          <StaggerItem>
            <p className="text-red-700 text-xs font-medium bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
              {error}
            </p>
          </StaggerItem>
        )}

        <StaggerItem className="pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 font-medium text-sm rounded-full transition-colors cursor-pointer"
          >
            {loading ? (
              "Mengirim pesan..."
            ) : (
              <>
                Kirim Permintaan Konsultasi
                <Send className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </StaggerItem>
      </StaggerChildren>
    </form>
  );
}

export default function ContactPage() {
  const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6282221682343";

  return (
    <div className="min-h-screen bg-white">
      {/* ── Full-Width Deep Slate Hero ────────────────────── */}
      <section className="w-full bg-[#1E242E] text-white pt-28 pb-16 sm:pt-32 sm:pb-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Kontak" }]} />

          <div className="max-w-3xl mt-6">
            <FadeUp>
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-slate-500" />
                <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                  Konsultasi & Diskusi Proyek
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
                Ceritakan kebutuhan website Anda
              </h1>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed">
                Isi formulir singkat di bawah atau hubungi langsung via WhatsApp. Kami bantu menganalisis kebutuhan, estimasi pengerjaan, dan langkah paling praktis untuk memulai.
              </p>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Main Content Section ──────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            
            {/* Form Column */}
            <div className="lg:col-span-3">
              <Suspense
                fallback={
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 animate-pulse h-[540px]" />
                }
              >
                <ContactForm />
              </Suspense>
            </div>

            {/* Info Sidebar Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* WhatsApp Quick Channel */}
              <FadeUp delay={0.1}>
                <div className="rounded-2xl border border-slate-800 bg-[#1E242E] text-white p-7">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase">
                      Respon Cepat
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Jalur Cepat WhatsApp</h3>
                  <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">
                    Lebih nyaman berdiskusi langsung? Hubungi kami langsung melalui WhatsApp untuk respon instan.
                  </p>
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=Halo%20MFWEB%2C%20saya%20ingin%20konsultasi%20pembuatan%20website`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 h-11 font-medium text-sm rounded-full transition-colors">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat Tim Kami
                    </Button>
                  </a>
                </div>
              </FadeUp>

              {/* What You Get Card */}
              <FadeUp delay={0.15}>
                <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
                  <h3 className="text-slate-900 font-bold text-base mb-4">Yang Anda Dapatkan</h3>
                  <div className="space-y-3.5">
                    {[
                      "Sesi telaah kebutuhan bisnis gratis",
                      "Rekomendasi struktur halaman & tombol CTA",
                      "Saran fitur yang relevan & tidak berlebihan",
                      "Estimasi timeline pengerjaan yang realistis",
                      "Garansi perbaikan bug setelah peluncuran",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-slate-800 shrink-0 mt-0.5" />
                        <span className="text-slate-600 text-xs sm:text-sm leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeUp>

              {/* Direct Details Card */}
              <FadeUp delay={0.2}>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Email Resmi</p>
                      <p className="text-slate-900 font-medium text-sm">hello@mfweb.id</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Studio Basecamp</p>
                      <p className="text-slate-900 font-medium text-sm">Kediri, Jawa Timur, Indonesia</p>
                    </div>
                  </div>
                </div>
              </FadeUp>

              {/* Privacy Assurance */}
              <p className="text-slate-400 text-xs leading-relaxed text-center px-2">
                Privasi dan data bisnis Anda terjamin aman. Kami tidak akan pernah membagikan kontak Anda kepada pihak ketiga.
              </p>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
