/*
  Warnings:

  - Added the required column `customerName` to the `Estimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPhone` to the `Estimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleName` to the `Estimate` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Estimate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "folio" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "vehicleName" TEXT NOT NULL,
    "vehicleYear" INTEGER,
    "notes" TEXT,
    "laborCost" INTEGER NOT NULL DEFAULT 0,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "taxRate" INTEGER NOT NULL DEFAULT 19,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    CONSTRAINT "Estimate_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Estimate_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Estimate" ("createdAt", "customerId", "discount", "folio", "id", "laborCost", "notes", "status", "taxRate", "updatedAt", "vehicleId") SELECT "createdAt", "customerId", "discount", "folio", "id", "laborCost", "notes", "status", "taxRate", "updatedAt", "vehicleId" FROM "Estimate";
DROP TABLE "Estimate";
ALTER TABLE "new_Estimate" RENAME TO "Estimate";
CREATE UNIQUE INDEX "Estimate_folio_key" ON "Estimate"("folio");
CREATE INDEX "Estimate_createdAt_idx" ON "Estimate"("createdAt");
CREATE INDEX "Estimate_status_idx" ON "Estimate"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
