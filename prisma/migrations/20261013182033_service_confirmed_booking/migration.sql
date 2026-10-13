-- AlterEnum
ALTER TYPE "LeadStatus" ADD VALUE 'CONFIRMED';

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "confirmed_date" DATE,
ADD COLUMN     "confirmed_slot" "TimeSlot";

-- CreateIndex
CREATE INDEX "leads_type_confirmed_date_idx" ON "leads"("type", "confirmed_date");
