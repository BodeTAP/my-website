"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CheckResult = { available: boolean; domain: string } | null;
type Suggestion  = { domain: string; available: boolean };

function getBaseName(q: string): string {
  return q.includes(".") ? q.split(".")[0] : q;
}

function buildSuggestions(base: string): string[] {
  const b = base.toLowerCase().replace(/[^a-z0-9-]/g, "");
  return [
    `${b}.net`,
    `${b}.id`,
    `${b}.co.id`,
    `${b}.biz`,
    `${b}.online`,
    `${b}id.com`,
    `get${b}.com`,
    `${b}store.com`,
  ];
}

async function checkDomain(domain: string): Promise<Suggestion> {
  try {
    const res  = await fetch(`/api/domain?q=${encodeURIComponent(domain)}`);
    const data = await res.json() as { available?: boolean };
    return { domain, available: data.available ?? false };
  } catch {
    return { domain, available: false };
  }
}

export default function DomainChecker() {
  const [query,       setQuery]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [result,      setResult]      = useState<CheckResult>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSugg, setLoadingSugg] = useState(false);
  const [error,       setError]       = useState("");
  const router = useRouter();

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    setSuggestions([]);
    setError("");

    try {
      const res  = await fetch(`/api/domain?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json() as { available?: boolean; domain?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Gagal mengecek domain");

      const checked = data as { available: boolean; domain: string };
      setResult(checked);

      if (!checked.available) {
        setLoadingSugg(true);
        const base   = getBaseName(query.trim());
        const alts   = buildSuggestions(base);
        const checks = await Promise.all(alts.map(checkDomain));
        setSuggestions(checks.filter(s => s.available).slice(0, 5));
        setLoadingSugg(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = (domain?: string) => {
    const d = domain ?? result?.domain;
    if (!d) return;
    router.push(`/contact?domain=${encodeURIComponent(d)}`);
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
            onChange={(e) => { setQuery(e.target.value); setResult(null); setSuggestions([]); }}
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
        <div className="mt-5 space-y-3">
          {/* Main result */}
          <div className={`rounded-xl p-4 flex items-center justify-between gap-4 ${
            result.available
              ? "bg-green-500/10 border border-green-500/20"
              : "bg-red-500/10 border border-red-500/20"
          }`}>
            <div className="flex items-center gap-3">
              {result.available
                ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                : <XCircle    className="w-5 h-5 text-red-400 shrink-0" />}
              <div>
                <p className="text-white font-semibold text-sm">{result.domain}</p>
                <p className={`text-xs ${result.available ? "text-green-300" : "text-red-300"}`}>
                  {result.available ? "Domain tersedia!" : "Domain sudah dipakai"}
                </p>
              </div>
            </div>
            {result.available && (
              <Button
                onClick={() => handleClaim()}
                size="sm"
                className="bg-green-600 hover:bg-green-500 text-white shrink-0"
              >
                Klaim & Buat Website
              </Button>
            )}
          </div>

          {/* Suggestions when unavailable */}
          {!result.available && (
            <div>
              <p className="text-blue-200/50 text-xs mb-2 px-1">
                {loadingSugg ? "Mencari alternatif yang tersedia..." : suggestions.length > 0 ? "✨ Domain alternatif yang tersedia:" : ""}
              </p>

              {loadingSugg && (
                <div className="flex items-center justify-center gap-2 py-3 text-blue-200/40 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengecek alternatif...
                </div>
              )}

              {!loadingSugg && suggestions.length > 0 && (
                <div className="space-y-2">
                  {suggestions.map((s) => (
                    <div
                      key={s.domain}
                      className="bg-green-500/5 border border-green-500/15 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                        <span className="text-white text-sm font-medium">{s.domain}</span>
                      </div>
                      <Button
                        onClick={() => handleClaim(s.domain)}
                        size="sm"
                        variant="outline"
                        className="border-green-500/30 text-green-300 hover:bg-green-500/10 hover:text-green-200 text-xs h-8 shrink-0"
                      >
                        Pilih ini
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {!loadingSugg && suggestions.length === 0 && (
                <p className="text-blue-200/40 text-xs text-center py-2">
                  Semua alternatif juga sudah dipakai. Coba nama yang berbeda.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
