-- AlterTable
ALTER TABLE "generated_proposals"
ADD COLUMN "proposalNo" TEXT,
ADD COLUMN "businessName" TEXT,
ADD COLUMN "whatsapp" TEXT,
ADD COLUMN "validUntil" TIMESTAMP(3),
ADD COLUMN "notes" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "generated_proposals_proposalNo_key" ON "generated_proposals"("proposalNo");

