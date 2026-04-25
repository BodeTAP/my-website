"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Image src="/logo.png" alt="MFWEB" width={48} height={48} className="mx-auto mb-4" />
          <h1 className="text-white font-bold text-xl">MFWEB</h1>
          <p className="text-blue-200/50 text-sm mt-1">Portal Klien</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {done ? (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-white font-bold text-lg mb-2">Password Berhasil Diubah!</h2>
              <p className="text-blue-200/60 text-sm">Anda akan diarahkan ke halaman login dalam beberapa detik...</p>
            </div>
          ) : (
            <>
              <h2 className="text-white font-bold text-lg mb-1">Buat Password Baru</h2>
              <p className="text-blue-200/50 text-sm mb-6">Masukkan password baru untuk akun portal Anda.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-blue-200 text-sm">Password Baru</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
                    <Input
                      type={showPw ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
                      placeholder="Minimal 8 karakter"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400/50 hover:text-blue-300">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-blue-200 text-sm">Konfirmasi Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
                    <Input
                      type="password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
                      placeholder="Ulangi password"
                    />
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white h-11"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Password Baru"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
