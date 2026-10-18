import type { Metadata } from "next";
import QRGenerator from "./QRGenerator";
import Breadcrumb from "@/components/public/Breadcrumb";
import { JsonLd, buildPublicBreadcrumbJsonLd } from "@/components/public/JsonLd";

export const metadata: Metadata = {
  title: "Generator QR Code Gratis — URL, WhatsApp, Teks",
  description: "Buat QR Code gratis untuk URL website, nomor WhatsApp, atau teks apapun. Langsung download PNG, tanpa daftar.",
  alternates: { canonical: "/tools/qr-code" },
};

export default function QRCodePage() {
  const breadcrumbJsonLd = buildPublicBreadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "Generator QR Code", path: "/tools/qr-code" },
  ]);

  return (
    <div className="min-h-screen bg-white">
      <JsonLd id="json-ld-breadcrumb-qr-code" data={breadcrumbJsonLd} />

      {/* Hero */}
      <section className="w-full bg-[#1E242E] text-white pt-24 pb-16 sm:pt-28 sm:pb-20 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Tools", href: "/tools" }, { label: "Generator QR Code" }]} />
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-px w-8 bg-slate-500" />
              <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                Free Utility
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Generator QR Code Instan
            </h1>
            <p className="mt-4 text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Buat kode QR resolusi tinggi untuk tautan web, nomor WhatsApp, atau teks bebas. Siap diunduh dalam format gambar PNG secara cuma-cuma tanpa batas penggunaan.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <QRGenerator />
        </div>
      </section>
    </div>
  );
}
