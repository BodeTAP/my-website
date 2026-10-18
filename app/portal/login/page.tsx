"use client";

import { useState } from "react";
import { BrandLogoIcon } from "@/components/brand/BrandLogo";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  FileCheck2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "password" | "magic";

const ease = [0.16, 1, 0.3, 1] as const;

export default function PortalLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email atau kata sandi yang Anda masukkan tidak sesuai.");
      setLoading(false);
    } else {
      router.push("/portal/dashboard");
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("resend", {
      email,
      redirect: false,
      callbackUrl: "/portal/dashboard",
    });

    if (res?.error) {
      setError("Gagal mengirim tautan masuk. Silakan gunakan opsi kata sandi atau hubungi tim support.");
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-white overflow-hidden">
      {/* ── Left Side: Deep Slate Showcase & Brand Experience ───────── */}
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

        {/* Top: Brand mark */}
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
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">Client Portal</span>
            </div>
          </Link>
        </motion.div>

        {/* Middle: Editorial Value Proposition */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="h-px w-8 bg-slate-500" />
              <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                Workspace Klien
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Satu kendali untuk seluruh proyek & berkas digital Anda.
            </h1>

            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              Pantau linimasa pengerjaan website, riwayat pembayaran invoice resmi, serta akses instan ke seluruh tool automasi bisnis kami.
            </p>
          </motion.div>

          {/* Value feature list with stagger */}
          <div className="mt-8 space-y-3">
            {[
              {
                icon: CheckCircle2,
                title: "Monitoring Progres Real-Time",
                desc: "Pantau milestone pengerjaan mulai dari tahap desain, rekayasa kode, hingga peluncuran.",
                delay: 0.2,
              },
              {
                icon: FileCheck2,
                title: "Generator Proposal & Invoice PDF",
                desc: "Buat dokumen komersial resmi dengan brand kit bisnis Anda dalam hitungan detik.",
                delay: 0.3,
              },
              {
                icon: Sparkles,
                title: "Lead Finder & Automasi B2B",
                desc: "Temukan prospek usaha baru secara otomatis langsung dari dasbor portal klien Anda.",
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
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom: Security & Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400"
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-300" />
            <span>Enkripsi SSL 256-bit</span>
          </div>
          <span>© 2026 MFWEB Studio</span>
        </motion.div>
      </div>

      {/* ── Right Side: Form Panel with Immersive In-Out ────────────── */}
      <div className="flex flex-col justify-between bg-[#F8F9FA] p-6 sm:p-10 lg:p-16 min-h-screen">
        {/* Top back navigation */}
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

          {/* Mobile logo icon */}
          <div className="lg:hidden flex items-center gap-2">
            <BrandLogoIcon size={24} variant="dark" />
            <span className="font-bold text-slate-900 text-sm tracking-tight">MFWEB</span>
          </div>
        </motion.div>

        {/* Centered Form Card */}
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
              className="relative flex-1 py-2 text-xs font-mono uppercase tracking-wider text-center font-bold"
            >
              <motion.div
                layoutId="auth-main-tab-pill"
                className="absolute inset-0 bg-white rounded-full shadow-xs border border-slate-200"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
              <span className="relative z-10 text-slate-900">
                Masuk Akun
              </span>
            </Link>

            <Link
              href="/portal/register"
              className="relative flex-1 py-2 text-xs font-mono uppercase tracking-wider text-center font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <span className="relative z-10">
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
              {sent ? (
                <motion.div
                  key="sent-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-slate-900 font-bold text-xl mb-2">Periksa Email Anda</h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Tautan akses masuk telah dikirimkan ke{" "}
                    <strong className="text-slate-900 font-mono font-medium">{email}</strong>.
                    Buka pesan tersebut lalu klik tautan untuk masuk langsung.
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSent(false)}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-mono font-medium px-6 h-10 transition-colors"
                  >
                    Gunakan Metode Lain
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
                        Autentikasi
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      Masuk ke Portal Klien
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                      Silakan pilih metode masuk yang Anda kehendaki.
                    </p>
                  </div>

                  {/* Google Sign In */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: "/portal/dashboard" })}
                    className="w-full flex items-center justify-center gap-3 h-12 bg-white border border-slate-200 rounded-full text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs group"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 group-hover:scale-105 transition-transform" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Lanjutkan dengan Google
                  </motion.button>

                  {/* Separator */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-white text-slate-400 font-mono text-[10px] uppercase tracking-widest">
                        atau gunakan email
                      </span>
                    </div>
                  </div>

                  {/* Mode Selector Tabs with animated pill */}
                  <div className="flex p-1 bg-slate-100 rounded-full border border-slate-200 mb-6 relative">
                    <button
                      type="button"
                      onClick={() => { setMode("password"); setError(""); }}
                      className="relative flex-1 py-1.5 text-xs text-center font-medium transition-colors"
                    >
                      {mode === "password" && (
                        <motion.div
                          layoutId="login-mode-pill"
                          className="absolute inset-0 bg-white rounded-full shadow-xs border border-slate-200"
                          transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        />
                      )}
                      <span className={`relative z-10 transition-colors ${mode === "password" ? "text-slate-900 font-semibold" : "text-slate-500 hover:text-slate-800"}`}>
                        Kata Sandi
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode("magic"); setError(""); }}
                      className="relative flex-1 py-1.5 text-xs text-center font-medium transition-colors"
                    >
                      {mode === "magic" && (
                        <motion.div
                          layoutId="login-mode-pill"
                          className="absolute inset-0 bg-white rounded-full shadow-xs border border-slate-200"
                          transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        />
                      )}
                      <span className={`relative z-10 transition-colors ${mode === "magic" ? "text-slate-900 font-semibold" : "text-slate-500 hover:text-slate-800"}`}>
                        Magic Link
                      </span>
                    </button>
                  </div>

                  {/* Form inputs with AnimatePresence */}
                  <AnimatePresence mode="wait">
                    {mode === "password" ? (
                      <motion.form
                        key="password-form"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.25, ease }}
                        onSubmit={handlePassword}
                        className="space-y-4"
                      >
                        <div className="space-y-1.5">
                          <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider block">
                            Alamat Email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all font-mono text-sm"
                              placeholder="nama@perusahaan.com"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider">
                              Kata Sandi
                            </Label>
                            <Link
                              href="/portal/reset-password"
                              className="text-slate-500 hover:text-slate-900 text-xs font-mono underline transition-colors"
                            >
                              Lupa sandi?
                            </Link>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              type={showPw ? "text" : "password"}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all text-sm font-mono"
                              placeholder="Masukkan kata sandi"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPw(!showPw)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
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
                          className="w-full flex items-center justify-center rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white h-11 font-medium text-sm transition-colors mt-2 shadow-xs cursor-pointer"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Memverifikasi...
                            </span>
                          ) : (
                            "Masuk ke Portal"
                          )}
                        </motion.button>
                      </motion.form>
                    ) : (
                      <motion.form
                        key="magic-form"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.25, ease }}
                        onSubmit={handleMagicLink}
                        className="space-y-4"
                      >
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                          <p className="text-slate-600 text-xs leading-relaxed text-center">
                            Masukkan email Anda. Kami akan mengirimkan tautan sekali klik untuk masuk langsung tanpa kata sandi.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider block">
                            Alamat Email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all font-mono text-sm"
                              placeholder="nama@perusahaan.com"
                            />
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
                          className="w-full flex items-center justify-center rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white h-11 font-medium text-sm transition-colors mt-2 shadow-xs cursor-pointer"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Mengirim Tautan...
                            </span>
                          ) : (
                            "Kirim Tautan Akses"
                          )}
                        </motion.button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Footer link to Register */}
                  <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                    <p className="text-slate-600 text-xs">
                      Belum memiliki akun klien?{" "}
                      <Link
                        href="/portal/register"
                        className="font-bold text-slate-900 underline underline-offset-2 hover:text-black transition-colors"
                      >
                        Daftar akun baru gratis →
                      </Link>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bottom subtle copyright */}
        <div className="text-center text-xs font-mono text-slate-400">
          MFWEB Client Access · Secure Authentication
        </div>
      </div>
    </div>
  );
}
