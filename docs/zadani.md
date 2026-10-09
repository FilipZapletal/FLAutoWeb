# FL Auto – zadání (aktuální verze)

Postav produkčně použitelný web autobazaru, který není jen prezentační. Funguje jako:
veřejný katalog vozidel · detail vozidla · vyhledávání a filtrování · systém poptávek/leadů · jednoduchá administrace · správa vozidel a fotek · správa leadů (základní CRM) · servis · responzivní mobilní web · SEO.

Nechci statický demo frontend. Chci skutečnou aplikaci s databází, CRUD, administrací, formuláři, validací a propojením veřejné části s adminem. Pokud je potřeba zvolit technologii nebo detail architektury, zvol moderní, stabilní a snadno udržovatelnou variantu. **Nechci enterprise systém**, chci dobře postavený základ, který lze rozšiřovat. Funkce, které nejsou potřeba, nepřidávej.

> Funkční demo schválené klientem je v `prototype/autobazar.html`. Slouží jako reference vzhledu, textů a chování.

## Změny oproti původnímu zadání
- Název: **FL Auto**, tagline „Prodej · Servis · Mytí · STK".
- **Výkup vozů je zrušen.** Odpadá `/vykup`, tabulka `buy_requests` i API `/buy-requests`. Nahrazuje ho stránka **Servis**.
- Akční cena se zobrazuje **bez přeškrtnuté původní ceny**.
- Prodaná auta zůstávají v katalogu se **zeleným** štítkem „Prodáno", rezervovaná mají **červený** „Rezervováno".
- Přibyl **světlý a tmavý režim** s přepínačem ve stylu iOS.
- Přibyly reálné kontaktní údaje, otevírací doba a čtyři servisní služby.

---

## 1. Architektura
- **Veřejný web:** Homepage, Katalog `/vozy`, Detail `/vozy/[slug]`, Servis `/servis`, O nás `/o-nas`, Kontakt `/kontakt`, právní stránky.
- **Admin (za loginem):** Dashboard, Vozidla, Přidat/Upravit vozidlo, Fotografie, Poptávky/Leady, Nastavení webu.
- **Databáze:** vehicles, vehicle_images, equipment, vehicle_equipment, leads, admins, případně settings.
- Navigace: Vozy · Servis · O nás · Kontakt · Admin + přepínač motivu.

## 2. Homepage
Prodejně orientovaná. Hero: eyebrow „Ojeté vozy s čistou historií", nadpis „Vůz, který stojí za to", podtext „Každé auto v naší nabídce prochází kontrolou před prodejem. Žádná překvapení, jen jasná fakta.", rychlé hledání (značka, cena do) a CTA „Hledat vozy". Na pozadí hero panelu je jemné logo (pravá část, plynule prolnuté, na mobilu skryté).

Dále: rychlé kategorie (Osobní vozy, SUV, Kombi, Automat, Do 300 000 Kč, Akční nabídky) – klik otevře katalog s předvyplněným filtrem; doporučené vozy; nově v nabídce; akční nabídky; blok Servis; informace o autobazaru; CTA kontakt.

## 3. Katalog `/vozy`
Karta vozu: hlavní foto, značka, model, verze, rok, nájezd, palivo, převodovka, výkon, cena, status, CTA „Zobrazit vůz". Pagination nebo efektivní načítání. Značka je na kartě zvýrazněná akcentovou barvou.

## 4. Filtry (reálně nad databází, kombinují se)
Základní: značka, model, cena od/do, rok od/do, nájezd od/do.
Technické: palivo (benzín, diesel, hybrid, plug-in hybrid, elektro, LPG/CNG), převodovka (manuální, automatická), pohon (přední, zadní, 4x4), výkon, objem motoru.
Karoserie: hatchback, sedan, kombi, SUV, MPV, kupé, kabriolet, užitkové.
Další: první registrace, počet majitelů, původ, barva, STK, počet míst, počet dveří.

## 5. Řazení
Nejlevnější, nejdražší, nejnovější, nejstarší, nejnižší nájezd, nejvyšší nájezd, doporučené.

## 6. Oblíbené (hotovo, změna klienta 10/2026)
Srdíčko u každého vozu (karta v katalogu i detail) uloží vůz do oblíbených **bez registrace** – seznam je v prohlížeči zákazníka (localStorage) a jen s jeho souhlasem s pohodlnými funkcemi. Odkaz „Oblíbená auta“ s počtem je v hlavičce, stránka `/oblibene` zobrazí uložené vozy (vozy, které už nejsou v nabídce, ze seznamu zmizí). Seznam se nesynchronizuje mezi zařízeními.

## 6b. Nastavení soukromí (souhlas, změna klienta 10/2026)
Při první návštěvě okno „Nastavení soukromí“ (Souhlasím / Nastavení / odmítnout). Web nesleduje návštěvníky; souhlas se týká pohodlných funkcí v prohlížeči (světlý/tmavý režim, oblíbená auta, zapamatování okna „Auto na přání“). Bez souhlasu se tyto údaje neukládají. Volbu lze změnit odkazem „Nastavení soukromí“ v patičce; platí 12 měsíců.

## 7. Detail vozu
SEO URL, např. `/vozy/skoda-octavia-2022` (ne `/car?id=…`). Obsahuje název, **aktuální cenu** (u akce jen akční), rok, nájezd, palivo, převodovku, výkon, galerii, technické parametry, výbavu, popis, **maskovaný VIN**, STK, majitele, původ, barvu, počet míst a dveří.

## 8. Fotogalerie
Hlavní foto, thumbnails, fullscreen, šipky, velké foto. Počet fotek není pevně omezen. Architektura připravená na video a 360° prohlídku. Lazy loading na veřejném webu.
**Změna klienta 10/2026:** na kartě vozu (úvodní stránka i katalog) lze fotky listovat přímo – přejetím prstem nebo šipkami (nejvýše 10 fotek na kartě), bez otevření detailu. V administraci jde pořadí fotek měnit přetažením myší i prstem (na telefonu podržet a táhnout) a také šipkami.

## 9. Technické údaje (rozdělení)
Základní (značka, model, rok výroby, první registrace, karoserie, barva) · Motor (palivo, objem, výkon, převodovka, pohon) · Provoz (nájezd, STK, spotřeba, emise) · Další (počet míst, dveří, VIN).

## 10. VIN
V DB celý, veřejně maskovaný (např. `WBA********0001`), admin vidí celý. Připravit možnost napojení na externí VIN API.

## 11. Výbava
Strukturovaný, rozšiřitelný systém (tabulky `equipment`, `vehicle_equipment`). Kategorie: Bezpečnost (ABS, ESP, airbagy, asistent jízdního pruhu, mrtvý úhel), Komfort (klimatizace, vyhřívaná sedadla, kůže, tempomat, parkovací kamera), Multimédia (CarPlay, Android Auto, Bluetooth, navigace), Exteriér (LED světla, alu kola, tažné zařízení).

## 12. Poptávka u vozu
Blok „Máte zájem o tento vůz?": jméno, telefon, e-mail, typ zájmu (prohlídka, rezervace, financování, protiúčet, zavolat zpět), zpráva, CTA „Odeslat poptávku", vedle toho Zavolat a WhatsApp. Po odeslání: validace → uložení leadu → potvrzení → e-mail administraci → potvrzovací e-mail zákazníkovi.

## 13. Rezervace prohlídky (fáze 2)
Datum, čas, jméno, telefon, e-mail; propojeno s vozem; viditelné v adminu; stavy NOVÁ, POTVRZENA, ZRUŠENA, VYŘÍZENA.

## 14. Financování (fáze 2)
„Financování od X Kč/měsíc" a komponenta „Spočítat financování" (cena, akontace, délka). Výpočet vždy označit jako **orientační**, nevymýšlet úvěrové podmínky.

## 15. Servis `/servis` (nahrazuje výkup)
Nadpis „Servis". Čtyři karty služeb, každá s ikonou, štítkem, popisem a odrážkami:
1. **Dovoz aut z EU** (Dovoz na klíč): vyhledání a prověření vozu v zahraničí, fyzická kontrola před koupí, doprava do ČR a přepis, dovozová STK, emise a přihlášení na české SPZ, pomoc s financováním a pojištěním.
2. **Autoservis & Pneuservis** (Rychle & spolehlivě): výměna oleje, filtrů a kapalin, brzdy, přezouvání a vyvažování kol, opravy defektů a sezónní uskladnění.
3. ~~Ruční mytí & čištění interiéru~~ – **nahrazeno službou Crystal Finish** (viz 15c, změna klienta 10/2026).
4. **Příprava na STK & emise** (Bez starostí): před-prohlídka podle metodiky STK, kontrola světel, brzd a řízení, podvozku a výfuku, rychlé odstranění nedostatků.

Pod kartami formulář „Objednat se do servisu" (značka a model vozu, telefon, e-mail, poznámka) → ukládá lead typu `SERVICE`.

## 15b. Hledané auto na přání (změna klienta 10/2026)
Pro zákazníka, který si z nabídky nevybere. **Žádný trvalý formulář na stránkách** – jen vyskakovací okno „Nenašli jste, co hledáte?“ s poptávkou na vysněný vůz (co hledá, volitelně cena, rok, nájezd, palivo, převodovka, karoserie, poznámka; jméno, telefon, e-mail).
- Zobrazí se návštěvníkovi, který si z nabídky nevybral a nic neodeslal: (1) katalog bez výsledků po 12 s nečinnosti (jakákoli aktivita odpočet zruší), (2) návrat tlačítkem Zpět z katalogu po hledání, (3) myš míří k zavření okna po hledání (počítač), (4) po 5 minutách aktivně stráveným na webu. Nezobrazí se, když návštěvník píše do formuláře nebo je otevřené jiné okno, a čeká na rozhodnutí v okně soukromí.
- Nejvýše jednou za návštěvu a celkem třikrát (při různých návštěvách). Po zavření se zmenší do **bublinky** na boku stránky (30 dní, i při další návštěvě), odkud ho lze znovu otevřít; po odeslání se 60 dní nenabízí. Předvyplní se podle filtrů.
- Poptávka (typ `WANTED_CAR`, „Hledané auto“) se uloží do leadů a e-mailem přijde **oběma majitelům**; zákazník dostane potvrzení. Majitelé mu následně odpoví, zda je poptávka reálná, nebo ji potvrdí.

## 15c. Crystal Finish (změna klienta 10/2026)
Samostatná služba na stránce Servis (`/servis/crystal-finish`) s vlastním ceníkem a **vlastním telefonem +420 735 231 876 jako jediným kontaktem** (kontakty majitelů se na stránce služby nezobrazují, online objednávka se nenabízí – objednává se jen telefonicky). Nabídka: ruční mytí exteriéru, čištění interiéru, renovace a ochrana laku. Ceník je rozdělený do sekcí (hlavní programy, samostatný interiér, exteriér, doplňky, renovace a korekce laku, keramická ochrana). V administraci: Služby → Crystal Finish.

## 16. Protiúčet
Jen jako typ poptávky `TRADE_IN` u konkrétního vozu (bez samostatné stránky).

## 17. Administrace
Zabezpečený login. Dashboard: aktivní vozy, nové poptávky, rezervace, servisní poptávky, prodáno tento měsíc, tabulka „Poslední poptávky" (zákazník, vůz, typ, datum, status).

## 18. Správa vozidel
Pole: značka, model, verze, cena, akční cena, rok, první registrace, nájezd, VIN, palivo, objem, výkon, převodovka, pohon, karoserie, barva, STK, majitelé, původ, spotřeba, emise, místa, dveře, popis, výbava, status.
Status: **DOSTUPNÉ, REZERVOVÁNO, PRODÁNO, SKRYTÉ**. Akce: vytvořit, zobrazit, upravit, změnit status (přímo v tabulce), archivovat, smazat.

## 19. Fotografie v adminu
Upload, drag & drop, změna pořadí, hlavní fotka, odstranění. Automatická optimalizace: resize, komprese, WebP/AVIF, thumbnails. Bezpečný upload (limit velikosti, kontrola typu).

## 20. Databáze vozidel
`vehicles`: id, brand, model, version, price, sale_price, year, registration_date, mileage, fuel, transmission, drive, body_type, engine_volume, power, color, vin, stk, owners, origin, consumption, emissions, seats, doors, description, status, slug, created_at, updated_at.
`vehicle_images`: id, vehicle_id, url, sort_order, is_main, created_at. `equipment`: id, name, category. `vehicle_equipment`: vehicle_id, equipment_id.

## 21. Leads
`leads`: id, vehicle_id (nullable), name, phone, email, type, message, created_at, status.
Type: INTEREST, TEST_DRIVE, RESERVATION, FINANCING, TRADE_IN, CALLBACK, **SERVICE**. Status: NEW, CONTACTED, NEGOTIATION, RESERVED, SOLD, LOST. V UI české názvy (Nová, Kontaktováno, V jednání, Rezervace, Prodáno, Ztraceno).

## 22. CRM
Detail leadu: zákazník, kontakt, konkrétní vůz, typ, zpráva, datum, stav. Admin mění stav v pořadí Nová → Kontaktováno → V jednání → Rezervace → Prodáno, nebo Ztraceno.

## 22b. Uchovávání poptávek (změna klienta 10/2026)
Poptávky, které nevedly k obchodu (stavy Nová, Kontaktováno, V jednání, Ztraceno), se **30 dní od posledního kontaktu** (poslední změny stavu) automaticky mažou. Rezervace a Prodáno se nemažou. Servisní objednávka s budoucím termínem se nemaže před termínem.

## 23. Notifikace
Po nové poptávce: zákazníkovi „Děkujeme za váš zájem. Autobazar vás bude kontaktovat.", adminovi „Nová poptávka" + vůz, jméno, telefon, e-mail, typ. Primárně e-mail; architektura připravená na SMS a WhatsApp.

## 24. SEO
Každý vůz: vlastní slug, title, meta description, H1, canonical URL, alt texty, Open Graph, schema.org (Vehicle/Product/Offer). Po změně na PRODÁNO stránku nemazat; připravit 404, redirect a případně archiv prodaných vozů.

## 25. Open Graph
Náhled při sdílení: název vozu, cena, hlavní fotografie. Metadata pro Facebook, Messenger, WhatsApp a další.

## 26. Mobil
Mobile-first. Na mobilu hned vidět cenu, rok, nájezd, palivo, telefon, kontakt a fotografie. Na detailu vozu sticky spodní lišta [Zavolat] [Poptat vůz].

## 27. Kontakt `/kontakt`
- Adresa: **Frýdecká 652/259, 718 00 Ostrava-Kunčičky**
- Telefon (Jarek Frejkovský): **+420 734 300 839**
- E-mail (Jarek Frejkovský): **jarekfrejky@gmail.com**; Lukáš Gvožď: +420 776 623 397, gvozd809@gmail.com
- Otevírací doba: **pouze po telefonické domluvě** (bez konkrétních hodin; změna klienta 10/2026)
- Provozovatel a odpovědná osoba: **Lukáš Gvožď**, IČO 07481233 (údaje v Nastavení webu)
- Kontakty **obou majitelů** (Jarek Frejkovský, Lukáš Gvožď – jméno, telefon, e-mail) se zobrazují společně všude: Kontakt, patička, otevírací doba, detail vozu, právní stránky. Jediná výjimka je **Crystal Finish** (vlastní telefon).
- Instagram: https://www.instagram.com/flautocrystal/ (ikona „Sledujte nás“ v patičce a na Kontaktu)
- Dále: mapa, fotografie provozovny, sociální sítě, CTA „Jak se k nám dostanete".

## 28. O nás `/o-nas`
Kdo bazar provozuje, historie, zkušenosti, počet prodaných vozů, jak se vozy vybírají, kontrola vozidel, fotky týmu a provozovny. **Nevymýšlet čísla ani tvrzení**, použít `[DOPLNIT …]`, dokud je klient nenahradí.

## 29. Právní stránky
Ochrana osobních údajů, cookies, obchodní údaje, reklamační řád, informace o ADR. Nevymýšlet právní text, použít `[DOPLNIT PRÁVNÍ TEXT KLIENTEM]`.

## 30. Status vozu
- DOSTUPNÉ – normálně.
- REZERVOVÁNO – výrazný **červený** štítek „Rezervováno".
- PRODÁNO – **zelený** štítek „Prodáno"; vůz zůstává v katalogu jako reference pro zákazníky (volitelně skrýt z aktivního katalogu nebo přesunout do archivu).
- SKRYTÉ – veřejně neviditelné.

## 31. AI popis (fáze 2)
V adminu tlačítko „✨ Vygenerovat popis" – návrh z parametrů vozu. Admin musí text před zveřejněním upravit a schválit. AI nikdy nepublikuje automaticky.

## 32. Budoucí automatizace
Architektura připravená na: nové auto → DB → web → Facebook → Instagram → Sauto/TipCars; nová poptávka → CRM → e-mail → notifikace → status. Integrace zatím neimplementovat.

## 33. Performance
Rychlé načítání, optimalizované a responzivní obrázky, lazy loading, pagination, cache kde dává smysl, minimum zbytečných requestů. Počítat s velkým počtem obrázků (40 vozů × 30 fotek ≈ 1200).

## 34. Security
Zabezpečená admin autentizace a autorizace, validace formulářů (i server-side), ochrana proti injection, bezpečný upload (limit, typ souboru), bezpečné ukládání hesel, ochrana API endpointů. VIN a kontakty nesmí být zbytečně ve veřejném API.

## 35. UX a design
Moderní, prémiový, automobilový, čistý, důvěryhodný, rychlý, mobile-first. Nepřehánět animace. Priorita: 1. auta, 2. fotografie, 3. cena, 4. technické parametry, 5. kontakt, 6. důvěra.
Konkrétní design (tmavý i světlý režim, barvy, fonty, přepínač, loga) je v `docs/specifikace.md`.

## 36. Kód
Čistý, modulární, typovaný (TypeScript), komponentový, znovupoužitelný; komentáře jen kde je to potřeba. Žádný obrovský soubor. Rozdělení např. `components`, `app`/`pages`, `admin`, `api`, `database`, `lib`, `types`, `utils`.

## 37. Demo data
Seed jasně označený jako demo: BMW 320d xDrive, Škoda Octavia 2.0 TDI, Audi A6, Volkswagen Passat (hodnoty v `docs/specifikace.md`).

## 38. Admin workflow
Login → Dashboard → Vozidla ([+ Přidat vozidlo] nebo [Upravit] [Fotografie] [Status] [Archivovat]) → Leady (Nové → Kontaktováno → Jednání → Rezervace → Prodáno).

## 39. API
`GET /vehicles`, `GET /vehicles/:slug`, `POST /vehicles`, `PUT /vehicles/:id`, `DELETE /vehicles/:id`, `GET /leads`, `POST /leads` (veřejné), `PUT /leads/:id`, `GET /settings`, `PUT /settings`. Respektovat autentizaci, veřejné API nevrací citlivá data.

## 40. MVP (první verze musí obsahovat)
Homepage · katalog · filtry · řazení · detail vozu · galerie · technické parametry · výbava · cena · status · poptávka konkrétního vozu · telefon · **Servis** · kontakt · O nás · admin s loginem · přidání a editace vozidla · správa fotografií · správa leadů · GDPR/cookies placeholder · SEO základy · responsive design · **světlý/tmavý režim**.

## 41. Fáze 2
Rezervace prohlídky, financování, protiúčet, oblíbené, porovnání vozů, pokročilé CRM, automatické e-maily, SMS, WhatsApp, inzertní portály, statistiky, Google Analytics, Search Console, remarketing, AI popisy, automatické social posty, VIN API.

## 42. Neprogramuj naslepo
Je-li něco nejasné: nejdřív navrhni řešení, krátce vysvětli proč, při více možnostech zvol nejjednodušší vhodné pro MVP a nekomplikuj projekt zbytečnými funkcemi.

## 43. User flow
Homepage → katalog → filtr → výběr auta → detail (fotky + parametry) → poptávka → lead v administraci → kontaktování → prohlídka → rezervace → prodej → status PRODÁNO (vůz zůstává viditelný jako reference).

## 44. Hlavní princip
Autobazar admin → databáze (vozy, fotky, leady, zákazníci) → web → zákazník → poptávka → CRM → prodej. Nechci jen web autobazaru, chci systém, jehož veřejnou částí je web autobazaru.

## 45. Postup práce
1. Architektura 2. DB schéma 3. routy 4. komponenty 5. API 6. databáze 7. backend 8. veřejný frontend 9. admin 10. propojení 11. seed data 12. test CRUD vozidel 13. test filtrování 14. test detailu 15. test odeslání leadu 16. test admin workflow 17. test responzivity 18. oprava chyb 19. README.

Před každou větší částí zkontroluj stávající kód. Na konci uveď: použité technologie, jak spustit projekt a databázi, jak se přihlásit do adminu, jak přidat první auto, env proměnné, co je hotové, co je připravené pro fázi 2, známé limity.
