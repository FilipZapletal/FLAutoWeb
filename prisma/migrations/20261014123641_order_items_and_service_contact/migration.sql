-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "items" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "contact_name" TEXT,
ADD COLUMN     "pick_items" BOOLEAN NOT NULL DEFAULT false;

-- Crystal Finish: nový kontakt (Denis) a objednávkový formulář s výběrem položek z ceníku
UPDATE "services"
SET "contact_phone" = '+420 773 578 684', "contact_name" = 'Denis', "pick_items" = true
WHERE "slug" = 'crystal-finish';
