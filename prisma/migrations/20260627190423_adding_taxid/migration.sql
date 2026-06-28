/*
  Warnings:

  - A unique constraint covering the columns `[taxId]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `taxId` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "taxId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_taxId_key" ON "Supplier"("taxId");
