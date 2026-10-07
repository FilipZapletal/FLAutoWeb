# Nasazení – aktuální stav a další kroky

Předávací poznámky pro dalšího vývojáře nebo AI. Stav k 7. 10. 2026 večer.
**Tajné hodnoty (hesla, klíče, connection stringy) sem nikdy nepište.** Jsou jen ve Vercelu a v Supabase.

## Co běží

| Část | Kde | Poznámka |
|---|---|---|
| Web (Next.js) | **Vercel**, projekt FLAutoWeb, tarif Hobby | adresa `*.vercel.app` (vlastní doména zatím není). Každý push do `main` se nasadí automaticky. |
| Databáze (PostgreSQL) | **Supabase**, projekt `flauto`, region Frankfurt, tarif Free | aplikace se připojuje přes *Transaction pooler* (port 6543) |
| Fotky | **Supabase Storage**, veřejný bucket `photos` | přes S3 rozhraní (`STORAGE_DRIVER=s3`) |
| E-maily | **zatím nenastaveno** | bez `RESEND_API_KEY` se e-maily jen vypisují do logu, poptávky se ukládají do adminu |
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
- Hesla jsou v tabulce `admins` jako argon2 hash.

## Co zbývá (v tomto pořadí)

1. **Otestovat ostrý web:** přidat zkušební vůz s fotkou (ověří úložiště S3), odeslat zkušební poptávku (ověří zápis do DB), potom zkušební data smazat.
2. **Admin účty pro majitele** (Jarek Frejkovský, Lukáš Gvožď). Dvě možnosti:
   - z počítače s projektem: `DATABASE_URL="<Session pooler URL>" ADMIN_EMAIL=… ADMIN_PASSWORD=… SEED_DEMO_VEHICLES=0 npm run db:seed`,
   - nebo v Supabase SQL Editoru: `INSERT INTO public.admins (email, password_hash) VALUES ('email@malymi.pismeny', '<argon2 hash>');`. Hash vytvoříte v projektu příkazem `node -e "require('@node-rs/argon2').hash(process.argv[1]).then(console.log)" 'DocasneHeslo'`.
   Po prvním přihlášení si majitel změní heslo v adminu.
3. **E-maily (Resend):** založit účet, přidat a ověřit doménu (DNS záznamy u registrátora), ve Vercelu doplnit `RESEND_API_KEY`, `EMAIL_FROM` (např. `FL Auto <poptavky@flauto.cz>`) a `ADMIN_NOTIFY_EMAIL`, potom Redeploy.
4. **Doména:** doporučeno `flauto.cz` (podle DNS vypadá volná, ověřit u registrátora). Koupit u českého registrátora (Wedos, Forpsi, Active24), ne přes Vercel. Ve Vercelu → Settings → Domains ji přidat, u registrátora nastavit DNS podle Vercelu, pak změnit `SITE_URL` a dát Redeploy.
5. **Vercel → Settings → Functions → region Frankfurt (fra1)**, ať je web blízko databáze.
6. **Před ostrým spuštěním:** Vercel Hobby je podle podmínek jen pro nekomerční použití, pro web firmy přejít na Pro. Supabase Free po neaktivitě uspává projekt, pro jistotu zvážit Pro.
7. **Obsah:** v adminu → Nastavení zkontrolovat firemní údaje, dodat fotky provozovny a týmu a doplnit poskytovatele (Vercel, Supabase, Resend) do Ochrany osobních údajů. Místa k doplnění jsou na webu označená `[DOPLNIT …]`.

## Při další práci
- Změna schématu: `npm run db:migrate` lokálně, commit migrace. Po nasazení na Vercel spustit proti produkční DB `DATABASE_URL="<Session pooler URL>" npm run db:deploy`. Pro migrace používejte *Session pooler* (port 5432), ne Transaction pooler.
- Známé limity jsou v `README.md` (rate limit v paměti instance, správa adminů jen přes seed/SQL).
