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
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";
import Breadcrumb from "@/components/public/Breadcrumb";
import { JsonLd, buildBreadcrumbJsonLd } from "@/components/public/JsonLd";
import { prisma } from "@/lib/prisma";
import { getToolSettings } from "@/lib/toolSettings";
import PublicLeadFinderForm from "@/components/public/tools/PublicLeadFinderForm";
import { getWelcomeCreditBreakdown } from "@/lib/welcomeCredits";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mfweb.maffisorp.id";

export const metadata: Metadata = {
  title: "Lead Finder untuk Cari Prospek Bisnis Lokal",
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
    a: "Lead Finder menyediakan uji coba gratis 1x per hari. Akses penuh memakai sistem kredit portal yang sangat terjangkau.",
  },
  {
    q: "Data lead berasal dari mana?",
    a: "Pencarian menggunakan database Google Maps yang diperbarui secara berkala, lalu hasilnya dirapikan agar siap diexport.",
  },
  {
    q: "Apakah saya bisa langsung download hasilnya?",
    a: "Bisa. Hasil pencarian di portal dapat difilter lalu diunduh sebagai file CSV untuk spreadsheet atau CRM Anda.",
  },
  {
    q: "Apa bedanya Standard dan Deep Search?",
    a: "Standard cocok untuk satu pencarian cepat. Deep Search menjalankan beberapa variasi kata kunci dan area sekitarnya agar hasil lebih luas.",
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
  const welcomeCredits = toolSettings.signupBonus.enabled ? toolSettings.signupBonus.amount : 0;
  const welcomeBonusBreakdown = welcomeCredits > 0 ? getWelcomeCreditBreakdown(welcomeCredits, toolSettings).summary : "";
  const visibleFeatures = socialScanEnabled ? features : features.filter((feature) => feature.title !== "Social Scan opsional");
  const visibleWorkflows = socialScanEnabled ? workflows : workflows.filter((item) => !item.includes("Social Scan"));
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Beranda", item: SITE_URL },
    { name: "Lead Finder", item: `${SITE_URL}/lead-finder` },
  ]);

  return (
    <div className="min-h-screen bg-white">
      <JsonLd id="json-ld-breadcrumb-lead-finder" data={breadcrumbJsonLd} />

      {/* ── Full-Width Deep Slate Hero ────────────────────── */}
      <section className="w-full bg-[#1E242E] text-white pt-28 pb-16 sm:pt-32 sm:pb-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Lead Finder" }]} />

          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center mt-6">
            <FadeUp>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-px w-8 bg-slate-500" />
                  <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                    Prospecting Engine
                  </span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
                  Temukan prospek bisnis lokal dalam hitungan menit
                </h1>
                <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                  Lead Finder membantu tim sales, distributor, dan pemilik bisnis memetakan data kontak usaha berdasarkan kategori dan area, lalu mengunduh data terstruktur ke format CSV.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/portal/register">
                    <Button size="lg" className="h-12 w-full rounded-full bg-white text-slate-900 hover:bg-slate-100 font-medium px-8 sm:w-auto transition-colors">
                      Mulai Cari Leads
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#pricing">
                    <Button size="lg" variant="outline" className="h-12 w-full rounded-full border border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white px-8 font-medium sm:w-auto transition-colors">
                      Lihat Paket Kredit
                    </Button>
                  </Link>
                </div>
                <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-300" />
                    Export CSV Instan
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-300" />
                    Filter Kontak Valid
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-300" />
                    Mulai {standardCost} kredit
                  </span>
                  {welcomeCredits > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-slate-300" />
                      {welcomeBonusBreakdown
                        ? `Bonus: ${welcomeCredits} kredit (${welcomeBonusBreakdown})`
                        : `Bonus: ${welcomeCredits} kredit gratis`}
                    </span>
                  )}
                </div>
              </div>
            </FadeUp>

            {/* Visual Mockup Card */}
            <FadeUp delay={0.1}>
              <div className="relative rounded-3xl border border-slate-800 bg-[#161B22] p-3 shadow-xl">
                <div className="rounded-2xl border border-slate-800 bg-[#1E242E] overflow-hidden text-white">
                  <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-[#161B22]">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                    </div>
                    <div className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-0.5 text-[10px] font-mono text-slate-300">
                      portal/tools/lead-finder
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Kategori</p>
                        <p className="font-semibold text-white text-sm">salon kecantikan</p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Area</p>
                        <p className="flex items-center gap-1 font-semibold text-white text-sm">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          Bandung
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-3">
                      {[
                        ["60", "prospek"],
                        ["41", "kontak aktif"],
                        ["38", "terverifikasi"],
                      ].map(([num, label]) => (
                        <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                          <p className="text-xl font-bold font-mono text-white">{num}</p>
                          <p className="text-[11px] font-mono text-slate-400">{label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      {[
                        { name: "Nara Beauty Studio", area: "Jl. Riau, Bandung", phone: "0812-3456-7890" },
                        { name: "Lumi Hair Lab", area: "Dago, Bandung", phone: "022-555-0134" },
                        { name: "Ayla Skin Clinic", area: "Buahbatu, Bandung", phone: "0857-1111-2200" },
                      ].map((lead) => (
                        <div key={lead.name} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/30 px-3.5 py-2.5 text-xs">
                          <div>
                            <p className="font-semibold text-white">{lead.name}</p>
                            <p className="text-[11px] text-slate-400">{lead.area}</p>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-slate-300 text-[11px]">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Free Trial Form Section ───────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="h-px w-6 bg-slate-400" />
                <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                  Uji Coba Langsung
                </span>
                <span className="h-px w-6 bg-slate-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Coba Lead Finder Gratis</h2>
              <p className="mt-2 text-sm text-slate-600">
                Lakukan pencarian prospek langsung di bawah ini tanpa perlu login.
              </p>
            </div>
            <PublicLeadFinderForm
              welcomeCredits={welcomeCredits}
              welcomeBonusBreakdown={welcomeBonusBreakdown}
              freemiumLimit={toolSettings.freemium.leadFinder.dailyLimit}
            />
          </FadeUp>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="mb-12 max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-6 bg-slate-400" />
              <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                Fitur Pencarian
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Dibuat untuk prospecting yang praktis & terarah
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Membantu tim Anda menemukan data bisnis lokal yang relevan, memiliki sinyal kontak aktif, dan siap difollow-up.
            </p>
          </FadeUp>

          <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {visibleFeatures.map((feature) => (
              <StaggerItem key={feature.title}>
                <div className="h-full rounded-2xl border border-slate-200 bg-[#F8F9FA] p-6 shadow-xs hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all flex flex-col">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-800">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{feature.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Workflow Steps ────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <FadeUp>
            <div className="rounded-3xl border border-slate-800 bg-[#1E242E] text-white p-8 sm:p-10">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                <MousePointerClick className="h-5 w-5" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Alur kerja dari riset niche ke data prospek
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Sangat cocok untuk rutinitas sales outbound harian, riset ekspansi kota baru, atau pemetaan calon mitra kerja.
              </p>
              <Link href="/portal/register">
                <Button className="h-11 rounded-full bg-white text-slate-900 hover:bg-slate-100 px-6 font-medium text-sm transition-colors">
                  Coba di Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </FadeUp>

          <StaggerChildren className="space-y-3">
            {visibleWorkflows.map((item, index) => (
              <StaggerItem key={item}>
                <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-mono text-xs font-bold">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm text-slate-700 leading-relaxed font-medium">{item}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Pricing Packages ──────────────────────────────── */}
      <section id="pricing" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="mx-auto mb-12 max-w-2xl text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="h-px w-6 bg-slate-400" />
              <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                Sistem Kredit
              </span>
              <span className="h-px w-6 bg-slate-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Beli kredit, gunakan sesuai kebutuhan
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Standard Search menggunakan {standardCost} kredit. Deep Search menggunakan {deepCost} kredit. Saldo kredit tidak memiliki masa kedaluwarsa.
            </p>
          </FadeUp>

          <StaggerChildren className="grid gap-6 md:grid-cols-3">
            {packages.map((pkg, index) => {
              const highlighted = index === 1;
              const totalCredits = pkg.credits + pkg.bonusCredit;
              const standardRuns = Math.floor(totalCredits / Math.max(standardCost, 1));
              const deepRuns = Math.floor(totalCredits / Math.max(deepCost, 1));

              return (
                <StaggerItem key={pkg.id}>
                  <div className={`flex h-full flex-col rounded-2xl border p-7 ${
                    highlighted
                      ? "border-slate-900 bg-white ring-1 ring-slate-900 shadow-sm"
                      : "border-slate-200 bg-[#F8F9FA]"
                  }`}>
                    {highlighted && (
                      <span className="mb-4 w-fit rounded-full bg-slate-900 text-white px-3 py-0.5 text-[10px] font-mono uppercase tracking-wider">
                        Paling Populer
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-slate-900">{pkg.name}</h3>
                    <p className="mt-1 text-xs text-slate-500 font-mono">
                      {formatCredits(pkg.credits, pkg.bonusCredit)} untuk tools portal
                    </p>
                    <div className="my-6">
                      <p className="text-3xl font-bold font-mono text-slate-900">{formatRupiah(pkg.price)}</p>
                      {pkg.bonusCredit > 0 && (
                        <p className="mt-1 text-xs font-mono text-slate-700">
                          Termasuk +{pkg.bonusCredit} bonus kredit
                        </p>
                      )}
                    </div>
                    <div className="space-y-3 text-xs sm:text-sm text-slate-600 flex-1">
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-slate-800" />
                        Hingga {standardRuns}x Standard Search
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-slate-800" />
                        Hingga {deepRuns}x Deep Search
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-slate-800" />
                        Saldo kredit tersimpan aman di portal
                      </p>
                    </div>
                    <Link href="/portal/register" className="mt-7">
                      <Button className={`h-11 w-full rounded-full font-medium text-sm transition-colors ${
                        highlighted
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                      }`}>
                        Pilih Paket
                      </Button>
                    </Link>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Use Cases ─────────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-2 lg:items-center">
          <FadeUp>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-px w-6 bg-slate-400" />
                <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                  Target Pengguna
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Cocok untuk siapa?</h2>
              <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                Lead Finder paling terasa manfaatnya saat Anda perlu mengumpulkan database usaha lokal yang terverifikasi secara masif dan terstruktur.
              </p>
            </div>
          </FadeUp>

          <StaggerChildren className="grid gap-3.5">
            {useCases.map((item) => (
              <StaggerItem key={item}>
                <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-800" />
                  <p className="text-sm leading-relaxed text-slate-700 font-medium">{item}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── FAQs ──────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="h-px w-6 bg-slate-400" />
              <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                Tanya Jawab
              </span>
              <span className="h-px w-6 bg-slate-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Pertanyaan Umum</h2>
          </FadeUp>

          <div className="grid gap-3.5">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-slate-200 bg-[#F8F9FA] p-5 sm:p-6 shadow-xs">
                <h3 className="font-bold text-slate-900 text-base mb-2">{faq.q}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA]">
        <FadeUp className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl border border-slate-800 bg-[#1E242E] text-white p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Siap mengisi pipeline sales dengan prospek baru?
            </h2>
            <p className="mx-auto text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed mb-8">
              Buat akun portal{welcomeCredits > 0
                ? welcomeBonusBreakdown
                  ? ` dan nikmati ${welcomeCredits} kredit gratis (${welcomeBonusBreakdown})`
                  : ` dan nikmati ${welcomeCredits} kredit gratis`
                : ""} untuk mulai mencari database bisnis di kota Anda.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/portal/register">
                <Button size="lg" className="h-12 w-full rounded-full bg-white text-slate-900 hover:bg-slate-100 font-medium px-8 sm:w-auto transition-colors">
                  Buat Akun Portal Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/portal/login">
                <Button size="lg" variant="outline" className="h-12 w-full rounded-full border border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white px-8 font-medium sm:w-auto transition-colors">
                  Login Klien
                </Button>
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>
    </div>
  );
}
