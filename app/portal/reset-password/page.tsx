"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
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
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Image src="/logo.png" alt="MFWEB" width={48} height={48} className="mx-auto mb-4" />
          <h1 className="text-white font-bold text-xl">MFWEB</h1>
          <p className="text-blue-200/50 text-sm mt-1">Portal Klien</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-white font-bold text-lg mb-2">Cek Email Anda!</h2>
              <p className="text-blue-200/60 text-sm mb-6">
                Jika email <span className="text-blue-300 font-medium">{email}</span> terdaftar,
                kami telah mengirimkan link reset password. Berlaku 1 jam.
              </p>
              <Link href="/portal/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white h-11">
                  Kembali ke Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-white font-bold text-lg mb-1">Lupa Password?</h2>
              <p className="text-blue-200/50 text-sm mb-6">
                Masukkan email Anda dan kami kirimkan link untuk membuat password baru.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-blue-200 text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
                      placeholder="email@bisnis.com"
                    />
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white h-11"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kirim Link Reset"}
                </Button>
              </form>

              <Link href="/portal/login" className="flex items-center justify-center gap-1.5 text-blue-400/60 hover:text-blue-300 text-sm mt-5 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
