"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      setError("Email atau password salah.");
      setLoading(false);
    } else {
      router.push("/portal/dashboard");
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("resend", { email, redirect: false });

    if (res?.error) {
      setError("Gagal mengirim magic link. Pastikan API key Resend sudah dikonfigurasi.");
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 40 40" className="w-8 h-8">
              <polygon points="4,6 20,6 36,6 26,34 20,20 14,34" fill="black" />
              <polygon points="14,6 20,6 26,6 20,20" fill="white" />
            </svg>
          </div>
          <h1 className="text-white font-bold text-xl">VICTORIA TECH</h1>
          <p className="text-blue-200/50 text-sm mt-1">Portal Klien</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-white font-bold text-lg mb-2">Cek Email Anda!</h2>
              <p className="text-blue-200/60 text-sm">
                Kami mengirimkan link masuk ke{" "}
                <span className="text-blue-300 font-medium">{email}</span>.
                Klik link tersebut untuk masuk ke dashboard Anda.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-blue-400 hover:underline text-xs mt-4 block mx-auto"
              >
                Kembali
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-white font-bold text-lg mb-1">Masuk ke Portal</h2>
              <p className="text-blue-200/50 text-sm mb-5">
                Belum punya akun?{" "}
                <Link href="/portal/register" className="text-blue-400 hover:underline">
                  Daftar di sini
                </Link>
              </p>

              {/* Google */}
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/portal/dashboard" })}
                className="w-full flex items-center justify-center gap-3 h-11 border border-white/10 rounded-xl text-white text-sm hover:bg-white/5 transition-colors mb-5"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Masuk dengan Google
              </button>

              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-[#0f172a] text-blue-200/30">atau</span>
                </div>
              </div>

              {/* Mode tabs */}
              <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6 mt-3">
                <button
                  onClick={() => { setMode("password"); setError(""); }}
                  className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    mode === "password"
                      ? "bg-blue-600 text-white"
                      : "text-blue-200/50 hover:text-white"
                  }`}
                >
                  Email & Password
                </button>
                <button
                  onClick={() => { setMode("magic"); setError(""); }}
                  className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    mode === "magic"
                      ? "bg-blue-600 text-white"
                      : "text-blue-200/50 hover:text-white"
                  }`}
                >
                  Magic Link
                </button>
              </div>

              {/* Password login */}
              {mode === "password" && (
                <form onSubmit={handlePassword} className="space-y-4">
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

                  <div className="space-y-1.5">
                    <Label className="text-blue-200 text-sm">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
                      <Input
                        type={showPw ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
                        placeholder="••••••••"
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

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white h-11"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Masuk"}
                  </Button>
                </form>
              )}

              {/* Magic link */}
              {mode === "magic" && (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <p className="text-blue-200/50 text-sm">
                    Masukkan email Anda dan kami kirimkan link masuk otomatis.
                  </p>
                  <div className="space-y-1.5">
                    <Label className="text-blue-200 text-sm">Alamat Email</Label>
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
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kirim Magic Link"}
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
