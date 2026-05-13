-- AlterTable
ALTER TABLE "generated_proposals"
ADD COLUMN "design" JSONB;

-- CreateTable
CREATE TABLE "proposal_brand_kits" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#1e40af',
    "accentColor" TEXT NOT NULL DEFAULT '#0d9488',
    "fontStyle" TEXT NOT NULL DEFAULT 'sans',
    "layout" TEXT NOT NULL DEFAULT 'corporate',
    "logoPosition" TEXT NOT NULL DEFAULT 'left',
    "showLogo" BOOLEAN NOT NULL DEFAULT true,
    "showProposalNo" BOOLEAN NOT NULL DEFAULT true,
    "showDate" BOOLEAN NOT NULL DEFAULT true,
    "showRecipient" BOOLEAN NOT NULL DEFAULT true,
    "showFooter" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_brand_kits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proposal_brand_kits_clientId_key" ON "proposal_brand_kits"("clientId");

-- AddForeignKey
ALTER TABLE "proposal_brand_kits" ADD CONSTRAINT "proposal_brand_kits_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

