-- AlterTable
ALTER TABLE "services" ADD COLUMN     "instagram_url" TEXT;

-- Crystal Finish: odkaz na jejich Instagram (bez sledovacího parametru)
UPDATE "services"
SET "instagram_url" = 'https://www.instagram.com/crystal_finish_ostrava/'
WHERE "slug" = 'crystal-finish';
