import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Coins,
  Download,
  Filter,
  Globe2,
  MapPin,
  MousePointerClick,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";
import { prisma } from "@/lib/prisma";
import { getToolSettings } from "@/lib/toolSettings";

export const metadata: Metadata = {
  title: "Lead Finder untuk Cari Prospek Bisnis Lokal | MFWEB",
  description:
    "Temukan prospek bisnis lokal dari Google Maps, sortir kontak yang layak dihubungi, export CSV, dan bangun pipeline sales lebih cepat dengan Lead Finder MFWEB.",
  alternates: { canonical: "/lead-finder" },
};

const fallbackPackages = [
  { id: "starter", name: "Starter", credits: 50, bonusCredit: 0, price: 39000 },
  { id: "growth", name: "Growth", credits: 150, bonusCredit: 10, price: 99000 },
  { id: "pro", name: "Pro", credits: 300, bonusCredit: 30, price: 179000 },
];

const features = [
  {
    icon: Search,
    title: "Cari dari Google Maps",
    desc: "Masukkan kategori dan kota, lalu Lead Finder mengambil data bisnis lokal yang relevan.",
  },
  {
    icon: Globe2,
    title: "Lihat jejak digital bisnis",
    desc: "Cek apakah prospek punya website, nomor telepon, rating, review, dan status operasional sebelum dihubungi.",
  },
  {
    icon: Filter,
    title: "Sortir kualitas lead",
    desc: "Urutkan berdasarkan rating, jumlah review, nomor telepon, status bisnis, dan kelengkapan profil.",
  },
  {
    icon: Users,
    title: "Social Scan opsional",
    desc: "Scan website prospek untuk menemukan link Instagram, Facebook, TikTok, LinkedIn, YouTube, dan X.",
  },
  {
    icon: Download,
    title: "Export siap follow up",
    desc: "Unduh hasil ke CSV dengan nomor WhatsApp dan link sosial yang sudah ditemukan.",
  },
];

const workflows = [
  "Pilih segmen bisnis, misalnya restoran, salon, klinik, bengkel, toko, distributor, atau travel agent.",
  "Tentukan kota atau area agar hasil lebih presisi.",
  "Gunakan mode Standard untuk pencarian cepat atau Deep Search untuk cakupan lebih luas.",
  "Aktifkan Social Scan jika perlu memetakan kanal sosial prospek dari website mereka.",
  "Filter prospek yang punya nomor telepon, rating bagus, status aktif, atau kanal sosial tertentu.",
  "Export CSV lalu mulai follow up dari pipeline sales Anda.",
];

const useCases = [
  "Distributor yang ingin mencari toko, outlet, reseller, atau mitra area baru.",
  "Vendor B2B yang menawarkan layanan operasional, pemasok, logistik, software, atau peralatan bisnis.",
  "Tim sales B2B yang mencari kontak usaha berdasarkan kota.",
  "Pemilik bisnis yang ingin memetakan kompetitor, calon partner, dan peluang ekspansi lokal.",
];

const faqs = [
  {
    q: "Apakah Lead Finder gratis?",
    a: "Lead Finder memakai sistem kredit. Standard Search memakai sedikit kredit untuk pencarian cepat, sedangkan Deep Search memakai kredit lebih besar untuk cakupan hasil yang lebih luas.",
  },
  {
    q: "Data lead berasal dari mana?",
    a: "Pencarian menggunakan Google Places, lalu hasilnya dirapikan di portal agar mudah difilter dan diexport.",
  },
  {
    q: "Apakah saya bisa langsung download hasilnya?",
    a: "Bisa. Hasil yang muncul di tabel dapat difilter lalu diunduh sebagai CSV untuk kebutuhan follow up.",
  },
  {
    q: "Apa bedanya Standard dan Deep Search?",
    a: "Standard cocok untuk satu pencarian cepat. Deep Search menjalankan beberapa variasi kata kunci dan area agar hasil lebih luas.",
  },
];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCredits(credits: number, bonusCredit: number) {
  return bonusCredit > 0 ? `${credits + bonusCredit} kredit` : `${credits} kredit`;
}

async function getCreditPackages() {
  try {
    const packages = await prisma.creditPackage.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
      take: 3,
      select: { id: true, name: true, credits: true, bonusCredit: true, price: true },
    });

    return packages.length > 0 ? packages : fallbackPackages;
  } catch {
    return fallbackPackages;
  }
}

export default async function LeadFinderLandingPage() {
  const [packages, toolSettings] = await Promise.all([getCreditPackages(), getToolSettings()]);
  const standardCost = toolSettings.leadFinder.standardCost;
  const deepCost = toolSettings.leadFinder.deepCost;
  const socialScanEnabled = toolSettings.leadFinder.socialScanEnabled;
  const socialScanCost = toolSettings.leadFinder.socialScanCost;
  const visibleFeatures = socialScanEnabled ? features : features.filter((feature) => feature.title !== "Social Scan opsional");
  const visibleWorkflows = socialScanEnabled ? workflows : workflows.filter((item) => !item.includes("Social Scan"));

  return (
    <div className="min-h-screen overflow-x-clip">
      <section className="relative px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <FadeUp>
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-300">
                <Target className="h-4 w-4" />
                Prospecting tool
              </div>
              <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Temukan prospek bisnis lokal dalam hitungan menit
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-blue-100/65 sm:text-lg">
                Lead Finder membantu tim sales, distributor, vendor, dan pemilik bisnis menemukan kontak usaha
                berdasarkan kategori dan area, lalu mengunduh data yang siap dimasukkan ke pipeline.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/portal/register">
                  <Button size="lg" className="h-12 w-full rounded-xl bg-blue-600 px-6 font-bold text-white hover:bg-blue-500 sm:w-auto">
                    Mulai cari leads
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button size="lg" variant="outline" className="h-12 w-full rounded-xl border-white/10 bg-white/5 px-6 font-bold text-white hover:bg-white/10 sm:w-auto">
                    Lihat pricing
                  </Button>
                </Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-blue-200/55">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Export CSV
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Filter kontak siap follow up
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Mulai {standardCost} kredit
                </span>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="relative rounded-3xl border border-white/10 bg-[#06101f] p-3 shadow-2xl shadow-black/40">
              <div className="rounded-2xl border border-white/10 bg-[#08172b]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400/80" />
                    <div className="h-3 w-3 rounded-full bg-amber-300/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
                  </div>
                  <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-semibold text-blue-100/50">
                    portal/tools/lead-finder
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="grid gap-3 sm:grid-cols-[1fr_170px]">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-200/35">Kategori</p>
                      <p className="mt-1 font-bold text-white">salon kecantikan</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-200/35">Area</p>
                      <p className="mt-1 flex items-center gap-1.5 font-bold text-white">
                        <MapPin className="h-4 w-4 text-blue-300" />
                        Bandung
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                      ["60", "leads ditemukan"],
                      ["41", "kontak lengkap"],
                      ["38", "prospek aktif"],
                    ].map(([num, label]) => (
                      <div key={label} className="rounded-xl border border-white/10 bg-black/25 p-4">
                        <p className="text-2xl font-black text-white">{num}</p>
                        <p className="mt-1 text-xs text-blue-200/45">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
                    {[
                      { name: "Nara Beauty Studio", area: "Jl. Riau, Bandung", tag: "Kontak lengkap", phone: "0812-3456-7890", hot: true },
                      { name: "Lumi Hair Lab", area: "Dago, Bandung", tag: "Rating tinggi", phone: "022-555-0134", hot: false },
                      { name: "Ayla Skin Clinic", area: "Buahbatu, Bandung", tag: "Prospek aktif", phone: "0857-1111-2200", hot: true },
                    ].map((lead) => (
                      <div key={lead.name} className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div>
                          <p className="font-bold text-white">{lead.name}</p>
                          <p className="mt-1 text-xs text-blue-200/45">{lead.area}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${lead.hot ? "border-red-500/25 bg-red-500/10 text-red-300" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"}`}>
                            {lead.tag}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-black text-blue-300">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeUp className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-black text-white sm:text-4xl">Dibuat untuk prospecting yang praktis</h2>
            <p className="mt-3 text-blue-200/55">
              Fokusnya sederhana: bantu tim Anda menemukan bisnis yang relevan, punya sinyal kualitas, dan mudah ditindaklanjuti.
            </p>
          </FadeUp>
          <StaggerChildren className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {visibleFeatures.map((feature) => (
              <StaggerItem key={feature.title}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/10">
                    <feature.icon className="h-6 w-6 text-blue-300" />
                  </div>
                  <h3 className="font-black text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-blue-200/50">{feature.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <FadeUp>
            <div className="rounded-3xl border border-white/10 bg-[#06101f] p-6 sm:p-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10">
                <MousePointerClick className="h-6 w-6 text-emerald-300" />
              </div>
              <h2 className="text-3xl font-black text-white">Workflow dari ide niche ke daftar prospek</h2>
              <p className="mt-3 text-blue-200/55">
                Cocok untuk rutinitas sales harian, riset area baru, validasi pasar, atau pencarian calon mitra bisnis.
              </p>
              <Link href="/portal/register" className="mt-7 inline-flex">
                <Button className="h-11 rounded-xl bg-emerald-500 px-5 font-black text-[#041014] hover:bg-emerald-400">
                  Coba di portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </FadeUp>
          <StaggerChildren className="space-y-3">
            {visibleWorkflows.map((item, index) => (
              <StaggerItem key={item}>
                <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/10 text-sm font-black text-blue-300">
                    {index + 1}
                  </span>
                  <p className="pt-2 text-sm leading-relaxed text-blue-100/70">{item}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <section id="pricing" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeUp className="mx-auto mb-10 max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-amber-300">
              <Coins className="h-4 w-4" />
              Pricing berbasis kredit
            </div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">Beli kredit, pakai sesuai kebutuhan</h2>
            <p className="mt-3 text-blue-200/55">
              Standard Search memakai {standardCost} kredit. Deep Search memakai {deepCost} kredit untuk pencarian lebih luas.
              {socialScanEnabled ? ` Social Scan opsional dapat ditambahkan mulai ${socialScanCost} kredit.` : ""}
            </p>
          </FadeUp>

          <StaggerChildren className="grid gap-5 md:grid-cols-3">
            {packages.map((pkg, index) => {
              const highlighted = index === 1;
              const totalCredits = pkg.credits + pkg.bonusCredit;
              const standardRuns = Math.floor(totalCredits / Math.max(standardCost, 1));
              const deepRuns = Math.floor(totalCredits / Math.max(deepCost, 1));

              return (
                <StaggerItem key={pkg.id}>
                  <div className={`flex h-full flex-col rounded-2xl border p-6 ${highlighted ? "border-blue-500/40 bg-blue-500/10" : "border-white/10 bg-white/[0.04]"}`}>
                    {highlighted && (
                      <span className="mb-4 w-fit rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-200">
                        Paling populer
                      </span>
                    )}
                    <h3 className="text-xl font-black text-white">{pkg.name}</h3>
                    <p className="mt-2 text-sm text-blue-200/50">{formatCredits(pkg.credits, pkg.bonusCredit)} untuk Lead Finder dan tools portal lain.</p>
                    <div className="my-6">
                      <p className="text-3xl font-black text-white">{formatRupiah(pkg.price)}</p>
                      {pkg.bonusCredit > 0 && <p className="mt-1 text-sm font-bold text-emerald-300">Termasuk {pkg.bonusCredit} bonus kredit</p>}
                    </div>
                    <div className="space-y-3 text-sm text-blue-100/65">
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Hingga {standardRuns} Standard Search
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Hingga {deepRuns} Deep Search
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Saldo kredit tersimpan di portal
                      </p>
                    </div>
                    <Link href="/portal/register" className="mt-7">
                      <Button className={`h-11 w-full rounded-xl font-black ${highlighted ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-white/10 text-white hover:bg-white/15"}`}>
                        Pilih paket
                      </Button>
                    </Link>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <FadeUp>
            <div>
              <h2 className="text-3xl font-black text-white sm:text-4xl">Cocok untuk siapa?</h2>
              <p className="mt-3 text-blue-200/55">
                Lead Finder paling terasa manfaatnya saat Anda perlu menemukan banyak bisnis lokal yang bisa dihubungi secara terarah.
              </p>
            </div>
          </FadeUp>
          <StaggerChildren className="grid gap-3">
            {useCases.map((item) => (
              <StaggerItem key={item}>
                <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  <p className="text-sm leading-relaxed text-blue-100/70">{item}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-[#06101f] p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <FadeUp>
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/10">
                  <ShieldCheck className="h-6 w-6 text-blue-300" />
                </div>
                <h2 className="text-3xl font-black text-white">Pertanyaan umum</h2>
                <p className="mt-3 text-blue-200/55">
                  Beberapa hal penting sebelum mulai memakai Lead Finder di portal.
                </p>
              </div>
            </FadeUp>
            <div className="grid gap-3">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <h3 className="font-black text-white">{faq.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-blue-200/55">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <FadeUp className="mx-auto max-w-4xl text-center">
          <div className="rounded-3xl border border-blue-500/25 bg-blue-500/10 p-8 sm:p-12">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-400/10">
              <TrendingUp className="h-7 w-7 text-blue-200" />
            </div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">Siap isi pipeline dengan prospek baru?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-blue-100/65">
              Buat akun portal, beli kredit, lalu mulai riset lead untuk niche dan kota yang Anda targetkan.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/portal/register">
                <Button size="lg" className="h-12 w-full rounded-xl bg-blue-600 px-7 font-black text-white hover:bg-blue-500 sm:w-auto">
                  Buat akun portal
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/portal/login">
                <Button size="lg" variant="outline" className="h-12 w-full rounded-xl border-white/10 bg-white/5 px-7 font-black text-white hover:bg-white/10 sm:w-auto">
                  Login klien
                </Button>
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>
    </div>
  );
}
