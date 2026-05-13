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
    label: "DKI Jakarta",
    cities: ["Jakarta", "Jakarta Selatan", "Jakarta Utara", "Jakarta Barat", "Jakarta Timur", "Jakarta Pusat"],
  },
  {
    label: "Jawa Barat",
    cities: ["Bandung", "Kota Bandung", "Kabupaten Bandung", "Bogor", "Kota Bogor", "Kabupaten Bogor",
             "Bekasi", "Kota Bekasi", "Kabupaten Bekasi", "Depok", "Cimahi", "Tasikmalaya",
             "Cirebon", "Kota Cirebon", "Kabupaten Cirebon", "Sukabumi", "Kota Sukabumi",
             "Karawang", "Purwakarta", "Subang", "Indramayu", "Majalengka", "Kuningan",
             "Garut", "Ciamis", "Banjar", "Pangandaran", "Sumedang"],
  },
  {
    label: "Jawa Tengah",
    cities: ["Semarang", "Kota Semarang", "Solo", "Kota Surakarta", "Yogyakarta",
             "Magelang", "Kota Magelang", "Kabupaten Magelang", "Salatiga", "Pekalongan",
             "Kota Pekalongan", "Tegal", "Kota Tegal", "Kabupaten Tegal", "Purwokerto",
             "Banyumas", "Cilacap", "Kebumen", "Purworejo", "Wonosobo", "Temanggung",
             "Kendal", "Demak", "Kudus", "Jepara", "Pati", "Rembang", "Blora",
             "Grobogan", "Sragen", "Karanganyar", "Wonogiri", "Klaten", "Boyolali",
             "Brebes", "Pemalang", "Batang", "Banjarnegara"],
  },
  {
    label: "DI Yogyakarta",
    cities: ["Yogyakarta", "Sleman", "Bantul", "Gunungkidul", "Kulonprogo", "Wates"],
  },
  {
    label: "Jawa Timur",
    cities: ["Surabaya", "Malang", "Kota Malang", "Kabupaten Malang", "Sidoarjo", "Gresik",
             "Mojokerto", "Kota Mojokerto", "Pasuruan", "Kota Pasuruan", "Probolinggo",
             "Kota Probolinggo", "Batu", "Blitar", "Kota Blitar", "Kediri", "Kota Kediri",
             "Madiun", "Kota Madiun", "Jember", "Banyuwangi", "Situbondo", "Bondowoso",
             "Lumajang", "Jombang", "Nganjuk", "Tulungagung", "Trenggalek", "Ponorogo",
             "Magetan", "Ngawi", "Bojonegoro", "Tuban", "Lamongan", "Bangkalan",
             "Sampang", "Pamekasan", "Sumenep", "Pacitan"],
  },
  {
    label: "Banten",
    cities: ["Tangerang", "Kota Tangerang", "Kabupaten Tangerang", "Tangerang Selatan",
             "Serang", "Kota Serang", "Kabupaten Serang", "Cilegon", "Lebak", "Pandeglang"],
  },
  {
    label: "Bali",
    cities: ["Denpasar", "Kuta", "Seminyak", "Ubud", "Canggu", "Sanur", "Nusa Dua",
             "Jimbaran", "Kerobokan", "Legian", "Gianyar", "Tabanan", "Singaraja",
             "Karangasem", "Klungkung", "Bangli", "Badung", "Buleleng", "Negara"],
  },
  {
    label: "Nusa Tenggara Barat",
    cities: ["Mataram", "Lombok", "Lombok Barat", "Lombok Tengah", "Lombok Timur",
             "Lombok Utara", "Sumbawa", "Sumbawa Besar", "Bima", "Kota Bima", "Dompu"],
  },
  {
    label: "Nusa Tenggara Timur",
    cities: ["Kupang", "Kota Kupang", "Ende", "Maumere", "Labuan Bajo", "Ruteng",
             "Bajawa", "Waingapu", "Waikabubak", "Atambua", "Kefamenanu", "Soe"],
  },
  {
    label: "Sumatera Utara",
    cities: ["Medan", "Binjai", "Tebing Tinggi", "Pematangsiantar", "Tanjungbalai",
             "Sibolga", "Padangsidimpuan", "Gunungsitoli", "Deli Serdang", "Langkat",
             "Karo", "Simalungun", "Asahan", "Labuhanbatu", "Tapanuli Utara",
             "Tapanuli Tengah", "Tapanuli Selatan", "Nias", "Mandailing Natal"],
  },
  {
    label: "Sumatera Barat",
    cities: ["Padang", "Bukittinggi", "Payakumbuh", "Solok", "Kota Solok", "Sawahlunto",
             "Padang Panjang", "Pariaman", "Agam", "Tanah Datar", "Pesisir Selatan",
             "Sijunjung", "Dharmasraya", "Pasaman", "Pasaman Barat", "Lima Puluh Kota",
             "Padang Pariaman", "Kepulauan Mentawai"],
  },
  {
    label: "Riau",
    cities: ["Pekanbaru", "Dumai", "Bengkalis", "Siak", "Kampar", "Rokan Hulu",
             "Rokan Hilir", "Pelalawan", "Indragiri Hulu", "Indragiri Hilir",
             "Kuantan Singingi", "Kepulauan Meranti"],
  },
  {
    label: "Kepulauan Riau",
    cities: ["Batam", "Tanjungpinang", "Bintan", "Karimun", "Natuna", "Lingga",
             "Kepulauan Anambas"],
  },
  {
    label: "Jambi",
    cities: ["Jambi", "Kota Jambi", "Sungai Penuh", "Batanghari", "Muaro Jambi",
             "Tanjung Jabung Barat", "Tanjung Jabung Timur", "Tebo", "Bungo",
             "Sarolangun", "Merangin", "Kerinci"],
  },
  {
    label: "Sumatera Selatan",
    cities: ["Palembang", "Prabumulih", "Pagar Alam", "Lubuklinggau", "Lahat",
             "Muara Enim", "Musi Banyuasin", "Banyuasin", "Ogan Komering Ilir",
             "Ogan Komering Ulu", "Ogan Ilir", "Empat Lawang", "Musi Rawas"],
  },
  {
    label: "Bengkulu",
    cities: ["Bengkulu", "Kota Bengkulu", "Rejang Lebong", "Kepahiang", "Lebong",
             "Bengkulu Utara", "Bengkulu Tengah", "Bengkulu Selatan", "Seluma",
             "Kaur", "Muko-Muko"],
  },
  {
    label: "Lampung",
    cities: ["Bandar Lampung", "Metro", "Lampung Selatan", "Lampung Tengah",
             "Lampung Utara", "Lampung Barat", "Lampung Timur", "Tanggamus",
             "Pringsewu", "Mesuji", "Tulang Bawang", "Tulang Bawang Barat",
             "Pesawaran", "Way Kanan", "Pesisir Barat"],
  },
  {
    label: "Bangka Belitung",
    cities: ["Pangkalpinang", "Bangka", "Bangka Barat", "Bangka Tengah", "Bangka Selatan",
             "Belitung", "Belitung Timur"],
  },
  {
    label: "Kalimantan Barat",
    cities: ["Pontianak", "Singkawang", "Sambas", "Bengkayang", "Landak", "Mempawah",
             "Sanggau", "Sekadau", "Sintang", "Melawi", "Kapuas Hulu", "Ketapang",
             "Kayong Utara", "Kubu Raya"],
  },
  {
    label: "Kalimantan Tengah",
    cities: ["Palangka Raya", "Kotawaringin Barat", "Kotawaringin Timur", "Kapuas",
             "Barito Selatan", "Barito Utara", "Barito Timur", "Murung Raya",
             "Pulang Pisau", "Gunung Mas", "Katingan", "Seruyan", "Sukamara",
             "Lamandau"],
  },
  {
    label: "Kalimantan Selatan",
    cities: ["Banjarmasin", "Banjarbaru", "Banjar", "Barito Kuala", "Tapin",
             "Hulu Sungai Selatan", "Hulu Sungai Tengah", "Hulu Sungai Utara",
             "Balangan", "Tabalong", "Tanah Laut", "Tanah Bumbu", "Kotabaru"],
  },
  {
    label: "Kalimantan Timur",
    cities: ["Samarinda", "Balikpapan", "Bontang", "Kutai Kartanegara", "Kutai Barat",
             "Kutai Timur", "Berau", "Paser", "Penajam Paser Utara", "Mahakam Ulu"],
  },
  {
    label: "Kalimantan Utara",
    cities: ["Tarakan", "Bulungan", "Malinau", "Nunukan", "Tana Tidung"],
  },
  {
    label: "Sulawesi Utara",
    cities: ["Manado", "Bitung", "Tomohon", "Kotamobagu", "Minahasa", "Minahasa Utara",
             "Minahasa Selatan", "Minahasa Tenggara", "Bolaang Mongondow",
             "Bolaang Mongondow Utara", "Bolaang Mongondow Selatan",
             "Bolaang Mongondow Timur", "Kepulauan Sangihe", "Kepulauan Talaud",
             "Kepulauan Siau Tagulandang Biaro"],
  },
  {
    label: "Sulawesi Tengah",
    cities: ["Palu", "Donggala", "Sigi", "Parigi Moutong", "Poso", "Tojo Una-Una",
             "Morowali", "Morowali Utara", "Banggai", "Banggai Kepulauan",
             "Banggai Laut", "Buol", "Toli-Toli"],
  },
  {
    label: "Sulawesi Selatan",
    cities: ["Makassar", "Parepare", "Palopo", "Gowa", "Maros", "Pangkajene",
             "Barru", "Bone", "Soppeng", "Wajo", "Sinjai", "Bulukumba",
             "Bantaeng", "Jeneponto", "Takalar", "Selayar", "Luwu", "Luwu Utara",
             "Luwu Timur", "Toraja Utara", "Tana Toraja", "Enrekang", "Pinrang",
             "Sidenreng Rappang"],
  },
  {
    label: "Sulawesi Tenggara",
    cities: ["Kendari", "Bau-Bau", "Konawe", "Konawe Selatan", "Konawe Utara",
             "Konawe Kepulauan", "Kolaka", "Kolaka Utara", "Kolaka Timur",
             "Bombana", "Muna", "Muna Barat", "Buton", "Buton Utara",
             "Buton Tengah", "Buton Selatan", "Wakatobi"],
  },
  {
    label: "Gorontalo",
    cities: ["Gorontalo", "Kota Gorontalo", "Kabupaten Gorontalo", "Gorontalo Utara",
             "Boalemo", "Pohuwato", "Bone Bolango"],
  },
  {
    label: "Sulawesi Barat",
    cities: ["Mamuju", "Majene", "Polewali Mandar", "Mamasa", "Pasangkayu",
             "Mamuju Tengah"],
  },
  {
    label: "Maluku",
    cities: ["Ambon", "Tual", "Maluku Tengah", "Maluku Tenggara", "Maluku Tenggara Barat",
             "Kepulauan Aru", "Seram Bagian Barat", "Seram Bagian Timur",
             "Maluku Barat Daya", "Buru", "Buru Selatan"],
  },
  {
    label: "Maluku Utara",
    cities: ["Ternate", "Tidore Kepulauan", "Halmahera Barat", "Halmahera Tengah",
             "Halmahera Utara", "Halmahera Selatan", "Halmahera Timur",
             "Kepulauan Sula", "Pulau Taliabu", "Pulau Morotai"],
  },
  {
    label: "Papua",
    cities: ["Jayapura", "Kota Jayapura", "Biak", "Merauke", "Timika", "Nabire",
             "Sorong", "Manokwari", "Fakfak", "Kaimana", "Teluk Bintuni",
             "Teluk Wondama", "Manokwari Selatan", "Pegunungan Arfak",
             "Sarmi", "Keerom", "Jayawijaya", "Puncak Jaya", "Puncak",
             "Pegunungan Bintang", "Yahukimo", "Tolikara", "Mamberamo Raya",
             "Mamberamo Tengah", "Yalimo", "Lanny Jaya", "Nduga", "Intan Jaya",
             "Deiyai", "Dogiyai", "Paniai", "Waropen", "Supiori", "Kepulauan Yapen",
             "Asmat", "Mappi", "Boven Digoel", "Merauke"],
  },
  {
    label: "Papua Barat",
    cities: ["Manokwari", "Sorong", "Kota Sorong", "Fakfak", "Kaimana",
             "Teluk Bintuni", "Teluk Wondama", "Manokwari Selatan",
             "Pegunungan Arfak", "Maybrat", "Tambrauw", "Raja Ampat"],
  },
  {
    label: "Aceh",
    cities: ["Banda Aceh", "Sabang", "Langsa", "Lhokseumawe", "Subulussalam",
             "Aceh Besar", "Pidie", "Pidie Jaya", "Bireuen", "Aceh Utara",
             "Aceh Timur", "Aceh Tamiang", "Aceh Tengah", "Bener Meriah",
             "Gayo Lues", "Aceh Tenggara", "Aceh Selatan", "Aceh Barat",
             "Aceh Barat Daya", "Nagan Raya", "Aceh Jaya", "Simeulue"],
  },
];

// Flat list for search filtering
const ALL_CITIES = CITY_GROUPS.flatMap((g) => g.cities);

type SavedStatus = "idle" | "saving" | "saved" | "error";
type FilterType  = "ALL" | "NO_WEBSITE" | "HAS_WEBSITE";
type StatusFilter = "ALL" | "OPERATIONAL" | "CLOSED_PERMANENTLY";
type SearchMode = "standard" | "deep";
type SortBy = "NO_WEBSITE" | "RATING" | "REVIEWS" | "NAME" | "PHONE";

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
  const [open, setOpen]             = useState(false);
  const [search, setSearch]         = useState("");
  const [activeProvince, setActiveProvince] = useState<string | null>(null);
  const containerRef                = useRef<HTMLDivElement>(null);
  const searchRef                   = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
        setActiveProvince(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  // Search results — flat, across all provinces
  const searchResults = search.trim()
    ? ALL_CITIES.filter((c) => c.toLowerCase().includes(search.toLowerCase())).slice(0, 30)
    : null;

  // Cities to show when a province is selected
  const provinceCities = activeProvince
    ? CITY_GROUPS.find((g) => g.label === activeProvince)?.cities ?? []
    : null;

  const select = (city: string) => {
    onChange(city);
    setOpen(false);
    setSearch("");
    setActiveProvince(null);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
    setActiveProvince(null);
  };

  // Popular cities for quick access
  const POPULAR = ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar",
                   "Yogyakarta", "Denpasar", "Palembang", "Batam"];

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
        <div className="absolute z-50 top-full mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1629]/98 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden"
          style={{ minWidth: "320px" }}>

          {/* Search bar */}
          <div className="p-2.5 border-b border-white/5">
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
              <Search className="w-3.5 h-3.5 text-blue-200/40 shrink-0" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setActiveProvince(null); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && search.trim()) {
                    select(search.trim());
                  }
                }}
                placeholder="Cari kota atau kabupaten..."
                className="flex-1 bg-transparent text-white text-sm placeholder:text-blue-200/30 outline-none"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")}>
                  <X className="w-3 h-3 text-blue-200/40 hover:text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Content area */}
          <div className="flex" style={{ height: "320px" }}>

            {/* Left: Province list */}
            {!search.trim() && (
              <div className="w-36 border-r border-white/5 overflow-y-auto py-1 shrink-0">
                {/* Popular shortcut */}
                <button
                  type="button"
                  onClick={() => setActiveProvince(null)}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                    !activeProvince ? "bg-indigo-500/20 text-indigo-300 font-medium" : "text-blue-200/50 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  ⭐ Populer
                </button>
                <div className="h-px bg-white/5 my-1" />
                {CITY_GROUPS.map((g) => (
                  <button
                    key={g.label}
                    type="button"
                    onClick={() => setActiveProvince(g.label)}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors leading-tight ${
                      activeProvince === g.label
                        ? "bg-indigo-500/20 text-indigo-300 font-medium"
                        : "text-blue-200/50 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            )}

            {/* Right: City list */}
            <div className="flex-1 overflow-y-auto py-1.5">
              {search.trim() ? (
                // Search results
                searchResults!.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <p className="text-blue-200/30 text-xs">Tidak ditemukan</p>
                    <button type="button" onClick={() => select(search.trim())}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                      Gunakan &quot;{search}&quot; langsung
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="px-3 pt-1 pb-1.5 text-[10px] text-blue-200/30">{searchResults!.length} hasil</p>
                    {searchResults!.map((city) => (
                      <button key={city} type="button" onClick={() => select(city)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                          value === city ? "bg-indigo-500/20 text-indigo-300" : "text-blue-100/70 hover:bg-white/5 hover:text-white"
                        }`}>
                        <MapPin className="w-3 h-3 text-indigo-400/50 shrink-0" />
                        {city}
                      </button>
                    ))}
                  </>
                )
              ) : activeProvince ? (
                // Province cities
                <>
                  <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-blue-200/30">
                    {activeProvince}
                  </p>
                  {provinceCities!.map((city) => (
                    <button key={city} type="button" onClick={() => select(city)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                        value === city ? "bg-indigo-500/20 text-indigo-300" : "text-blue-100/70 hover:bg-white/5 hover:text-white"
                      }`}>
                      <MapPin className="w-3 h-3 text-indigo-400/50 shrink-0" />
                      {city}
                    </button>
                  ))}
                </>
              ) : (
                // Popular cities
                <>
                  <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-blue-200/30">
                    Kota Populer
                  </p>
                  {POPULAR.map((city) => (
                    <button key={city} type="button" onClick={() => select(city)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                        value === city ? "bg-indigo-500/20 text-indigo-300" : "text-blue-100/70 hover:bg-white/5 hover:text-white"
                      }`}>
                      <MapPin className="w-3 h-3 text-indigo-400/50 shrink-0" />
                      {city}
                    </button>
                  ))}
                  <div className="h-px bg-white/5 my-1.5 mx-3" />
                  <p className="px-3 pb-1.5 text-[10px] text-blue-200/30">
                    Pilih provinsi di kiri untuk lihat semua kota
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-blue-200/30">{ALL_CITIES.length} kota/kabupaten tersedia</span>
            <button type="button"
              onClick={() => { if (search.trim()) select(search.trim()); }}
              className="text-[10px] text-indigo-400/60 hover:text-indigo-300 transition-colors">
              Tekan Enter untuk input manual
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
  const [mode, setMode]             = useState<SearchMode>("standard");
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
  const [minReviews, setMinReviews] = useState<number>(0);
  const [hasPhoneOnly, setHasPhoneOnly] = useState(true);
  const [hideSaved, setHideSaved]   = useState(true);
  const [resultSearch, setResultSearch] = useState("");
  const [sortBy, setSortBy]         = useState<SortBy>("NO_WEBSITE");
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
        body:    JSON.stringify({ query: q.trim(), city: c.trim(), pages, mode }),
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
  }, [query, city, pages, mode]);

  // Apply all filters
  const filtered = places.filter((p) => {
    const hasPhone = Boolean(p.phoneNorm || p.phone);
    const isSaved = p.alreadySaved || savedIds.has(p.placeId);
    const search = resultSearch.trim().toLowerCase();
    if (hideSaved && isSaved) return false;
    if (filter === "NO_WEBSITE"  && p.hasWebsite)  return false;
    if (filter === "HAS_WEBSITE" && !p.hasWebsite) return false;
    if (hasPhoneOnly && !hasPhone) return false;
    if (statusFilter === "OPERATIONAL"       && p.businessStatus === "CLOSED_PERMANENTLY") return false;
    if (statusFilter === "CLOSED_PERMANENTLY" && p.businessStatus !== "CLOSED_PERMANENTLY") return false;
    if (minRating > 0 && (p.rating ?? 0) < minRating) return false;
    if (minReviews > 0 && (p.ratingCount ?? 0) < minReviews) return false;
    if (search) {
      const haystack = [p.name, p.address, p.category, p.phone, p.website ?? ""].join(" ").toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "NO_WEBSITE") {
      if (a.hasWebsite !== b.hasWebsite) return a.hasWebsite ? 1 : -1;
      if (Boolean(a.phoneNorm || a.phone) !== Boolean(b.phoneNorm || b.phone)) return a.phoneNorm || a.phone ? -1 : 1;
      return (b.ratingCount ?? 0) - (a.ratingCount ?? 0);
    }
    if (sortBy === "RATING") return (b.rating ?? 0) - (a.rating ?? 0);
    if (sortBy === "REVIEWS") return (b.ratingCount ?? 0) - (a.ratingCount ?? 0);
    if (sortBy === "PHONE") return Number(Boolean(b.phoneNorm || b.phone)) - Number(Boolean(a.phoneNorm || a.phone));
    return a.name.localeCompare(b.name, "id");
  });

  const selectableFiltered = filtered.filter((p) => !p.alreadySaved && !savedIds.has(p.placeId) && p.phoneNorm);

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });

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
  const noPhoneCount      = places.filter((p) => !(p.phoneNorm || p.phone)).length;
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

          <div className="grid sm:grid-cols-2 gap-3">
            {([
              {
                value: "standard" as const,
                title: "Standard",
                description: "Satu query utama, maksimal 60 leads.",
                badge: `${pages * 20} hasil`,
              },
              {
                value: "deep" as const,
                title: "Deep Search",
                description: "Multi-keyword dan multi-area, hasil lebih luas.",
                badge: "hingga 240",
              },
            ]).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  mode === option.value
                    ? "border-indigo-500/45 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.12)]"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-white">{option.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-blue-200/45">{option.description}</p>
                  </div>
                  <span className={`shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-black ${
                    mode === option.value
                      ? "border-indigo-400/30 bg-indigo-400/10 text-indigo-300"
                      : "border-white/10 bg-white/5 text-blue-200/45"
                  }`}>
                    {option.badge}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button type="submit" disabled={!query.trim() || loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 px-6">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? (mode === "deep" ? "Deep Search berjalan..." : `Mencari ${pages * 20} data...`) : "Cari Calon Klien"}
            </Button>

            {/* Max results */}
            <div className={`flex items-center gap-1.5 ${mode === "deep" ? "opacity-45 pointer-events-none" : ""}`}>
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
                {noPhoneCount > 0      && <span className="text-amber-300/80"><strong>{noPhoneCount}</strong> tanpa nomor</span>}
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

          <div className="grid lg:grid-cols-[1fr_220px] gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <Search className="w-4 h-4 text-blue-200/35 shrink-0" />
              <input
                value={resultSearch}
                onChange={(event) => setResultSearch(event.target.value)}
                placeholder="Cari di hasil: nama, alamat, kategori..."
                className="w-full bg-transparent text-sm text-white placeholder:text-blue-200/30 outline-none"
              />
              {resultSearch && (
                <button type="button" onClick={() => setResultSearch("")} className="text-blue-200/35 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortBy)}
              className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-indigo-500/45"
            >
              <option className="bg-[#0f1629] text-white" value="NO_WEBSITE">Tanpa website dulu</option>
              <option className="bg-[#0f1629] text-white" value="REVIEWS">Review terbanyak</option>
              <option className="bg-[#0f1629] text-white" value="RATING">Rating tertinggi</option>
              <option className="bg-[#0f1629] text-white" value="PHONE">Ada nomor dulu</option>
              <option className="bg-[#0f1629] text-white" value="NAME">Nama A-Z</option>
            </select>
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
            <button onClick={() => setHasPhoneOnly((current) => !current)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                hasPhoneOnly
                  ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                  : "bg-white/5 border-white/10 text-blue-200/50 hover:text-white"
              }`}>
              Ada nomor
            </button>
            <button onClick={() => setHideSaved((current) => !current)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                hideSaved
                  ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                  : "bg-white/5 border-white/10 text-blue-200/50 hover:text-white"
              }`}>
              Sembunyikan duplikat
            </button>
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

            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
              <span className="text-blue-200/40 text-xs">Ulasan:</span>
              {[0, 10, 50, 100, 500].map((reviews) => (
                <button key={reviews} onClick={() => setMinReviews(reviews)}
                  className={`px-1.5 py-0.5 rounded text-xs transition-all ${
                    minReviews === reviews ? "text-indigo-300 font-semibold" : "text-blue-200/40 hover:text-white"
                  }`}>
                  {reviews === 0 ? "Semua" : `${reviews}+`}
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
                const isSaved = p.alreadySaved || savedIds.has(p.placeId);
                const isSelectable = p.phoneNorm && !isSaved && !isClosed;

                return (
                  <div key={p.placeId}
                    onClick={() => isSelectable && toggleSelect(p.placeId)}
                    className={`glass rounded-2xl p-4 border transition-all ${
                      isSaved
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
                        {isSaved
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
                            {isSaved && (
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
