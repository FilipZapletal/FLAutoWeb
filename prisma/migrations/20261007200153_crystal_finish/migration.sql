-- AlterTable
ALTER TABLE "services" ADD COLUMN     "contact_phone" TEXT;

-- Crystal Finish: samostatná nabídka s vlastním kontaktem (telefon) a ceníkem
INSERT INTO "services" ("title", "slug", "tag", "icon", "summary", "items", "description", "prices", "contact_phone", "meta_title", "meta_description", "sort_order", "updated_at")
VALUES (
 'Crystal Finish', 'crystal-finish', 'Mytí · Čištění · Leštění', 'SPARKLE',
 'Ruční mytí exteriéru, čištění interiéru a renovace i ochrana laku.',
 ARRAY['Ruční mytí exteriéru', 'Čištění interiéru', 'Renovace a ochrana laku'],
 'Crystal Finish Ostrava nabízí ruční mytí exteriéru, čištění interiéru a renovaci i ochranu laku. Objednávky a dotazy vyřizujeme telefonicky.',
 '[{"label": "Kompletní čištění (Kůže)", "price": 2500, "from": false, "group": "Hlavní programy (exteriér & interiér)"}, {"label": "Kompletní čištění (Látka)", "price": 3000, "from": false, "group": "Hlavní programy (exteriér & interiér)"}, {"label": "Kompletní čištění (Bez sedaček)", "price": 2000, "from": false, "group": "Hlavní programy (exteriér & interiér)"}, {"label": "Samostatný interiér Kůže", "price": 2000, "from": false, "group": "Samostatné čištění interiéru"}, {"label": "Samostatný interiér (Tepování)", "price": 2500, "from": false, "group": "Samostatné čištění interiéru"}, {"label": "Samostatný interiér (Bez sedaček)", "price": 1500, "from": false, "group": "Samostatné čištění interiéru"}, {"label": "Ruční mytí exteriéru", "price": 600, "from": false, "group": "Exteriér"}, {"label": "Čištění motorového prostoru", "price": 300, "from": false, "group": "Doplňky k programům", "addon": true}, {"label": "Tekuté stěrače na čelní okno", "price": 300, "from": false, "group": "Doplňky k programům", "addon": true}, {"label": "Tepování koberečků", "price": 300, "from": false, "group": "Doplňky k programům", "addon": true}, {"label": "Rozleštění škrábanců a hmyzu", "price": 300, "from": false, "group": "Doplňky k programům", "addon": true}, {"label": "Tvrdý vosk (ochrana 3–6 měsíců)", "price": 300, "from": false, "group": "Doplňky k programům", "addon": true}, {"label": "Dezinfekce ozónem", "price": 300, "from": false, "group": "Doplňky k programům", "addon": true}, {"label": "Jednokrokové leštění laku", "price": 4000, "from": false, "group": "Renovace a korekce laku", "note": "Odstranění jemných škrábanců, obnova vysokého lesku"}, {"label": "Dvoukrokové leštění laku", "price": 7000, "from": false, "group": "Renovace a korekce laku", "note": "Důkladná korekce laku, odstranění hlubších defektů a hologramů"}, {"label": "Roční keramická ochrana", "price": 2000, "from": false, "group": "Keramická ochrana laku"}, {"label": "Prémiová keramika (výdrž 3–4 roky)", "price": 4000, "from": false, "group": "Keramická ochrana laku"}]'::jsonb,
 '+420 735 231 876',
 'Crystal Finish Ostrava – ceník mytí, čištění a leštění',
 'Ruční mytí exteriéru, čištění interiéru, renovace a ochrana laku. Ceník služeb Crystal Finish Ostrava.',
 4, CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;
