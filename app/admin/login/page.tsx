"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
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
      setError("Email atau password salah");
      setLoading(false);
    } else {
      router.push("/admin");
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
          <p className="text-blue-200/50 text-sm mt-1">Admin Dashboard</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-blue-200 text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30"
                  placeholder="admin@victoriatch.com"
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
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
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

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white h-11"
            >
              {loading ? "Masuk..." : "Masuk ke Dashboard"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
