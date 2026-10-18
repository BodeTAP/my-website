"use client";

import { useState } from "react";
import { BrandLogoIcon } from "@/components/brand/BrandLogo";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Lock, Building2, Phone, Loader2, Eye, EyeOff, CheckCircle,
  ArrowLeft, Coins, CheckCircle2, ShieldCheck, FileCheck2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ease = [0.16, 1, 0.3, 1] as const;

export default function PortalRegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    businessName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [welcomeCredits, setWelcomeCredits] = useState(0);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    if (form.password.length < 8) {
      setError("Kata sandi memerlukan minimal 8 karakter.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/portal/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          businessName: form.businessName,
          phone: form.phone,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Pendaftaran gagal, silakan coba lagi.");
      setWelcomeCredits(typeof data.welcomeCredits === "number" ? data.welcomeCredits : 0);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-white overflow-hidden">
      {/* ── Left Side: Deep Slate Showcase & Perks ──────────────────── */}
      <div className="hidden lg:flex flex-col justify-between bg-[#1E242E] text-white p-12 lg:p-16 border-r border-slate-800 relative overflow-hidden">
        {/* Ambient architectural lighting */}
        <motion.div
          initial={{ opacity: 0.2, scale: 0.8 }}
          animate={{ opacity: [0.2, 0.35, 0.2], scale: [0.8, 1.05, 0.8] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-slate-600/20 blur-3xl pointer-events-none"
        />
        <motion.div
          initial={{ opacity: 0.1, scale: 0.9 }}
          animate={{ opacity: [0.1, 0.25, 0.1], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-slate-500/15 blur-3xl pointer-events-none"
        />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415510_1px,transparent_1px),linear-gradient(to_bottom,#33415510_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

        {/* Brand mark */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="relative z-10"
        >
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center transition-transform group-hover:scale-105">
              <BrandLogoIcon size={26} variant="dark" />
            </div>
            <div>
              <span className="font-bold text-white text-lg tracking-tight block">MFWEB</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">Pendaftaran Klien</span>
            </div>
          </Link>
        </motion.div>

        {/* Middle: Value Prop */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="h-px w-8 bg-slate-500" />
              <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                Benefit Akun Portal
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Mulai kelola aset digital bisnis Anda secara profesional.
            </h1>

            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              Daftarkan bisnis Anda untuk mendapatkan akses ke dashboard pemantauan proyek, portal invoice resmi, dan tool optimasi B2B.
            </p>
          </motion.div>

          <div className="mt-8 space-y-3">
            {[
              {
                icon: Coins,
                title: "Bonus Kredit Sambutan",
                desc: "Dapatkan kredit gratis otomatis saat pendaftaran untuk mencoba tool Lead Finder & Generator dokumen.",
                iconColor: "text-amber-400",
                delay: 0.2,
              },
              {
                icon: FileCheck2,
                title: "Riwayat Tagihan & Dokumen Rapi",
                desc: "Semua berkas penawaran, invoice pembayaran, dan status pengerjaan tersimpan aman di satu tempat.",
                iconColor: "text-white",
                delay: 0.3,
              },
              {
                icon: CheckCircle2,
                title: "Tanpa Biaya Berlangganan Tersembunyi",
                desc: "Pendaftaran akun klien 100% gratis tanpa komitmen bulanan yang mengikat.",
                iconColor: "text-white",
                delay: 0.4,
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: item.delay, ease }}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-[#161B22]/70 p-4 transition-colors hover:border-slate-700"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400"
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-300" />
            <span>Keamanan Data Terjamin</span>
          </div>
          <span>© 2026 MFWEB Studio</span>
        </motion.div>
      </div>

      {/* ── Right Side: Register Form with Immersive In-Out ─────────── */}
      <div className="flex flex-col justify-between bg-[#F8F9FA] p-6 sm:p-10 lg:p-16 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="flex items-center justify-between"
        >
          <Link
            href="/"
            className="inline-flex items-center text-xs font-mono text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Kembali ke Beranda
          </Link>
          <div className="lg:hidden flex items-center gap-2">
            <BrandLogoIcon size={24} variant="dark" />
            <span className="font-bold text-slate-900 text-sm tracking-tight">MFWEB</span>
          </div>
        </motion.div>

        <div className="my-auto py-8 w-full max-w-md mx-auto">
          {/* Master Auth Switcher (Login vs Register) with animated sliding indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease }}
            className="flex p-1 bg-slate-200/80 rounded-full border border-slate-300/80 mb-6 relative"
          >
            <Link
              href="/portal/login"
              className="relative flex-1 py-2 text-xs font-mono uppercase tracking-wider text-center font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <span className="relative z-10">
                Masuk Akun
              </span>
            </Link>

            <Link
              href="/portal/register"
              className="relative flex-1 py-2 text-xs font-mono uppercase tracking-wider text-center font-bold"
            >
              <motion.div
                layoutId="auth-main-tab-pill"
                className="absolute inset-0 bg-white rounded-full shadow-xs border border-slate-200"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
              <span className="relative z-10 text-slate-900">
                Daftar Baru
              </span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.45, ease }}
            className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-9 shadow-xs"
          >
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-slate-900 font-bold text-xl mb-2">Pendaftaran Berhasil</h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Akun Anda telah aktif.{welcomeCredits > 0 ? ` Anda mendapatkan ${welcomeCredits} kredit gratis untuk mencoba tools.` : " Silakan masuk dengan kredensial baru Anda."}
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/portal/login")}
                    className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white h-11 font-medium text-sm transition-colors cursor-pointer"
                  >
                    Masuk Sekarang →
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="form-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="h-px w-6 bg-slate-400" />
                      <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                        Pendaftaran
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      Buat Akun Portal Baru
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                      Sudah memiliki akun klien?{" "}
                      <Link href="/portal/login" className="font-bold text-slate-900 underline hover:text-black transition-colors">
                        Masuk di sini
                      </Link>
                    </p>
                  </div>

                  {/* Google Sign In */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: "/portal/dashboard" })}
                    className="w-full flex items-center justify-center gap-3 h-12 bg-white border border-slate-200 rounded-full text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs group cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 group-hover:scale-105 transition-transform" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Daftar Cepat dengan Google
                  </motion.button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-white text-slate-400 font-mono text-[10px] uppercase tracking-widest">
                        atau isi formulir manual
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="space-y-1">
                      <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider block">
                        Nama Lengkap *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          required
                          value={form.name}
                          onChange={set("name")}
                          placeholder="Contoh: Budi Santoso"
                          className="pl-10 h-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider block">
                        Alamat Email *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="email"
                          required
                          value={form.email}
                          onChange={set("email")}
                          placeholder="nama@perusahaan.com"
                          className="pl-10 h-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider block">
                        Nama Usaha / Brand *
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          required
                          value={form.businessName}
                          onChange={set("businessName")}
                          placeholder="Nama bisnis atau studio Anda"
                          className="pl-10 h-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider flex justify-between">
                        <span>No. WhatsApp</span>
                        <span className="text-slate-400 lowercase font-normal">(opsional)</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="tel"
                          value={form.phone}
                          onChange={set("phone")}
                          placeholder="0812-xxxx-xxxx"
                          className="pl-10 h-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider block">
                          Kata Sandi *
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            type={showPw ? "text" : "password"}
                            required
                            value={form.password}
                            onChange={set("password")}
                            placeholder="Min. 8 karakter"
                            className="pl-10 pr-9 h-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider block">
                          Konfirmasi *
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            type={showCPw ? "text" : "password"}
                            required
                            value={form.confirmPassword}
                            onChange={set("confirmPassword")}
                            placeholder="Ulangi sandi"
                            className="pl-10 pr-9 h-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCPw(!showCPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showCPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="p-3 bg-rose-50 border border-rose-200 rounded-xl"
                        >
                          <p className="text-rose-700 text-xs font-medium text-center">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white h-11 font-medium text-sm transition-colors mt-3 shadow-xs cursor-pointer"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Mendaftarkan Akun...
                        </span>
                      ) : (
                        "Daftarkan Akun Klien"
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="text-center text-xs font-mono text-slate-400">
          MFWEB Client Access · Secure Registration
        </div>
      </div>
    </div>
  );
}
