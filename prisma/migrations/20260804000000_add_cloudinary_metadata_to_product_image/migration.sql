-- AlterTable: Add Cloudinary metadata fields to ProductImage
ALTER TABLE "ProductImage" ADD COLUMN IF NOT EXISTS "publicId" TEXT,
ADD COLUMN IF NOT EXISTS "width" INTEGER,
ADD COLUMN IF NOT EXISTS "height" INTEGER,
ADD COLUMN IF NOT EXISTS "format" TEXT,
ADD COLUMN IF NOT EXISTS "bytes" INTEGER,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ProductImage_productId_idx" ON "ProductImage"("productId");
