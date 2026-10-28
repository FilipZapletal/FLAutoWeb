-- Crystal Finish: popis služby už neříká, že se objednává jen telefonicky (jde i přes web).
-- Mění se jen tato věta, případné další úpravy textu v administraci zůstanou.
UPDATE "services"
SET "description" = REPLACE("description", 'Objednávky a dotazy vyřizujeme telefonicky.', 'Objednat se můžete přímo na webu, nebo nám zavolejte.')
WHERE "slug" = 'crystal-finish';
