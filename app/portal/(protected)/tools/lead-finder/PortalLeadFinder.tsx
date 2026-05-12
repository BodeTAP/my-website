"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Coins,
  Download,
  Globe,
  GlobeOff,
  Loader2,
  MapPin,
  Phone,
  Search,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlaceLead } from "@/app/api/portal/tools/lead-finder/route";

type FilterType = "NO_WEBSITE" | "ALL";

const PRESETS = [
  "restoran",
  "kafe",
  "salon kecantikan",
  "bengkel motor",
  "apotek",
  "klinik",
  "laundry",
  "toko pakaian",
  "percetakan",
  "travel agent",
];

const CITIES = [
  "Jakarta",
  "Bandung",
  "Surabaya",
  "Semarang",
  "Yogyakarta",
  "Denpasar",
  "Tangerang",
  "Bekasi",
  "Depok",
  "Bogor",
  "Medan",
  "Makassar",
];

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function stripIndonesiaPrefix(phone: string) {
  return phone.replace(/\D/g, "").replace(/^62/, "").replace(/^0/, "");
}

function downloadCsv(places: PlaceLead[]) {
  const header = ["Name", "CountryCode", "Phone", "AllowCampaign", "AllowSMS", "Attribute 1"];
  const rows = places
    .filter((place) => place.phoneNorm || place.phone)
    .map((place) => {
      const phone = stripIndonesiaPrefix(place.phoneNorm || place.phone);
      return [
        place.name,
        "62",
        phone,
        "TRUE",
        "TRUE",
        place.name,
      ].map(csvEscape).join(",");
    });

  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wati-leads-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function Rating({ rating, count }: { rating: number | null; count: number | null }) {
  if (!rating) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-yellow-300">
      <Star className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
      {rating.toFixed(1)}
      {count != null && <span className="text-blue-200/40">({count})</span>}
    </span>
  );
}

export default function PortalLeadFinder({ initialBalance }: { initialBalance: number }) {
  const [balance, setBalance] = useState(initialBalance);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [pages, setPages] = useState(1);
  const [filter, setFilter] = useState<FilterType>("NO_WEBSITE");
  const [places, setPlaces] = useState<PlaceLead[]>([]);
  const [fullQuery, setFullQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const insufficient = balance < 5;
  const filteredPlaces = useMemo(() => {
    if (filter === "NO_WEBSITE") return places.filter((place) => !place.hasWebsite);
    return places;
  }, [filter, places]);

  function requestSearch() {
    if (!query.trim() || insufficient) return;
    setConfirmOpen(true);
  }

  async function runSearch() {
    if (!query.trim() || insufficient) return;
    setConfirmOpen(false);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/portal/tools/lead-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, city, pages }),
      });
      const data = await res.json().catch(() => ({}));

      if (typeof data.balance === "number") setBalance(data.balance);
      if (!res.ok) throw new Error(data.error ?? "Pencarian gagal");

      setPlaces(Array.isArray(data.places) ? data.places : []);
      setFullQuery(typeof data.fullQuery === "string" ? data.fullQuery : "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pencarian gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <Link href="/portal/tools" className="inline-flex items-center gap-2 text-blue-200/50 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Tools
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Search className="w-7 h-7 text-blue-400" />
            Lead Finder
          </h1>
          <p className="text-blue-200/50 text-sm mt-2">Temukan bisnis lokal dari Google Maps dalam format siap follow-up.</p>
        </div>
        <Link href="/portal/credits" className="w-fit">
          <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 px-4 py-3 hover:bg-amber-500/15 transition-colors">
            <Coins className="w-5 h-5 text-amber-300" />
            <div>
              <p className="text-amber-200/55 text-[10px] uppercase tracking-widest font-black">Saldo</p>
              <p className="text-white font-black">{balance} kredit</p>
            </div>
          </div>
        </Link>
      </div>

      {insufficient && (
        <Link
          href="/portal/credits"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 px-5 py-4 text-amber-100 hover:bg-amber-500/15 transition-colors"
        >
          <span className="flex items-center gap-3 text-sm font-bold">
            <AlertTriangle className="w-5 h-5 text-amber-300" />
            Kredit tidak cukup. Beli sekarang
          </span>
          <span className="text-xs text-amber-200/70">Minimal 5 kredit per pencarian</span>
        </Link>
      )}

      <div className="glass rounded-3xl p-5 sm:p-6 border border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_120px_auto] gap-3">
          <div>
            <label htmlFor="lead-query" className="text-blue-200/50 text-xs font-bold uppercase tracking-widest">Jenis Bisnis</label>
            <input
              id="lead-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Contoh: restoran, klinik, laundry"
              className="mt-2 w-full h-12 rounded-xl bg-black/35 border border-white/10 px-4 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500/50"
            />
          </div>
          <div>
            <label htmlFor="lead-city" className="text-blue-200/50 text-xs font-bold uppercase tracking-widest">Kota</label>
            <input
              id="lead-city"
              list="lead-city-options"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Opsional"
              className="mt-2 w-full h-12 rounded-xl bg-black/35 border border-white/10 px-4 text-white placeholder:text-blue-200/25 outline-none focus:border-blue-500/50"
            />
            <datalist id="lead-city-options">
              {CITIES.map((item) => <option key={item} value={item} />)}
            </datalist>
          </div>
          <div>
            <label htmlFor="lead-pages" className="text-blue-200/50 text-xs font-bold uppercase tracking-widest">Halaman</label>
            <select
              id="lead-pages"
              value={pages}
              onChange={(e) => setPages(Number(e.target.value))}
              className="mt-2 w-full h-12 rounded-xl bg-black/35 border border-white/10 px-4 text-white outline-none focus:border-blue-500/50"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
          <Button
            type="button"
            onClick={requestSearch}
            disabled={loading || insufficient || !query.trim()}
            className="lg:self-end h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black px-6"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4 mr-1" /> Cari</>}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setQuery(preset)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-blue-200/60 hover:text-white hover:border-blue-500/30 transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/25 px-5 py-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      {fullQuery && !error && !loading && (
        <div className="rounded-2xl bg-green-500/10 border border-green-500/25 px-5 py-4 text-green-100 text-sm">
          Pencarian selesai. 5 kredit telah digunakan, saldo terbaru {balance} kredit.
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-white font-bold">{filteredPlaces.length} hasil</p>
          {fullQuery && <p className="text-blue-200/40 text-xs mt-1">{fullQuery}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-black/35 border border-white/10 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setFilter("NO_WEBSITE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === "NO_WEBSITE" ? "bg-blue-600 text-white" : "text-blue-200/55 hover:text-white"}`}
            >
              Tanpa Website
            </button>
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === "ALL" ? "bg-blue-600 text-white" : "text-blue-200/55 hover:text-white"}`}
            >
              Semua
            </button>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => downloadCsv(filteredPlaces)}
            disabled={filteredPlaces.length === 0}
            className="h-10 rounded-xl border-green-500/25 bg-green-500/10 text-green-200 hover:bg-green-500/15"
          >
            <Download className="w-4 h-4 mr-1" />
            Download CSV (Wati Format)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredPlaces.map((place) => (
          <div key={place.placeId || `${place.name}-${place.phone}`} className="glass rounded-2xl p-5 border border-white/5 hover:border-blue-500/25 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-white font-bold leading-snug">{place.name || "Tanpa nama"}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Rating rating={place.rating} count={place.ratingCount} />
                  <span className="text-blue-200/40 text-xs">{place.category || "Kategori tidak tersedia"}</span>
                </div>
              </div>
              <span className={`shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center ${place.hasWebsite ? "bg-blue-500/10 border-blue-500/20 text-blue-300" : "bg-amber-500/10 border-amber-500/20 text-amber-300"}`}>
                {place.hasWebsite ? <Globe className="w-5 h-5" /> : <GlobeOff className="w-5 h-5" />}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <p className="flex gap-2 text-blue-100/65 leading-relaxed">
                <MapPin className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
                {place.address || "Alamat tidak tersedia"}
              </p>
              <p className="flex gap-2 text-blue-100/65">
                <Phone className="w-4 h-4 text-green-300 shrink-0 mt-0.5" />
                {place.phone || "Nomor tidak tersedia"}
              </p>
              {place.website && (
                <a href={place.website} target="_blank" rel="noreferrer" className="flex gap-2 text-blue-300 hover:text-white transition-colors break-all">
                  <Globe className="w-4 h-4 shrink-0 mt-0.5" />
                  {place.website}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && places.length === 0 && (
        <div className="glass rounded-3xl p-10 border border-white/5 text-center text-blue-200/35 text-sm">
          Masukkan jenis bisnis dan kota untuk mulai mencari.
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#07111f] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.55)] p-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mb-5">
              <Coins className="w-6 h-6 text-amber-300" />
            </div>
            <h2 className="text-white font-black text-xl">Gunakan 5 kredit?</h2>
            <p className="text-blue-200/55 text-sm mt-2 leading-relaxed">
              Pencarian Lead Finder akan memotong 5 kredit dari saldo Anda. Query: <span className="text-white font-bold">{city.trim() ? `${query.trim()} di ${city.trim()}` : query.trim()}</span>.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                className="h-11 rounded-xl border-white/10 bg-white/5 text-blue-100 hover:bg-white/10"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={runSearch}
                className="h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black flex-1"
              >
                Ya, Cari Lead
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
