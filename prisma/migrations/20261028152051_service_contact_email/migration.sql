-- AlterTable
ALTER TABLE "services" ADD COLUMN     "contact_email" TEXT;

-- Crystal Finish: kontakt Denis Gurský včetně e-mailu (objednávky chodí i na něj)
UPDATE "services"
SET "contact_name" = 'Denis Gurský', "contact_email" = 'crystalfinishostrava@gmail.com'
WHERE "slug" = 'crystal-finish';
