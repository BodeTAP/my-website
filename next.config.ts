import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

/**
 * Security Headers — aktif di production maupun development.
 * CSP dikonfigurasi untuk mengizinkan semua tools analitik (Clarity, Vercel)
 * tanpa memblokir fungsionalitas apapun.
 */
const securityHeaders = [
  // Aktifkan DNS prefetch untuk performa
  { key: "X-DNS-Prefetch-Control",  value: "on" },
  // Cegah website Anda di-embed di iframe (anti-clickjacking)
  { key: "X-Frame-Options",         value: "SAMEORIGIN" },
  // Cegah browser menebak-nebak tipe konten (MIME sniffing)
  { key: "X-Content-Type-Options",  value: "nosniff" },
  // Kontrol data referrer yang dikirim ke website lain
  { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
  // Batasi akses ke kamera, mikrofon, GPS
  { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      // Default: hanya izinkan dari domain sendiri
      "default-src 'self'",

      // Script: izinkan inline script (Next.js) + domain analytics
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'" +
        " https://www.googletagmanager.com https://www.google-analytics.com" + // Google Analytics 4
        " https://connect.facebook.net" +                              // Facebook Pixel
        " https://www.clarity.ms https://*.clarity.ms" +               // Microsoft Clarity
        " https://va.vercel-scripts.com https://*.vercel-scripts.com"+ // Vercel Analytics
        " https://*.sentry.io https://js.sentry-cdn.com",              // Sentry monitoring

      // Style: izinkan inline + Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

      // Gambar: izinkan dari semua HTTPS + data URI + blob
      "img-src 'self' data: blob: https:",

      // Font: izinkan Google Fonts
      "font-src 'self' https://fonts.gstatic.com",

      // Koneksi API/WebSocket: izinkan ke semua HTTPS + WSS (untuk HMR dev)
      "connect-src 'self' https: wss:",

      // Worker: dibutuhkan Clarity untuk session recording
      "worker-src blob: 'self'",

      // Larang website ini di-embed di frame dari domain lain
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default withSentryConfig(nextConfig, {
  // Suppress build-time output (auth token warning, source map upload logs)
  silent: true,
  widenClientFileUpload: true,

  // Route errors through /monitoring tunnel to avoid ad blockers
  tunnelRoute: "/monitoring",

  // Remove Sentry debug logger from bundle (replaces deprecated disableLogger)
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },
});
