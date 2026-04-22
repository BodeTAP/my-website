"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CheckResult = { available: boolean; domain: string } | null;

export default function DomainChecker() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch(`/api/domain?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengecek domain");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = () => {
    if (!result?.domain) return;
    router.push(`/contact?domain=${encodeURIComponent(result.domain)}`);
  };

  return (
    <div id="domain-checker" className="glass rounded-2xl p-6 sm:p-8 glow-blue max-w-2xl mx-auto">
      <h3 className="text-white font-bold text-xl mb-2 text-center">
        Cek Ketersediaan Domain Bisnis Anda
      </h3>
      <p className="text-blue-200/60 text-sm text-center mb-6">
        Ketik nama bisnis Anda untuk melihat apakah domain-nya masih tersedia
      </p>

      <form onSubmit={handleCheck} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="namabisnisanda.com"
            className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 pr-4 h-12"
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !query.trim()}
          className="h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span className="ml-2 hidden sm:inline">Cek Domain</span>
        </Button>
      </form>

      {error && (
        <p className="mt-4 text-red-400 text-sm text-center">{error}</p>
      )}

      {result && (
        <div className={`mt-5 rounded-xl p-4 flex items-center justify-between gap-4 ${
          result.available
            ? "bg-green-500/10 border border-green-500/20"
            : "bg-red-500/10 border border-red-500/20"
        }`}>
          <div className="flex items-center gap-3">
            {result.available ? (
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <div>
              <p className="text-white font-semibold text-sm">{result.domain}</p>
              <p className={`text-xs ${result.available ? "text-green-300" : "text-red-300"}`}>
                {result.available ? "Domain tersedia!" : "Domain sudah dipakai"}
              </p>
            </div>
          </div>

          {result.available && (
            <Button
              onClick={handleClaim}
              size="sm"
              className="bg-green-600 hover:bg-green-500 text-white shrink-0"
            >
              Klaim & Buat Website
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
