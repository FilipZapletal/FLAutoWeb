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
2. **Doména:** doporučeno `flauto.cz` (podle DNS vypadá volná, ověřit u registrátora). Koupit u českého registrátora (Wedos, Forpsi, Active24), ne přes Vercel. Ve Vercelu → Settings → Domains ji přidat, u registrátora nastavit DNS podle Vercelu, pak změnit `SITE_URL` a dát Redeploy.
3. **Admin účty pro majitele** (Jarek Frejkovský, Lukáš Gvožď): v Administraci → **Správci** zadat e-mail a dočasné heslo (a pro potvrzení své heslo). Po prvním přihlášení si majitel změní heslo v Administraci → Změna hesla. SQL ani seed už nejsou potřeba (seed jen jako nouzovka, když se nikdo nemůže přihlásit, viz `README.md`).
4. **Obsah:** skutečná auta, ceny služeb (Služby), hodnocení z Googlu (Nastavení), fotky provozovny a týmu, místa označená `[DOPLNIT …]`, poskytovatelé (Vercel, Supabase, Resend) v Ochraně osobních údajů. **Smazat zkušební auta a poptávky.**
5. **Design:** Michal chce ještě trochu doladit vzhled (zatím bez konkrétního zadání, zeptat se ho). Reference vzhledu je `prototype/autobazar.html`, design tokeny v `docs/specifikace.md`, světlý i tmavý režim povinně.
6. **Před ostrým spuštěním:** Vercel → Settings → Functions → region Frankfurt (fra1). Vercel Hobby je podle podmínek jen nekomerční, pro web firmy tarif Pro. Supabase Free po neaktivitě uspává projekt, zvážit Pro.
7. **Upozornění na nové poptávky v zařízení správce (Web Push):** nová tabulka `push_subscriptions` (migrace `push_subscriptions`) → po nasazení `npm run db:deploy` (Session pooler). Klíče vygenerovat jednou příkazem `npx web-push generate-vapid-keys` a vložit do Vercelu jako `VAPID_PUBLIC_KEY` a `VAPID_PRIVATE_KEY` (volitelně `VAPID_SUBJECT`, např. `mailto:info@flauto.cz`), pak Redeploy. Klíče pak neměnit, jinak se musí všichni správci k upozorněním přihlásit znovu. Každý správce se v admin panelu přihlásí a v hlavičce klikne na „Zapnout upozornění“ (a povolí je v prohlížeči). Na iPhonu nejdřív přidat administraci na plochu (Sdílet → Přidat na plochu) a zapnout upozornění z ikony. Otestovat tlačítkem „Vyzkoušet“ a zkušební poptávkou. Ověřeno lokálně jen odesílání a ukládání; skutečné doručení do telefonu je třeba vyzkoušet na ostrém webu.
8. **Potvrzení objednávek, kalendář a objednávka z ceníku Crystal Finish:** nové migrace `service_confirmed_booking` (pole `confirmed_date`, `confirmed_slot` a stav `CONFIRMED`) a `order_items_and_service_contact` (položky objednávky, jméno kontaktu a přepínač objednávky z ceníku u služby; **přepíše kontakt Crystal Finish na Denis +420 773 578 684**) → po nasazení `npm run db:deploy`. Připomenutí posílá druhý plánovač ve `vercel.json` (`/api/cron/booking-reminders`, denně v 5:00 UTC = 7:00 letního / 6:00 zimního času). Potřebuje stejné `CRON_SECRET` jako úklid poptávek; e-mail potřebuje Resend (bod 1), upozornění do zařízení klíče z bodu 7.
9. **Analýza návštěvnosti:** nová migrace `analytics_events` → po nasazení `npm run db:deploy`. Funguje hned, žádné klíče nejsou potřeba. Volitelně `ANALYTICS_SALT` (libovolný tajný řetězec pro anonymní otisk, jinak se použije `SESSION_SECRET`). Staré záznamy (13 měsíců) maže denní úloha `purge-leads` (potřebuje `CRON_SECRET`). Údaje začnou přibývat od nasazení.
10. **Po spuštění (doporučení):** Google firemní profil a Google Search Console (sitemap je na `/sitemap.xml`).

## Při další práci
- Změna schématu: `npm run db:migrate` lokálně, commit migrace. Po nasazení na Vercel spustit proti produkční DB `DATABASE_URL="<Session pooler URL>" npm run db:deploy`. Pro migrace používejte *Session pooler* (port 5432), ne Transaction pooler.
- Známé limity jsou v `README.md` (rate limit v paměti instance).
- Předávací list k podpisu: `docs/predavaci-list.md`.
