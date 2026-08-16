-- AlterTable Product
ALTER TABLE "Product" ADD COLUMN "shortDescription" TEXT,
ADD COLUMN "weight" TEXT,
ADD COLUMN "ingredients" TEXT,
ADD COLUMN "allergenInfo" TEXT,
ADD COLUMN "flavourProfile" TEXT,
ADD COLUMN "storageInstructions" TEXT,
ADD COLUMN "shelfLife" TEXT;

-- CreateTable InventoryLog
CREATE TABLE "InventoryLog" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "previousQuantity" INTEGER NOT NULL,
    "adjustment" INTEGER NOT NULL,
    "newQuantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryLog_inventoryId_idx" ON "InventoryLog"("inventoryId");

-- CreateIndex
CREATE INDEX "InventoryLog_productId_idx" ON "InventoryLog"("productId");

-- AddForeignKey
ALTER TABLE "InventoryLog" ADD CONSTRAINT "InventoryLog_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
