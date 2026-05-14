CREATE TABLE "generated_invoices" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "invoiceNo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "fromEmail" TEXT,
    "fromPhone" TEXT,
    "fromAddress" TEXT,
    "billToName" TEXT NOT NULL,
    "billToEmail" TEXT,
    "billToPhone" TEXT,
    "billToAddress" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "lineItems" JSONB NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "taxLabel" TEXT,
    "taxAmount" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "notes" TEXT,
    "footer" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_invoices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "generated_invoices_invoiceNo_key" ON "generated_invoices"("invoiceNo");
CREATE INDEX "generated_invoices_clientId_createdAt_idx" ON "generated_invoices"("clientId", "createdAt");

ALTER TABLE "generated_invoices" ADD CONSTRAINT "generated_invoices_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
