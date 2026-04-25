"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="id">
      <body style={{ margin: 0, background: "#070f1e", fontFamily: "Arial, sans-serif" }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}>
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <p style={{ color: "#60a5fa", fontSize: "13px", marginBottom: "8px", letterSpacing: "2px" }}>
              MFWEB
            </p>
            <h2 style={{ color: "white", fontSize: "22px", fontWeight: "bold", marginBottom: "12px" }}>
              Terjadi Kesalahan
            </h2>
            <p style={{ color: "rgba(147,197,253,0.6)", fontSize: "14px", marginBottom: "28px", lineHeight: "1.6" }}>
              Kami sudah mencatat error ini dan akan segera memperbaikinya.
              Coba muat ulang halaman atau kembali nanti.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{
                  background: "#1e40af",
                  color: "white",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Coba Lagi
              </button>
              <button
                onClick={() => window.location.href = "/"}
                style={{
                  background: "transparent",
                  color: "rgba(147,197,253,0.7)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Ke Beranda
              </button>
            </div>
            {error.digest && (
              <p style={{ color: "rgba(147,197,253,0.3)", fontSize: "11px", marginTop: "20px" }}>
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
