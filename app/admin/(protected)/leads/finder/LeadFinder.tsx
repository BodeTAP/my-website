"use client";

import { useState } from "react";
import { Search, Loader2, Globe, GlobeOff, CheckSquare, Square, Save, ChevronRight, DatabaseZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlaceLead } from "@/app/api/admin/leads/finder/route";

const PRESETS = [
  "restoran", "kafe", "salon kecantikan", "bengkel motor", "apotek",
  "klinik", "laundry", "toko pakaian", "toko elektronik", "warung makan",
  "minimarket", "konter hp", "travel agent", "percetakan", "jasa fotografi",
];

type SavedStatus = "idle" | "saving" | "saved" | "error";

export default function LeadFinder() {
  const [query, setQuery]         = useState("");
  const [city, setCity]           = useState("");
  const [loading, setLoading]     = useState(false);
  const [places, setPlaces]       = useState<PlaceLead[]>([]);
  const [searched, setSearched]   = useState(false);
  const [error, setError]         = useState("");
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [filter, setFilter]       = useState<"ALL" | "NO_WEBSITE" | "HAS_WEBSITE">("NO_WEBSITE");
  const [savedIds, setSavedIds]   = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<SavedStatus>("idle");
  const [saveMsg, setSaveMsg]     = useState("");

  const fullQuery = city.trim() ? `${query} di ${city.trim()}` : query;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setPlaces([]);
    setSelected(new Set());
    setSearched(false);

    try {
      const res = await fetch("/api/admin/leads/finder", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ query: fullQuery }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil data");
      setPlaces(data.places);
      setSearched(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = places.filter((p) => {
    if (savedIds.has(p.placeId)) return false; // sudah disimpan sesi ini
    if (filter === "NO_WEBSITE") return !p.hasWebsite;
    if (filter === "HAS_WEBSITE") return p.hasWebsite;
    return true;
  });

  // hanya lead baru (belum di DB) yang bisa dipilih
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
            message:        `📍 ${p.address}${p.category ? `\n🏷️ Kategori: ${p.category}` : ""}\n\n🔍 Ditemukan via Google Maps: "${fullQuery}"`,
            notes:          "Lead dari Google Maps Finder",
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

  const noWebsiteCount  = places.filter((p) => !p.hasWebsite && !p.alreadySaved && !savedIds.has(p.placeId)).length;
  const alreadySavedCount = places.filter((p) => p.alreadySaved || savedIds.has(p.placeId)).length;

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="glass rounded-3xl p-6 border border-white/5">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-blue-200/60 text-xs font-medium">Kategori Bisnis *</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="contoh: restoran, salon, klinik..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-blue-200/30 outline-none focus:border-indigo-500/50 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-blue-200/60 text-xs font-medium">Kota / Area</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="contoh: Bandung, Jakarta Selatan..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-blue-200/30 outline-none focus:border-indigo-500/50 text-sm"
              />
            </div>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p} type="button" onClick={() => setQuery(p)}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                  query === p ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" : "bg-white/5 border-white/10 text-blue-200/50 hover:text-white hover:border-white/20"
                }`}>
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!query.trim() || loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 px-6">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? "Mencari..." : "Cari Calon Klien"}
            </Button>
            {fullQuery && !loading && (
              <span className="text-blue-200/40 text-xs">Query: &ldquo;{fullQuery}&rdquo;</span>
            )}
          </div>
        </form>
      </div>

      {error && <p className="text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">{error}</p>}

      {/* Results */}
      {searched && (
        <div className="space-y-4">
          {/* Summary + Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <p className="text-white font-semibold">
                {places.length} bisnis ditemukan
                {noWebsiteCount > 0 && (
                  <span className="ml-2 text-sm text-red-400 font-normal">
                    · <span className="font-semibold">{noWebsiteCount}</span> tanpa website
                  </span>
                )}
                {alreadySavedCount > 0 && (
                  <span className="ml-2 text-sm text-blue-200/40 font-normal">
                    · <span className="font-semibold">{alreadySavedCount}</span> sudah di DB
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {(["NO_WEBSITE", "ALL", "HAS_WEBSITE"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    filter === f
                      ? f === "NO_WEBSITE" ? "bg-red-500/20 border-red-500/40 text-red-300"
                        : f === "HAS_WEBSITE" ? "bg-green-500/20 border-green-500/40 text-green-300"
                        : "bg-white/15 border-white/20 text-white"
                      : "bg-white/5 border-white/10 text-blue-200/50 hover:text-white"
                  }`}>
                  {f === "NO_WEBSITE" ? "🔴 Tanpa Website" : f === "HAS_WEBSITE" ? "🟢 Punya Website" : "Semua"}
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
              {filtered.map((p) => (
                <div key={p.placeId}
                  onClick={() => p.phoneNorm && !p.alreadySaved && toggleSelect(p.placeId)}
                  className={`glass rounded-2xl p-4 border transition-all ${
                    p.alreadySaved
                      ? "opacity-50 cursor-default border-white/5 bg-white/2"
                      : !p.phoneNorm ? "opacity-50 cursor-not-allowed border-white/5"
                      : selected.has(p.placeId)
                        ? "cursor-pointer border-indigo-500/50 bg-indigo-500/5"
                        : "cursor-pointer border-white/5 hover:border-white/15"
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {p.alreadySaved
                        ? <DatabaseZap className="w-4 h-4 text-blue-200/30" />
                        : p.phoneNorm
                          ? selected.has(p.placeId) ? <CheckSquare className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4 text-blue-200/30" />
                          : <Square className="w-4 h-4 text-white/10" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="text-white font-semibold text-sm leading-snug line-clamp-1">{p.name}</p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {p.alreadySaved && (
                            <span className="flex items-center gap-1 text-[10px] text-blue-200/50 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                              <DatabaseZap className="w-2.5 h-2.5" /> Sudah di DB
                            </span>
                          )}
                          {p.hasWebsite
                            ? <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                                <Globe className="w-2.5 h-2.5" /> Punya
                              </span>
                            : <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                                <GlobeOff className="w-2.5 h-2.5" /> Belum
                              </span>}
                        </div>
                      </div>
                      {p.category && <p className="text-blue-200/40 text-[11px] mt-0.5">{p.category}</p>}
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
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
