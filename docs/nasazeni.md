# Nasazení – aktuální stav a další kroky

Předávací poznámky pro dalšího vývojáře nebo AI. Stav k 8. 10. 2026 večer.
**Tajné hodnoty (hesla, klíče, connection stringy) sem nikdy nepište.** Jsou jen ve Vercelu a v Supabase.

## Co běží

| Část | Kde | Poznámka |
|---|---|---|
| Web (Next.js) | **Vercel**, projekt FLAutoWeb, tarif Hobby | adresa `*.vercel.app` (vlastní doména zatím není). Každý push do `main` se nasadí automaticky. |
| Databáze (PostgreSQL) | **Supabase**, projekt `flauto`, region Frankfurt, tarif Free | aplikace se připojuje přes *Transaction pooler* (port 6543) |
| Fotky | **Supabase Storage**, veřejný bucket **`Photos`** (velké P) | přes S3 rozhraní (`STORAGE_DRIVER=s3`). **Funguje, ověřeno 8. 10.** `S3_BUCKET` i konec `S3_PUBLIC_URL` musí přesně odpovídat názvu bucketu včetně velikosti písmen (původní chyba `NoSuchBucket`). |
| E-maily | **zatím nenastaveno** | bez `RESEND_API_KEY` se e-maily jen vypisují do logu. Poptávky a objednávky se ukládají do adminu, ale **nikdo nedostane upozornění** a zákazník nedostane potvrzení. |
| Denní úklid poptávek | Vercel Cron (`vercel.json`) | chráněno `CRON_SECRET` |

### Proměnné ve Vercelu (Settings → Environment Variables)
Vyplněno: `DATABASE_URL`, `SITE_URL`, `SESSION_SECRET`, `CRON_SECRET`, `STORAGE_DRIVER`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`.
Chybí: `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFY_EMAIL`.
Popis všech proměnných je v `README.md` a `.env.example`.

### Jak vznikla databáze
Tabulky se nezakládaly příkazem `npm run db:deploy`, ale jednorázovým SQL skriptem v Supabase → SQL Editor. Skript byl výpis lokální DB po `prisma migrate deploy` a seedu bez demo vozů. Obsahuje:
- všech 7 migrací včetně tabulky `_prisma_migrations`, takže **další `npm run db:deploy` normálně naváže** a aplikuje jen nové migrace,
- katalog výbavy a výchozí služby,
- zapnuté RLS na všech tabulkách (bez policies). Supabase Data API tak k tabulkám nemá přístup, Prisma se připojuje jako vlastník tabulek a RLS ji neomezuje.

Skript už **znovu nespouštějte**.

### Admin
- Přihlášení: `https://<adresa>/admin`.
- Existuje 1 účet (Michal), heslo si už změnil v Administraci → Změna hesla.
- Další účty se přidávají a odebírají v Administraci → **Správci** (od 9. 10.).
- Hesla jsou v tabulce `admins` jako argon2 hash.

## Co se stalo 8. 10.
- Nahrávání fotek opraveno (název bucketu, viz tabulka). Strejdovy commity přidaly podrobné chybové hlášky při uploadu, díky nim se to našlo.
- Z veřejného webu odstraněn odkaz „Admin“ (hlavička i mobilní menu, PR #7). Administrace je jen na ručně zadané adrese `/admin`. **Odkaz zpět nepřidávat.**
- Strejda přidal oblíbená auta, okno Nastavení soukromí, upravené okno Auto na přání a nové kontakty. Bez nových migrací.

## Jak funguje objednávka / poptávka (pro kontrolu)
Formulář → `POST /api/leads` → validace na serveru → uložení do tabulky `leads` (stav Nová) → zákazník vidí poděkování → v adminu v Poptávkách (servisní termíny i na nástěnce). Termín servisu je jen **předběžný** (nic se neblokuje), majitelé ho potvrzují telefonem. Po uložení se odesílají e-maily (`src/lib/notifications`), ty ale zatím nefungují (chybí Resend).

## Co zbývá (v tomto pořadí)

1. **E-maily (Resend)**, nejdůležitější. Bez nich se objednávky přehlédnou. Resend potřebuje ověřenou vlastní doménu; bez ní posílá jen na e-mail majitele Resend účtu. Postup: účet na resend.com, přidat doménu, nastavit DNS záznamy u registrátora, ve Vercelu doplnit `RESEND_API_KEY`, `EMAIL_FROM` (např. `FL Auto <poptavky@flauto.cz>`), `ADMIN_NOTIFY_EMAIL`, pak Redeploy a otestovat zkušební objednávkou.
2. **Doména:** doporučeno `flauto.cz` (podle DNS vypadá volná, ověřit u registrátora). Koupit u českého registrátora (Wedos, Forpsi, Active24), ne přes Vercel. Ve Vercelu → Settings → Domains ji přidat, u registrátora nastavit DNS podle Vercelu, pak změnit `SITE_URL` a dát Redeploy.
3. **Admin účty pro majitele** (Jarek Frejkovský, Lukáš Gvožď): v Administraci → **Správci** zadat e-mail a dočasné heslo (a pro potvrzení své heslo). Po prvním přihlášení si majitel změní heslo v Administraci → Změna hesla. SQL ani seed už nejsou potřeba (seed jen jako nouzovka, když se nikdo nemůže přihlásit, viz `README.md`).
4. **Obsah:** skutečná auta, ceny služeb (Služby), hodnocení z Googlu (Nastavení), fotky provozovny a týmu, místa označená `[DOPLNIT …]`, poskytovatelé (Vercel, Supabase, Resend) v Ochraně osobních údajů. **Smazat zkušební auta a poptávky.**
5. **Design:** Michal chce ještě trochu doladit vzhled (zatím bez konkrétního zadání, zeptat se ho). Reference vzhledu je `prototype/autobazar.html`, design tokeny v `docs/specifikace.md`, světlý i tmavý režim povinně.
6. **Před ostrým spuštěním:** Vercel → Settings → Functions → region Frankfurt (fra1). Vercel Hobby je podle podmínek jen nekomerční, pro web firmy tarif Pro. Supabase Free po neaktivitě uspává projekt, zvážit Pro.
7. **Po spuštění (doporučení):** Google firemní profil a Google Search Console (sitemap je na `/sitemap.xml`).

## Při další práci
- Změna schématu: `npm run db:migrate` lokálně, commit migrace. Po nasazení na Vercel spustit proti produkční DB `DATABASE_URL="<Session pooler URL>" npm run db:deploy`. Pro migrace používejte *Session pooler* (port 5432), ne Transaction pooler.
- Známé limity jsou v `README.md` (rate limit v paměti instance).
- Předávací list k podpisu: `docs/predavaci-list.md`.
