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
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";

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
};

const accentClass = {
  blue: {
    ring: "border-blue-500/25 bg-blue-500/10 text-blue-300",
    button: "bg-blue-600 hover:bg-blue-500 text-white",
    soft: "bg-blue-500/10 border-blue-500/25",
    icon: "text-blue-300",
  },
  emerald: {
    ring: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    button: "bg-emerald-500 hover:bg-emerald-400 text-[#041014]",
    soft: "bg-emerald-500/10 border-emerald-500/25",
    icon: "text-emerald-300",
  },
  amber: {
    ring: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    button: "bg-amber-400 hover:bg-amber-300 text-[#120b02]",
    soft: "bg-amber-500/10 border-amber-500/25",
    icon: "text-amber-300",
  },
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
}: PaidToolLandingProps) {
  const c = accentClass[accent];
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
          name: "Tools",
          item: `${siteUrl}/tools`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: eyebrow,
          item: pageUrl,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="relative px-4 pt-16 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <FadeUp>
            <div>
              <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest ${c.ring}`}>
                <Sparkles className="h-4 w-4" />
                {eyebrow}
              </div>
              <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-blue-100/65 sm:text-lg">
                {description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/portal/register">
                  <Button size="lg" className={`h-12 w-full rounded-xl px-6 font-bold sm:w-auto ${c.button}`}>
                    {primaryCta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button size="lg" variant="outline" className="h-12 w-full rounded-xl border-white/10 bg-white/5 px-6 font-bold text-white hover:bg-white/10 sm:w-auto">
                    Lihat kredit
                  </Button>
                </Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-blue-200/55">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Download PDF
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Brand kit
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  {creditCost} kredit per dokumen
                </span>
                {welcomeCredits > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Akun baru dapat {welcomeCredits} kredit gratis
                  </span>
                )}
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            {mockup === "proposal" ? <ProposalMockup accent={accent} /> : <InvoiceMockup accent={accent} />}
          </FadeUp>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeUp className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-black text-white sm:text-4xl">Dirancang untuk kerja yang cepat dan rapi</h2>
            <p className="mt-3 text-blue-200/55">
              Bukan sekadar form. Tool ini membantu user membuat dokumen yang terlihat profesional tanpa mengulang pekerjaan manual.
            </p>
          </FadeUp>
          <StaggerChildren className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl border ${c.soft}`}>
                    <feature.icon className={`h-6 w-6 ${c.icon}`} />
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
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl border ${c.soft}`}>
                <Layers3 className={`h-6 w-6 ${c.icon}`} />
              </div>
              <h2 className="text-3xl font-black text-white">Alur kerja yang ringan</h2>
              <p className="mt-3 text-blue-200/55">
                Mulai dari data dasar, pilih template, cek ringkasan, lalu unduh PDF. Cocok untuk pekerjaan berulang di portal klien.
              </p>
              <Link href={portalHref} className="mt-7 inline-flex">
                <Button className={`h-11 rounded-xl px-5 font-black ${c.button}`}>
                  Buka tool di portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </FadeUp>
          <StaggerChildren className="space-y-3">
            {workflow.map((item, index) => (
              <StaggerItem key={item}>
                <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-black ${c.ring}`}>
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
            <h2 className="text-3xl font-black text-white sm:text-4xl">Transparan sebelum dipakai</h2>
            <p className="mt-3 text-blue-200/55">
              Kredit dipotong saat dokumen berhasil dibuat. User tetap bisa mengedit template dan data sebelum generate.
            </p>
          </FadeUp>
          <StaggerChildren className="grid gap-5 md:grid-cols-3">
            {pricing.map((item, index) => (
              <StaggerItem key={item.label}>
                <div className={`h-full rounded-2xl border p-6 ${index === 0 ? c.soft : "border-white/10 bg-white/[0.04]"}`}>
                  <p className="text-sm font-black uppercase tracking-widest text-blue-200/40">{item.label}</p>
                  <p className="mt-4 text-3xl font-black text-white">{item.value}</p>
                  <p className="mt-3 text-sm leading-relaxed text-blue-200/55">{item.hint}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <FadeUp>
            <div>
              <h2 className="text-3xl font-black text-white sm:text-4xl">Cocok untuk siapa?</h2>
              <p className="mt-3 text-blue-200/55">
                Tool berbayar ini paling berguna saat user perlu membuat dokumen rapi berkali-kali tanpa membuka aplikasi desain lain.
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
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl border ${c.soft}`}>
                  <ShieldCheck className={`h-6 w-6 ${c.icon}`} />
                </div>
                <h2 className="text-3xl font-black text-white">Pertanyaan umum</h2>
                <p className="mt-3 text-blue-200/55">
                  Hal penting sebelum memakai tool di portal klien.
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
          <div className={`rounded-3xl border p-8 sm:p-12 ${c.soft}`}>
            <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${c.soft}`}>
              <Sparkles className={`h-7 w-7 ${c.icon}`} />
            </div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">Siap membuat dokumen lebih cepat?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-blue-100/65">
              Buat akun portal{welcomeCredits > 0 ? ` dan dapatkan ${welcomeCredits} kredit gratis` : ""}, lalu gunakan tool ini kapan pun diperlukan.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/portal/register">
                <Button size="lg" className={`h-12 w-full rounded-xl px-7 font-black sm:w-auto ${c.button}`}>
                  Buat akun portal
                  <ArrowRight className="ml-2 h-4 w-4" />
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

function ProposalMockup({ accent }: { accent: PaidToolLandingProps["accent"] }) {
  void accent;
  return (
    <div className="relative rounded-3xl border border-white/10 bg-[#06101f] p-3 shadow-2xl shadow-black/40">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-950">
        <div className="flex items-center justify-between px-6 py-5" style={{ background: "#1e40af" }}>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-100/70">Proposal</p>
            <h3 className="mt-1 text-2xl font-black text-white">Digital Growth Plan</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="space-y-4 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prospek</p>
              <p className="mt-1 font-black">Rana Beauty Studio</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Valid Until</p>
              <p className="mt-1 font-black">30 hari</p>
            </div>
          </div>
          {["Ringkasan kebutuhan", "Scope layanan", "Timeline pekerjaan"].map((label) => (
            <div key={label} className="rounded-xl border border-slate-200 p-4">
              <p className="font-black">{label}</p>
              <div className="mt-3 space-y-2">
                <div className="h-2 rounded-full bg-slate-200" />
                <div className="h-2 w-4/5 rounded-full bg-slate-200" />
              </div>
            </div>
          ))}
          <div className="rounded-xl border border-slate-900 bg-slate-950 p-4">
            <p className="text-sm font-black text-white">PDF siap download dengan brand kit</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoiceMockup({ accent }: { accent: PaidToolLandingProps["accent"] }) {
  void accent;
  return (
    <div className="relative rounded-3xl border border-white/10 bg-[#06101f] p-3 shadow-2xl shadow-black/40">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-950">
        <div className="flex items-center justify-between px-6 py-5" style={{ background: "#155e75" }}>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-cyan-100/70">Invoice</p>
            <h3 className="mt-1 text-2xl font-black text-white">INV-20260516-001</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">
            <ReceiptText className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="space-y-4 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ditagihkan ke</p>
              <p className="mt-1 font-black">Ayla Skin Clinic</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jatuh tempo</p>
              <p className="mt-1 font-black">7 hari</p>
            </div>
          </div>
          {[
            ["Landing page campaign", "Rp 2.500.000"],
            ["Copywriting section", "Rp 750.000"],
            ["PPN 11%", "Rp 357.500"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <p className="font-bold">{label}</p>
              <p className="font-black">{value}</p>
            </div>
          ))}
          <div className="rounded-xl border border-slate-900 bg-slate-950 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-white">Total</p>
              <p className="text-xl font-black text-white">Rp 3.607.500</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-700">
              <Download className="h-3.5 w-3.5" />
              PDF
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-700">
              <Palette className="h-3.5 w-3.5" />
              Template
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
