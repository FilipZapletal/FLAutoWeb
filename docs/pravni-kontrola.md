# Právní kontrola webu FL Auto (stav 2. 11. 2026)

> Technická kontrola programátora, **ne právní stanovisko**. Texty na webu jsou návrh. Před ostrým spuštěním je má projít právník nebo účetní, zvlášť body označené ⚠.

## 1. Co web už splňuje
| Požadavek | Kde na webu / v kódu |
|---|---|
| Identifikace provozovatele (jméno, IČO, DIČ, sídlo, provozovna, zápis, kontakty) | Obchodní údaje, patička, Kontakt. Hodnoty z Administrace → Nastavení. |
| Ochrana osobních údajů (čl. 13 GDPR): správce, účely, právní základy, doby uchování, zpracovatelé, předání do USA, práva, stížnost u ÚOOÚ | `/ochrana-osobnich-udaju`, odkaz je i u každého formuláře |
| Mazání údajů | Poptávky se po `LEAD_RETENTION_DAYS` dnech mažou, statistika po 13 měsících, počítadla pokusů do dne (denní úloha `purge-leads`, potřebuje `CRON_SECRET`) |
| Cookies a souhlas | `/cookies`, okno Nastavení soukromí s tlačítky přijmout i odmítnout. Web nepoužívá analytické ani reklamní cookies, statistika je anonymní a bez cookies. |
| Služby třetích stran | Mapa Google se načte až po kliknutí |
| Reklamace | `/reklamacni-rad` |
| Mimosoudní řešení sporů (ČOI) | `/adr` (platforma ODR zanikla v červenci 2025, web ji nezmiňuje) |
| Recenze | Štítek „Recenze nejsou ověřené“, falešné recenze se nezveřejňují |
| Ceny | U akce se ukazuje jen aktuální cena (bez přeškrtnuté), takže se neuplatní pravidlo o nejnižší ceně za 30 dní |
| Obchodní podmínky a odstoupení od smlouvy (2. 11.) | `/obchodni-podminky` včetně vzorového formuláře, odkaz u objednávkových formulářů, informace o odstoupení v e-mailu o potvrzení termínu služby |
| DPH u cen vozů (2. 11.) | Poznámka u ceny na detailu vozu |
| Způsob platby (2. 11.) | Obchodní údaje a Obchodní podmínky: na provozovně, hotově nebo QR kódem |

## 2. Co zkontrolovat před předáním
- [ ] V Administrace → Nastavení jsou vyplněné: obchodní firma, **IČO, DIČ (Lukáš Gvožď je plátce DPH)**, sídlo, zápis v rejstříku, živnostenský úřad, odpovědná osoba, datum účinnosti.
- [ ] Na ostrém webu na stránkách Obchodní údaje, Obchodní podmínky, Ochrana osobních údajů, Reklamační řád a Kontakt **není žádný červený text `[DOPLNIT …]`**.
- [x] **Crystal Finish:** smluvní stranou je Lukáš Gvožď (FL Auto), který za službu fakturuje. Denis Gurský je kontaktní osoba (rozhodnuto 2. 11.). Podmínky, Reklamační řád i Obchodní údaje už s tím sedí.
- [ ] ⚠ **DPH u vozů:** účetní potvrdí, zda se auta prodávají v režimu použitého zboží (marže), nebo s DPH. Poznámka u ceny obojí pokrývá, ale musí sedět se skutečností. Ceny služeb v Administrace → Služby → Poznámka k ceníku (např. „Ceny jsou včetně DPH.“) podle toho, zda je daná služba v režimu plátce.
- [ ] ⚠ **Platba v hotovosti:** platba QR kódem je bezhotovostní, takže limity pro hotovost se jí netýkají. Týkají se jen případů, kdy někdo zaplatí auto v hotovosti. Zákon omezuje hotovostní platby (naposledy jsem se setkal s 270 000 Kč, aktuální výši ověřit) a při větších hotovostních platbách za zboží mohou platit povinnosti proti praní peněz (identifikace kupujícího). Doporučení: u dražších vozů přijímat jen QR kód nebo převod. Potvrdit s účetní. Web říká jen „v rámci zákonných limitů“.
- [x] **Odstoupení od smlouvy (rozhodnuto 2. 11.):** tlačítko „Odstoupit od smlouvy“ se zatím nepřidává. Směrnice EU 2023/2673 (použitelná od 19. 6. 2026) míří na smlouvy uzavírané přes online rozhraní. Zde smlouva o službě vzniká až potvrzením termínu člověkem (telefon, e-mail), platí se na místě a auta se kupují osobně. Informace o právu odstoupit je na stránce Obchodní podmínky s formulářem a **v e-mailu o potvrzení termínu u služeb** (trvalý nosič). Znovu posoudit, pokud web začne přijímat závazné objednávky nebo platby online: pak přidat tlačítko s formulářem a potvrzovacím e-mailem. Jde o odhad programátora, ne o právní stanovisko.
- [ ] Zkušební recenze, poptávky a data analýzy před ostrým provozem smazána.

## 3. Dokumenty mimo kód (často se zapomínají)
- [ ] **Zpracovatelské smlouvy (DPA)** s poskytovateli: Vercel, Supabase, Resend. Nabízejí je k odsouhlasení online v nastavení účtu nebo na svých webech. Uložit potvrzení.
- [ ] **Zpracovatelská smlouva mezi FL Auto a dodavatelem webu** (Michal), protože dodavatel má přístup do administrace a databáze s osobními údaji. Vložit do předávacího listu jako přílohu.
- [ ] **Záznam o činnostech zpracování** (čl. 30 GDPR), interní dokument. Níže je předvyplněný podklad.
- [ ] **Postup při úniku osobních údajů:** nahlásit ÚOOÚ do 72 hodin od zjištění, pokud hrozí riziko pro lidi. Kontakt na ÚOOÚ: uoou.gov.cz. Každý únik zapsat (co, kdy, co se stalo, co se udělalo).
- [ ] Přístupy do administrace mají jen lidé, kteří je potřebují. Při odchodu zaměstnance nebo dodavatele účet smazat (Administrace → Správci).

### Podklad k záznamu o činnostech zpracování
| Činnost | Údaje | Účel a základ | Doba | Příjemci |
|---|---|---|---|---|
| Poptávky a objednávky z webu | jméno, telefon, e-mail, vůz, termín, položky | vyřízení žádosti, čl. 6/1/b | `LEAD_RETENTION_DAYS` dnů od posledního kontaktu | hosting, e-maily |
| Hledané auto | jméno, kontakt, požadavky | jednání o smlouvě, čl. 6/1/b | stejně | stejně |
| Recenze | jméno, text, hodnocení | souhlas, čl. 6/1/a | do odvolání | zveřejněno na webu |
| Kupní smlouvy a servisní zakázky | identifikační údaje, doklady | plnění smlouvy a zákonné povinnosti, čl. 6/1/b, c | podle účetních a daňových předpisů | účetní, úřady |
| Ochrana formulářů | IP adresa (počítadlo) | oprávněný zájem, čl. 6/1/f | do hodiny, smaže se nejpozději další den | hosting |
| Anonymní statistika | stránky, akce, zdroj, zařízení (bez IP a cookies) | oprávněný zájem, čl. 6/1/f | 13 měsíců | hosting |

## 4. Další upozornění pro rok 2026
- **Přístupnost webu (evropský zákon o přístupnosti, v ČR od 28. 6. 2025):** týká se i e-shopů a služeb pro spotřebitele, ale **mikropodniky** (méně než 10 zaměstnanců a obrat do 2 mil. EUR) mají u služeb výjimku. Ověřit u klienta. Web má základy přístupnosti (popisky, ovládání klávesnicí, kontrast), prohlášení o přístupnosti by u mikropodniku nebylo povinné.
- **Recenze:** pokud se na webu objeví hodnocení, musí být jasné, zda a jak se ověřují (štítek „Recenze nejsou ověřené“ to splňuje). Nikdy nezveřejňovat vymyšlené recenze.
- **Ceny:** pokud by se někdy zobrazovala sleva (přeškrtnutá cena), vznikne povinnost uvést nejnižší cenu za předchozích 30 dní. Zatím se neukazuje.
- **Změna zákonů:** právní texty mají datum účinnosti (Nastavení). Při každé změně provozu (nová služba, online platba, nový nástroj) je třeba je aktualizovat.
