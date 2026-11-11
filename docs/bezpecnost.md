# Bezpečnost – revize a pen test (11. 11. 2026)

Navazuje na bezpečnostní úpravy z 26. 10. (viz `docs/nasazeni.md`, bod 10).

## Co web dělá
- **Přihlášení do adminu:** heslo jako hash argon2, httpOnly cookie s podepsaným JWT (7 dní), limit 5 pokusů / 15 min z IP a 10 na účet, stejná chyba pro existující i neexistující účet. Změna hesla nebo zapnutí 2FA odhlásí ostatní zařízení, odhlášení zneplatní cookie i na serveru (`revoked_sessions`).
- **2FA (TOTP):** volitelné pro každého správce (Administrace → Heslo a 2FA). Klíč zašifrovaný v DB (AES-256-GCM), ochrana proti opakovanému použití kódu, 8 jednorázových záložních kódů (v DB jen hash), limit 5 pokusů / 15 min na účet. Zapnutí i vypnutí vyžaduje heslo. Mezikrok přihlášení je oddělená cookie platná 5 minut, která sama k ničemu nepřihlásí.
- **CSRF:** zápisy kontrolují hlavičku `Origin` / `Sec-Fetch-Site`, cookie `SameSite=Lax`.
- **Validace:** všechny formuláře a admin API přes zod na serveru, limit velikosti JSON (256 kB), honeypot u veřejných formulářů.
- **Injekce:** Prisma (parametrizované dotazy), jediný ruční SQL dotaz (rate limit) je parametrizovaný.
- **XSS:** React escapuje výstup, JSON-LD má escapované `<`, e-maily jsou čistý text.
- **Hlavičky:** CSP (bez cizích skriptů, `frame-ancestors 'none'`), HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy.
- **Data:** veřejné API bez kontaktů z poptávek, VIN maskovaný, bez původní ceny. RLS na všech tabulkách (Supabase Data API k nim nemá přístup).
- **Tajné klíče:** jen v proměnných prostředí, v gitu žádné. `npm audit --omit=dev`: 0 zranitelností.

## Lokální pen test (63 testů, všechny prošly)
Proti produkčnímu buildu (`npm run build && npm start`) s lokální DB, ne proti ostrému webu.
- Všech 23 admin endpointů bez přihlášení → 401; podvržený JWT (cizí podpis, `alg=none`) → 401 / přesměrování na login; cron bez tajemství → 401.
- CSRF: přihlášení, 2FA i admin zápisy z cizího původu → 403.
- Limity: 6. pokus o přihlášení → 429; hádání 2FA kódu z různých IP → 429.
- Odhlášená (ukradená) cookie → 401; cookie vydaná jen heslem po zapnutí 2FA → 401; token mezikroku 2FA použitý jako přihlášení → 401.
- 2FA: špatný kód / heslo při zapnutí odmítnuto, opakované použití kódu odmítnuto, záložní kód funguje jen jednou, kód bez hesla (bez mezikroku) odmítnut.
- Veřejné API: bez kontaktů a hashů, VIN maskovaný; SQL injekce ve filtrech bez efektu; path traversal v `/media` → 404; příliš velké tělo odmítnuto.
- XSS payload v poptávce a schválené recenzi se v adminu i na webu vykreslí jako text.
- Upload: SVG převlečené za JPG odmítnuto (fotky se převádějí přes sharp).

Nalezeno a opraveno: odhlášení nerušilo cookie na serveru; anonymní statistika neměla limit; přihlašovací formulář odeslaný před načtením JavaScriptu poslal heslo v URL (teď `method="post"`).

## Vědomé kompromisy
- CSP povoluje inline skripty (přepínač motivu, JSON-LD, Next.js) – nonce by vypnul statické stránky.
- Limit 10 pokusů na účet umožňuje někomu na 15 minut zablokovat přihlášení konkrétního správce.
- 2FA je volitelné; povinné pro všechny správce jde doplnit.

## Co lokální test nepokrývá
Skutečnou infrastrukturu (Vercel, Supabase, DNS a TLS domény), nastavení účtů u poskytovatelů (2FA na Vercelu, Supabase, GitHubu, WEDOSu a v e-mailu – **zapnout**), sociální inženýrství. Na to je potřeba externí tester nebo aspoň pasivní kontrola ostrého webu (např. Mozilla Observatory, SSL Labs).
