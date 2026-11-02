import Link from "next/link";
import { phonesLine } from "@/lib/contacts";
import type { SiteSettings } from "@/lib/validation/settings";
import { CompanyBlock } from "./CompanyBlock";

/**
 * Obchodní podmínky pro objednávky služeb a informace o prodeji vozidel, včetně informací o odstoupení
 * od smlouvy na dálku (§ 1811 a násl. občanského zákoníku). Návrh – před spuštěním doporučujeme kontrolu právníkem.
 */
export function TermsPolicy({ s }: { s: SiteSettings }) {
  return (
    <>
      <h2>1. Úvodní ustanovení</h2>
      <p>Tyto obchodní podmínky upravují prodej vozidel a poskytování servisních služeb (včetně služby Crystal Finish) prostřednictvím tohoto webu a na provozovně. Prodávajícím a poskytovatelem služeb je:</p>
      <CompanyBlock s={s} />
      <p>Službu Crystal Finish poskytujeme my jako provozovatel uvedený výše. Kontaktní osobou a zákazníkům k dispozici je u ní Denis Gurský.</p>
      <p>
        Vztahy se spotřebiteli se řídí zákonem č. 89/2012 Sb., občanský zákoník, a zákonem č. 634/1992 Sb., o ochraně spotřebitele. Zákonná práva spotřebitele těmito podmínkami nejsou nijak omezena. Spotřebitelem je každý, kdo s námi uzavírá smlouvu mimo rámec své podnikatelské činnosti.
      </p>

      <h2>2. Nabídka vozidel</h2>
      <ul>
        <li>Nabídka vozidel na webu je informativní a není návrhem na uzavření smlouvy. Údaje o vozidle (výbava, parametry, fotografie) jsou orientační, rozhodující je stav vozidla při prohlídce a údaje v kupní smlouvě a předávacím protokolu.</li>
        <li>Formulář „Máte zájem o tento vůz?“ je nezávazná poptávka. Ozveme se vám a domluvíme prohlídku nebo zkušební jízdu.</li>
        <li>Kupní smlouvu na vozidlo uzavíráme písemně, osobně na provozovně. Přes web se vozidla nekupují ani neplatí.</li>
      </ul>

      <h2>3. Objednávka služby a uzavření smlouvy</h2>
      <ul>
        <li>Objednávkou na webu (servis, příprava na STK a emise, Crystal Finish) žádáte o poskytnutí služby v navrženém termínu. Je to žádost, nikoli uzavřená smlouva.</li>
        <li>Smlouva o poskytnutí služby vzniká až <strong>potvrzením termínu</strong> z naší strany, telefonicky nebo e-mailem (pokud jste e-mail uvedli, pošleme vám potvrzení i e-mailem). Do té doby je váš termín jen přáním.</li>
        <li>Uvádějte prosím správné a úplné údaje, zejména telefon a vůz. Podle nich vás kontaktujeme.</li>
        <li>U objednávky z ceníku je cena orientační. Přesnou cenu potvrdíme po prohlídce vozu. Práce nad rámec objednávky provedeme jen po dohodě s vámi.</li>
      </ul>

      <h2>4. Cena a platba</h2>
      <ul>
        <li>Ceny jsou uvedeny v českých korunách a jsou konečné pro spotřebitele: zahrnují DPH, je-li provozovatel jejím plátcem. U ojetých vozidel prodávaných ve zvláštním režimu pro použité zboží se DPH na dokladu nevyčleňuje.</li>
        <li>Platba probíhá <strong>na provozovně</strong> při převzetí vozidla nebo po provedení služby, <strong>hotově nebo QR kódem</strong>. Hotovost přijímáme v rámci zákonných limitů pro platby v hotovosti. Přes web se neplatí.</li>
        <li>Za provedenou službu nebo prodané vozidlo vystavíme daňový doklad.</li>
      </ul>

      <h2>5. Provedení služby</h2>
      <ul>
        <li>Vozidlo přistavte v domluveném termínu. Termín můžete změnit nebo zrušit telefonicky či e-mailem, nejlépe co nejdříve ({phonesLine(s)}, {s.email}).</li>
        <li>Před zahájením prací můžeme vozidlo prohlédnout a upřesnit rozsah prací a cenu. Při předání vozidla vám ukážeme provedené práce.</li>
      </ul>

      <h2>6. Odstoupení od smlouvy</h2>
      <p>Tento bod se týká pouze spotřebitelů.</p>
      <ul>
        <li>
          <strong>Služba objednaná přes web.</strong> Pokud smlouvu o službě uzavřete na dálku (objednáním na webu a potvrzením termínu telefonem nebo e-mailem), máte právo od ní <strong>odstoupit do 14 dnů</strong> od jejího uzavření bez udání důvodu. Odstoupení nám oznamte e-mailem na {s.email}, písemně nebo telefonicky; můžete použít vzorový formulář níže, nemusíte.
        </li>
        <li>Pokud jste výslovně požádali, abychom začali službu poskytovat ještě před uplynutím čtrnáctidenní lhůty, a služba byla poskytnuta v plném rozsahu, právo na odstoupení zaniká. Odstoupíte-li po zahájení služby, uhradíte poměrnou část ceny za dosud poskytnuté plnění.</li>
        <li><strong>Vozidlo.</strong> Kupní smlouvu na vozidlo uzavíráme osobně na provozovně. U smlouvy uzavřené osobně zákon právo odstoupit do 14 dnů bez udání důvodu nepřiznává. Práva z vadného plnění máte vždy, viz <Link href="/reklamacni-rad">Reklamační řád</Link>.</li>
        <li>Právo odstoupit od smlouvy z jiných důvodů (např. kvůli podstatnému porušení smlouvy) zůstává zachováno.</li>
      </ul>

      <h3>Vzorový formulář pro odstoupení od smlouvy</h3>
      <div className="rounded-inner border border-line bg-card2 p-4 text-sm">
        <p>Adresát: {s.email}{s.registeredOffice ? `, ${s.registeredOffice}` : ""}</p>
        <p>Oznamuji, že odstupuji od smlouvy o poskytnutí této služby: …………………………………………</p>
        <p>Datum objednání / potvrzení termínu: ………………………</p>
        <p>Jméno a příjmení spotřebitele: ………………………</p>
        <p>Adresa nebo telefon a e-mail spotřebitele: ………………………</p>
        <p>Datum: ………………………</p>
        <p>Podpis spotřebitele (pouze pokud se formulář podává v listinné podobě): ………………………</p>
      </div>

      <h2>7. Vady a reklamace</h2>
      <p>Postup při uplatnění práv z vadného plnění a lhůty popisuje <Link href="/reklamacni-rad">Reklamační řád</Link>.</p>

      <h2>8. Mimosoudní řešení sporů</h2>
      <p>Pokud se spor nepodaří vyřešit přímo s námi, můžete se obrátit na Českou obchodní inspekci. Podrobnosti najdete na stránce <Link href="/adr">Informace o ADR</Link>.</p>

      <h2>9. Osobní údaje</h2>
      <p>Jak zpracováváme osobní údaje, popisuje stránka <Link href="/ochrana-osobnich-udaju">Ochrana osobních údajů</Link>.</p>

      <h2>10. Závěrečná ustanovení</h2>
      <ul>
        <li>Smlouvy se řídí právním řádem České republiky. Smlouvu uzavíráme v českém jazyce.</li>
        <li>Pro objednávku platí znění obchodních podmínek účinné v den jejího odeslání.</li>
      </ul>
    </>
  );
}
