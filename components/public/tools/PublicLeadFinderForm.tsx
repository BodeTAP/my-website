"use client";

import { useState, useCallback } from "react";
import { Search, MapPin, Loader2, Star, Globe, Phone, Tag, AlertCircle } from "lucide-react";
import { track } from "@vercel/analytics";
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

function isLocalLimitReached(limit: number): boolean {
  const usage = getLocalUsage();
  if (!usage) return false;
  if (Date.now() > usage.resetAt) {
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
  return usage.count >= limit;
}

type PublicLeadFinderFormProps = {
  welcomeCredits?: number;
  welcomeBonusBreakdown?: string;
  freemiumLimit?: number;
};

export default function PublicLeadFinderForm({
  welcomeCredits = 15,
  welcomeBonusBreakdown,
  freemiumLimit = 1,
}: PublicLeadFinderFormProps = {}) {
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
      if (loading) return;
      setError(null);
      setResults([]);
      setSearched(false);

      if (!query.trim()) {
        setError("Masukkan kata kunci pencarian");
        return;
      }

      if (isLocalLimitReached(freemiumLimit)) {
        track("freemium_paywall_shown", { tool: "lead_finder", reason: "local_limit" });
        setShowPaywall(true);
        return;
      }

      setLoading(true);

      try {
        const res = await fetch("/api/tools/lead-finder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: query.trim(),
            city: city.trim() || undefined,
          }),
        });

        if (res.status === 403) {
          const body = (await res.json().catch(() => ({}))) as {
            code?: string;
            message?: string;
          };
          if (body.code === "FREEMIUM_DISABLED") {
            setFreemiumDisabled(true);
            return;
          }
        }

        if (res.status === 429) {
          const body = (await res.json().catch(() => ({}))) as {
            retryAfterMs?: number;
          };
          const resetAt =
            typeof body.retryAfterMs === "number" && body.retryAfterMs > 0
              ? Date.now() + body.retryAfterMs
              : Date.now() + 24 * 60 * 60 * 1000;
          setLocalUsage({ count: freemiumLimit, resetAt });
          track("freemium_paywall_shown", { tool: "lead_finder", reason: "rate_limit" });
          setShowPaywall(true);
          return;
        }

        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          setError(errData.error || "Gagal mengambil data lead. Silakan coba lagi.");
          return;
        }

        const data = (await res.json()) as {
          places?: LeadResult[];
          results?: LeadResult[];
        };
        const items = data.places || data.results || [];
        setResults(items);
        setSearched(true);

        const current = getLocalUsage();
        const nextCount = (current?.count || 0) + 1;
        const resetAt = current?.resetAt || Date.now() + 24 * 60 * 60 * 1000;
        setLocalUsage({ count: nextCount, resetAt });

        track("freemium_tool_used", {
          tool: "lead_finder",
          resultCount: items.length,
          query: query.trim(),
          city: city.trim() || undefined,
        });
      } catch {
        setError("Terjadi kesalahan koneksi. Periksa koneksi internet Anda.");
      } finally {
        setLoading(false);
      }
    },
    [loading, query, city, freemiumLimit],
  );

  function renderStars(rating: number) {
    const full = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < full ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
        />,
      );
    }
    return stars;
  }

  if (freemiumDisabled) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xs">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-slate-700" />
        <p className="text-sm font-semibold text-slate-900">
          Uji coba gratis sedang dinonaktifkan sementara.
        </p>
        <a
          href="/portal/register"
          className="mt-3 inline-block text-sm font-bold text-slate-900 underline underline-offset-2 hover:text-slate-700"
        >
          Daftar akun portal untuk akses penuh →
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <p className="mb-5 text-center text-xs font-mono text-slate-500">
          Uji Coba Publik: 1 pencarian per hari, maksimal 5 hasil preview
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
            {/* Keyword input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kata kunci, misal: salon kecantikan"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
              />
            </div>

            {/* City input */}
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Kota (opsional)"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-slate-900 font-medium text-sm text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-7 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mencari prospek...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Cari Prospek Sekarang
              </>
            )}
          </button>
        </form>

        {/* Error message */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-xs sm:text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {searched && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="mb-4 text-xs font-mono font-semibold text-slate-600">
              {results.length} prospek ditemukan
            </p>

            {results.length === 0 ? (
              <p className="text-sm text-slate-500">
                Tidak ada hasil untuk pencarian ini. Coba kata kunci yang lebih umum atau periksa penulisan kota.
              </p>
            ) : (
              <div className="grid gap-3">
                {results.map((lead, idx) => (
                  <div
                    key={`${lead.name}-${idx}`}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">{lead.name}</h4>
                        {lead.address && (
                          <p className="mt-1 text-xs text-slate-500">{lead.address}</p>
                        )}
                      </div>

                      {/* Rating */}
                      {lead.rating != null && lead.rating > 0 && (
                        <div className="flex shrink-0 items-center gap-1">
                          {renderStars(lead.rating)}
                          <span className="ml-1 text-xs font-mono text-slate-600">
                            {lead.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {lead.category && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-mono text-slate-700">
                          <Tag className="h-3 w-3" />
                          {lead.category}
                        </span>
                      )}

                      {lead.phone && (
                        <a
                          href={`tel:${lead.phoneNorm || lead.phone}`}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-mono text-slate-700 transition-colors hover:bg-slate-100"
                        >
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </a>
                      )}

                      {lead.website && (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-mono text-slate-700 transition-colors hover:bg-slate-100"
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
        signupBonus={welcomeCredits}
        signupBonusBreakdown={welcomeBonusBreakdown}
      />
    </>
  );
}
