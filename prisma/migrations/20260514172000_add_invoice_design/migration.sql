-- AlterTable
ALTER TABLE "generated_invoices"
ADD COLUMN "templateName" TEXT,
ADD COLUMN "design" JSONB;

-- CreateTable
CREATE TABLE "invoice_brand_kits" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "logoUrl" TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#1d4ed8',
  "accentColor" TEXT NOT NULL DEFAULT '#0d9488',
  "fontStyle" TEXT NOT NULL DEFAULT 'sans',
  "layout" TEXT NOT NULL DEFAULT 'corporate',
  "logoPosition" TEXT NOT NULL DEFAULT 'left',
  "showLogo" BOOLEAN NOT NULL DEFAULT true,
  "showInvoiceNo" BOOLEAN NOT NULL DEFAULT true,
  "showDueDate" BOOLEAN NOT NULL DEFAULT true,
  "showSender" BOOLEAN NOT NULL DEFAULT true,
  "showRecipient" BOOLEAN NOT NULL DEFAULT true,
  "showFooter" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "invoice_brand_kits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoice_brand_kits_clientId_key" ON "invoice_brand_kits"("clientId");

-- AddForeignKey
ALTER TABLE "invoice_brand_kits"
ADD CONSTRAINT "invoice_brand_kits_clientId_fkey"
FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
