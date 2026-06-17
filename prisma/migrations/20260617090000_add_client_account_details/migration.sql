-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'FOLLOW_UP', 'INACTIVE', 'CHURNED');

-- CreateEnum
CREATE TYPE "ContactPreference" AS ENUM ('WHATSAPP', 'EMAIL', 'PHONE');

-- AlterTable
ALTER TABLE "clients"
ADD COLUMN "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "alternatePhone" TEXT,
ADD COLUMN "picName" TEXT,
ADD COLUMN "picRole" TEXT,
ADD COLUMN "billingEmail" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "province" TEXT,
ADD COLUMN "preferredContact" "ContactPreference" NOT NULL DEFAULT 'WHATSAPP',
ADD COLUMN "contactHours" TEXT,
ADD COLUMN "source" TEXT,
ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "internalNotes" TEXT,
ADD COLUMN "accountManagerId" TEXT,
ADD COLUMN "lastContactedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "clients_accountManagerId_idx" ON "clients"("accountManagerId");

-- CreateIndex
CREATE INDEX "clients_status_idx" ON "clients"("status");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
