"use client";

import { useState, useCallback } from "react";
import { Search, MapPin, Loader2, Star, Globe, Phone, Tag, AlertCircle } from "lucide-react";
import PaywallGate from "@/components/public/PaywallGate";

const STORAGE_KEY = "mfweb_freemium_lead_finder";

type FreemiumUsage = {
  count: number;
  resetAt: number;
};

type LeadResult = {
  name: string;
  address?: string;
  phone?: string;
  phoneNorm?: string;
  category?: string;
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
};

function getLocalUsage(): FreemiumUsage | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FreemiumUsage;
  } catch {
    return null;
  }
}

function setLocalUsage(usage: FreemiumUsage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch {
    // localStorage might be full or disabled
  }
}

function isLocalLimitReached(): boolean {
  const usage = getLocalUsage();
  if (!usage) return false;
  if (Date.now() > usage.resetAt) {
    // Window expired, clear it
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
  return usage.count >= 1;
}

export default function PublicLeadFinderForm() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LeadResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [freemiumDisabled, setFreemiumDisabled] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setResults([]);
      setSearched(false);

      if (!query.trim()) {
        setError("Masukkan kata kunci pencarian");
        return;
      }

      // Client-side soft-limit check
      if (isLocalLimitReached()) {
        setShowPaywall(true);
        return;
      }

      setLoading(true);

      try {
        const res = await fetch("/api/tools/lead-finder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: query.trim(), city: city.trim() }),
        });

        if (res.status === 429) {
          // Rate limited — set localStorage flag and show paywall
          const resetAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
          setLocalUsage({ count: 1, resetAt });
          setShowPaywall(true);
          setLoading(false);
          return;
        }

        if (res.status === 403) {
          setFreemiumDisabled(true);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Terjadi kesalahan" }));
          setError(data.error || "Terjadi kesalahan");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setResults(data.places || []);
        setSearched(true);

        // Update localStorage usage
        const usage = getLocalUsage();
        const resetAt = Date.now() + 24 * 60 * 60 * 1000;
        setLocalUsage({ count: (usage?.count ?? 0) + 1, resetAt: usage?.resetAt ?? resetAt });
      } catch {
        setError("Gagal menghubungi server. Coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    },
    [query, city],
  );

  function renderStars(rating: number) {
    const full = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < full ? "fill-amber-400 text-amber-400" : "text-white/20"}`}
        />,
      );
    }
    return stars;
  }

  if (freemiumDisabled) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-6 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-amber-400" />
        <p className="text-sm font-semibold text-amber-200">
          Free tier tidak tersedia untuk tool ini saat ini.
        </p>
        <a
          href="/portal/register"
          className="mt-3 inline-block text-sm font-bold text-blue-400 underline underline-offset-2 hover:text-blue-300"
        >
          Daftar akun untuk akses penuh →
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
        {/* Free tier notice */}
        <p className="mb-5 text-center text-xs font-semibold text-blue-200/50">
          Gratis: 1 pencarian per hari, maks 5 hasil
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
            {/* Keyword input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-200/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kata kunci, misal: salon kecantikan"
                className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm font-medium text-white placeholder:text-blue-200/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              />
            </div>

            {/* City input */}
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-200/40" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Kota (opsional)"
                className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm font-medium text-white placeholder:text-blue-200/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-7"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mencari...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Cari Leads
              </>
            )}
          </button>
        </form>

        {/* Error message */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Results */}
        {searched && (
          <div className="mt-6">
            <p className="mb-4 text-sm font-semibold text-blue-200/60">
              {results.length} hasil ditemukan
            </p>

            {results.length === 0 ? (
              <p className="text-sm text-blue-200/40">
                Tidak ada hasil untuk pencarian ini. Coba kata kunci atau kota lain.
              </p>
            ) : (
              <div className="grid gap-3">
                {results.map((lead, idx) => (
                  <div
                    key={`${lead.name}-${idx}`}
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-white">{lead.name}</h4>
                        {lead.address && (
                          <p className="mt-1 text-xs text-blue-200/45">{lead.address}</p>
                        )}
                      </div>

                      {/* Rating */}
                      {lead.rating != null && lead.rating > 0 && (
                        <div className="flex shrink-0 items-center gap-1">
                          {renderStars(lead.rating)}
                          <span className="ml-1 text-xs font-semibold text-blue-200/50">
                            {lead.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {/* Category badge */}
                      {lead.category && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                          <Tag className="h-3 w-3" />
                          {lead.category}
                        </span>
                      )}

                      {/* Phone link */}
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phoneNorm || lead.phone}`}
                          className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-300 transition-colors hover:bg-blue-500/20"
                        >
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </a>
                      )}

                      {/* Website link */}
                      {lead.website && (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-[10px] font-bold text-purple-300 transition-colors hover:bg-purple-500/20"
                        >
                          <Globe className="h-3 w-3" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Paywall modal */}
      <PaywallGate
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        toolName="Lead Finder"
      />
    </>
  );
}
