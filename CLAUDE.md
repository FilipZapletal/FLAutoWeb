# FL Auto – web autobazaru + administrace

Systém, jehož veřejnou částí je web autobazaru a jehož jádrem je admin (vozy, fotky, leady). Klient chce web **jednoduchý** – nestavět enterprise systém, nepřidávat funkce, které nejsou v zadání.

## Dokumenty (přečti před větší prací)
- `docs/zadani.md` – kompletní funkční zadání (aktuální, po úpravách klienta)
- `docs/specifikace.md` – technologie, design tokeny, DB schéma, API, rozdíl prototyp vs. produkce
- `prototype/autobazar.html` – funkční demo schválené klientem. **Reference vzhledu, textů a chování**, ne kód k přenesení (localStorage, heslo napevno, loga jako base64).

## Technologie (doporučeno, lze zdůvodněně změnit)
Next.js (App Router) + TypeScript + Tailwind CSS, PostgreSQL (např. Supabase: DB, auth, storage), sharp pro optimalizaci fotek, e-mail přes Resend/SMTP.

## Pravidla
- UI a texty **česky**. Značka se jmenuje **FL Auto** (ne „FLAuto Crystal").
- Nevymýšlej čísla, reference ani právní text. Použij `[DOPLNIT ...]`.
- Před větší změnou zkontroluj stávající kód, ať nerozbiješ funkční části.
- Server-side validace všech formulářů. VIN veřejně jen maskovaně, kontaktní údaje a admin data nikdy ve veřejném API.
- Admin heslo nikdy v kódu, jen hash v DB / env proměnné.
- Cena: u akční ceny se zobrazuje **pouze aktuální cena**, žádná přeškrtnutá původní.
- Prodané vozy se **nemažou** – zůstávají v katalogu se zeleným štítkem „Prodáno" (rezervované červený „Rezervováno").
- Výkup vozů se **nenabízí**. Místo něj je stránka Servis. Protiúčet zůstává jen jako typ poptávky u konkrétního vozu.
- Světlý i tmavý režim jsou povinné (viz `docs/specifikace.md`).
- Loga: `public/logo-dark.png` (tmavý režim), `public/logo-light.png` (světlý režim). Nekopírovat cizí loga ani vodoznakované návrhy.

## Příkazy
- dev: `npm run dev` (DB lokálně: `npm run db:local` v jiném terminálu)
- build: `npm run build`
- lint: `npm run lint`, typy: `npm run typecheck`
- DB: `npm run db:migrate` (změna schématu), `npm run db:seed`
- Podrobnosti v `README.md`.

## Struktura (stručně)
- `src/app/(web)` veřejné stránky, `src/app/admin` administrace, `src/app/api` REST API
- `src/lib` – data a logika (`vehicles/`, `leads/`, `validation/`, `auth/`, `images/`, `notifications/`); veřejná data jen přes `src/lib/vehicles/public.ts` (maskování VIN, bez původní ceny)
- Next.js 16: `proxy.ts` místo middleware, `params`/`searchParams` jsou Promise. Viz `AGENTS.md`.

@AGENTS.md

## Postup práce
Navrhni architekturu → DB schéma → routy → komponenty → API → backend → veřejný frontend → admin → seed data → test (CRUD vozidel, filtry, detail, lead, admin workflow, responzivita) → README. Na konci uveď použité technologie, spuštění, přihlášení do adminu, env proměnné, co je hotové, co je fáze 2 a známé limity.
