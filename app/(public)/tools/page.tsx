import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  Coins,
  FileText,
  Gauge,
  QrCode,
  ReceiptText,
  Search,
  SearchCheck,
  Tags,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/public/Breadcrumb";
import { JsonLd, buildBreadcrumbJsonLd } from "@/components/public/JsonLd";
import { getToolSettings } from "@/lib/toolSettings";
import { getWelcomeCreditBreakdown } from "@/lib/welcomeCredits";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mfweb.maffisorp.id";
const pageTitle = "Tools Website, Lead, Proposal, dan Invoice";
const pageDescription =
  "Katalog tools MFWEB untuk cek website, cari lead, membuat proposal PDF, invoice PDF, QR code, estimasi harga, dan audit ringan.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: "/tools" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/tools",
    siteName: "MFWEB",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/opengraph-image"],
  },
};

const freeTools = [
  {
    href: "/tools/cek-kecepatan",
    icon: Gauge,
    tone: "blue" as const,
    label: "Cek Kecepatan Website",
    desc: "Cek performa, Core Web Vitals, dan catatan teknis dari PageSpeed Insights.",
    tags: ["Performa", "Core Web Vitals"],
  },
  {
    href: "/tools/cek-seo",
    icon: SearchCheck,
    tone: "teal" as const,
    label: "Cek SEO Score",
    desc: "Audit title, meta description, heading, OG tags, HTTPS, dan schema dasar.",
    tags: ["On-page", "Schema"],
  },
  {
    href: "/tools/cek-meta-tags",
    icon: Tags,
    tone: "amber" as const,
    label: "Cek Meta Tags",
    desc: "Lihat preview Google dan sosial media sebelum link dibagikan.",
    tags: ["Preview", "Open Graph"],
  },
  {
    href: "/tools/estimasi-harga",
    icon: Calculator,
    tone: "emerald" as const,
    label: "Estimasi Harga Website",
    desc: "Dapatkan estimasi awal dari jenis website, fitur, dan timeline.",
    tags: ["Estimasi", "Brief awal"],
  },
  {
    href: "/tools/qr-code",
    icon: QrCode,
    tone: "blue" as const,
    label: "Generator QR Code",
    desc: "Buat QR untuk URL, WhatsApp, atau teks sederhana tanpa login.",
    tags: ["QR", "Download PNG"],
  },
  {
    href: "/tools/roi-website",
    icon: TrendingUp,
    tone: "teal" as const,
    label: "Kalkulator ROI Website",
    desc: "Hitung potensi lead, omzet, dan waktu balik modal dari website.",
    tags: ["ROI", "Revenue"],
  },
  {
    href: "/tools/generator-nama",
    icon: Wand2,
    tone: "slate" as const,
    label: "Generator Nama Bisnis",
    desc: "Cari opsi nama dan slogan untuk tahap awal validasi brand.",
    tags: ["Nama", "Slogan"],
  },
];

function getPaidTools(settings: Awaited<ReturnType<typeof getToolSettings>>) {
  return [
    {
      href: "/lead-finder",
      icon: Search,
      tone: "blue" as const,
      label: "Lead Finder",
      desc: "Cari prospek bisnis lokal, simpan list, dan export CSV untuk follow up.",
      tags: ["Google Maps", "Saved lists", "CSV"],
      price: `Mulai ${settings.leadFinder.standardCost} kredit`,
    },
    {
      href: "/tools/proposal-generator",
      icon: FileText,
      tone: "amber" as const,
      label: "Proposal Generator",
      desc: "Buat proposal PDF dengan template, brand kit, dan riwayat dokumen.",
      tags: ["Template", "Brand kit", "PDF"],
      price: `${settings.proposalGenerator.creditCost} kredit`,
    },
    {
      href: "/tools/invoice-generator",
      icon: ReceiptText,
      tone: "teal" as const,
      label: "Invoice Generator",
      desc: "Buat invoice PDF dengan item layanan, diskon, PPN 11%, dan status manual.",
      tags: ["PPN 11%", "Duplicate", "PDF"],
      price: `${settings.invoiceGenerator.creditCost} kredit`,
    },
  ];
}

const TONE = {
  blue: {
    icon: "text-blue-300",
    iconBox: "border-blue-500/20 bg-blue-500/10",
    chip: "border-blue-500/15 bg-blue-500/10 text-blue-200/70",
  },
  teal: {
    icon: "text-teal-300",
    iconBox: "border-teal-500/20 bg-teal-500/10",
    chip: "border-teal-500/15 bg-teal-500/10 text-teal-200/70",
  },
  amber: {
    icon: "text-amber-300",
    iconBox: "border-amber-500/20 bg-amber-500/10",
    chip: "border-amber-500/15 bg-amber-500/10 text-amber-200/70",
  },
  emerald: {
    icon: "text-emerald-300",
    iconBox: "border-emerald-500/20 bg-emerald-500/10",
    chip: "border-emerald-500/15 bg-emerald-500/10 text-emerald-200/70",
  },
  slate: {
    icon: "text-slate-200",
    iconBox: "border-white/12 bg-white/[0.04]",
    chip: "border-white/10 bg-white/[0.035] text-blue-100/60",
  },
};

export default async function ToolsPage() {
  const toolSettings = await getToolSettings();
  const paidTools = getPaidTools(toolSettings);
  const welcomeCredits = toolSettings.signupBonus.enabled ? toolSettings.signupBonus.amount : 0;
  const welcomeBonusBreakdown =
    welcomeCredits > 0 ? getWelcomeCreditBreakdown(welcomeCredits, toolSettings).summary : "";
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Beranda", item: SITE_URL },
    { name: "Tools", item: `${SITE_URL}/tools` },
  ]);

  return (
    <div className="min-h-screen bg-[#020611]">
      <JsonLd id="json-ld-breadcrumb-tools" data={breadcrumbJsonLd} />

      <section className="border-b border-white/8 px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb items={[{ label: "Tools" }]} />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200/45">
                Katalog Tools
              </p>
              <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Tools praktis untuk cek website dan merapikan proses sales
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-blue-100/60">
                Pilih tool sesuai pekerjaan hari ini: audit ringan, cari prospek, buat proposal,
                atau siapkan invoice PDF.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#071225] p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                  <Coins className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Akun portal</p>
                  <p className="mt-1 text-sm leading-relaxed text-blue-100/55">
                    Tools premium memakai kredit. Tools gratis bisa dipakai tanpa login.
                  </p>
                  {welcomeCredits > 0 && (
                    <p className="mt-3 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200">
                      {welcomeBonusBreakdown
                        ? `${welcomeCredits} kredit gratis: ${welcomeBonusBreakdown}.`
                        : `${welcomeCredits} kredit gratis untuk akun baru.`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/55">
                Premium
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">Tools untuk pekerjaan berulang</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100/55">
                Dipakai dari portal klien, menyimpan data kerja, dan cocok untuk rutinitas sales atau administrasi.
              </p>
            </div>
            <Link href="/portal/register" className="w-fit">
              <Button className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500">
                Buat akun
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {paidTools.map((tool) => {
              const Icon = tool.icon;
              const tone = TONE[tool.tone];

              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex min-h-[220px] flex-col rounded-lg border border-white/10 bg-[#071225] p-4 transition-colors hover:border-white/20 hover:bg-[#0a1629]"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${tone.iconBox}`}>
                      <Icon className={`h-5 w-5 ${tone.icon}`} />
                    </span>
                    <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
                      {tool.price}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{tool.label}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-blue-100/55">{tool.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tool.tags.map((tag) => (
                      <span key={tag} className={`rounded-md border px-2 py-1 text-[11px] font-medium ${tone.chip}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-200/70 transition-colors group-hover:text-blue-200">
                    Lihat detail
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-white/8 bg-[#06111f] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200/45">
              Gratis
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">Tools cepat tanpa login</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100/55">
              Untuk cek awal sebelum menentukan prioritas perbaikan atau menghubungi tim.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {freeTools.map((tool) => {
              const Icon = tool.icon;
              const tone = TONE[tool.tone];

              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group grid min-h-[130px] grid-cols-[auto_1fr_auto] gap-3 rounded-lg border border-white/10 bg-[#071225] p-4 transition-colors hover:border-white/20 hover:bg-[#0a1629]"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${tone.iconBox}`}>
                    <Icon className={`h-5 w-5 ${tone.icon}`} />
                  </span>
                  <span>
                    <span className="block font-semibold text-white">{tool.label}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-blue-100/52">{tool.desc}</span>
                    <span className="mt-3 flex flex-wrap gap-1.5">
                      {tool.tags.map((tag) => (
                        <span key={tag} className={`rounded-md border px-2 py-1 text-[11px] font-medium ${tone.chip}`}>
                          {tag}
                        </span>
                      ))}
                    </span>
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 text-blue-200/35 transition-colors group-hover:text-blue-200" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-white/8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Butuh dibantu membaca hasilnya?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100/55">
              Kirim hasil audit atau kebutuhan website. Kami bantu susun prioritas yang paling masuk akal.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/contact">
              <Button className="h-10 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-500">
                Konsultasi
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/layanan">
              <Button
                variant="outline"
                className="h-10 rounded-lg border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-white hover:bg-white/[0.07]"
              >
                Lihat layanan
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
