"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, QrCode, Link2, MessageCircle, Type, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Tab = "url" | "whatsapp" | "text";

const TABS: { id: Tab; label: string; icon: React.ElementType; placeholder: string }[] = [
  { id: "url",       label: "URL / Tautan Website", icon: Link2,          placeholder: "https://namabisnis.com" },
  { id: "whatsapp",  label: "Kontak WhatsApp",     icon: MessageCircle,  placeholder: "08xxxxxxxxxx atau 628xxxxxxxxxx" },
  { id: "text",      label: "Teks Bebas / Catatan", icon: Type,           placeholder: "Tuliskan nama usaha, deskripsi, atau pesan" },
];

const SIZES = [200, 300, 400, 500];

function buildQRData(tab: Tab, value: string): string {
  if (!value.trim()) return "";
  if (tab === "url") {
    return value.startsWith("http") ? value : `https://${value}`;
  }
  if (tab === "whatsapp") {
    const phone = value.replace(/\D/g, "").replace(/^0/, "62");
    return `https://wa.me/${phone}`;
  }
  return value;
}

function qrUrl(data: string, size: number) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&format=png&ecc=M&margin=1`;
}

export default function QRGenerator() {
  const [tab,   setTab]   = useState<Tab>("url");
  const [value, setValue] = useState("");
  const [size,  setSize]  = useState(300);
  const [key,   setKey]   = useState(0);

  const qrData    = buildQRData(tab, value);
  const imageUrl  = qrData ? qrUrl(qrData, size) : null;

  function handleTabChange(t: Tab) {
    setTab(t);
    setValue("");
  }

  async function handleDownload() {
    if (!imageUrl) return;
    try {
      const res  = await fetch(imageUrl);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `qrcode-mfweb.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank");
    }
  }

  const activeTab = TABS.find(t => t.id === tab)!;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
      {/* Left: Input Options */}
      <div className="space-y-5">
        {/* Tab selector */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-6 bg-slate-400" />
            <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">Langkah 1</span>
          </div>
          <h3 className="text-slate-900 font-bold text-sm mb-3">Tipe Data QR</h3>
          <div className="flex flex-col gap-2">
            {TABS.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTabChange(t.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  tab === t.id
                    ? "bg-slate-900 border-slate-900 text-white shadow-xs font-medium"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <t.icon className="w-4 h-4 shrink-0" />
                <span className="text-sm">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-6 bg-slate-400" />
            <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">Langkah 2</span>
          </div>
          <h3 className="text-slate-900 font-bold text-sm mb-3">{activeTab.label}</h3>
          {tab === "whatsapp" ? (
            <div className="space-y-2">
              <input
                type="tel"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="08xxxxxxxxxx atau 628xxxxxxxxxx"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono transition-all"
              />
              <p className="text-slate-500 text-xs font-mono">Kode QR akan membuka tautan pesan langsung ke nomor ini.</p>
            </div>
          ) : tab === "text" ? (
            <textarea
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={activeTab.placeholder}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none font-mono transition-all"
            />
          ) : (
            <input
              type="url"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={activeTab.placeholder}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono transition-all"
            />
          )}
        </div>

        {/* Size selector */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-6 bg-slate-400" />
            <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">Langkah 3</span>
          </div>
          <h3 className="text-slate-900 font-bold text-sm mb-3">Resolusi Gambar ({size}×{size}px)</h3>
          <div className="flex gap-2">
            {SIZES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`flex-1 py-2 rounded-xl border text-xs font-mono transition-all ${
                  size === s
                    ? "bg-slate-900 border-slate-900 text-white font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white"
                }`}
              >
                {s}px
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Output Preview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col items-center justify-center gap-5 shadow-xs min-h-[360px]">
        {imageUrl ? (
          <>
            <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <Image
                key={`${imageUrl}-${key}`}
                src={imageUrl}
                alt="QR Code"
                width={size}
                height={size}
                className="block max-w-[240px] max-h-[240px] w-auto h-auto"
                unoptimized
              />
            </div>
            <div className="flex gap-2 w-full max-w-xs">
              <Button
                onClick={handleDownload}
                className="flex-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-11 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" /> Unduh PNG
              </Button>
              <button
                onClick={() => setKey(k => k + 1)}
                className="p-3 border border-slate-200 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                title="Refresh gambar"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-400 text-xs font-mono text-center break-all line-clamp-2 max-w-xs">{qrData}</p>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 border border-slate-200">
              <QrCode className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-900 font-bold text-sm">Pratinjau QR Code</p>
            <p className="text-slate-500 text-xs mt-1">Isi formulir di sebelah kiri untuk membuat kode QR instan</p>
          </div>
        )}
      </div>
    </div>
  );
}
