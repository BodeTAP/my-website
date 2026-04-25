import { ImageResponse } from "next/og";

export const runtime     = "edge";
export const alt         = "MFWEB — Jasa Pembuatan Website Profesional untuk Bisnis Lokal";
export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #070f1e 0%, #0d1b35 55%, #1a3a6b 100%)",
          fontFamily: "Arial, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative orb top-right */}
        <div style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)",
        }} />
        {/* Decorative orb bottom-left */}
        <div style={{
          position: "absolute",
          bottom: -100,
          left: -60,
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(29,78,216,0.20) 0%, transparent 70%)",
        }} />

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 36 }}>
          <div style={{
            width: 72,
            height: 72,
            background: "white",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {/* Simple M mark */}
            <div style={{
              fontSize: 38,
              fontWeight: 900,
              color: "#1e40af",
              lineHeight: 1,
            }}>M</div>
          </div>
          <div style={{
            fontSize: 68,
            fontWeight: 800,
            color: "white",
            letterSpacing: -2,
            display: "flex",
          }}>
            MF<span style={{ color: "#60a5fa" }}>WEB</span>
          </div>
        </div>

        {/* Main headline */}
        <div style={{
          fontSize: 48,
          fontWeight: 700,
          color: "white",
          textAlign: "center",
          maxWidth: 860,
          lineHeight: 1.25,
          marginBottom: 18,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          Jasa Pembuatan Website Profesional
        </div>

        {/* Sub headline */}
        <div style={{
          fontSize: 28,
          color: "rgba(147,197,253,0.75)",
          textAlign: "center",
          marginBottom: 48,
          display: "flex",
        }}>
          untuk Bisnis Lokal Indonesia
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 16, marginBottom: 48 }}>
          {["⚡ Cepat", "📈 SEO-Friendly", "💰 Mulai Rp 800K"].map((item) => (
            <div
              key={item}
              style={{
                background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.35)",
                borderRadius: 50,
                padding: "10px 24px",
                color: "#93c5fd",
                fontSize: 20,
                display: "flex",
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{
          fontSize: 20,
          color: "rgba(147,197,253,0.45)",
          display: "flex",
        }}>
          mfweb.maffisorp.id
        </div>
      </div>
    ),
    { ...size },
  );
}
