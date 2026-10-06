# FL Auto – web autobazaru + administrace

Veřejný web autobazaru (katalog, detail vozu, poptávky, servis) a administrace pro správu vozů, fotek a poptávek. Funkční zadání je v [docs/zadani.md](docs/zadani.md), technická specifikace v [docs/specifikace.md](docs/specifikace.md).

## Novinky (říjen 2026) – co je nového a kde to najdete

**Služby a ceníky** ([PR #2](https://github.com/FilipZapletal/FLAutoWeb/pull/2))
- V administraci je sekce **Služby**. Upravíte v ní texty, odrážky a ceník každé služby, pořadí a skrytí služby.
- Každá služba má vlastní stránku `/servis/<název-služby>`.
- Dokud cenu nevyplníte, web ukazuje „Cena na dotaz“.

**Online objednávka do servisu** ([PR #3](https://github.com/FilipZapletal/FLAutoWeb/pull/3))
- Zákazník na stránce Servis (nebo na stránce služby) vybere službu, den (od zítřka, nejdéle 60 dní dopředu) a **dopoledne** nebo **odpoledne**.
- Objednávky najdete v administraci na **nástěnce** (tabulka Nadcházející servisní termíny) a v **Poptávkách** (sloupec Termín).
- O každé objednávce přijde e-mail vám i zákazníkovi, včetně termínu.

**Recenze zákazníků a hodnocení z Googlu** ([PR #1](https://github.com/FilipZapletal/FLAutoWeb/pull/1))
- V administraci je sekce **Recenze**: přidáte recenzi a zvolíte, jestli se ukáže na úvodní stránce, na stránce Servis, nebo na obou.
- Hodnocení z Googlu (počet hvězd, počet recenzí, odkaz) vyplníte ručně v **Nastavení**.

**Při nasazení:** tyto změny přidaly do databáze nové tabulky. Po nasazení nové verze proto jednou spusťte proti produkční databázi:

```bash
DATABASE_URL="…" npm run db:deploy
```

**Zbývá doplnit v administraci:** ceny služeb (Služby) a hodnocení z Googlu (Nastavení).

## Použité technologie

| Vrstva | Technologie |
|---|---|
| Framework | Next.js 16 (App Router, server components, route handlers) + TypeScript |
| Styly | Tailwind CSS 4, design tokeny jako CSS proměnné (světlý/tmavý režim přes `data-theme`) |
| Databáze | PostgreSQL + Prisma 7 (ORM, migrace, seed) |
| Validace | zod (stejná schémata pro API i chybové hlášky formulářů) |
| Přihlášení | vlastní: heslo jako hash argon2 v tabulce `admins`, podepsaná httpOnly cookie (JWT, `jose`) |
| Fotky | sharp → WebP varianty 400/1024/1920 px + JPEG pro náhledy při sdílení; úložiště lokální disk nebo S3 (Supabase Storage, R2…) |
| E-maily | Resend (bez API klíče se e-maily jen vypisují do konzole) |

## Spuštění lokálně

Potřebujete Node.js 20.19+.

```bash
npm install
cp .env.example .env
```

V `.env` vyplňte `SESSION_SECRET` (např. `openssl rand -base64 48`), `ADMIN_EMAIL` a `ADMIN_PASSWORD` (min. 10 znaků).

**Databáze** – vyberte jednu možnost:

- bez Dockeru: `npm run db:local` (spustí PostgreSQL v samostatném terminálu, data jsou v `./.local-db`; nechte ho běžet),
- s Dockerem: `docker compose up -d`.

Potom ve druhém terminálu:

```bash
npm run db:deploy   # vytvoří tabulky
npm run db:seed     # výbava, první admin a 4 DEMO vozy
npm run dev         # http://localhost:3000
```

## Příkazy

| Příkaz | Co dělá |
|---|---|
| `npm run dev` | vývojový server |
| `npm run build` / `npm start` | produkční build / spuštění |
| `npm run lint`, `npm run typecheck` | kontrola kódu |
| `npm run db:local` | lokální PostgreSQL bez Dockeru |
| `npm run db:migrate` | po změně `prisma/schema.prisma` vytvoří a aplikuje migraci |
| `npm run db:deploy` | aplikuje migrace (produkce) |
| `npm run db:seed` | seed (lze spouštět opakovaně, nic neduplikuje) |
| `npm run db:studio` | prohlížeč databáze |

## Přihlášení do administrace

Adresa `/admin` (odkaz „Admin“ v hlavičce). Přihlašuje se e-mailem a heslem z `ADMIN_EMAIL` / `ADMIN_PASSWORD` v době spuštění seedu. V databázi je uložený jen hash hesla; po seedu lze heslo z `.env` smazat.

**Změna hesla / další admin:** nastavte `ADMIN_EMAIL` a nové `ADMIN_PASSWORD` a spusťte znovu `npm run db:seed` (existující účet dostane nové heslo, jiný e-mail vytvoří nový účet).

Přihlášení je chráněné limitem 5 pokusů za 15 minut z jedné IP.

## Jak přidat první auto

1. Administrace → **Vozidla** → **+ Přidat vozidlo**.
2. Vyplňte povinné údaje (značka, model, rok, cena, nájezd, palivo, převodovka, karoserie), zaškrtněte výbavu a uložte.
3. Otevře se stránka **Fotografie**: přetáhněte fotky (nebo „Vybrat fotky“). Pořadí změníte přetažením, hvězdička nastaví hlavní fotku.
4. Vůz je hned vidět na webu (status *Dostupné*). Status měníte přímo v tabulce vozidel.

Demo vozy ze seedu jsou označené „DEMO“ (v popisu i na fotkách). Před spuštěním je smažte nebo nahraďte. Seed bez demo vozů: `SEED_DEMO_VEHICLES=0 npm run db:seed`.

## Proměnné prostředí

| Proměnná | Povinná | Popis |
|---|---|---|
| `DATABASE_URL` | ano | připojení k PostgreSQL |
| `SITE_URL` | ano (produkce) | veřejná adresa webu – canonical URL, Open Graph, sitemap |
| `SESSION_SECRET` | ano | klíč pro podpis přihlašovací cookie, min. 32 znaků |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | jen pro seed | první admin |
| `STORAGE_DRIVER` | ne | `local` (výchozí, složka `./uploads`) nebo `s3` |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL` | při `s3` | S3-kompatibilní úložiště fotek, `S3_PUBLIC_URL` = veřejná URL bucketu |
| `RESEND_API_KEY` | ne | bez něj se e-maily jen vypíšou do konzole |
| `EMAIL_FROM` | s Resend | odesílatel, doména musí být ověřená v Resend |
| `ADMIN_NOTIFY_EMAIL` | ne | kam chodí upozornění na poptávky (jinak e-mail z Nastavení webu) |

## Nasazení (Vercel + Supabase)

1. Supabase: vytvořte projekt. Ve Storage vytvořte **veřejný** bucket (např. `photos`) a v *Storage → S3 Connection* vygenerujte přístupové klíče.
2. Vercel: importujte repozitář a nastavte proměnné prostředí:
   - `DATABASE_URL` = connection string z Supabase (pro běh aplikace ideálně *Transaction pooler*),
   - `STORAGE_DRIVER=s3`, `S3_ENDPOINT=https://<projekt>.supabase.co/storage/v1/s3`, `S3_REGION` (region projektu), `S3_BUCKET`, klíče,
   - `S3_PUBLIC_URL=https://<projekt>.supabase.co/storage/v1/object/public/<bucket>`,
   - `SITE_URL`, `SESSION_SECRET`, případně Resend.
3. Migrace a seed spusťte z počítače proti produkční DB (s *Direct connection* URL):
   `DATABASE_URL="…" npm run db:deploy` a `DATABASE_URL="…" ADMIN_EMAIL=… ADMIN_PASSWORD=… SEED_DEMO_VEHICLES=0 npm run db:seed`.

Build databázi nepotřebuje, všechny stránky s daty se renderují při požadavku.

## Struktura projektu

```
prisma/              schéma, migrace, seed
scripts/local-db.mjs lokální PostgreSQL bez Dockeru
src/app/(web)/       veřejné stránky (homepage, /vozy, /vozy/[slug], /servis, /o-nas, /kontakt, právní stránky)
src/app/admin/       přihlášení a administrace (dashboard, vozidla, fotky, poptávky, služby, recenze, nastavení)
src/app/api/         REST API (vehicles, leads, services, reviews, settings, auth, equipment)
src/app/media/       servírování fotek při lokálním úložišti
src/components/      UI komponenty (layout, vehicles, forms, admin, ui)
src/lib/             databáze, dotazy, validace, auth, obrázky, notifikace, SEO
src/proxy.ts         přesměrování nepřihlášených z /admin
```

### API

| Endpoint | Přístup | Popis |
|---|---|---|
| `GET /api/vehicles` | veřejné | katalog: filtry v query (`brand`, `model`, `priceMin/Max`, `yearMin/Max`, `mileageMin/Max`, `fuel`, `transmission`, `drive`, `body`, `powerMin/Max`, `engineMin/Max`, `regMin`, `ownersMax`, `origin`, `color`, `seats`, `doors`, `stk=1`, `sale=1`, `sold=0`, `sort`, `page`) |
| `GET /api/vehicles/:slug` | veřejné | detail, VIN maskovaný |
| `POST /api/vehicles` | admin | nový vůz |
| `PUT /api/vehicles/:id` | admin | úprava (celý formulář), nebo rychlá změna `{status}`, `{archived}`, `{featured}` |
| `DELETE /api/vehicles/:id` | admin | trvalé smazání vč. fotek |
| `POST/PUT /api/vehicles/:id/images`, `DELETE …/images/:imageId` | admin | upload, pořadí + hlavní fotka, smazání |
| `GET /api/leads` | admin | poptávky (`?status=`, `?type=`) |
| `POST /api/leads` | veřejné | poptávka u vozu (`kind: "vehicle"`) nebo servis (`kind: "service"`); validace, honeypot, rate limit 5 / 10 min |
| `PUT /api/leads/:id` | admin | změna stavu |
| `GET/PUT /api/settings` | admin | kontakt, otevírací doba, sociální sítě, hodnocení na Googlu |
| `POST /api/services`, `PUT/DELETE /api/services/:id` | admin | služby a ceníky |
| `GET/POST /api/reviews`, `PUT/DELETE /api/reviews/:id` | admin | recenze zákazníků |

Veřejné odpovědi nikdy neobsahují celý VIN, původní cenu u akce ani kontakty z poptávek. Zápisy do admin API kontrolují přihlášení i hlavičku `Origin` (ochrana proti CSRF).

## Co je hotové (MVP)

- Homepage: hero s rychlým hledáním, rychlé kategorie, doporučené vozy, akční nabídky, nově v nabídce, blok Servis, kontakt.
- Katalog s kombinovatelnými filtry nad databází (základní, technické, karoserie, další), 7 způsobů řazení, stránkování po 12. Prodané vozy jsou na konci, dají se skrýt.
- Detail vozu: SEO URL, galerie (náhledy, šipky, fullscreen, klávesnice, swipe, lazy loading), aktuální cena, štítek statusu, technické údaje ve 4 skupinách, výbava podle kategorií, maskovaný VIN, poptávkový formulář, Zavolat a WhatsApp, na mobilu spodní lišta.
- Poptávky: validace na serveru, uložení leadu, potvrzení na webu, e-mail administraci i zákazníkovi.
- Servis: služby spravované v administraci (výchozí 4 vytvoří migrace), každá s vlastní stránkou `/servis/[slug]` a ceníkem; online objednávka termínu (služba, den, dopoledne/odpoledne; lead typu `SERVICE`).
- Kontakt (mapa až po kliknutí, odkaz na navigaci), O nás s texty klienta, právní stránky (návrh, firemní údaje z Nastavení).
- Administrace: přihlášení, dashboard se statistikami, posledními poptávkami a nadcházejícími servisními termíny, CRUD vozidel, změna statusu přímo v tabulce, doporučené vozy, archiv, správa fotek (drag & drop, pořadí, hlavní fotka, mazání, automatická optimalizace), poptávky se změnou stavu a detailem, služby (texty, odrážky, ceník, pořadí, skrytí, SEO titulek a popis), nastavení kontaktů a otevírací doby, recenze zákazníků (zobrazení na úvodu a/nebo na Servisu, pořadí) a ručně zadané hodnocení na Googlu.
- SEO: title, meta description, canonical, Open Graph (hlavní fotka), schema.org `Car` + `Offer` a `Service` s ceníkem, `sitemap.xml`, `robots.txt`, 301 přesměrování po změně URL vozu i služby, 404 stránka.
- Světlý i tmavý režim (přepínač ve stylu iOS, bez probliknutí při načtení), mobile-first.

## Připraveno pro fázi 2 (zatím neimplementováno)

- Oblíbené, porovnání vozů, rezervace prohlídky, kalkulačka financování.
- Video a 360° prohlídka: `vehicle_images.media_type` (VIDEO, PANO360).
- SMS / WhatsApp notifikace: místo pro další kanály je v `src/lib/notifications/`.
- VIN API: celý VIN je uložený, veřejně se maskuje v `src/lib/vin.ts`.
- Inzertní portály, sociální sítě, AI popisy, analytika.
- Typ poptávky `TEST_DRIVE` existuje v DB, ve formuláři zatím není.

## Známé limity

- **Rate limit** (poptávky, přihlášení) běží v paměti jedné instance serveru. Na Vercelu tedy platí pro každou instanci zvlášť; pro přísnější ochranu by se nahradil např. Upstash Redis.
- Stránky se renderují při každém požadavku (bez cache). Pro desítky vozů je to rychlé; při vyšší návštěvnosti lze doplnit cache s revalidací po změně v adminu.
- **Fotky HEIC** (iPhone): Safari je před nahráním převede na JPEG. Chrome na počítači HEIC neumí a server takový soubor odmítne – je potřeba nahrát JPG.
- Adresa provozovny je bez města a PSČ. Doplňte je v **Nastavení → Upřesnění k adrese**, nebo přímo do adresy.
- Právní stránky (ochrana osobních údajů, cookies, obchodní údaje, reklamační řád, ADR) jsou **návrh** podle aktuální legislativy a skutečného fungování webu – před spuštěním je nechte zkontrolovat právníkem. Firemní údaje (IČO, sídlo, zápis…) se vyplňují v **Nastavení → Firemní údaje**; dokud chybí, stránky ukazují `[DOPLNIT …]`. Doplnit je třeba i dobu uložení poptávek, zvolenou dobu odpovědnosti za vady (12/24 měsíců) a konkrétní poskytovatele hostingu.
- Fotografie provozovny a týmu dodá klient (`[DOPLNIT …]`).
- Admin má jednu roli; změna hesla se dělá přes seed (viz výše), v administraci formulář na změnu hesla není.
- Web používá jen nezbytnou cookie (přihlášení do adminu) a `localStorage` pro motiv, proto nemá cookie lištu. Při přidání analytiky (fáze 2) bude lišta se souhlasem potřeba.
- E-maily přes Resend vyžadují ověřenou odesílací doménu.
