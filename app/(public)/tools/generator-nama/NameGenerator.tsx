"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Copy, Check, RefreshCw, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6282221682343";

const INDUSTRIES = [
  { value: "teknologi", label: "🖥️ Teknologi / IT" },
  { value: "kuliner",   label: "🍜 Kuliner / F&B" },
  { value: "fashion",   label: "👗 Fashion / Pakaian" },
  { value: "kesehatan", label: "💊 Kesehatan / Kecantikan" },
  { value: "properti",  label: "🏠 Properti / Konstruksi" },
  { value: "jasa",      label: "🔧 Jasa / Konsultasi" },
  { value: "pendidikan",label: "📚 Pendidikan / Pelatihan" },
  { value: "retail",    label: "🛍️ Retail / Toko" },
  { value: "otomotif",  label: "🚗 Otomotif / Bengkel" },
  { value: "hiburan",   label: "🎉 Hiburan / Event" },
];

const STYLES = [
  { value: "profesional",  label: "Profesional" },
  { value: "modern",       label: "Modern & Tech" },
  { value: "kreatif",      label: "Kreatif" },
  { value: "tradisional",  label: "Lokal / Tradisional" },
  { value: "internasional",label: "Internasional" },
];

const PREFIXES: Record<string, string[]> = {
  profesional:   ["Prima", "Mitra", "Solusi", "Karya", "Mandiri", "Andalan", "Sentosa", "Utama"],
  modern:        ["Neo", "Digi", "Smart", "Pro", "Inno", "Hyper", "Meta", "Ultra"],
  kreatif:       ["Kreasi", "Cipta", "Idea", "Visio", "Gagas", "Reka", "Arta", "Imaji"],
  tradisional:   ["Nusa", "Bumi", "Artha", "Bhakti", "Wahana", "Kusuma", "Cahaya", "Warna"],
  internasional: ["Global", "Inter", "World", "Asia", "Trans", "Uni", "Infinity", "Era"],
};

const INDUSTRY_WORDS: Record<string, string[]> = {
  teknologi: ["Tech", "Byte", "Code", "Data", "Net", "Soft", "App", "Logic"],
  kuliner:   ["Rasa", "Sajian", "Dapur", "Selera", "Cita", "Boga", "Lezat", "Nikmati"],
  fashion:   ["Mode", "Style", "Wear", "Trend", "Busana", "Look", "Gaya", "Kreasi"],
  kesehatan: ["Sehat", "Medika", "Vita", "Care", "Prima", "Bugar", "Klinik", "Herba"],
  properti:  ["Graha", "Land", "Property", "Hunian", "Realty", "Aset", "Kavling", "Villas"],
  jasa:      ["Service", "Karya", "Solusi", "Prima", "Andal", "Expert", "Works", "Pro"],
  pendidikan:["Edu", "Ilmu", "Pintar", "Learn", "Cerdas", "Skill", "Bright", "Genius"],
  retail:    ["Mart", "Store", "Shop", "Trade", "Market", "Point", "Center", "Warung"],
  otomotif:  ["Motor", "Auto", "Drive", "Speed", "Karbu", "Engine", "Wheels", "Turbo"],
  hiburan:   ["Fun", "Event", "Show", "Stage", "Star", "Play", "Festa", "Gala"],
};

const SUFFIXES: Record<string, string[]> = {
  profesional:   ["Consulting", "Solutions", "Group", "Partners", "Services", "Professional", "Associates"],
  modern:        ["Tech", "Digital", "Labs", "Studio", "Hub", "Pro", "ID", "360"],
  kreatif:       ["Creative", "Works", "Craft", "Design", "Vision", "Ideas", "Studio", "Space"],
  tradisional:   ["Jaya", "Makmur", "Sejahtera", "Maju", "Berkah", "Mulia", "Sentosa", "Abadi"],
  internasional: ["International", "Global", "Corp", "Enterprise", "Holdings", "Ventures", "Group", "Co."],
};

const SLOGANS: Record<string, string[]> = {
  profesional:   [
    "{name}: Layanan profesional yang bisa Anda andalkan.",
    "Solusi bisnis terpercaya — {name}.",
    "{name}. Profesional. Tepat. Terpercaya.",
  ],
  modern:        [
    "{name} — Inovasi untuk masa depan bisnis Anda.",
    "Bertumbuh lebih cepat bersama {name}.",
    "{name}: Modern, Efisien, Menguntungkan.",
  ],
  kreatif:       [
    "{name} — Di mana kreativitas bertemu solusi.",
    "Bersama {name}, setiap ide jadi kenyataan.",
    "{name}: Kreatif, Segar, Berkesan.",
  ],
  tradisional:   [
    "{name} — Kepercayaan yang diwariskan generasi.",
    "Bermitra dengan {name}, tumbuh bersama.",
    "{name}: Lokal, Andal, Terpercaya.",
  ],
  internasional: [
    "{name} — Standar global, sentuhan lokal.",
    "Bersaing di pasar global bersama {name}.",
    "{name}: Beyond Borders.",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
}

function generateNames(
  industry: string,
  style: string,
  keyword: string,
): { name: string; slogan: string }[] {
  const prefixes  = PREFIXES[style]       ?? PREFIXES.profesional;
  const indWords  = INDUSTRY_WORDS[industry] ?? INDUSTRY_WORDS.jasa;
  const suffixes  = SUFFIXES[style]       ?? SUFFIXES.profesional;
  const slogans   = SLOGANS[style]        ?? SLOGANS.profesional;
  const kw = keyword.trim();
  const kwCap = kw ? cap(kw) : null;

  const combos = [
    `${pick(prefixes)} ${pick(indWords)}`,
    kwCap ? `${kwCap} ${pick(suffixes)}` : `${pick(prefixes)} ${pick(suffixes)}`,
    kwCap ? `${kwCap}${pick(indWords)}` : `${pick(prefixes)}${pick(indWords)}`,
    `${pick(indWords)} ${pick(suffixes)}`,
    kwCap ? `${pick(prefixes)} ${kwCap}` : `${pick(prefixes)} ${pick(prefixes)}`,
    `${pick(prefixes)}${pick(suffixes).replace(/\s+/g, "")}`,
    kwCap ? `${kwCap} ${pick(indWords)}` : `${pick(indWords)}${pick(prefixes)}`,
    `${pick(prefixes)} ${pick(indWords)} ${pick(suffixes)}`,
  ];

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const c of combos) {
    if (!seen.has(c)) { seen.add(c); unique.push(c); }
  }

  return unique.slice(0, 6).map((name, i) => ({
    name,
    slogan: slogans[i % slogans.length].replace("{name}", name),
  }));
}

export default function NameGenerator() {
  const [industry, setIndustry] = useState("teknologi");
  const [style, setStyle] = useState("profesional");
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<{ name: string; slogan: string }[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  function handleGenerate() {
    setResults(generateNames(industry, style, keyword));
  }

  function handleCopy(idx: number, name: string, slogan: string) {
    void navigator.clipboard.writeText(`${name}\n${slogan}`);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-1">
          <span className="text-purple-400 mr-2">01</span> Pilih Industri & Gaya
        </h2>
        <p className="text-blue-200/40 text-sm mb-5">Sesuaikan dengan karakter bisnis Anda.</p>

        <div className="space-y-5">
          {/* Industry select */}
          <div>
            <label className="text-blue-200/60 text-xs mb-2 block">Industri / Bidang Bisnis</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors cursor-pointer"
            >
              {INDUSTRIES.map((i) => (
                <option key={i.value} value={i.value} className="bg-[#0a1628] text-white">
                  {i.label}
                </option>
              ))}
            </select>
          </div>

          {/* Style buttons */}
          <div>
            <label className="text-blue-200/60 text-xs mb-2 block">Gaya Nama</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                    style === s.value
                      ? "bg-purple-600/20 border-purple-500/50 text-purple-300"
                      : "glass border-white/10 text-blue-200/60 hover:border-white/20"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Keyword */}
          <div>
            <label className="text-blue-200/60 text-xs mb-2 block">
              Kata Kunci <span className="text-blue-200/30">(opsional)</span>
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="Contoh: nama pemilik, kota, atau kata unik"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-blue-200/30 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <Button onClick={handleGenerate} className="bg-purple-600 hover:bg-purple-500 text-white h-11 px-8">
            <Wand2 className="w-4 h-4 mr-2" /> Generate Nama
          </Button>
          {results.length > 0 && (
            <Button
              onClick={handleGenerate}
              variant="outline"
              className="h-11 border-white/10 text-white hover:bg-white/5"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Generate Ulang
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-white font-semibold text-sm">Hasil Generate ({results.length} nama)</h3>
              <span className="text-blue-200/30 text-xs">Klik Salin untuk copy nama + slogan</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.map((r, i) => (
                <motion.div
                  key={`${r.name}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="group bg-white/3 border border-white/8 hover:border-purple-500/30 rounded-xl p-4 transition-colors"
                >
                  <p className="text-white font-bold text-lg mb-1">{r.name}</p>
                  <p className="text-blue-200/50 text-xs leading-relaxed mb-3">{r.slogan}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => handleCopy(i, r.name, r.slogan)}
                      className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {copiedIdx === i ? (
                        <><Check className="w-3.5 h-3.5" /> Disalin!</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Salin</>
                      )}
                    </button>
                    <a
                      href={`https://wa.me/${WA}?text=${encodeURIComponent(
                        `Halo MFWEB, saya ingin membuat website untuk bisnis saya:\n\nNama Bisnis: ${r.name}\nSlogan: ${r.slogan}\n\nBoleh konsultasi pembuatan website?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Buat Website
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 text-center">
              <p className="text-blue-200/40 text-xs">
                Tidak menemukan yang cocok?{" "}
                <button
                  onClick={handleGenerate}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Generate ulang
                </button>{" "}
                untuk hasil baru.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {results.length === 0 && (
        <div className="text-center py-8 text-blue-200/25 text-sm">
          ← Pilih industri dan gaya, lalu klik Generate Nama
        </div>
      )}
    </div>
  );
}
