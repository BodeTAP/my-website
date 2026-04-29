"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, MessageCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StaggerChildren, StaggerItem, FadeUp, ScaleIn } from "@/components/public/motion";

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
      <div className="glass rounded-2xl p-10 text-center max-w-md mx-auto">
        <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
        <h3 className="text-white text-xl font-bold mb-2">Pesan Terkirim!</h3>
        <p className="text-blue-200/60 mb-6">
          Kami akan menghubungi Anda via WhatsApp dalam 1×24 jam. Terima kasih!
        </p>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6282221682343"}?text=Halo%20MFWEB%20Tech%2C%20saya%20baru%20mengisi%20formulir%20kontak`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="bg-green-600 hover:bg-green-500 text-white">
            💬 Chat WhatsApp Sekarang
          </Button>
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-6 sm:p-8"
    >
      <StaggerChildren stagger={0.05} className="space-y-5">
        <StaggerItem className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label className="text-blue-200 text-sm">Nama Lengkap *</Label>
            <Input
              required
              value={form.name}
              onChange={set("name")}
              placeholder="Budi Santoso"
              className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-blue-200 text-sm">Nama Bisnis *</Label>
            <Input
              required
              value={form.businessName}
              onChange={set("businessName")}
              placeholder="Toko Maju Jaya"
              className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
            />
          </div>
        </StaggerItem>

        <StaggerItem className="space-y-1.5">
          <Label className="text-blue-200 text-sm">Nomor WhatsApp *</Label>
          <Input
            required
            type="tel"
            value={form.whatsapp}
            onChange={set("whatsapp")}
            placeholder="08123456789"
            className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
          />
        </StaggerItem>

        <StaggerItem className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label className="text-blue-200 text-sm">
              Domain yang diinginkan
              {domainParam && (
                <span className="ml-2 text-green-400 text-xs">
                  (dari domain checker)
                </span>
              )}
            </Label>
            <Input
              value={form.domain}
              onChange={set("domain")}
              placeholder="namabisnisanda.com"
              className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-blue-200 text-sm">
              Website / Profil Bisnis Saat Ini
            </Label>
            <Input
              value={form.currentWebsite}
              onChange={set("currentWebsite")}
              placeholder="https://goo.gl/maps/..."
              className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
            />
          </div>
        </StaggerItem>

        <StaggerItem className="space-y-1.5">
          <Label className="text-blue-200 text-sm">
            Ceritakan kebutuhan Anda (opsional)
          </Label>
          <Textarea
            value={form.message}
            onChange={set("message")}
            rows={4}
            placeholder="Saya punya klinik gigi dan ingin website yang bisa menerima booking online..."
            className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 resize-none"
          />
        </StaggerItem>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <StaggerItem>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 shadow-lg shadow-blue-500/20"
          >
            {loading ? (
              "Mengirim..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Kirim Pesan
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
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Mulai <span className="text-gradient">Konsultasi Gratis</span>
          </h1>
          <p className="text-blue-200/60 max-w-xl mx-auto">
            Isi formulir di bawah dan kami akan menghubungi Anda melalui
            WhatsApp dalam waktu 1×24 jam.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-3"
          >
            <Suspense
              fallback={
                <div className="glass rounded-2xl p-8 animate-pulse h-96" />
              }
            >
              <ContactForm />
            </Suspense>
          </motion.div>

          {/* Info sidebar */}
          <div className="lg:col-span-2 space-y-5">
            <ScaleIn delay={0.1}>
              <div className="glass rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">
                  Hubungi Langsung
                </h3>
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=Halo%20MFWEB%20Tech%2C%20saya%20ingin%20konsultasi%20website`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full bg-green-600 hover:bg-green-500 text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat via WhatsApp
                  </Button>
                </a>
              </div>
            </ScaleIn>

            <ScaleIn delay={0.2}>
              <div className="glass rounded-2xl p-6 space-y-4">
                <h3 className="text-white font-semibold">Yang Anda Dapatkan</h3>
                {[
                  "Konsultasi kebutuhan bisnis gratis",
                  "Rekomendasi paket yang sesuai budget",
                  "Estimasi waktu pengerjaan",
                  "Garansi revisi sampai puas",
                  "Support teknis setelah launch",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-blue-200/70 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </ScaleIn>

            <ScaleIn delay={0.3}>
              <div className="glass rounded-2xl p-6">
                <p className="text-blue-200/50 text-xs leading-relaxed">
                  Data Anda aman bersama kami dan hanya digunakan untuk keperluan
                  konsultasi. Tidak ada spam, tidak ada penjualan data.
                </p>
              </div>
            </ScaleIn>
          </div>
        </div>
      </div>
    </div>
  );
}
