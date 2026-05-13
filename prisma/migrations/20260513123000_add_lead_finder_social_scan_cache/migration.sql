CREATE TABLE "lead_finder_social_scan_cache" (
    "id" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "socialLinks" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_finder_social_scan_cache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lead_finder_social_scan_cache_websiteUrl_key" ON "lead_finder_social_scan_cache"("websiteUrl");
CREATE INDEX "lead_finder_social_scan_cache_scannedAt_idx" ON "lead_finder_social_scan_cache"("scannedAt");
