"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, CheckCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeUp, ScaleIn } from "@/components/public/motion";

type Mode = "magic" | "password";

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
      setError("Email atau kata sandi tidak sesuai.");
      setLoading(false);
    } else {
      router.push("/portal/dashboard");
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("resend", { email, redirect: false, callbackUrl: "/portal/dashboard" });

    if (res?.error) {
      setError("Gagal mengirim magic link. Mohon hubungi tim support.");
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#030914]">
      <div className="w-full max-w-md relative z-10 py-12">
        
        {/* Logo */}
        <FadeUp delay={0}>
          <div className="text-center mb-10 group">
            <div className="inline-flex relative items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 mb-5">
              <Image src="/logo.png" alt="MFWEB" width={32} height={32} className="relative z-10 drop-shadow-lg" />
            </div>
            <h1 className="text-white font-black text-3xl tracking-tight">MFWEB</h1>
            <p className="text-blue-300/70 text-[11px] font-bold uppercase tracking-[0.2em] mt-1.5">Portal Klien</p>
          </div>
        </FadeUp>

        <ScaleIn delay={0.1}>
          <div className="rounded-2xl border border-white/10 bg-[#071225] p-8 sm:p-10">
            {sent ? (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-white font-black text-2xl mb-3">Cek email Anda</h2>
                <p className="text-blue-200/60 text-sm leading-relaxed mb-8 px-2">
                  Tautan masuk sudah dikirim ke{" "}
                  <strong className="text-white font-bold">{email}</strong>.
                  Klik tautan tersebut untuk masuk tanpa kata sandi.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="text-blue-400 hover:text-blue-300 hover:underline text-xs font-semibold uppercase tracking-wider block mx-auto transition-colors"
                >
                  Gunakan cara lain
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    <h2 className="text-white font-black text-xl">Masuk ke portal</h2>
                  </div>
                </div>
                <p className="text-blue-200/50 text-xs font-medium mb-8">
                  Belum memiliki akun klien?{" "}
                  <Link href="/portal/register" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                    Daftar sekarang
                  </Link>
                </p>

                {/* Google */}
                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/portal/dashboard" })}
                  className="w-full flex items-center justify-center gap-3 h-12 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-semibold hover:bg-white/10 transition-all mb-6 group"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Lanjutkan dengan Google
                </button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-[#071225] text-white/30 font-bold uppercase tracking-widest text-[10px]">Atau gunakan email</span>
                  </div>
                </div>

                {/* Mode tabs */}
                <div className="flex p-1 bg-black/40 rounded-xl mb-6 border border-white/5">
                  <button
                    onClick={() => { setMode("password"); setError(""); }}
                    className={`flex-1 py-2 text-xs rounded-lg font-bold transition-all ${
                      mode === "password"
                        ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    Kata Sandi
                  </button>
                  <button
                    onClick={() => { setMode("magic"); setError(""); }}
                    className={`flex-1 py-2 text-xs rounded-lg font-bold transition-all ${
                      mode === "magic"
                        ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    Magic Link
                  </button>
                </div>

                {/* Password login */}
                {mode === "password" && (
                  <form onSubmit={handlePassword} className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Alamat Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
                        <Input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-11 h-12 bg-black/50 border-white/10 text-white placeholder:text-blue-200/20 rounded-xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                          placeholder="email@domain.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Kata Sandi</Label>
                        <Link href="/portal/reset-password" className="text-blue-400/80 hover:text-blue-300 text-[10px] font-semibold transition-colors">
                          Lupa Sandi?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
                        <Input
                          type={showPw ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-11 pr-11 h-12 bg-black/50 border-white/10 text-white placeholder:text-blue-200/20 rounded-xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                          placeholder="Kata sandi"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400/50 hover:text-blue-400 transition-colors"
                        >
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 text-xs font-semibold text-center">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl font-bold text-sm transition-colors mt-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Masuk"}
                    </Button>
                  </form>
                )}

                {/* Magic link */}
                {mode === "magic" && (
                  <form onSubmit={handleMagicLink} className="space-y-5">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-2">
                      <p className="text-blue-200/80 text-xs leading-relaxed text-center">
                        Masukkan email. Kami akan mengirim tautan masuk yang bisa diklik tanpa kata sandi.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Alamat Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
                        <Input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-11 h-12 bg-black/50 border-white/10 text-white placeholder:text-blue-200/20 rounded-xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                          placeholder="email@domain.com"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 text-xs font-semibold text-center">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl font-bold text-sm transition-colors mt-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Kirim Tautan Akses"}
                    </Button>
                  </form>
                )}
              </>
            )}
          </div>
        </ScaleIn>
      </div>
    </div>
  );
}
