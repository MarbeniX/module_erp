/*
  Warnings:

  - You are about to drop the column `creditDays` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `taxId` on the `Supplier` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Supplier_taxId_key";

-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "creditDays",
DROP COLUMN "taxId";
