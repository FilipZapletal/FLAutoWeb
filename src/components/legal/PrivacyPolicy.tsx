import Link from "next/link";
import { LEAD_RETENTION_DAYS } from "@/lib/leads/retention";
import type { SiteSettings } from "@/lib/validation/settings";
import { CompanyBlock } from "./CompanyBlock";

/**
 * Informace o zpracování osobních údajů (čl. 13 GDPR).
 * Popisuje skutečné fungování webu (formuláře, cookies, mapa). Návrh – před
 * spuštěním doporučujeme kontrolu právníkem.
 */
export function PrivacyPolicy({ s }: { s: SiteSettings }) {
  // Žádosti o osobní údaje směřují na odpovědnou osobu, jinak na obecný kontakt.
  const privacyEmail = s.responsibleEmail ?? s.email;
  const privacyPhone = s.responsiblePhone ?? s.phone;
  return (
    <>
      <p>
        Vážíme si vaší důvěry a s osobními údaji zacházíme odpovědně. Na této stránce najdete, jaké údaje o vás zpracováváme, proč, jak dlouho a jaká máte práva. Řídíme se nařízením Evropského parlamentu a Rady (EU) 2016/679 (GDPR) a zákonem č. 110/2019 Sb., o zpracování osobních údajů.
      </p>

      <h2>1. Kdo je správcem vašich údajů</h2>
      <CompanyBlock s={s} />
      <p>
        S jakýmkoli dotazem k osobním údajům se můžete obrátit na správce{s.responsiblePerson ? <> ({s.responsiblePerson})</> : null} na e-mailu <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a> nebo telefonu {privacyPhone}. Pověřence pro ochranu osobních údajů jsme nejmenovali, protože nám tato povinnost nevzniká.
      </p>

      <h2>2. Jaké údaje zpracováváme</h2>
      <ul>
        <li><strong>Poptávka u vozu</strong> (formulář „Máte zájem o tento vůz?“): jméno, telefon, e-mail (nepovinný), typ zájmu, text zprávy a vůz, o který máte zájem.</li>
        <li><strong>Hledané auto</strong> (okno „Nenašli jste, co hledáte?“): jméno, telefon, e-mail (nepovinný), popis hledaného vozu a vaše požadavky (např. cena, rok, palivo).</li>
        <li><strong>Objednávka do servisu</strong>: jméno, značka a model vozu, telefon, e-mail (nepovinný) a poznámka.</li>
        <li><strong>Koupě vozu nebo servisní zakázka</strong>: údaje potřebné k uzavření a splnění smlouvy, k převodu vozidla v registru silničních vozidel a k vystavení dokladů (např. jméno, adresa, datum narození, číslo dokladu totožnosti, u podnikatelů IČO).</li>
        <li><strong>Komunikace</strong>: obsah e-mailů, zpráv a záznamy o telefonickém a osobním jednání týkajícím se vaší poptávky.</li>
        <li><strong>Údaje v prohlížeči</strong>: vaši volbu v okně Nastavení soukromí a – s vaším souhlasem – světlý či tmavý režim, oblíbená auta a údaj, že jste zavřeli okno „Nenašli jste, co hledáte?“. Zůstávají jen ve vašem zařízení (viz <Link href="/cookies">Cookies</Link>), nikam se neodesílají.</li>
        <li><strong>Technické údaje</strong>: IP adresa a údaje o prohlížeči. Používáme je jen krátkodobě k ochraně formulářů před zneužitím (omezení počtu odeslání) a k zajištění bezpečného provozu webu.</li>
      </ul>

      <h2>3. Proč údaje zpracováváme a na jakém právním základě</h2>
      <table>
        <thead>
          <tr>
            <th>Účel</th>
            <th>Právní základ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Vyřízení vaší poptávky, domluva prohlídky, zkušební jízdy nebo termínu v servisu</td>
            <td>Jednání o smlouvě na vaši žádost – čl. 6 odst. 1 písm. b) GDPR</td>
          </tr>
          <tr>
            <td>Posouzení, zda se nám podaří vámi hledané auto sehnat, a odpověď na vaši poptávku</td>
            <td>Jednání o smlouvě na vaši žádost – čl. 6 odst. 1 písm. b) GDPR</td>
          </tr>
          <tr>
            <td>Uzavření a splnění kupní smlouvy nebo servisní zakázky, vyřízení reklamace</td>
            <td>Plnění smlouvy – čl. 6 odst. 1 písm. b) GDPR</td>
          </tr>
          <tr>
            <td>Vedení účetnictví, daňové povinnosti, převod vozidla a další povinnosti podle zákona</td>
            <td>Plnění právní povinnosti – čl. 6 odst. 1 písm. c) GDPR</td>
          </tr>
          <tr>
            <td>Ochrana webu a formulářů před zneužitím, uplatnění a obrana právních nároků</td>
            <td>Oprávněný zájem – čl. 6 odst. 1 písm. f) GDPR</td>
          </tr>
        </tbody>
      </table>
      <p>Poskytnutí údajů ve formulářích je dobrovolné. Bez jména a telefonu ale vaši poptávku nedokážeme vyřídit. Obchodní sdělení (newslettery) neposíláme a na webu nepoužíváme analytické ani reklamní nástroje.</p>

      <h2>4. Jak dlouho údaje uchováváme</h2>
      <ul>
        <li>Poptávky, které nevedly k uzavření smlouvy: <strong>{LEAD_RETENTION_DAYS} dní</strong> od posledního kontaktu s vámi, poté je automaticky smažeme. Poptávka, která vedla k rezervaci nebo koupi vozu, se dále uchovává jako podklad ke smlouvě podle následujícího bodu.</li>
        <li>Údaje ze smluv a účetní a daňové doklady: po dobu, kterou nám ukládají právní předpisy (zejména zákon o účetnictví a zákon o dani z přidané hodnoty), a po dobu, po kterou lze uplatnit práva ze smlouvy.</li>
        <li>Technické údaje pro ochranu formulářů: jen v paměti serveru, nejvýše několik desítek minut.</li>
      </ul>
      <p>Po uplynutí této doby údaje smažeme nebo anonymizujeme.</p>

      <h2>5. Kdo k údajům má přístup</h2>
      <p>Údaje zpracováváme sami. Pomáhají nám s tím dodavatelé, kteří s nimi smějí nakládat jen podle našich pokynů (zpracovatelé):</p>
      <ul>
        <li>poskytovatel hostingu webu a databáze,</li>
        <li>poskytovatel služby pro odesílání e-mailů (potvrzení a upozornění na poptávky),</li>
        <li>dodavatel, který web vyvíjí a spravuje,</li>
        <li>účetní, případně daňový poradce.</li>
      </ul>
      <p>
        Konkrétní poskytovatelé: <span className="text-acc">[DOPLNIT po spuštění webu, např. Vercel Inc. (hosting), Supabase Inc. (databáze a úložiště fotografií), Resend (e-maily)]</span>.
      </p>
      <p>Pokud to vyžaduje zákon, předáváme údaje také orgánům veřejné moci (např. registru silničních vozidel při převodu vozu nebo finančnímu úřadu).</p>
      <p>
        Někteří poskytovatelé mohou mít sídlo nebo servery mimo Evropskou unii (zejména v USA). V takovém případě se údaje předávají jen se zárukami podle GDPR – na základě rámce EU–USA pro ochranu osobních údajů (Data Privacy Framework) nebo standardních smluvních doložek schválených Evropskou komisí.
      </p>

      <h2>6. Služby třetích stran na webu</h2>
      <ul>
        <li><strong>Mapa Google</strong> na stránce Kontakt se načte až poté, co kliknete na „Zobrazit mapu“. Teprve potom společnost Google získá údaje o vaší návštěvě (např. IP adresu) a může ukládat vlastní cookies.</li>
        <li><strong>WhatsApp</strong>: tlačítko „Napsat na WhatsApp“ vás přesměruje do aplikace WhatsApp. Za zpracování údajů v této aplikaci odpovídá její provozovatel.</li>
      </ul>
      <p>Podrobnosti o cookies najdete na stránce <Link href="/cookies">Cookies</Link>.</p>

      <h2>7. Vaše práva</h2>
      <p>V souvislosti se zpracováním osobních údajů máte právo:</p>
      <ul>
        <li>na přístup k osobním údajům a na jejich kopii,</li>
        <li>na opravu nepřesných nebo neúplných údajů,</li>
        <li>na výmaz údajů, pokud už nejsou potřeba nebo je zpracováváme neoprávněně,</li>
        <li>na omezení zpracování,</li>
        <li>na přenositelnost údajů, které jste nám poskytli na základě smlouvy,</li>
        <li>vznést námitku proti zpracování založenému na našem oprávněném zájmu.</li>
      </ul>
      <p>Svá práva můžete uplatnit e-mailem na <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a> nebo osobně na provozovně. Odpovíme bez zbytečného odkladu, nejpozději do jednoho měsíce.</p>
      <p>
        Pokud se domníváte, že s vašimi údaji nezacházíme v souladu s předpisy, můžete podat stížnost u Úřadu pro ochranu osobních údajů, Pplk. Sochora 27, 170 00 Praha 7,{" "}
        <a href="https://uoou.gov.cz" target="_blank" rel="noopener noreferrer">uoou.gov.cz</a>.
      </p>

      <h2>8. Zabezpečení</h2>
      <p>Web komunikuje přes šifrované spojení (HTTPS). Do administrace s poptávkami mají přístup jen oprávněné osoby chráněné heslem. Automatizované rozhodování ani profilování neprovádíme.</p>
    </>
  );
}
