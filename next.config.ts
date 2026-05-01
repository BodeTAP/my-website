import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
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
