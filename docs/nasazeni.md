# Nasazení – aktuální stav a další kroky

Předávací poznámky pro dalšího vývojáře nebo AI. Stav k 26. 10. 2026 večer.
**Tajné hodnoty (hesla, klíče, connection stringy) sem nikdy nepište.** Jsou jen ve Vercelu a v Supabase.

## Co běží

| Část | Kde | Poznámka |
|---|---|---|
| Web (Next.js) | **Vercel**, projekt FLAutoWeb, tarif Hobby | adresa **https://www.flauto.cz** (od 26. 10.; `flauto.cz` přesměruje na www). Každý push do `main` se nasadí automaticky. |
| Databáze (PostgreSQL) | **Supabase**, projekt `flauto`, region Frankfurt, tarif Free | aplikace se připojuje přes *Transaction pooler* (port 6543) |
| Fotky | **Supabase Storage**, veřejný bucket **`Photos`** (velké P) | přes S3 rozhraní (`STORAGE_DRIVER=s3`). **Funguje, ověřeno 8. 10.** `S3_BUCKET` i konec `S3_PUBLIC_URL` musí přesně odpovídat názvu bucketu včetně velikosti písmen (původní chyba `NoSuchBucket`). |
| E-maily | **zatím nenastaveno** | bez `RESEND_API_KEY` se e-maily jen vypisují do logu. Poptávky a objednávky se ukládají do adminu, ale **nikdo nedostane upozornění** a zákazník nedostane potvrzení. |
| Denní úklid poptávek | Vercel Cron (`vercel.json`) | chráněno `CRON_SECRET` |
| Doména `flauto.cz` | **WEDOS** (koupena 26. 10. 2026) | DNS spravuje WEDOS (ne Vercel DNS). Výchozí A/AAAA záznamy WEDOSu smazány, místo nich záznamy podle Vercelu (A pro `flauto.cz`, CNAME pro `www`). Sem se přidávají i záznamy pro Resend a ověření Google. |

### Proměnné ve Vercelu (Settings → Environment Variables)
Vyplněno: `DATABASE_URL`, `SITE_URL`, `SESSION_SECRET`, `CRON_SECRET`, `STORAGE_DRIVER`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`.
Chybí: `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFY_EMAIL`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (upozornění v adminu, viz níže).
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
2. **Doména:** `flauto.cz` koupena u WEDOSu a připojena (26. 10.). Hlavní adresa je `www.flauto.cz`, proto `SITE_URL` = `https://www.flauto.cz` (bez lomítka) a Redeploy; ověřit, že `/sitemap.xml` ukazuje adresy s www. Kdo byl přihlášený do adminu na staré adrese `*.vercel.app`, musí se přihlásit znovu. Po převodu Vercelu na majitele zkontrolovat v Settings → Domains „Valid Configuration“ (případně doplnit ověřovací TXT záznam u WEDOSu).
3. **Admin účty pro majitele** (Jarek Frejkovský, Lukáš Gvožď): v Administraci → **Správci** zadat e-mail a dočasné heslo (a pro potvrzení své heslo). Po prvním přihlášení si majitel změní heslo v Administraci → Změna hesla. SQL ani seed už nejsou potřeba (seed jen jako nouzovka, když se nikdo nemůže přihlásit, viz `README.md`).
4. **Obsah:** skutečná auta, ceny služeb (Služby), hodnocení z Googlu (Nastavení), fotky provozovny a týmu, místa označená `[DOPLNIT …]`, poskytovatelé (Vercel, Supabase, Resend) v Ochraně osobních údajů. **Smazat zkušební auta a poptávky.**
5. **Design:** Michal chce ještě trochu doladit vzhled (zatím bez konkrétního zadání, zeptat se ho). Reference vzhledu je `prototype/autobazar.html`, design tokeny v `docs/specifikace.md`, světlý i tmavý režim povinně.
6. **Před ostrým spuštěním:** Vercel → Settings → Functions → region Frankfurt (fra1). Vercel Hobby je podle podmínek jen nekomerční, pro web firmy tarif Pro. Supabase Free po neaktivitě uspává projekt, zvážit Pro.
7. **Upozornění na nové poptávky v zařízení správce (Web Push):** nová tabulka `push_subscriptions` (migrace `push_subscriptions`) → po nasazení `npm run db:deploy` (Session pooler). Klíče vygenerovat jednou příkazem `npx web-push generate-vapid-keys` a vložit do Vercelu jako `VAPID_PUBLIC_KEY` a `VAPID_PRIVATE_KEY` (volitelně `VAPID_SUBJECT`, např. `mailto:info@flauto.cz`), pak Redeploy. Klíče pak neměnit, jinak se musí všichni správci k upozorněním přihlásit znovu. Každý správce se v admin panelu přihlásí a v hlavičce klikne na „Zapnout upozornění“ (a povolí je v prohlížeči). Na iPhonu nejdřív přidat administraci na plochu (Sdílet → Přidat na plochu) a zapnout upozornění z ikony. Otestovat tlačítkem „Vyzkoušet“ a zkušební poptávkou. Ověřeno lokálně jen odesílání a ukládání; skutečné doručení do telefonu je třeba vyzkoušet na ostrém webu.
8. **Potvrzení objednávek, kalendář a objednávka z ceníku Crystal Finish:** nové migrace `service_confirmed_booking` (pole `confirmed_date`, `confirmed_slot` a stav `CONFIRMED`) a `order_items_and_service_contact` (položky objednávky, jméno kontaktu a přepínač objednávky z ceníku u služby; **přepíše kontakt Crystal Finish na Denis +420 773 578 684**) → po nasazení `npm run db:deploy`. Připomenutí posílá druhý plánovač ve `vercel.json` (`/api/cron/booking-reminders`, denně v 5:00 UTC = 7:00 letního / 6:00 zimního času). Potřebuje stejné `CRON_SECRET` jako úklid poptávek; e-mail potřebuje Resend (bod 1), upozornění do zařízení klíče z bodu 7.
9. **Analýza návštěvnosti:** nová migrace `analytics_events` → po nasazení `npm run db:deploy`. Funguje hned, žádné klíče nejsou potřeba. Volitelně `ANALYTICS_SALT` (libovolný tajný řetězec pro anonymní otisk, jinak se použije `SESSION_SECRET`). Staré záznamy (13 měsíců) maže denní úloha `purge-leads` (potřebuje `CRON_SECRET`). Údaje začnou přibývat od nasazení.
10. **Bezpečnost (26. 10.):** nová migrace `security_hardening` (sloupec `admins.session_version`, tabulka `rate_limits`, RLS na všech tabulkách). **Migraci spustit dřív než Redeploy** (v Supabase SQL Editoru soubor `migrace-2026-10-26-bezpecnost.sql`, nebo `npm run db:deploy`): starý kód novým sloupcem nic nerozbije, nový kód bez něj nepřihlásí. Co se změnilo: Next.js 16.4.3 a zod (bezpečnostní opravy), bezpečnostní hlavičky (CSP, zákaz vložení do cizí stránky, HSTS), limity pokusů u přihlášení a formulářů jsou v DB (platí pro všechny instance Vercelu, u přihlášení i na účet), změna hesla odhlásí ostatní zařízení (nouzové odhlášení ukradené cookie = změnit si heslo), limit velikosti JSON požadavků, kontrola původu u přihlášení a odhlášení. Doporučeno ručně: Supabase → Project Settings → Data API → vypnout (web ho nepoužívá, připojuje se přímo k Postgresu).
11. **Google:** Search Console založena na Michalově Google účtu, ověření doménou (TXT záznam u WEDOSu), odeslat `sitemap.xml` a v Nastavení → Uživatelé a oprávnění přidat Jarkův Gmail jako vlastníka. **Firemní profil** (Mapy) založit na Jarkově Gmailu s ním u počítače (ověření videem provozovny nebo telefonem); když už FL Auto v Mapách je, profil převzít, nezakládat nový. Volitelně Seznam Webmaster a Firmy.cz. Podrobně `plan/google-a-domena.md` ve sdílených souborech projektu.

## Při další práci
- Změna schématu: `npm run db:migrate` lokálně, commit migrace. Po nasazení na Vercel spustit proti produkční DB `DATABASE_URL="<Session pooler URL>" npm run db:deploy`. Pro migrace používejte *Session pooler* (port 5432), ne Transaction pooler.
- Známé limity jsou v `README.md` (rate limit v paměti instance).
- Předávací list k podpisu: `docs/predavaci-list.md`.
