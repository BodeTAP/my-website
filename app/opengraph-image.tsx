import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs"; // Menggunakan nodejs agar bisa membaca file dari sistem lokal dengan aman
export const alt =
  "MFWEB — Jasa Pembuatan Website Profesional untuk Bisnis Lokal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Membaca file logo.png langsung dari folder public
  const logoPath = join(process.cwd(), "public", "logo.png");
  const logoBuffer = readFileSync(logoPath);
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#030914",
        backgroundImage:
          "radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.05) 2%, transparent 0%)",
        backgroundSize: "100px 100px",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow Effects */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-30%",
          left: "-10%",
          width: "800px",
          height: "800px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(79,70,229,0.3) 0%, transparent 60%)",
          filter: "blur(80px)",
        }}
      />

      {/* Central Glassmorphism Card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          borderRadius: 32,
          padding: "60px 80px",
          maxWidth: "90%",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Logo row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)",
              overflow: "hidden",
            }}
          >
            {/* Using the actual logo */}
            <img src={logoSrc} alt="Logo" width="60" height="60" style={{ objectFit: 'contain' }} />
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "white",
              letterSpacing: -2,
              display: "flex",
            }}
          >
            MF<span style={{ color: "#60a5fa" }}>WEB</span>
          </div>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.1,
            marginBottom: 20,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            letterSpacing: -1,
          }}
        >
          Jasa Pembuatan Website Profesional
        </div>

        {/* Sub headline */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: "rgba(147,197,253,0.8)",
            textAlign: "center",
            marginBottom: 50,
            display: "flex",
          }}
        >
          Tingkatkan Omset Bisnis Lokal Anda
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 20 }}>
          {["Premium Design", "SEO Optimized", "Fast Load"].map((item) => (
            <div
              key={item}
              style={{
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.3)",
                borderRadius: 100,
                padding: "12px 32px",
                color: "#93c5fd",
                fontSize: 22,
                fontWeight: 600,
                display: "flex",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom URL */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          fontSize: 24,
          fontWeight: 600,
          color: "rgba(255,255,255,0.3)",
          display: "flex",
          letterSpacing: 2,
        }}
      >
        MFWEB.MAFFISORP.ID
      </div>
    </div>,
    { ...size },
  );
}
