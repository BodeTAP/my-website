"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogoIcon } from "@/components/brand/BrandLogo";
import { Mail, Loader2, CheckCircle, ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/portal/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-[#F8F9FA]">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-[#1E242E] border border-slate-800 flex items-center justify-center transition-transform group-hover:scale-105">
              <BrandLogoIcon size={28} variant="dark" />
            </div>
          </Link>
          <h1 className="text-slate-900 font-bold text-xl tracking-tight mt-3">MFWEB</h1>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-0.5">Pemulihan Kata Sandi</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-9 shadow-xs">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-slate-900 font-bold text-xl mb-2">Tautan Telah Terkirim</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Jika alamat email <span className="font-mono text-slate-900 font-medium">{email}</span> terdaftar,
                kami telah mengirimkan tautan reset kata sandi baru. Tautan ini berlaku selama 1 jam.
              </p>
              <Link href="/portal/login">
                <Button className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white h-11 font-medium text-sm transition-colors">
                  Kembali ke Halaman Masuk
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                  Reset Sandi
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                Lupa Kata Sandi?
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
                Ketikkan email akun klien Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi dengan aman.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider block">
                    Alamat Email Terdaftar
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
                      Mengirim Tautan...
                    </span>
                  ) : (
                    "Kirim Tautan Pemulihan"
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <Link
                  href="/portal/login"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali ke halaman masuk
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-mono mt-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          Proses pemulihan terenkripsi aman
        </div>
      </div>
    </div>
  );
}
