-- CreateTable
CREATE TABLE "proposal_templates" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "sections" JSONB NOT NULL,
    "variables" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_proposals" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "templateId" TEXT,
    "title" TEXT NOT NULL,
    "prospectName" TEXT,
    "templateName" TEXT,
    "input" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "proposal_templates_clientId_idx" ON "proposal_templates"("clientId");

-- CreateIndex
CREATE INDEX "generated_proposals_clientId_createdAt_idx" ON "generated_proposals"("clientId", "createdAt");

-- AddForeignKey
ALTER TABLE "proposal_templates" ADD CONSTRAINT "proposal_templates_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_proposals" ADD CONSTRAINT "generated_proposals_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_proposals" ADD CONSTRAINT "generated_proposals_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "proposal_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

