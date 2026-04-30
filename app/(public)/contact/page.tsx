"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, MessageCircle, CheckCircle, Mail, MapPin, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StaggerChildren, StaggerItem, FadeUp, ScaleIn, SlideIn } from "@/components/public/motion";

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

  useEffect(() => {
    if (domainParam) setForm((f) => ({ ...f, domain: domainParam }));
  }, [domainParam]);

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
      <div className="glass rounded-[32px] p-10 text-center flex flex-col justify-center items-center h-full min-h-[500px] border border-green-500/20 bg-green-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full pointer-events-none" />
        <ScaleIn>
          <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-8 mx-auto border border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h3 className="text-white text-3xl font-black mb-4 tracking-tight">Inquiry Terkirim!</h3>
          <p className="text-green-100/70 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
            Sistem kami telah menerima rincian Anda. Tim spesialis kami akan segera menyapa Anda via WhatsApp dalam waktu dekat.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6282221682343"}?text=Halo%20MFWEB%20Tech%2C%20saya%20baru%20mengisi%20formulir%20kontak`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-green-600 hover:bg-green-500 text-white h-14 px-10 font-bold text-base shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all rounded-xl">
              <MessageCircle className="w-5 h-5 mr-3" />
              Buka Chat WhatsApp
            </Button>
          </a>
        </ScaleIn>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass rounded-[32px] p-8 sm:p-12 border border-white/5 bg-[#050b14]/90 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
    >
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />
      
      <StaggerChildren stagger={0.05} className="space-y-7 relative z-10">
        <StaggerItem>
          <div className="mb-6 border-b border-white/5 pb-5">
            <h2 className="text-3xl font-black text-white mb-2">Form Konsultasi</h2>
            <p className="text-blue-200/50 text-sm">Ceritakan garis besar kebutuhan Anda, kami merancang solusinya.</p>
          </div>
        </StaggerItem>

        <StaggerItem className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <Label className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Nama Lengkap *</Label>
            <Input
              required
              value={form.name}
              onChange={set("name")}
              placeholder="Cth: Budi Santoso"
              className="bg-black/50 border-white/10 text-white placeholder:text-blue-200/20 h-14 rounded-xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all px-4"
            />
          </div>
          <div className="space-y-2.5">
            <Label className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Nama Bisnis *</Label>
            <Input
              required
              value={form.businessName}
              onChange={set("businessName")}
              placeholder="Cth: Toko Maju Jaya"
              className="bg-black/50 border-white/10 text-white placeholder:text-blue-200/20 h-14 rounded-xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all px-4"
            />
          </div>
        </StaggerItem>

        <StaggerItem className="space-y-2.5">
          <Label className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Nomor WhatsApp *</Label>
          <Input
            required
            type="tel"
            value={form.whatsapp}
            onChange={set("whatsapp")}
            placeholder="Cth: 081234567890"
            className="bg-black/50 border-white/10 text-white placeholder:text-blue-200/20 h-14 rounded-xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all px-4"
          />
        </StaggerItem>

        <StaggerItem className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <Label className="text-white/70 text-[11px] font-bold uppercase tracking-widest flex items-center">
              Domain Incaran
              {domainParam && (
                <span className="ml-2 text-green-400/90 text-[9px] bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Otomatis Terisi</span>
              )}
            </Label>
            <Input
              value={form.domain}
              onChange={set("domain")}
              placeholder="Cth: namabisnis.com"
              className="bg-black/50 border-white/10 text-white placeholder:text-blue-200/20 h-14 rounded-xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all px-4"
            />
          </div>
          <div className="space-y-2.5">
            <Label className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Web / Socmed Saat Ini</Label>
            <Input
              value={form.currentWebsite}
              onChange={set("currentWebsite")}
              placeholder="Cth: instagram.com/bisnisku"
              className="bg-black/50 border-white/10 text-white placeholder:text-blue-200/20 h-14 rounded-xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all px-4"
            />
          </div>
        </StaggerItem>

        <StaggerItem className="space-y-2.5">
          <Label className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Deskripsi Kebutuhan (Opsional)</Label>
          <Textarea
            value={form.message}
            onChange={set("message")}
            rows={4}
            placeholder="Jelaskan secara singkat fitur apa saja yang Anda harapkan ada di dalam website ini..."
            className="bg-black/50 border-white/10 text-white placeholder:text-blue-200/20 rounded-xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none p-4"
          />
        </StaggerItem>

        {error && <StaggerItem><p className="text-red-400/90 text-sm font-medium bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">{error}</p></StaggerItem>}

        <StaggerItem className="pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white h-16 font-black text-lg shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] transition-all rounded-xl"
          >
            {loading ? (
              "Memproses Permintaan..."
            ) : (
              <>
                Kirim Permintaan Konsultasi
                <Send className="w-5 h-5 ml-2" />
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
    <div className="min-h-screen">
      {/* ── Header ──────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-600/20 to-indigo-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <FadeUp delay={0}>
            <div className="inline-flex items-center gap-2 glass px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-blue-300 mb-8 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] bg-blue-500/5">
              <PhoneCall className="w-4 h-4 text-blue-400" />
              Hubungi Kami
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              Mulai <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Eksekusi</span> <br className="hidden sm:block" /> Ide Anda
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-blue-200/70 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
              Isi form di bawah untuk mengatur jadwal konsultasi secara gratis. Tim arsitek web kami siap membedah struktur bisnis digital Anda.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Main Content ────────────────────────────────────── */}
      <section className="pb-32 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            
            {/* Form */}
            <SlideIn delay={0.1} className="lg:col-span-3">
              <Suspense
                fallback={
                  <div className="glass rounded-[32px] p-8 border border-white/5 bg-[#050b14]/80 animate-pulse h-[700px]" />
                }
              >
                <ContactForm />
              </Suspense>
            </SlideIn>

            {/* Info sidebar */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Direct Contact Card */}
              <ScaleIn delay={0.15}>
                <div className="glass rounded-3xl p-8 border border-emerald-500/20 bg-gradient-to-b from-[#050b14] to-[#041a10] relative overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.05)]">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
                  
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-6">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Fast Response
                  </div>
                  
                  <h3 className="text-white text-2xl font-black mb-3">Jalur Cepat WhatsApp</h3>
                  <p className="text-emerald-100/60 text-sm mb-8 leading-relaxed">
                    Lebih nyaman ngobrol via chat? Klik tombol di bawah untuk langsung terhubung dengan technical representative kami.
                  </p>
                  
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=Halo%20MFWEB%20Tech%2C%20saya%20ingin%20konsultasi%20pembuatan%20website`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-14 font-black text-base shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all rounded-xl">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Chat WhatsApp
                    </Button>
                  </a>
                </div>
              </ScaleIn>

              {/* Perks Card */}
              <ScaleIn delay={0.2}>
                <div className="glass rounded-3xl p-8 border border-white/5 bg-black/20 backdrop-blur-md shadow-xl">
                  <h3 className="text-white font-bold text-lg mb-6">Yang Anda Dapatkan</h3>
                  <div className="space-y-4">
                    {[
                      "Sesi bedah kebutuhan bisnis (Gratis)",
                      "Rancangan arsitektur database awal",
                      "Rekomendasi stack teknologi",
                      "Transparansi timeline eksekusi",
                      "Garansi perbaikan bug",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <span className="text-blue-100/70 text-sm font-medium leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScaleIn>

              {/* Contact Details */}
              <ScaleIn delay={0.25}>
                <div className="glass rounded-3xl p-8 border border-white/5 bg-black/20 backdrop-blur-md space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                      <Mail className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-0.5">Email Official</p>
                      <p className="text-white font-semibold text-sm">hello@mfweb.id</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                      <MapPin className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-0.5">Basecamp</p>
                      <p className="text-white font-semibold text-sm">Kediri, Jawa Timur</p>
                    </div>
                  </div>
                </div>
              </ScaleIn>

              {/* Privacy note */}
              <ScaleIn delay={0.3}>
                <p className="text-blue-200/30 text-[11px] leading-relaxed text-center px-4 pt-2">
                  Komunikasi Anda dilindungi enkripsi. Kami tidak akan pernah membagikan detail kontak Anda ke pihak ketiga.
                </p>
              </ScaleIn>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
