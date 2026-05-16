CREATE TABLE "lead_finder_lists" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "query" TEXT NOT NULL,
  "city" TEXT,
  "mode" TEXT NOT NULL DEFAULT 'standard',
  "socialScan" BOOLEAN NOT NULL DEFAULT false,
  "total" INTEGER NOT NULL DEFAULT 0,
  "items" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "lead_finder_lists_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "lead_finder_lists_clientId_createdAt_idx" ON "lead_finder_lists"("clientId", "createdAt");

ALTER TABLE "lead_finder_lists"
  ADD CONSTRAINT "lead_finder_lists_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "clients"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
