-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "from_customer" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "reviews_approved_idx" ON "reviews"("approved");
