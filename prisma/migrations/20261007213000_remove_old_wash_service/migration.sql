-- Kartu „Ruční mytí & čištění interiéru“ nahrazuje Crystal Finish (změna klienta 10/2026).
-- Stará adresa stránky se přesměruje (301) na Crystal Finish, ta zaujme místo původní karty.
UPDATE "services"
SET "previous_slugs" = array_append("previous_slugs", 'rucni-myti-cisteni-interieru'),
    "sort_order" = 2
WHERE "slug" = 'crystal-finish'
  AND NOT ('rucni-myti-cisteni-interieru' = ANY ("previous_slugs"));

DELETE FROM "services" WHERE "slug" = 'rucni-myti-cisteni-interieru';
