-- DropIndex
DROP INDEX IF EXISTS "Session_token_idx";

-- DropIndex
DROP INDEX IF EXISTS "Session_token_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN IF EXISTS "token",
ADD COLUMN IF NOT EXISTS "tokenHash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phoneVerifiedAt" TIMESTAMP(3),
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Session_tokenHash_idx" ON "Session"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User"("phone");
