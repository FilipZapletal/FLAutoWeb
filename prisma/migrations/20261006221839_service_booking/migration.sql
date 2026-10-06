-- CreateEnum
CREATE TYPE "TimeSlot" AS ENUM ('DOPOLEDNE', 'ODPOLEDNE');

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "car" TEXT,
ADD COLUMN     "preferred_date" DATE,
ADD COLUMN     "preferred_slot" "TimeSlot",
ADD COLUMN     "service_id" INTEGER;

-- CreateIndex
CREATE INDEX "leads_type_preferred_date_idx" ON "leads"("type", "preferred_date");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
