import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Coins,
  Download,
  FileText,
  Layers3,
  Palette,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";
import { JsonLd } from "@/components/public/JsonLd";

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

type Faq = {
  q: string;
  a: string;
};

type PricingItem = {
  label: string;
  value: string;
  hint: string;
};

type Mockup = "proposal" | "invoice";

type PaidToolLandingProps = {
  eyebrow: string;
  title: string;
  description: string;
  canonicalPath: string;
  primaryCta: string;
  portalHref: string;
  accent: "blue" | "emerald" | "amber";
  mockup: Mockup;
  creditCost: number;
  features: Feature[];
  workflow: string[];
  useCases: string[];
  pricing: PricingItem[];
  faqs: Faq[];
  welcomeCredits?: number;
  welcomeBonusBreakdown?: string;
  children?: React.ReactNode;
};

export default function PaidToolLanding({
  eyebrow,
  title,
  description,
  canonicalPath,
  primaryCta,
  portalHref,
  accent,
  mockup,
  creditCost,
  features,
  workflow,
  useCases,
  pricing,
  faqs,
  welcomeCredits = 0,
  welcomeBonusBreakdown = "",
  children,
}: PaidToolLandingProps) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://mfweb.maffisorp.id").replace(/\/$/, "");
  const pageUrl = `${siteUrl}${canonicalPath}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: eyebrow,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: pageUrl,
      description,
      isAccessibleForFree: false,
      featureList: features.map((feature) => feature.title),
      provider: {
        "@type": "Organization",
        name: "MFWEB",
        url: siteUrl,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Beranda",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Tools",
          item: `${siteUrl}/tools`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: eyebrow,
          item: pageUrl,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <JsonLd id={`json-ld-${mockup}-landing`} data={jsonLd} />

      {/* ── Full-Width Deep Slate Hero ────────────────────── */}
      <section className="w-full bg-[#1E242E] text-white pt-24 pb-16 sm:pt-28 sm:pb-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <FadeUp>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-px w-8 bg-slate-500" />
                  <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                    {eyebrow}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  {title}
                </h1>
                <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                  {description}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/portal/register">
                    <Button size="lg" className="h-12 w-full rounded-full bg-white text-slate-900 hover:bg-slate-100 font-medium px-8 sm:w-auto transition-colors">
                      {primaryCta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#pricing">
                    <Button size="lg" variant="outline" className="h-12 w-full rounded-full border border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white px-8 font-medium sm:w-auto transition-colors">
                      Lihat Sistem Kredit
                    </Button>
                  </Link>
                </div>
                <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-300" />
                    Download PDF Resmi
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-300" />
                    Brand Kit Klien
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-300" />
                    {creditCost} kredit / dokumen
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

            <FadeUp delay={0.1}>
              {mockup === "proposal" ? <ProposalMockup accent={accent} /> : <InvoiceMockup accent={accent} />}
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Optional Interactive Free Tool Section ──────────── */}
      {children && (
        <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA] border-b border-slate-200">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </section>
      )}

      {/* ── Features Grid ─────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="mb-12 max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-6 bg-slate-400" />
              <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                Fitur Unggulan
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Dirancang untuk kerja yang cepat dan rapi
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Bukan sekadar formulir polos. Tool ini membantu Anda membuat dokumen komersial berstandar profesional tanpa mengulang layout manual.
            </p>
          </FadeUp>

          <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
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
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <FadeUp>
            <div className="rounded-3xl border border-slate-800 bg-[#1E242E] text-white p-8 sm:p-10">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                <Layers3 className="h-5 w-5" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Alur kerja praktis & efisien</h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Mulai dari mengisi data, memilih template visual, pratinjau instan, lalu unduh PDF berkualitas tinggi dalam hitungan detik.
              </p>
              <Link href={portalHref}>
                <Button className="h-11 rounded-full bg-white text-slate-900 hover:bg-slate-100 px-6 font-medium text-sm transition-colors">
                  Buka Tool di Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </FadeUp>

          <StaggerChildren className="space-y-3">
            {workflow.map((item, index) => (
              <StaggerItem key={item}>
                <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-[#F8F9FA] p-4 shadow-xs">
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

      {/* ── Pricing Section ───────────────────────────────── */}
      <section id="pricing" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA] border-b border-slate-200">
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
              Transparan sebelum digunakan
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Kredit hanya dipotong saat dokumen berhasil digenerate. Anda bebas merancang dan mengedit draft tanpa biaya.
            </p>
          </FadeUp>

          <StaggerChildren className="grid gap-6 md:grid-cols-3">
            {pricing.map((item, index) => (
              <StaggerItem key={item.label}>
                <div className={`h-full rounded-2xl border p-6 flex flex-col ${
                  index === 0
                    ? "border-slate-900 bg-white ring-1 ring-slate-900 shadow-xs"
                    : "border-slate-200 bg-white shadow-xs"
                }`}>
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-500">{item.label}</p>
                  <p className="mt-3 text-3xl font-bold font-mono text-slate-900">{item.value}</p>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.hint}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Use Cases Section ─────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-2 lg:items-center">
          <FadeUp>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-px w-6 bg-slate-400" />
                <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                  Penerapan Praktis
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Cocok untuk siapa saja?</h2>
              <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                Alat ini dirancang khusus bagi pelaku usaha dan tim profesional yang rutin menyusun berkas penawaran dan administrasi tagihan.
              </p>
            </div>
          </FadeUp>

          <StaggerChildren className="grid gap-3.5">
            {useCases.map((item) => (
              <StaggerItem key={item}>
                <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-[#F8F9FA] p-4 shadow-xs">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-800" />
                  <p className="text-sm leading-relaxed text-slate-700 font-medium">{item}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── FAQs Section ──────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA] border-b border-slate-200">
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
              <div key={faq.q} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
                <h3 className="font-bold text-slate-900 text-base mb-2">{faq.q}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final Call to Action ──────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <FadeUp className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl border border-slate-800 bg-[#1E242E] text-white p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Siap membuat dokumen komersial lebih cepat?
            </h2>
            <p className="mx-auto text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed mb-8">
              Daftar akun portal sekarang{welcomeCredits > 0
                ? welcomeBonusBreakdown
                  ? ` dan nikmati ${welcomeCredits} kredit gratis (${welcomeBonusBreakdown})`
                  : ` dan nikmati ${welcomeCredits} kredit gratis`
                : ""} untuk mulai membuat berkas Anda.
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

function ProposalMockup({ accent }: { accent: PaidToolLandingProps["accent"] }) {
  void accent;
  return (
    <div className="relative rounded-3xl border border-slate-800 bg-[#161B22] p-3 shadow-xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900">
        <div className="flex items-center justify-between px-6 py-5 bg-[#1E242E] text-white border-b border-slate-800">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Proposal Bisnis</p>
            <h3 className="mt-1 text-xl font-bold text-white">Digital Growth Plan</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="space-y-3.5 p-6 text-xs">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Nama Klien</p>
              <p className="mt-1 font-bold text-slate-900">Rana Beauty Studio</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Masa Berlaku</p>
              <p className="mt-1 font-bold text-slate-900 font-mono">30 Hari</p>
            </div>
          </div>
          {["Ringkasan Eksekutif", "Rincian Deliverables", "Estimasi Timeline"].map((label) => (
            <div key={label} className="rounded-xl border border-slate-100 p-3.5 bg-white">
              <p className="font-bold text-slate-900">{label}</p>
              <div className="mt-2 space-y-1.5">
                <div className="h-1.5 rounded-full bg-slate-200" />
                <div className="h-1.5 w-3/4 rounded-full bg-slate-200" />
              </div>
            </div>
          ))}
          <div className="rounded-xl bg-[#1E242E] text-white p-3.5 text-center font-mono text-xs">
            Format PDF Resmi dengan Brand Kit
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoiceMockup({ accent }: { accent: PaidToolLandingProps["accent"] }) {
  void accent;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mockNumber = `INV-${yyyy}-0001`;
  const issueLabel = today.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="relative rounded-3xl border border-slate-800 bg-[#161B22] p-3 shadow-xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900">
        <div className="flex items-center justify-between px-6 py-5 bg-[#1E242E] text-white border-b border-slate-800">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Invoice Tagihan</p>
            <h3 className="mt-1 text-xl font-bold font-mono text-white">{mockNumber}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <ReceiptText className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="space-y-3.5 p-6 text-xs">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Ditagihkan Ke</p>
              <p className="mt-1 font-bold text-slate-900">Ayla Skin Clinic</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Tanggal Terbit</p>
              <p className="mt-1 font-bold text-slate-900 font-mono">{issueLabel}</p>
            </div>
          </div>
          {[
            ["Pembuatan Website Bisnis", "Rp 2.500.000"],
            ["Copywriting & SEO Setup", "Rp 750.000"],
            ["PPN 11%", "Rp 357.500"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5">
              <p className="font-medium text-slate-700">{label}</p>
              <p className="font-bold font-mono text-slate-900">{value}</p>
            </div>
          ))}
          <div className="rounded-xl bg-[#1E242E] text-white p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Tagihan</p>
              <p className="text-base font-bold font-mono text-white">Rp 3.607.500</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-mono text-slate-700">
              <Download className="h-3 w-3" />
              Download PDF
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-mono text-slate-700">
              <Palette className="h-3 w-3" />
              Template
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
