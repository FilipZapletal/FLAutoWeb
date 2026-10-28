-- Crystal Finish: finální znění věty v popisu služby („Objednávky na webu, dotazy telefonicky“).
-- Řeší původní větu i její předchozí náhradu; jiné úpravy textu v administraci zůstanou.
UPDATE "services"
SET "description" = REPLACE(
  REPLACE("description", 'Objednávky a dotazy vyřizujeme telefonicky.', 'Objednávky přijímáme na webu, dotazy vyřizujeme telefonicky.'),
  'Objednat se můžete přímo na webu, nebo nám zavolejte.',
  'Objednávky přijímáme na webu, dotazy vyřizujeme telefonicky.'
)
WHERE "slug" = 'crystal-finish';
