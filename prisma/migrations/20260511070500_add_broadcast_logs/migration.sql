-- Backfill missing broadcast_logs migration so shadow database replay is valid.

CREATE TABLE IF NOT EXISTS "broadcast_logs" (
  "id" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "totalLeads" INTEGER NOT NULL,
  "sent" INTEGER NOT NULL,
  "failed" INTEGER NOT NULL,
  "skipped" INTEGER NOT NULL DEFAULT 0,
  "devices" INTEGER NOT NULL DEFAULT 1,
  "delayRange" TEXT NOT NULL,
  "messageSnippet" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "broadcast_logs_pkey" PRIMARY KEY ("id")
);
