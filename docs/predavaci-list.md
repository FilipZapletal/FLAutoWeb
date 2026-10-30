# Předávací list – web FL Auto

> Šablona k vytištění a podpisu při předání. Místa `[DOPLNIT]` vyplňte. **Hesla ani klíče sem nikdy nepište.** Postup předání účtů je v `docs/nasazeni.md`.

Tímto listem dodavatel předává objednateli hotový web autobazaru a servisu FL Auto včetně administrace. Objednatel podpisem potvrzuje převzetí.

## Základní údaje

| Údaj | Hodnota |
| --- | --- |
| Objednatel | Lukáš Gvožď, IČO 07481233 (FL Auto) |
| Kontaktní osoby objednatele | Jarek Frejkovský, Lukáš Gvožď |
| Dodavatel | Michal \[DOPLNIT příjmení, IČO / adresa\] |
| Adresa webu | https://www.flauto.cz (flauto.cz přesměruje na www) |
| Administrace | https://www.flauto.cz/admin |
| Datum předání | \[DOPLNIT\] |

## Co bylo dodáno

**Veřejný web**

- Úvodní stránka, katalog vozů s filtry a řazením, detail vozu s galerií a poptávkovým formulářem
- Prodané a rezervované vozy se štítkem, oblíbená auta bez registrace
- Servis: služby s ceníkem, online objednávka termínu, Crystal Finish
- Okno „Auto na přání“ pro hledaný vůz
- Recenze, O nás, Kontakt, právní stránky (obchodní údaje, ochrana osobních údajů, cookies, reklamační řád), nastavení soukromí
- Světlý a tmavý režim, mobilní verze, SEO (sitemap, náhledy při sdílení, údaje o firmě pro Google)

**Administrace**

- Vozy: přidání, úprava, stav (Prodáno, Rezervováno), fotky (nahrání, pořadí, hlavní fotka)
- Poptávky a objednávky servisu se stavem vyřizování, automatické mazání po 30 dnech
- Služby a ceník, recenze, kontaktní a firemní údaje, správci (přidání a odebrání účtů), změna hesla
- E-mailová upozornění na novou objednávku a potvrzení zákazníkovi (po nastavení Resend)

Zdrojový kód je v repozitáři GitHub FilipZapletal/FLAutoWeb.

## Služby a účty

Technické účty (Vercel, Supabase, Resend) vede dodavatel. Web běží v jeho týmu `fla-uto` na Vercelu s tarifem Pro, který **platí objednatel vlastní kartou**: objednatel má v týmu roli Billing (zdarma), sám spravuje platební kartu a vidí náklady i faktury. Supabase a Resend jsou zdarma. Doména a Google patří objednateli. Pokud si objednatel bude chtít účty vzít k sobě, dodavatel ho ve Vercelu povýší na Ownera a projekty v Supabase a Resendu mu převede. Ceny jsou orientační, aktuální vždy na webu dané služby.

| Služba | K čemu slouží | Vlastník účtu | Tarif a cena |
| --- | --- | --- | --- |
| Vercel | běh webu | dodavatel (tým fla-uto), platí objednatel (role Billing) | Pro, 20 $ měsíčně bez DPH (1 placené místo dodavatele, role Billing a Viewer zdarma) |
| Supabase | databáze a fotky | dodavatel | Free (Pro až při nedostatku místa na fotky, limit 1 GB) |
| Resend | odesílání e-mailů | dodavatel | Free |
| Doména flauto.cz | adresa webu, DNS záznamy (web, Resend, Google) | FL Auto, registrátor WEDOS | \[DOPLNIT\] Kč ročně, prodloužení k \[DOPLNIT\] |
| Google Search Console | hlídání webu ve vyhledávání Google, sitemap | dodavatel, objednatel přidán jako vlastník | zdarma |
| Google firemní profil | karta FL Auto v Mapách a ve vyhledávání | FL Auto (Gmail Jarka Frejkovského) | zdarma |
| GitHub | zdrojový kód | dodavatel | zdarma |

## Přístupy

Hesla nejsou v tomto listu ani v žádném e-mailu. Každý si je nastaví sám při předání.

| Přístup | Kdo | Jak |
| --- | --- | --- |
| Administrace webu | Jarek Frejkovský, Lukáš Gvožď | vlastní e-mail a heslo; účty zakládá správce v Administrace → Správci, heslo si každý změní v Administrace → Změna hesla |
| Vercel | dodavatel (Owner), objednatel (Billing a Viewer) | dodavatel pozve objednatele do týmu fla-uto: plátce jako Billing, druhý majitel jako Viewer |
| Supabase, Resend | dodavatel | objednatel přístup nepotřebuje; převod na jeho účet kdykoli na požádání |
| Doména | objednatel | klientská sekce WEDOS na jméno objednatele, upomínky na prodloužení chodí na jeho e-mail |
| Google Search Console | objednatel, dodavatel | objednatel se přihlásí svým Gmailem (přidán jako vlastník) |
| Google firemní profil | objednatel | business.google.com, Gmail Jarka Frejkovského |

Odkaz do administrace na webu záměrně není, adresa /admin se zadává ručně.

## Podpora a údržba

Web běží sám, dokud objednatel platí služby výše. Údržba znamená opravy chyb, drobné úpravy a obnovu knihoven kvůli bezpečnosti. Strany se dohodly na variantě \[DOPLNIT A nebo B\]:

| Varianta | Co zahrnuje | Cena |
| --- | --- | --- |
| A: hodinová sazba | práce na vyžádání, účtuje se odpracovaný čas | \[DOPLNIT\] Kč / hod |
| B: měsíční paušál | aktualizace, dohled nad provozem, drobné úpravy do \[DOPLNIT\] hod měsíčně | \[DOPLNIT\] Kč / měsíc |

- Záruka na chyby v dodaném webu: \[DOPLNIT, např. počet měsíců od předání\]
- Nové funkce mimo zadání se ocení zvlášť.
- Kontakt na dodavatele: \[DOPLNIT telefon, e-mail\]

## Kontrolní seznam na předávací schůzku

Pořadí tak, aby se nic nedělalo dvakrát. Postup krok za krokem je v souboru předání webu.

- [ ] Vercel: tým fla-uto přepnut na Pro (Settings → Billing → Upgrade to Pro)
- [ ] Vercel: objednatel pozván jako Billing (Settings → Members), zadal svou platební kartu; druhý majitel jako Viewer
- [ ] Vercel: region funkcí Frankfurt (Settings → Functions → fra1)
- [x] Objednatel koupí doménu na své jméno (flauto.cz, WEDOS, 26. 10. 2026)
- [x] Doména připojena k webu (DNS u WEDOSu, ve Vercelu „Valid Configuration“)
- [x] Ve Vercelu `SITE_URL` = `https://www.flauto.cz` a Redeploy (26. 10.)
- [x] Google Search Console: doména ověřená, odeslaná sitemap (26. 10.)
- [x] Google Search Console: objednatel přidán jako vlastník (29. 10.)
- [ ] Google firemní profil založen (nebo převzat) a ověřen, s odkazem na web
- [ ] Po přepnutí na Pro zkontrolovat, že web běží a doména svítí „Valid Configuration“
- [ ] Resend (účet dodavatele): DNS záznamy u WEDOSu, ověřená doména, klíč ve Vercelu, zkušební objednávka došla e-mailem majitelům i zákazníkovi
- [ ] Admin účet pro oba majitele (Administrace → Správci), každý si změnil heslo
- [ ] Smazána zkušební auta a poptávky, vyplněno Nastavení a místa \[DOPLNIT\] na webu
- [ ] Dohodnuta podpora (varianta A nebo B)
- [ ] Podepsán tento předávací list

## Podpisy

Objednatel převzal web v rozsahu tohoto listu bez výhrad / s výhradami: \[DOPLNIT\]

|  | Jméno | Datum | Podpis |
| --- | --- | --- | --- |
| Za objednatele |  |  |  |
| Za dodavatele |  |  |  |
