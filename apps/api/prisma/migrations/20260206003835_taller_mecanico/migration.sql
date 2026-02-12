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
    "customerId" TEXT,
    "vehicleId" TEXT,
    "notes" TEXT,
    "laborCost" INTEGER NOT NULL DEFAULT 0,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "taxRate" INTEGER NOT NULL DEFAULT 19,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Estimate_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Estimate_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Estimate" ("createdAt", "customerEmail", "customerId", "customerName", "customerPhone", "discount", "folio", "id", "laborCost", "notes", "status", "taxRate", "updatedAt", "vehicleId", "vehicleName", "vehicleYear") SELECT "createdAt", "customerEmail", "customerId", "customerName", "customerPhone", "discount", "folio", "id", "laborCost", "notes", "status", "taxRate", "updatedAt", "vehicleId", "vehicleName", "vehicleYear" FROM "Estimate";
DROP TABLE "Estimate";
ALTER TABLE "new_Estimate" RENAME TO "Estimate";
CREATE UNIQUE INDEX "Estimate_folio_key" ON "Estimate"("folio");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
