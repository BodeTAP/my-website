import type { Metadata } from "next";
import QRGenerator from "./QRGenerator";
import Breadcrumb from "@/components/public/Breadcrumb";

export const metadata: Metadata = {
  title: "Generator QR Code Gratis — URL, WhatsApp, Teks | MFWEB",
  description: "Buat QR Code gratis untuk URL website, nomor WhatsApp, atau teks apapun. Langsung download PNG, tanpa daftar.",
  alternates: { canonical: "/tools/qr-code" },
};

export default function QRCodePage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={[{ label: "Tools", href: "/tools" }, { label: "Generator QR Code" }]} />
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-blue-300 mb-6 border border-blue-500/20">
            🔲 Gratis Selamanya
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Generator <span className="text-gradient">QR Code</span>
          </h1>
          <p className="text-blue-200/60 max-w-xl mx-auto">
            Buat QR Code untuk URL website, nomor WhatsApp, atau teks bebas.
            Langsung download PNG resolusi tinggi, gratis tanpa daftar.
          </p>
        </div>
        <QRGenerator />
      </div>
    </div>
  );
}
