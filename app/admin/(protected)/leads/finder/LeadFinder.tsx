"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Search, Loader2, Globe, GlobeOff, CheckSquare, Square,
  Save, ChevronRight, DatabaseZap, Star, Download,
  MapPin, Clock, XCircle, History, Crosshair, ChevronDown, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlaceLead } from "@/app/api/admin/leads/finder/route";

const PRESETS = [
  "restoran", "kafe", "salon kecantikan", "bengkel motor", "apotek",
  "klinik", "laundry", "toko pakaian", "toko elektronik", "warung makan",
  "minimarket", "konter hp", "travel agent", "percetakan", "jasa fotografi",
];

type CityGroup = { label: string; cities: string[] };

const CITY_GROUPS: CityGroup[] = [
  {
    label: "Jawa",
    cities: ["Jakarta", "Jakarta Selatan", "Jakarta Utara", "Jakarta Barat", "Jakarta Timur", "Jakarta Pusat",
             "Bandung", "Surabaya", "Semarang", "Yogyakarta", "Solo", "Malang",
             "Tangerang", "Depok", "Bekasi", "Bogor", "Cirebon", "Serang", "Cilegon"],
  },
  {
    label: "Bali & Nusa Tenggara",
    cities: ["Denpasar", "Kuta", "Seminyak", "Ubud", "Canggu", "Sanur", "Nusa Dua",
             "Gianyar", "Tabanan", "Singaraja", "Karangasem", "Jimbaran"],
  },
  {
    label: "Sumatera",
    cities: ["Medan", "Palembang", "Pekanbaru", "Batam", "Padang", "Lampung"],
  },
  {
    label: "Kalimantan",
    cities: ["Balikpapan", "Samarinda", "Pontianak", "Banjarmasin"],
  },
  {
    label: "Sulawesi & Timur",
    cities: ["Makassar", "Manado"],
  },
];

// Flat list for search filtering
const ALL_CITIES = CITY_GROUPS.flatMap((g) => g.cities);

type SavedStatus = "idle" | "saving" | "saved" | "error";
type FilterType  = "ALL" | "NO_WEBSITE" | "HAS_WEBSITE";
type StatusFilter = "ALL" | "OPERATIONAL" | "CLOSED_PERMANENTLY";

type SearchHistory = {
  query:     string;
  city:      string;
  total:     number;
  timestamp: number;
};

function StarRating({ rating, count }: { rating: number | null; count: number | null }) {
  if (!rating) return null;
  return (
    <span className="flex items-center gap-1 text-[11px] text-yellow-400/80">
      <Star className="w-3 h-3 fill-yellow-400/80 text-yellow-400/80" />
      <span className="font-medium">{rating.toFixed(1)}</span>
      {count != null && <span className="text-blue-200/40">({count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count})</span>}
    </span>
  );
}

function BusinessStatusBadge({ status }: { status: PlaceLead["businessStatus"] }) {
  if (!status || status === "OPERATIONAL") return null;
  if (status === "CLOSED_PERMANENTLY") {
    return (
      <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
        <XCircle className="w-2.5 h-2.5" /> Tutup Permanen
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
      <Clock className="w-2.5 h-2.5" /> Tutup Sementara
    </span>
  );
}

// ── Custom City Dropdown ───────────────────────────────────────────────────────
function CityDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState("");
  const containerRef          = useRef<HTMLDivElement>(null);
  const searchRef             = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const filtered = search.trim()
    ? ALL_CITIES.filter((c) => c.toLowerCase().includes(search.toLowerCase()))
    : null; // null = show grouped

  const select = (city: string) => {
    onChange(city);
    setOpen(false);
    setSearch("");
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 bg-white/5 border rounded-xl px-4 py-2.5 text-sm transition-all outline-none ${
          open ? "border-indigo-500/50 bg-white/8" : "border-white/10 hover:border-white/20"
        }`}
      >
        <span className={`flex items-center gap-2 truncate ${value ? "text-white" : "text-blue-200/30"}`}>
          {value ? (
            <>
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              {value}
            </>
          ) : (
            "Pilih kota / area..."
          )}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {value && (
            <span onClick={clear}
              className="p-0.5 rounded hover:bg-white/10 text-blue-200/40 hover:text-white transition-colors">
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-blue-200/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 top-full mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1629]/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Search inside dropdown */}
          <div className="p-2 border-b border-white/5">
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
              <Search className="w-3.5 h-3.5 text-blue-200/40 shrink-0" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kota..."
                className="flex-1 bg-transparent text-white text-sm placeholder:text-blue-200/30 outline-none"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")}>
                  <X className="w-3 h-3 text-blue-200/40 hover:text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="max-h-64 overflow-y-auto py-1.5 scrollbar-thin">
            {filtered ? (
              // Search results — flat list
              filtered.length === 0 ? (
                <p className="text-blue-200/30 text-xs text-center py-4">Tidak ditemukan</p>
              ) : (
                filtered.map((city) => (
                  <button key={city} type="button" onClick={() => select(city)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors ${
                      value === city
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "text-blue-100/70 hover:bg-white/5 hover:text-white"
                    }`}>
                    <MapPin className="w-3.5 h-3.5 text-indigo-400/50 shrink-0" />
                    {city}
                  </button>
                ))
              )
            ) : (
              // Grouped list
              CITY_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="px-4 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-blue-200/30">
                    {group.label}
                  </p>
                  {group.cities.map((city) => (
                    <button key={city} type="button" onClick={() => select(city)}
                      className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors ${
                        value === city
                          ? "bg-indigo-500/20 text-indigo-300"
                          : "text-blue-100/70 hover:bg-white/5 hover:text-white"
                      }`}>
                      <MapPin className="w-3.5 h-3.5 text-indigo-400/50 shrink-0" />
                      {city}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Or type manually */}
          <div className="p-2 border-t border-white/5">
            <button type="button"
              onClick={() => { onChange(search || value); setOpen(false); setSearch(""); }}
              className="w-full text-center text-[11px] text-blue-200/30 hover:text-blue-200/60 py-1 transition-colors">
              atau ketik manual lalu tekan Enter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeadFinder() {
  const [query, setQuery]           = useState("");
  const [city, setCity]             = useState("");
  const [pages, setPages]           = useState(3);
  const [loading, setLoading]       = useState(false);
  const [places, setPlaces]         = useState<PlaceLead[]>([]);
  const [searched, setSearched]     = useState(false);
  const [fullQuery, setFullQuery]   = useState("");
  const [usedBias, setUsedBias]     = useState(false);
  const [error, setError]           = useState("");
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [filter, setFilter]         = useState<FilterType>("NO_WEBSITE");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("OPERATIONAL");
  const [minRating, setMinRating]   = useState<number>(0);
  const [savedIds, setSavedIds]     = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<SavedStatus>("idle");
  const [saveMsg, setSaveMsg]       = useState("");
  const [history, setHistory]       = useState<SearchHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleSearch = useCallback(async (e?: React.FormEvent, overrideQuery?: string, overrideCity?: string) => {
    e?.preventDefault();
    const q = overrideQuery ?? query;
    const c = overrideCity  ?? city;
    if (!q.trim()) return;

    setLoading(true);
    setError("");
    setPlaces([]);
    setSelected(new Set());
    setSearched(false);
    setShowHistory(false);

    try {
      const res = await fetch("/api/admin/leads/finder", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ query: q.trim(), city: c.trim(), pages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil data");

      setPlaces(data.places);
      setFullQuery(data.fullQuery);
      setUsedBias(data.usedBias);
      setSearched(true);

      // Save to history (max 10 entries, no duplicates)
      setHistory((prev) => {
        const entry: SearchHistory = { query: q.trim(), city: c.trim(), total: data.total, timestamp: Date.now() };
        const filtered = prev.filter((h) => !(h.query === entry.query && h.city === entry.city));
        return [entry, ...filtered].slice(0, 10);
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [query, city, pages]);

  // Apply all filters
  const filtered = places.filter((p) => {
    if (savedIds.has(p.placeId)) return false;
    if (filter === "NO_WEBSITE"  && p.hasWebsite)  return false;
    if (filter === "HAS_WEBSITE" && !p.hasWebsite) return false;
    if (statusFilter === "OPERATIONAL"       && p.businessStatus === "CLOSED_PERMANENTLY") return false;
    if (statusFilter === "CLOSED_PERMANENTLY" && p.businessStatus !== "CLOSED_PERMANENTLY") return false;
    if (minRating > 0 && (p.rating ?? 0) < minRating) return false;
    return true;
  });

  const selectableFiltered = filtered.filter((p) => !p.alreadySaved && p.phoneNorm);

  const toggleSelect = (id: string) =>
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const toggleAll = () =>
    setSelected(
      selected.size === selectableFiltered.length
        ? new Set()
        : new Set(selectableFiltered.map((p) => p.placeId))
    );

  const handleSave = async () => {
    const toSave = filtered.filter((p) => selected.has(p.placeId) && p.phoneNorm);
    if (!toSave.length) { setSaveMsg("Pastikan lead yang dipilih memiliki nomor telepon."); return; }

    setSaveStatus("saving");
    setSaveMsg("");

    try {
      const res = await fetch("/api/admin/leads", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          toSave.map((p) => ({
            name:           p.name,
            businessName:   p.name,
            whatsapp:       p.phoneNorm,
            currentWebsite: p.website ?? null,
            message: [
              `📍 ${p.address}`,
              p.category ? `🏷️ Kategori: ${p.category}` : null,
              p.rating    ? `⭐ Rating: ${p.rating} (${p.ratingCount ?? 0} ulasan)` : null,
              `\n🔍 Ditemukan via Google Maps: "${fullQuery}"`,
            ].filter(Boolean).join("\n"),
            notes: "Lead dari Google Maps Finder",
          })),
        ),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Gagal menyimpan"); }

      const newSaved = new Set([...savedIds, ...toSave.map((p) => p.placeId)]);
      setSavedIds(newSaved);
      setSelected(new Set());
      setSaveStatus("saved");
      setSaveMsg(`${toSave.length} lead berhasil disimpan!`);
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      setSaveStatus("error");
      setSaveMsg((err as Error).message);
    }
  };

  // Export filtered results as CSV
  const handleExportCSV = () => {
    const rows = [
      ["Nama", "Alamat", "Telepon", "Website", "Kategori", "Rating", "Jumlah Ulasan", "Status Bisnis"],
      ...filtered.map((p) => [
        p.name,
        p.address,
        p.phone,
        p.website ?? "",
        p.category,
        p.rating?.toString() ?? "",
        p.ratingCount?.toString() ?? "",
        p.businessStatus ?? "OPERATIONAL",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `leads-${fullQuery.replace(/\s+/g, "-")}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const noWebsiteCount    = places.filter((p) => !p.hasWebsite && !p.alreadySaved && !savedIds.has(p.placeId)).length;
  const alreadySavedCount = places.filter((p) => p.alreadySaved || savedIds.has(p.placeId)).length;
  const closedCount       = places.filter((p) => p.businessStatus === "CLOSED_PERMANENTLY").length;

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="glass rounded-3xl p-6 border border-white/5">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-blue-200/60 text-xs font-medium">Kategori Bisnis *</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="contoh: restoran, salon, klinik..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-blue-200/30 outline-none focus:border-indigo-500/50 text-sm"
              />
            </div>
            {/* City */}
            <div className="space-y-1.5">
              <label className="text-blue-200/60 text-xs font-medium flex items-center gap-1.5">
                Kota / Area
                <span className="text-indigo-400/60 text-[10px] flex items-center gap-0.5">
                  <Crosshair className="w-2.5 h-2.5" /> Presisi lebih akurat
                </span>
              </label>
              <CityDropdown value={city} onChange={setCity} />
            </div>
          </div>

          {/* Category presets */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p} type="button" onClick={() => setQuery(p)}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                  query === p
                    ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                    : "bg-white/5 border-white/10 text-blue-200/50 hover:text-white hover:border-white/20"
                }`}>
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button type="submit" disabled={!query.trim() || loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 px-6">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? `Mencari ${pages * 20} data...` : "Cari Calon Klien"}
            </Button>

            {/* Max results */}
            <div className="flex items-center gap-1.5">
              <span className="text-blue-200/40 text-xs">Maks hasil:</span>
              {([1, 2, 3] as const).map((n) => (
                <button key={n} type="button" onClick={() => setPages(n)}
                  className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                    pages === n
                      ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                      : "bg-white/5 border-white/10 text-blue-200/50 hover:text-white"
                  }`}>
                  {n * 20}
                </button>
              ))}
            </div>

            {/* History toggle */}
            {history.length > 0 && (
              <button type="button" onClick={() => setShowHistory((v) => !v)}
                className="flex items-center gap-1.5 text-blue-200/40 hover:text-white text-xs transition-colors">
                <History className="w-3.5 h-3.5" />
                Riwayat ({history.length})
              </button>
            )}
          </div>
        </form>

        {/* Search history dropdown */}
        {showHistory && history.length > 0 && (
          <div className="mt-4 border-t border-white/5 pt-4 space-y-1.5">
            <p className="text-blue-200/40 text-xs mb-2">Pencarian terakhir:</p>
            {history.map((h, i) => (
              <button key={i} type="button"
                onClick={() => {
                  setQuery(h.query);
                  setCity(h.city);
                  handleSearch(undefined, h.query, h.city);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left">
                <span className="flex items-center gap-2 text-sm text-white/70">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400/60 shrink-0" />
                  <span>{h.query}{h.city ? ` · ${h.city}` : ""}</span>
                </span>
                <span className="text-blue-200/30 text-xs shrink-0">{h.total} hasil</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
          {error}
        </p>
      )}

      {/* Results */}
      {searched && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-white font-semibold flex items-center gap-2 flex-wrap">
                {places.length} bisnis ditemukan
                {usedBias && (
                  <span className="text-[10px] text-indigo-400/70 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Crosshair className="w-2.5 h-2.5" /> Lokasi presisi aktif
                  </span>
                )}
              </p>
              <p className="text-xs text-blue-200/40 flex flex-wrap gap-3">
                {noWebsiteCount > 0    && <span className="text-red-400"><strong>{noWebsiteCount}</strong> tanpa website</span>}
                {alreadySavedCount > 0 && <span><strong>{alreadySavedCount}</strong> sudah di DB</span>}
                {closedCount > 0       && <span className="text-orange-400/70"><strong>{closedCount}</strong> tutup permanen</span>}
              </p>
            </div>

            {/* Export CSV */}
            {filtered.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleExportCSV}
                className="gap-2 text-xs border-white/10 text-blue-200/60 hover:text-white hover:border-white/20 shrink-0">
                <Download className="w-3.5 h-3.5" />
                Export CSV ({filtered.length})
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Website filter */}
            {(["NO_WEBSITE", "ALL", "HAS_WEBSITE"] as FilterType[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  filter === f
                    ? f === "NO_WEBSITE"  ? "bg-red-500/20 border-red-500/40 text-red-300"
                      : f === "HAS_WEBSITE" ? "bg-green-500/20 border-green-500/40 text-green-300"
                      : "bg-white/15 border-white/20 text-white"
                    : "bg-white/5 border-white/10 text-blue-200/50 hover:text-white"
                }`}>
                {f === "NO_WEBSITE" ? "🔴 Tanpa Website" : f === "HAS_WEBSITE" ? "🟢 Punya Website" : "Semua"}
              </button>
            ))}

            {/* Status filter */}
            <div className="w-px bg-white/10 mx-1" />
            <button onClick={() => setStatusFilter(statusFilter === "OPERATIONAL" ? "ALL" : "OPERATIONAL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                statusFilter === "OPERATIONAL"
                  ? "bg-green-500/20 border-green-500/40 text-green-300"
                  : "bg-white/5 border-white/10 text-blue-200/50 hover:text-white"
              }`}>
              ✅ Aktif saja
            </button>

            {/* Rating filter */}
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
              <Star className="w-3 h-3 text-yellow-400/60" />
              <span className="text-blue-200/40 text-xs">Min:</span>
              {[0, 3, 3.5, 4, 4.5].map((r) => (
                <button key={r} onClick={() => setMinRating(r)}
                  className={`px-1.5 py-0.5 rounded text-xs transition-all ${
                    minRating === r ? "text-yellow-300 font-semibold" : "text-blue-200/40 hover:text-white"
                  }`}>
                  {r === 0 ? "Semua" : r}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk action bar */}
          {selectableFiltered.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-4 py-3">
              <button onClick={toggleAll} className="flex items-center gap-2 text-sm text-indigo-300 hover:text-white transition-colors">
                {selected.size === selectableFiltered.length && selectableFiltered.length > 0
                  ? <CheckSquare className="w-4 h-4" />
                  : <Square className="w-4 h-4" />}
                {selected.size === 0 ? `Pilih Semua (${selectableFiltered.length})` : `${selected.size} dipilih`}
              </button>
              <div className="flex items-center gap-3">
                {saveMsg && (
                  <span className={`text-xs ${saveStatus === "error" ? "text-red-400" : "text-green-400"}`}>
                    {saveMsg}
                  </span>
                )}
                <Button onClick={handleSave}
                  disabled={selected.size === 0 || saveStatus === "saving"}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 h-8 text-xs px-4">
                  {saveStatus === "saving"
                    ? <><Loader2 className="w-3 h-3 animate-spin" /> Menyimpan...</>
                    : <><Save className="w-3 h-3" /> Simpan {selected.size > 0 ? selected.size : ""} Lead</>}
                </Button>
              </div>
            </div>
          )}

          {/* Place cards */}
          {filtered.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center border border-white/5">
              <p className="text-blue-200/40">Tidak ada hasil untuk filter ini.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {filtered.map((p) => {
                const isClosed    = p.businessStatus === "CLOSED_PERMANENTLY";
                const isSelectable = p.phoneNorm && !p.alreadySaved && !isClosed;

                return (
                  <div key={p.placeId}
                    onClick={() => isSelectable && toggleSelect(p.placeId)}
                    className={`glass rounded-2xl p-4 border transition-all ${
                      p.alreadySaved
                        ? "opacity-50 cursor-default border-white/5 bg-white/2"
                        : isClosed
                          ? "opacity-40 cursor-not-allowed border-white/5"
                          : !p.phoneNorm
                            ? "opacity-50 cursor-not-allowed border-white/5"
                            : selected.has(p.placeId)
                              ? "cursor-pointer border-indigo-500/50 bg-indigo-500/5"
                              : "cursor-pointer border-white/5 hover:border-white/15"
                    }`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {p.alreadySaved
                          ? <DatabaseZap className="w-4 h-4 text-blue-200/30" />
                          : isSelectable
                            ? selected.has(p.placeId)
                              ? <CheckSquare className="w-4 h-4 text-indigo-400" />
                              : <Square className="w-4 h-4 text-blue-200/30" />
                            : <Square className="w-4 h-4 text-white/10" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Name + badges */}
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <p className="text-white font-semibold text-sm leading-snug line-clamp-1">{p.name}</p>
                          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                            {p.alreadySaved && (
                              <span className="flex items-center gap-1 text-[10px] text-blue-200/50 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                                <DatabaseZap className="w-2.5 h-2.5" /> Sudah di DB
                              </span>
                            )}
                            <BusinessStatusBadge status={p.businessStatus} />
                            {p.hasWebsite
                              ? <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                                  <Globe className="w-2.5 h-2.5" /> Punya
                                </span>
                              : <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                                  <GlobeOff className="w-2.5 h-2.5" /> Belum
                                </span>}
                          </div>
                        </div>

                        {/* Category + rating */}
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          {p.category && <p className="text-blue-200/40 text-[11px]">{p.category}</p>}
                          <StarRating rating={p.rating} count={p.ratingCount} />
                          {p.isOpen === true  && <span className="text-[10px] text-green-400/70">● Buka</span>}
                          {p.isOpen === false && <span className="text-[10px] text-red-400/70">● Tutup</span>}
                        </div>

                        <p className="text-blue-200/50 text-xs mt-1.5 line-clamp-2">{p.address}</p>

                        {p.phone
                          ? <p className="text-indigo-300 text-xs mt-1.5 font-mono">{p.phone}</p>
                          : <p className="text-white/20 text-xs mt-1.5 italic">Tidak ada nomor telepon</p>}

                        {p.website && (
                          <a href={p.website} target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-400 text-[11px] mt-1 flex items-center gap-1 hover:underline w-fit">
                            <ChevronRight className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{p.website.replace(/^https?:\/\//, "")}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
