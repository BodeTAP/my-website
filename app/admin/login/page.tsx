"use client";

import { useState } from "react";
import { BrandLogoIcon } from "@/components/brand/BrandLogo";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email atau kata sandi admin tidak sesuai.");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-[#F8F9FA]">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-[#1E242E] border border-slate-800 flex items-center justify-center transition-transform group-hover:scale-105">
              <BrandLogoIcon size={28} variant="dark" />
            </div>
          </Link>
          <h1 className="text-slate-900 font-bold text-xl tracking-tight mt-3">MFWEB</h1>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-0.5">Admin Control Center</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-9 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-6 bg-slate-400" />
            <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
              Restricted Area
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-6">
            Otorisasi Administrator
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider block">
                Email Administrator
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all font-mono text-sm"
                  placeholder="admin@mfweb.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider block">
                Kata Sandi
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type={showPw ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all text-sm font-mono"
                  placeholder="••••••••"
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

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <p className="text-rose-700 text-xs font-medium text-center">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white h-11 font-medium text-sm transition-colors mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengotentikasi...
                </span>
              ) : (
                "Masuk ke Dashboard"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-mono mt-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          Akses terbatas hanya untuk tim operasional MFWEB
        </div>
      </div>
    </div>
  );
}
