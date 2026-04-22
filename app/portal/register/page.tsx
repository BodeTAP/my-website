"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Mail, Lock, Building2, Phone, Loader2, Eye, EyeOff, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password minimal 8 karakter.");
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
      if (!res.ok) throw new Error(data.error ?? "Pendaftaran gagal.");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 40 40" className="w-8 h-8">
              <polygon points="4,6 20,6 36,6 26,34 20,20 14,34" fill="black" />
              <polygon points="14,6 20,6 26,6 20,20" fill="white" />
            </svg>
          </div>
          <h1 className="text-white font-bold text-xl">VICTORIA TECH</h1>
          <p className="text-blue-200/50 text-sm mt-1">Daftar Akun Klien</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {success ? (
            <div className="text-center">
              <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
              <h2 className="text-white font-bold text-lg mb-2">Pendaftaran Berhasil!</h2>
              <p className="text-blue-200/60 text-sm mb-6">
                Akun Anda sudah dibuat. Silakan login dengan email dan password yang tadi Anda daftarkan.
              </p>
              <Button
                onClick={() => router.push("/portal/login")}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white h-11"
              >
                Masuk Sekarang
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-white font-bold text-lg mb-1">Buat Akun Baru</h2>
              <p className="text-blue-200/50 text-sm mb-6">
                Sudah punya akun?{" "}
                <Link href="/portal/login" className="text-blue-400 hover:underline">
                  Masuk di sini
                </Link>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nama */}
                <div className="space-y-1.5">
                  <Label className="text-blue-200 text-sm">Nama Lengkap *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
                    <Input
                      required
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Nama Anda"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-blue-200 text-sm">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
                    <Input
                      type="email"
                      required
                      value={form.email}
                      onChange={set("email")}
                      placeholder="email@bisnis.com"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
                    />
                  </div>
                </div>

                {/* Nama Bisnis */}
                <div className="space-y-1.5">
                  <Label className="text-blue-200 text-sm">Nama Bisnis / Usaha *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
                    <Input
                      required
                      value={form.businessName}
                      onChange={set("businessName")}
                      placeholder="Toko Maju Jaya"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
                    />
                  </div>
                </div>

                {/* No. WhatsApp */}
                <div className="space-y-1.5">
                  <Label className="text-blue-200 text-sm">
                    No. WhatsApp{" "}
                    <span className="text-blue-200/30 text-xs">(opsional)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="08xx-xxxx-xxxx"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
                    />
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-4">
                  {/* Password */}
                  <div className="space-y-1.5">
                    <Label className="text-blue-200 text-sm">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
                      <Input
                        type={showPw ? "text" : "password"}
                        required
                        value={form.password}
                        onChange={set("password")}
                        placeholder="Minimal 8 karakter"
                        className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400/50 hover:text-blue-300"
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <Label className="text-blue-200 text-sm">Konfirmasi Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
                      <Input
                        type={showCPw ? "text" : "password"}
                        required
                        value={form.confirmPassword}
                        onChange={set("confirmPassword")}
                        placeholder="Ulangi password"
                        className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCPw(!showCPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400/50 hover:text-blue-300"
                      >
                        {showCPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white h-11 mt-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Daftar Sekarang"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
