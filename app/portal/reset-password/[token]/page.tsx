"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BrandLogoIcon } from "@/components/brand/BrandLogo";
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordTokenPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Konfirmasi password tidak cocok."); return; }
    if (password.length < 8) { setError("Password minimal 8 karakter."); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/portal/reset-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
      setTimeout(() => router.push("/portal/login"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-[#F8F9FA]">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1E242E] border border-slate-800 shadow-xs">
            <BrandLogoIcon size={28} variant="dark" />
          </div>
          <h1 className="text-slate-900 font-bold text-xl tracking-tight mt-3">MFWEB</h1>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-0.5">Atur Ulang Kata Sandi</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-9 shadow-xs">
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-slate-900 font-bold text-xl mb-2">Kata Sandi Berhasil Diubah</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Kata sandi baru Anda telah tersimpan dengan aman. Anda akan diarahkan ke halaman login secara otomatis.
              </p>
              <Button
                onClick={() => router.push("/portal/login")}
                className="w-full rounded-xl bg-[#1E242E] hover:bg-slate-800 text-white h-11 font-medium text-sm transition-colors shadow-xs"
              >
                Masuk Sekarang
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                Buat Kata Sandi Baru
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
                Masukkan kata sandi baru untuk akun klien Anda. Minimal terdiri dari 8 karakter.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider block">
                    Kata Sandi Baru
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type={showPw ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono text-sm transition-all"
                      placeholder="Minimal 8 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-900 text-xs font-mono uppercase tracking-wider block">
                    Konfirmasi Kata Sandi
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono text-sm transition-all"
                      placeholder="Ulangi kata sandi"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#1E242E] hover:bg-slate-800 text-white h-11 font-medium text-sm transition-colors shadow-xs"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Kata Sandi"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
