"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  ChevronDown,
  ChevronRight,
  Clock,
  Coins,
  Crosshair,
  Download,
  Globe,
  GlobeOff,
  History,
  Loader2,
  MapPin,
  Phone,
  FolderOpen,
  Save,
  Search,
  Star,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlaceLead, SocialPlatform, SocialScanStatus } from "@/app/api/portal/tools/lead-finder/route";

type FilterType = "ALL" | "NO_WEBSITE" | "HAS_WEBSITE";
type StatusFilter = "ALL" | "OPERATIONAL" | "CLOSED_PERMANENTLY";
type SearchMode = "standard" | "deep";
type SortBy = "NO_WEBSITE" | "RATING" | "REVIEWS" | "NAME" | "PHONE" | "SOCIAL";
type SocialFilter = "ALL" | "ANY" | "NONE" | SocialPlatform;
type CityGroup = { label: string; cities: string[] };
type SearchHistory = {
  query: string;
  city: string;
  total: number;
  timestamp: number;
};
type SavedLeadList = {
  id: string;
  name: string;
  query: string;
  city: string | null;
  mode: string;
  socialScan: boolean;
  total: number;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_CREDIT_COST: Record<SearchMode, number> = {
  standard: 5,
  deep: 20,
};

const DEFAULT_SOCIAL_SCAN_COST = 10;

const SOCIAL_PLATFORMS: Array<{ value: SocialPlatform; label: string }> = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X" },
];

const PRESETS = [
  "restoran", "kafe", "salon kecantikan", "bengkel motor", "apotek",
  "klinik", "laundry", "toko pakaian", "toko elektronik", "warung makan",
  "minimarket", "konter hp", "travel agent", "percetakan", "jasa fotografi",
];

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

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function stripIndonesiaPrefix(phone: string) {
  return phone.replace(/\D/g, "").replace(/^62/, "").replace(/^0/, "");
}

function getSocialPlatforms(place: PlaceLead) {
  return SOCIAL_PLATFORMS.filter((platform) => place.socialScan.links[platform.value]);
}

function hasAnySocial(place: PlaceLead) {
  return getSocialPlatforms(place).length > 0;
}

function socialStatusLabel(status: SocialScanStatus) {
  if (status === "FOUND") return "Ditemukan";
  if (status === "NOT_FOUND") return "Tidak ditemukan";
  if (status === "NO_WEBSITE") return "Tidak ada website";
  if (status === "FAILED") return "Gagal scan";
  if (status === "SKIPPED") return "Dilewati";
  return "Tidak discan";
}

function socialStatusText(place: PlaceLead) {
  const label = socialStatusLabel(place.socialScan.status);
  return place.socialScan.error ? `${label}: ${place.socialScan.error}` : label;
}

function downloadCsv(places: PlaceLead[]) {
  const header = [
    "Nama Bisnis",
    "Kategori",
    "Alamat",
    "Telepon",
    "WhatsApp",
    "Website",
    "Status Website",
    "Rating",
    "Jumlah Ulasan",
    "Status Bisnis",
    "Sedang Buka",
    "Status Social Scan",
    "Detail Social Scan",
    "Instagram",
    "Facebook",
    "TikTok",
    "LinkedIn",
    "YouTube",
    "X",
  ];
  const rows = places.map((place) => {
    const phone = place.phoneNorm || place.phone;
    return [
      place.name,
      place.category,
      place.address,
      place.phone,
      phone ? `62${stripIndonesiaPrefix(phone)}` : "",
      place.website ?? "",
      place.hasWebsite ? "Ada" : "Tidak ada",
      place.rating?.toString() ?? "",
      place.ratingCount?.toString() ?? "",
      place.businessStatus ?? "",
      place.isOpen === null ? "" : place.isOpen ? "Ya" : "Tidak",
      socialStatusLabel(place.socialScan.status),
      place.socialScan.error ?? "",
      place.socialScan.links.instagram ?? "",
      place.socialScan.links.facebook ?? "",
      place.socialScan.links.tiktok ?? "",
      place.socialScan.links.linkedin ?? "",
      place.socialScan.links.youtube ?? "",
      place.socialScan.links.x ?? "",
    ].map(csvEscape).join(",");
  });

  const csv = ["\uFEFF" + header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function StarRating({ rating, count }: { rating: number | null; count: number | null }) {
  if (!rating) return null;
  return (
    <span className="flex items-center gap-1 text-[11px] text-amber-500">
      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
      <span className="font-semibold text-slate-700">{rating.toFixed(1)}</span>
      {count != null && <span className="text-slate-400 font-normal">({count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count})</span>}
    </span>
  );
}

function BusinessStatusBadge({ status }: { status: PlaceLead["businessStatus"] }) {
  if (!status || status === "OPERATIONAL") return null;
  if (status === "CLOSED_PERMANENTLY") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
        <XCircle className="w-2.5 h-2.5 text-rose-500" /> Tutup Permanen
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      <Clock className="w-2.5 h-2.5 text-amber-500" /> Tutup Sementara
    </span>
  );
}

function CityDropdown({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeProvince, setActiveProvince] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearch("");
        setActiveProvince(null);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) window.setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const searchResults = search.trim()
    ? ALL_CITIES.filter((city) => city.toLowerCase().includes(search.toLowerCase())).slice(0, 30)
    : null;
  const provinceCities = activeProvince
    ? CITY_GROUPS.find((group) => group.label === activeProvince)?.cities ?? []
    : null;
  const popularCities = ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar", "Yogyakarta", "Denpasar", "Palembang", "Batam"];

  const select = (city: string) => {
    onChange(city);
    setOpen(false);
    setSearch("");
    setActiveProvince(null);
  };

  const clear = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    onChange("");
    setSearch("");
    setActiveProvince(null);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`w-full flex items-center justify-between gap-2 bg-slate-50 border rounded-xl px-4 py-2.5 text-sm transition-all outline-none ${
          open ? "border-slate-900 bg-white ring-1 ring-slate-900/10" : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <span className={`flex items-center gap-2 truncate ${value ? "text-slate-900 font-medium" : "text-slate-400"}`}>
          {value ? (
            <>
              <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              {value}
            </>
          ) : (
            "Pilih kota / area..."
          )}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {value && (
            <span onClick={clear} className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors">
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 w-full min-w-[320px] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          <div className="p-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                ref={searchRef}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setActiveProvince(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && search.trim()) select(search.trim());
                }}
                placeholder="Cari kota/kabupaten..."
                className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")}>
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                </button>
              )}
            </div>
          </div>

          <div className="flex h-80">
            {!search.trim() && (
              <div className="w-36 shrink-0 border-r border-slate-100 overflow-y-auto py-1 bg-slate-50/60">
                <button
                  type="button"
                  onClick={() => setActiveProvince(null)}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                    !activeProvince ? "bg-white text-slate-900 font-bold border-r-2 border-slate-900 shadow-xs" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  Populer
                </button>
                <div className="h-px bg-slate-200/70 my-1" />
                {CITY_GROUPS.map((group) => (
                  <button
                    key={group.label}
                    type="button"
                    onClick={() => setActiveProvince(group.label)}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors leading-tight ${
                      activeProvince === group.label
                        ? "bg-white text-slate-900 font-bold border-r-2 border-slate-900 shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {group.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-1.5">
              {search.trim() ? (
                searchResults!.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <p className="text-slate-400 text-xs">Tidak ditemukan</p>
                    <button type="button" onClick={() => select(search.trim())} className="text-xs text-slate-800 font-semibold hover:underline transition-colors">
                      Gunakan &quot;{search.trim()}&quot; langsung
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="px-3 pt-1 pb-1.5 text-[10px] text-slate-400">{searchResults!.length} hasil</p>
                    {searchResults!.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => select(city)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                          value === city ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {city}
                      </button>
                    ))}
                  </>
                )
              ) : activeProvince ? (
                <>
                  <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {activeProvince}
                  </p>
                  {provinceCities!.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => select(city)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                        value === city ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {city}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Kota populer
                  </p>
                  {popularCities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => select(city)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                        value === city ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {city}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-[10px] text-slate-400">{ALL_CITIES.length} kota/kabupaten tersedia</span>
            <button type="button" onClick={() => clear()} className="text-xs text-slate-500 hover:text-slate-900 font-medium">
              Kosongkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PortalLeadFinder({
  initialBalance,
  enabled,
  creditCosts = { ...DEFAULT_CREDIT_COST, socialScan: DEFAULT_SOCIAL_SCAN_COST },
  socialScanAvailable = true,
}: {
  initialBalance: number;
  enabled: boolean;
  creditCosts?: Record<SearchMode, number> & { socialScan?: number };
  socialScanAvailable?: boolean;
}) {
  const router = useRouter();
  const [balance, setBalance] = useState(initialBalance);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [mode, setMode] = useState<SearchMode>("standard");
  const [socialScanEnabled, setSocialScanEnabled] = useState(false);
  const [socialFilter, setSocialFilter] = useState<SocialFilter>("ALL");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("OPERATIONAL");
  const [minRating, setMinRating] = useState<number>(0);
  const [minReviews, setMinReviews] = useState<number>(0);
  const [hasPhoneOnly, setHasPhoneOnly] = useState(true);
  const [resultSearch, setResultSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("PHONE");
  const [places, setPlaces] = useState<PlaceLead[]>([]);
  const [fullQuery, setFullQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [loadedFromSavedList, setLoadedFromSavedList] = useState(false);
  const [usedBias, setUsedBias] = useState(false);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [lastCreditCost, setLastCreditCost] = useState(creditCosts.standard);
  const [lastMode, setLastMode] = useState<SearchMode>("standard");
  const [loading, setLoading] = useState(false);
  const [loadingListId, setLoadingListId] = useState<string | null>(null);
  const [savingList, setSavingList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listMessage, setListMessage] = useState<string | null>(null);
  const [savedLists, setSavedLists] = useState<SavedLeadList[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const socialScanCost = creditCosts.socialScan ?? DEFAULT_SOCIAL_SCAN_COST;
  const activeSocialScan = socialScanAvailable && socialScanEnabled;
  const creditCost = creditCosts[mode] + (activeSocialScan ? socialScanCost : 0);
  const insufficient = balance < creditCost || !enabled;
  const filteredPlaces = useMemo(() => {
    const search = resultSearch.trim().toLowerCase();
    const filtered = places.filter((place) => {
      const hasPhone = Boolean(place.phoneNorm || place.phone);
      if (filter === "NO_WEBSITE" && place.hasWebsite) return false;
      if (filter === "HAS_WEBSITE" && !place.hasWebsite) return false;
      if (hasPhoneOnly && !hasPhone) return false;
      if (activeSocialScan) {
        if (socialFilter === "ANY" && !hasAnySocial(place)) return false;
        if (socialFilter === "NONE" && hasAnySocial(place)) return false;
        if (SOCIAL_PLATFORMS.some((platform) => platform.value === socialFilter) && !place.socialScan.links[socialFilter as SocialPlatform]) return false;
      }
      if (statusFilter === "OPERATIONAL" && place.businessStatus === "CLOSED_PERMANENTLY") return false;
      if (statusFilter === "CLOSED_PERMANENTLY" && place.businessStatus !== "CLOSED_PERMANENTLY") return false;
      if (minRating > 0 && (place.rating ?? 0) < minRating) return false;
      if (minReviews > 0 && (place.ratingCount ?? 0) < minReviews) return false;
      if (search) {
        const haystack = [
          place.name,
          place.address,
          place.category,
          place.phone,
          place.website ?? "",
        ].join(" ").toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "NO_WEBSITE") {
        if (a.hasWebsite !== b.hasWebsite) return a.hasWebsite ? 1 : -1;
        if (Boolean(a.phoneNorm || a.phone) !== Boolean(b.phoneNorm || b.phone)) return a.phoneNorm || a.phone ? -1 : 1;
        return (b.ratingCount ?? 0) - (a.ratingCount ?? 0);
      }
      if (sortBy === "RATING") return (b.rating ?? 0) - (a.rating ?? 0);
      if (sortBy === "REVIEWS") return (b.ratingCount ?? 0) - (a.ratingCount ?? 0);
      if (sortBy === "PHONE") return Number(Boolean(b.phoneNorm || b.phone)) - Number(Boolean(a.phoneNorm || a.phone));
      if (sortBy === "SOCIAL") return Number(hasAnySocial(b)) - Number(hasAnySocial(a));
      return a.name.localeCompare(b.name, "id");
    });
  }, [activeSocialScan, filter, hasPhoneOnly, minRating, minReviews, places, resultSearch, socialFilter, sortBy, statusFilter]);

  const noWebsiteCount = places.filter((place) => !place.hasWebsite).length;
  const noPhoneCount = places.filter((place) => !(place.phoneNorm || place.phone)).length;
  const closedCount = places.filter((place) => place.businessStatus === "CLOSED_PERMANENTLY").length;
  const socialFoundCount = places.filter(hasAnySocial).length;

  useEffect(() => {
    let mounted = true;
    fetch("/api/portal/tools/lead-finder/lists")
      .then((res) => res.json())
      .then((data) => {
        if (mounted && Array.isArray(data.lists)) setSavedLists(data.lists);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  function requestSearch() {
    if (!query.trim() || insufficient) return;
    setConfirmOpen(true);
  }

  async function runSearch() {
    if (!query.trim() || insufficient) return;
    setConfirmOpen(false);
    setLoading(true);
    setError(null);
    setListMessage(null);
    setPlaces([]);
    setSearched(false);
    setLoadedFromSavedList(false);
    setShowHistory(false);

    try {
      const res = await fetch("/api/portal/tools/lead-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, city, mode, socialScan: activeSocialScan }),
      });
      const data = await res.json().catch(() => ({}));

      if (typeof data.balance === "number") setBalance(data.balance);
      if (!res.ok) throw new Error(data.error ?? "Pencarian gagal");

      setPlaces(Array.isArray(data.places) ? data.places : []);
      setFullQuery(typeof data.fullQuery === "string" ? data.fullQuery : "");
      setUsedBias(!!data.usedBias);
      setLastCreditCost(typeof data.creditCost === "number" ? data.creditCost : creditCost);
      setLastMode(data.mode === "deep" ? "deep" : "standard");
      setLoadedFromSavedList(false);
      setSearched(true);
      setHistory((previous) => {
        const entry: SearchHistory = {
          query: query.trim(),
          city: city.trim(),
          total: typeof data.total === "number" ? data.total : 0,
          timestamp: Date.now(),
        };
        const withoutDuplicate = previous.filter((item) => !(item.query === entry.query && item.city === entry.city));
        return [entry, ...withoutDuplicate].slice(0, 10);
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pencarian gagal");
    } finally {
      setLoading(false);
    }
  }

  async function saveCurrentList() {
    if (places.length === 0 || savingList) return;
    setSavingList(true);
    setError(null);
    setListMessage(null);

    try {
      const res = await fetch("/api/portal/tools/lead-finder/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullQuery || `${query.trim()} ${city.trim()}`.trim(),
          query: query.trim(),
          city: city.trim(),
          mode: lastMode,
          socialScan: activeSocialScan,
          items: places,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan list");

      setSavedLists((current) => [data.list, ...current.filter((item) => item.id !== data.list.id)].slice(0, 50));
      setListMessage("List lead berhasil disimpan.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan list");
    } finally {
      setSavingList(false);
    }
  }

  async function loadSavedList(id: string) {
    setLoadingListId(id);
    setError(null);
    setListMessage(null);

    try {
      const res = await fetch(`/api/portal/tools/lead-finder/lists/${id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal membuka list");

      const list = data.list as SavedLeadList & { items?: unknown };
      setQuery(list.query);
      setCity(list.city ?? "");
      setMode(list.mode === "deep" ? "deep" : "standard");
      setSocialScanEnabled(!!list.socialScan);
      setPlaces(Array.isArray(list.items) ? list.items as PlaceLead[] : []);
      setFullQuery(list.city ? `${list.query} di ${list.city}` : list.query);
      setSearched(true);
      setLoadedFromSavedList(true);
      setUsedBias(false);
      setLastMode(list.mode === "deep" ? "deep" : "standard");
      setListMessage(`List "${list.name}" dibuka.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuka list");
    } finally {
      setLoadingListId(null);
    }
  }

  async function deleteSavedList(id: string) {
    setLoadingListId(id);
    setError(null);
    setListMessage(null);

    try {
      const res = await fetch(`/api/portal/tools/lead-finder/lists/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal menghapus list");

      setSavedLists((current) => current.filter((item) => item.id !== id));
      setListMessage("List lead dihapus.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus list");
    } finally {
      setLoadingListId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <Link href="/portal/tools" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Tools
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-800">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lead Finder</h1>
              <p className="text-slate-500 text-sm mt-1">Cari prospek bisnis lokal dari Google Maps, lalu simpan atau export list yang relevan.</p>
            </div>
          </div>
        </div>
        <Link href="/portal/credits" className="w-fit">
          <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs px-4 py-3 hover:border-slate-300 transition-colors">
            <Coins className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Saldo</p>
              <p className="text-slate-900 font-black">{balance} kredit</p>
            </div>
          </div>
        </Link>
      </div>

      {!enabled && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-slate-100 border border-slate-200 px-5 py-4 text-slate-800">
          <span className="flex items-center gap-3 text-sm font-semibold">
            <AlertTriangle className="w-5 h-5 text-slate-600" />
            Lead Finder sedang nonaktif sementara.
          </span>
          <span className="text-xs text-slate-500">Silakan coba lagi nanti.</span>
        </div>
      )}

      {enabled && insufficient && (
        <Link
          href="/portal/credits"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 text-amber-900 hover:bg-amber-100/60 transition-colors"
        >
          <span className="flex items-center gap-3 text-sm font-semibold">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            Kredit tidak cukup. Beli sekarang
          </span>
          <span className="text-xs text-amber-700">Butuh {creditCost} kredit untuk mode ini</span>
        </Link>
      )}

      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            requestSearch();
          }}
          className="space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="lead-query" className="text-slate-700 text-xs font-semibold">Kategori Bisnis *</label>
              <input
                id="lead-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="contoh: restoran, salon, klinik..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:bg-white text-sm transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-700 text-xs font-semibold flex items-center gap-1.5">
                Kota / Area
                <span className="text-slate-500 text-[10px] flex items-center gap-0.5">
                  <Crosshair className="w-2.5 h-2.5 text-slate-600" /> Presisi lebih akurat
                </span>
              </label>
              <CityDropdown value={city} onChange={setCity} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setQuery(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                  query === preset
                    ? "bg-[#1E242E] border-slate-800 text-white font-medium shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {([
              {
                value: "standard" as const,
                title: "Standard",
                description: "Satu query utama, maksimal 60 leads.",
                badge: `${creditCosts.standard} kredit`,
              },
              {
                value: "deep" as const,
                title: "Deep Search",
                description: "Multi-keyword dan multi-area, hasil lebih luas.",
                badge: `${creditCosts.deep} kredit`,
              },
            ]).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  mode === option.value
                    ? "border-slate-900 bg-slate-50/80 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{option.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{option.description}</p>
                  </div>
                  <span className={`shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-bold ${
                    mode === option.value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-100 text-slate-600"
                  }`}>
                    {option.badge}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {socialScanAvailable && (
            <button
              type="button"
              onClick={() => setSocialScanEnabled((current) => !current)}
              className={`w-full rounded-2xl border p-4 text-left transition-all ${
                socialScanEnabled
                  ? "border-emerald-600/40 bg-emerald-50/60 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">Social Scan</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Cek link Instagram, Facebook, TikTok, LinkedIn, YouTube, dan X dari website bisnis. Hasil memakai cache dan dibatasi agar pencarian tetap stabil.
                  </p>
                </div>
                <span className={`shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-bold ${
                  socialScanEnabled
                    ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                    : "border-slate-200 bg-slate-100 text-slate-600"
                }`}>
                  +{socialScanCost} kredit
                </span>
              </div>
            </button>
          )}

          <div className="flex items-center gap-3 flex-wrap pt-1">
            <Button type="submit" disabled={!query.trim() || loading || insufficient} className="bg-[#1E242E] hover:bg-slate-800 text-white gap-2 px-6 rounded-xl font-medium shadow-xs">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? (mode === "deep" ? "Mencari lebih luas..." : "Mencari lead...") : "Cari Lead"}
            </Button>

            <div className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
              {mode === "deep" ? "Multi-search aktif" : "Fix 60 leads"}
              {activeSocialScan ? " + Social Scan" : ""}
            </div>

            {history.length > 0 && (
              <button type="button" onClick={() => setShowHistory((value) => !value)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs transition-colors ml-auto">
                <History className="w-3.5 h-3.5" />
                Riwayat ({history.length})
              </button>
            )}
          </div>
        </form>

        {showHistory && history.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-4 space-y-1.5">
            <p className="text-slate-400 text-xs mb-2 font-medium">Pencarian terakhir:</p>
            {history.map((item) => (
              <button
                key={`${item.query}-${item.city}-${item.timestamp}`}
                type="button"
                onClick={() => {
                  setQuery(item.query);
                  setCity(item.city);
                  setConfirmOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all text-left"
              >
                <span className="flex items-center gap-2 text-sm text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{item.query}{item.city ? ` - ${item.city}` : ""}</span>
                </span>
                <span className="text-slate-500 text-xs shrink-0 font-medium">{item.total} hasil</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {listMessage && !error && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-emerald-800 text-sm">
          {listMessage}
        </div>
      )}

      {savedLists.length > 0 && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-slate-900 font-bold">
                <Bookmark className="h-4 w-4 text-slate-700" />
                Saved Lists
              </h2>
              <p className="mt-1 text-xs text-slate-500">Buka ulang hasil pencarian tanpa memotong kredit lagi.</p>
            </div>
            {places.length > 0 && (
              <Button type="button" size="sm" onClick={saveCurrentList} disabled={savingList} className="gap-2 bg-[#1E242E] text-white hover:bg-slate-800 rounded-xl shadow-xs">
                {savingList ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Simpan Hasil Ini
              </Button>
            )}
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {savedLists.slice(0, 6).map((list) => (
              <div key={list.id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{list.name}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{list.total} lead - {list.city ? `${list.query} di ${list.city}` : list.query}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteSavedList(list.id)}
                    disabled={loadingListId === list.id}
                    className="shrink-0 rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition-colors"
                    aria-label="Hapus saved list"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void loadSavedList(list.id)}
                  disabled={loadingListId === list.id}
                  className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs disabled:opacity-50"
                >
                  {loadingListId === list.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FolderOpen className="h-3.5 w-3.5" />}
                  Buka List
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {fullQuery && !error && !loading && !loadedFromSavedList && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-emerald-900 text-sm">
          {lastMode === "deep" ? "Deep Search selesai" : "Pencarian selesai"}. {lastCreditCost} kredit telah digunakan, saldo terbaru {balance} kredit.
        </div>
      )}

      {searched && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-slate-900 font-bold flex items-center gap-2 flex-wrap">
                {places.length} bisnis ditemukan
                {usedBias && (
                  <span className="text-[10px] text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                    <Crosshair className="w-2.5 h-2.5 text-slate-600" /> Lokasi presisi aktif
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-500 flex flex-wrap gap-3">
                {noWebsiteCount > 0 && <span className="text-amber-700"><strong>{noWebsiteCount}</strong> tanpa website</span>}
                {noPhoneCount > 0 && <span className="text-slate-600"><strong>{noPhoneCount}</strong> tanpa nomor</span>}
                {activeSocialScan && <span className="text-emerald-700"><strong>{socialFoundCount}</strong> punya social link</span>}
                {closedCount > 0 && <span className="text-rose-600"><strong>{closedCount}</strong> tutup permanen</span>}
              </p>
              {fullQuery && <p className="text-slate-400 text-xs">{fullQuery}</p>}
            </div>

            {filteredPlaces.length > 0 && (
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button variant="outline" size="sm" onClick={saveCurrentList} disabled={savingList}
                  className="gap-2 text-xs border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shrink-0 rounded-xl shadow-2xs">
                  {savingList ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Simpan List
                </Button>
                <Button size="sm" onClick={() => downloadCsv(filteredPlaces)}
                  className="gap-2 text-xs bg-[#1E242E] text-white hover:bg-slate-800 shrink-0 rounded-xl shadow-xs">
                  <Download className="w-3.5 h-3.5" />
                  Download CSV ({filteredPlaces.length})
                </Button>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-[1fr_220px] gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-2xs">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                value={resultSearch}
                onChange={(event) => setResultSearch(event.target.value)}
                placeholder="Cari di hasil: nama, alamat, kategori..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
              />
              {resultSearch && (
                <button type="button" onClick={() => setResultSearch("")} className="text-slate-400 hover:text-slate-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortBy)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-900 shadow-2xs"
            >
              <option className="bg-white text-slate-900" value="PHONE">Ada nomor dulu</option>
              <option className="bg-white text-slate-900" value="REVIEWS">Review terbanyak</option>
              <option className="bg-white text-slate-900" value="RATING">Rating tertinggi</option>
              <option className="bg-white text-slate-900" value="NO_WEBSITE">Belum ada website dulu</option>
              <option className="bg-white text-slate-900" value="SOCIAL">Ada sosial media dulu</option>
              <option className="bg-white text-slate-900" value="NAME">Nama A-Z</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["NO_WEBSITE", "ALL", "HAS_WEBSITE"] as FilterType[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  filter === value
                    ? value === "NO_WEBSITE"
                      ? "bg-amber-100 border-amber-300 text-amber-900 shadow-2xs"
                      : value === "HAS_WEBSITE"
                      ? "bg-emerald-100 border-emerald-300 text-emerald-900 shadow-2xs"
                      : "bg-[#1E242E] border-slate-800 text-white shadow-2xs"
                    : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {value === "NO_WEBSITE" ? "Belum ada website" : value === "HAS_WEBSITE" ? "Ada website" : "Semua"}
              </button>
            ))}

            <div className="w-px bg-slate-200 mx-1" />
            <select
              value={socialFilter}
              onChange={(event) => setSocialFilter(event.target.value as SocialFilter)}
              disabled={!activeSocialScan}
              className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none disabled:opacity-45"
            >
              <option className="bg-white text-slate-900" value="ALL">Semua sosial</option>
              <option className="bg-white text-slate-900" value="ANY">Ada sosial media</option>
              <option className="bg-white text-slate-900" value="NONE">Tidak ditemukan</option>
              {SOCIAL_PLATFORMS.map((platform) => (
                <option key={platform.value} className="bg-white text-slate-900" value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
            <div className="w-px bg-slate-200 mx-1" />
            <button
              type="button"
              onClick={() => setHasPhoneOnly((current) => !current)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                hasPhoneOnly
                  ? "bg-[#1E242E] border-slate-800 text-white shadow-2xs"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Ada nomor
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === "OPERATIONAL" ? "ALL" : "OPERATIONAL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === "OPERATIONAL"
                  ? "bg-emerald-100 border-emerald-300 text-emerald-900 shadow-2xs"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Aktif saja
            </button>

            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-slate-400 text-xs font-medium">Min:</span>
              {[0, 3, 3.5, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setMinRating(rating)}
                  className={`px-1.5 py-0.5 rounded text-xs transition-all ${minRating === rating ? "text-amber-800 font-bold bg-amber-50" : "text-slate-500 hover:text-slate-900"}`}
                >
                  {rating === 0 ? "Semua" : rating}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
              <span className="text-slate-400 text-xs font-medium">Ulasan:</span>
              {[0, 10, 50, 100, 500].map((reviews) => (
                <button
                  key={reviews}
                  type="button"
                  onClick={() => setMinReviews(reviews)}
                  className={`px-1.5 py-0.5 rounded text-xs transition-all ${minReviews === reviews ? "text-slate-900 font-bold bg-slate-100" : "text-slate-500 hover:text-slate-900"}`}
                >
                  {reviews === 0 ? "Semua" : `${reviews}+`}
                </button>
              ))}
            </div>
          </div>

          {filteredPlaces.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <p className="text-slate-400">Tidak ada hasil untuk filter ini.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {filteredPlaces.map((place) => {
                const isClosed = place.businessStatus === "CLOSED_PERMANENTLY";
                const socialPlatforms = getSocialPlatforms(place);
                return (
                  <div key={place.placeId || `${place.name}-${place.phone}`} className={`rounded-2xl bg-white p-4 border transition-all shadow-xs ${isClosed ? "opacity-55 border-slate-200" : "border-slate-200/90 hover:border-slate-300 hover:shadow-md"}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {place.hasWebsite
                          ? <Globe className="w-4 h-4 text-emerald-600" />
                          : <GlobeOff className="w-4 h-4 text-amber-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <p className="text-slate-900 font-bold text-sm leading-snug line-clamp-1">{place.name || "Tanpa nama"}</p>
                          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                            <BusinessStatusBadge status={place.businessStatus} />
                            {place.hasWebsite ? (
                              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <Globe className="w-2.5 h-2.5" /> Ada website
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <GlobeOff className="w-2.5 h-2.5" /> Tanpa website
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {place.category && <p className="text-slate-500 text-[11px] font-medium">{place.category}</p>}
                          <StarRating rating={place.rating} count={place.ratingCount} />
                          {place.isOpen === true && <span className="text-[10px] text-emerald-700 font-semibold">Buka</span>}
                          {place.isOpen === false && <span className="text-[10px] text-rose-600 font-semibold">Tutup</span>}
                        </div>

                        <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">{place.address || "Alamat tidak tersedia"}</p>

                        {place.phone ? (
                          <p className="text-slate-800 text-xs mt-1.5 font-mono font-medium flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-500" /> {place.phone}
                          </p>
                        ) : (
                          <p className="text-slate-300 text-xs mt-1.5 italic">Tidak ada nomor telepon</p>
                        )}

                        {place.website && (
                          <a href={place.website} target="_blank" rel="noopener noreferrer" className="text-slate-700 font-medium text-[11px] mt-1 flex items-center gap-1 hover:text-slate-900 hover:underline w-fit">
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[220px]">{place.website.replace(/^https?:\/\//, "")}</span>
                          </a>
                        )}

                        {activeSocialScan && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {socialPlatforms.length > 0 ? (
                              socialPlatforms.map((platform) => (
                                <a
                                  key={platform.value}
                                  href={place.socialScan.links[platform.value]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                                >
                                  {platform.label}
                                </a>
                              ))
                            ) : (
                              <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                Sosial: {socialStatusText(place)}
                              </span>
                            )}
                          </div>
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

      {!loading && !searched && places.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-400 text-sm shadow-xs">
          Masukkan jenis bisnis dan kota untuk mulai mencari.
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-5 text-amber-600">
              <Coins className="w-6 h-6" />
            </div>
            <h2 className="text-slate-900 font-bold text-xl tracking-tight">Gunakan {creditCost} kredit?</h2>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Mode <span className="text-slate-900 font-bold">{mode === "deep" ? "Deep Search" : "Standard"}</span>
              {activeSocialScan ? <span> dengan <span className="text-slate-900 font-bold">Social Scan</span></span> : null}
              {" "}akan memotong {creditCost} kredit dari saldo Anda. Query: <span className="text-slate-900 font-bold">{city.trim() ? `${query.trim()} di ${city.trim()}` : query.trim()}</span>.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                className="h-11 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={runSearch}
                className="h-11 rounded-xl bg-[#1E242E] hover:bg-slate-800 text-white font-medium flex-1 shadow-xs"
              >
                {mode === "deep" ? "Ya, Deep Search" : "Ya, Cari Lead"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
