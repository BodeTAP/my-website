-- WhatsApp broadcast consent and per-recipient audit log

CREATE TYPE "WhatsAppOptInStatus" AS ENUM ('UNKNOWN', 'OPTED_IN', 'OPTED_OUT');

ALTER TABLE "leads"
  ADD COLUMN "waOptInStatus" "WhatsAppOptInStatus" NOT NULL DEFAULT 'UNKNOWN',
  ADD COLUMN "waOptInAt" TIMESTAMP(3),
  ADD COLUMN "waOptInSource" TEXT,
  ADD COLUMN "waOptOutAt" TIMESTAMP(3),
  ADD COLUMN "waOptOutReason" TEXT,
  ADD COLUMN "doNotContact" BOOLEAN NOT NULL DEFAULT false;

CREATE TYPE "BroadcastRecipientStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED', 'SKIPPED', 'OPTED_OUT');

CREATE TABLE "broadcast_recipients" (
  "id" TEXT NOT NULL,
  "broadcastId" TEXT NOT NULL,
  "leadId" TEXT,
  "phone" TEXT NOT NULL,
  "status" "BroadcastRecipientStatus" NOT NULL DEFAULT 'QUEUED',
  "skipReason" TEXT,
  "providerResponse" TEXT,
  "messageSnippet" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "broadcast_recipients_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "broadcast_recipients_broadcastId_idx" ON "broadcast_recipients"("broadcastId");
CREATE INDEX "broadcast_recipients_leadId_idx" ON "broadcast_recipients"("leadId");
CREATE INDEX "broadcast_recipients_phone_idx" ON "broadcast_recipients"("phone");

ALTER TABLE "broadcast_recipients"
  ADD CONSTRAINT "broadcast_recipients_broadcastId_fkey"
  FOREIGN KEY ("broadcastId") REFERENCES "broadcast_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "broadcast_recipients"
  ADD CONSTRAINT "broadcast_recipients_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
