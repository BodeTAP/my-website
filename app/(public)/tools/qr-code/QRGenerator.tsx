"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Download, QrCode, Link2, MessageCircle, Type, RefreshCw } from "lucide-react";

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6282221682343";

type Tab = "url" | "whatsapp" | "text";

const TABS: { id: Tab; label: string; icon: React.ElementType; placeholder: string }[] = [
  { id: "url",       label: "URL / Link",  icon: Link2,          placeholder: "https://namabisnis.com" },
  { id: "whatsapp",  label: "WhatsApp",    icon: MessageCircle,  placeholder: "08xxxxxxxxxx" },
  { id: "text",      label: "Teks Bebas",  icon: Type,           placeholder: "Nama bisnis, alamat, atau teks apapun" },
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
  const [key,   setKey]   = useState(0); // force re-render image

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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Left: Input */}
      <div className="space-y-5">
        {/* Tab selector */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3 text-sm">
            <span className="text-blue-400 mr-2">01</span> Jenis QR Code
          </h3>
          <div className="flex flex-col gap-2">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  tab === t.id
                    ? "bg-blue-600/15 border-blue-500/40 text-white"
                    : "glass border-white/8 text-blue-200/60 hover:border-white/20"
                }`}
              >
                <t.icon className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3 text-sm">
            <span className="text-blue-400 mr-2">02</span> {activeTab.label}
          </h3>
          {tab === "whatsapp" ? (
            <div className="space-y-2">
              <input
                type="tel"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="08xxxxxxxxxx atau 628xxxxxxxxxx"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-blue-200/25 focus:outline-none focus:border-blue-500/50"
              />
              <p className="text-blue-200/35 text-xs">QR akan membuka chat WhatsApp ke nomor ini</p>
            </div>
          ) : tab === "text" ? (
            <textarea
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={activeTab.placeholder}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-blue-200/25 focus:outline-none focus:border-blue-500/50 resize-none"
            />
          ) : (
            <input
              type="url"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={activeTab.placeholder}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-blue-200/25 focus:outline-none focus:border-blue-500/50"
            />
          )}
        </div>

        {/* Size selector */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3 text-sm">
            <span className="text-blue-400 mr-2">03</span> Ukuran ({size}×{size}px)
          </h3>
          <div className="flex gap-2">
            {SIZES.map(s => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`flex-1 py-2 rounded-xl border text-sm transition-all ${
                  size === s
                    ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                    : "glass border-white/10 text-blue-200/50 hover:border-white/20"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="glass rounded-2xl p-5 flex flex-col items-center justify-center gap-4 min-h-64">
        {imageUrl ? (
          <>
            <div className="bg-white p-3 rounded-2xl shadow-lg">
              <Image
                key={`${imageUrl}-${key}`}
                src={imageUrl}
                alt="QR Code"
                width={size}
                height={size}
                className="block"
                unoptimized
              />
            </div>
            <div className="flex gap-2 w-full">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                <Download className="w-4 h-4" /> Unduh PNG
              </button>
              <button
                onClick={() => setKey(k => k + 1)}
                className="p-2.5 glass border border-white/10 rounded-xl text-blue-200/50 hover:text-white transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-blue-200/30 text-xs text-center break-all line-clamp-2">{qrData}</p>
          </>
        ) : (
          <div className="text-center">
            <QrCode className="w-16 h-16 text-blue-200/10 mx-auto mb-3" />
            <p className="text-blue-200/30 text-sm">QR Code akan muncul di sini</p>
            <p className="text-blue-200/20 text-xs mt-1">Isi input di sebelah kiri</p>
          </div>
        )}
      </div>
    </div>
  );
}
