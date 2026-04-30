"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  User, Mail, Lock, Building2, Phone, Loader2, Eye, EyeOff, CheckCircle, UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeUp, ScaleIn } from "@/components/public/motion";

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

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi sandi tidak sesuai.");
      return;
    }
    if (form.password.length < 8) {
      setError("Sandi memerlukan minimal 8 karakter.");
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
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#030914]">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        
        {/* Logo */}
        <FadeUp delay={0}>
          <div className="text-center mb-10 group">
            <div className="inline-flex relative items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 mb-5 shadow-[0_0_30px_rgba(79,70,229,0.15)] group-hover:shadow-[0_0_40px_rgba(79,70,229,0.3)] group-hover:scale-105 transition-all duration-500">
              <Image src="/logo.png" alt="MFWEB" width={32} height={32} className="relative z-10 drop-shadow-lg" />
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-2xl pointer-events-none" />
            </div>
            <h1 className="text-white font-black text-3xl tracking-tight bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">MFWEB</h1>
            <p className="text-indigo-400/80 text-[11px] font-bold uppercase tracking-[0.2em] mt-1.5">Pendaftaran Klien</p>
          </div>
        </FadeUp>

        <ScaleIn delay={0.1}>
          <div className="glass rounded-[32px] p-8 sm:p-10 border border-white/5 bg-[#050b14]/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none" />
            
            {success ? (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-white font-black text-2xl mb-3">Pendaftaran Selesai!</h2>
                <p className="text-blue-200/60 text-sm leading-relaxed mb-8 px-2">
                  Sistem kami telah mengotorisasi akun Anda. Silakan masuk menggunakan kredensial yang baru saja Anda daftarkan.
                </p>
                <Button
                  onClick={() => router.push("/portal/login")}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all"
                >
                  Masuk Sesi Sekarang
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-white font-black text-xl">Buat Akun Baru</h2>
                </div>
                <p className="text-blue-200/50 text-xs font-medium mb-8">
                  Sudah terdaftar?{" "}
                  <Link href="/portal/login" className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">
                    Masuk di sini
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
                  Daftar Otomatis dengan Google
                </button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-[#050b14] text-white/30 font-bold uppercase tracking-widest text-[10px]">Atau Manual via Email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Nama */}
                  <div className="space-y-2">
                    <Label className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Nama Panggilan *</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                      <Input
                        required
                        value={form.name}
                        onChange={set("name")}
                        placeholder="Budi Santoso"
                        className="pl-11 h-12 bg-black/50 border-white/10 text-white placeholder:text-blue-200/20 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Email Terdaftar *</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                      <Input
                        type="email"
                        required
                        value={form.email}
                        onChange={set("email")}
                        placeholder="email@bisnis.com"
                        className="pl-11 h-12 bg-black/50 border-white/10 text-white placeholder:text-blue-200/20 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Nama Bisnis */}
                  <div className="space-y-2">
                    <Label className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Nama Usaha / Perusahaan *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                      <Input
                        required
                        value={form.businessName}
                        onChange={set("businessName")}
                        placeholder="Toko Maju Jaya"
                        className="pl-11 h-12 bg-black/50 border-white/10 text-white placeholder:text-blue-200/20 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* No. WhatsApp */}
                  <div className="space-y-2">
                    <Label className="text-white/70 text-[11px] font-bold uppercase tracking-widest flex justify-between">
                      <span>No. WhatsApp</span>
                      <span className="text-white/30">(Opsional)</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                      <Input
                        type="tel"
                        value={form.phone}
                        onChange={set("phone")}
                        placeholder="0812-xxxx-xxxx"
                        className="pl-11 h-12 bg-black/50 border-white/10 text-white placeholder:text-blue-200/20 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/5 border-dashed" />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Kata Sandi Akses *</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                      <Input
                        type={showPw ? "text" : "password"}
                        required
                        value={form.password}
                        onChange={set("password")}
                        placeholder="Minimal 8 karakter unik"
                        className="pl-11 pr-11 h-12 bg-black/50 border-white/10 text-white placeholder:text-blue-200/20 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400/50 hover:text-indigo-300 transition-colors"
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Konfirmasi Sandi *</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                      <Input
                        type={showCPw ? "text" : "password"}
                        required
                        value={form.confirmPassword}
                        onChange={set("confirmPassword")}
                        placeholder="Ketik ulang kata sandi"
                        className="pl-11 pr-11 h-12 bg-black/50 border-white/10 text-white placeholder:text-blue-200/20 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCPw(!showCPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400/50 hover:text-indigo-300 transition-colors"
                      >
                        {showCPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mt-2">
                      <p className="text-red-400 text-xs font-semibold text-center">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-12 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all mt-4"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Buat Akun Sekarang"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </ScaleIn>
      </div>
    </div>
  );
}
