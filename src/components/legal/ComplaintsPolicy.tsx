import Link from "next/link";
import { phonesLine } from "@/lib/contacts";
import type { SiteSettings } from "@/lib/validation/settings";
import { CompanyBlock } from "./CompanyBlock";

/**
 * Reklamační řád pro ojetá vozidla a servisní služby podle občanského zákoníku
 * (zákon č. 89/2012 Sb., ve znění od 6. 1. 2023) a zákona o ochraně spotřebitele.
 * Návrh – před spuštěním doporučujeme kontrolu právníkem.
 */
export function ComplaintsPolicy({ s }: { s: SiteSettings }) {
  return (
    <>
      <h2>1. Úvodní ustanovení</h2>
      <p>Tento reklamační řád popisuje, jak uplatnit práva z vadného plnění (reklamaci) u vozidel zakoupených od nás a u servisních služeb, které provádíme. Prodávajícím a poskytovatelem služeb je:</p>
      <CompanyBlock s={s} />
      <p>
        Práva spotřebitele se řídí zejména zákonem č. 89/2012 Sb., občanský zákoník (§ 2158 a násl.), a zákonem č. 634/1992 Sb., o ochraně spotřebitele. Pro kupující, kteří jednají jako podnikatelé, platí obecná ustanovení občanského zákoníku a ujednání v kupní smlouvě. Zákonná práva spotřebitele nelze tímto reklamačním řádem omezit.
      </p>

      <h2>2. Za co odpovídáme</h2>
      <p>Odpovídáme za to, že vozidlo má při převzetí vlastnosti a stav, které jsou uvedeny v kupní smlouvě a předávacím protokolu, odpovídá popisu v nabídce a je způsobilé k obvyklému užívání s ohledem na své stáří a nájezd.</p>
      <p>Každé vozidlo před prodejem kontrolujeme. Známé vady a stav vozu (včetně poškození a opotřebení) vám ukážeme a zapíšeme do kupní smlouvy nebo předávacího protokolu.</p>

      <h2>3. Co není vadou u ojetého vozidla</h2>
      <p>Vozidla prodáváme jako použitá. Práva z vadného plnění proto nevznikají zejména:</p>
      <ul>
        <li>u opotřebení, které odpovídá stáří vozidla, počtu najetých kilometrů a míře jeho používání v době převzetí,</li>
        <li>u vad, na které jsme vás před koupí upozornili, které jsou uvedeny v kupní smlouvě nebo předávacím protokolu, nebo s ohledem na které byla snížena cena,</li>
        <li>u vad, které vznikly po převzetí – například nehodou, nesprávnou údržbou, používáním v rozporu s návodem, neodbornými zásahy nebo úpravami,</li>
        <li>u běžného opotřebení dílů, které se při provozu pravidelně opotřebovávají a vyměňují (např. pneumatiky, brzdové destičky a kotouče, stírátka, žárovky, spojka, baterie), pokud jejich stav při převzetí odpovídal stáří a nájezdu vozu.</li>
      </ul>

      <h2>4. Lhůty pro uplatnění reklamace</h2>
      <ul>
        <li>
          Práva z vadného plnění u ojetého vozidla můžete uplatnit do <strong>12 měsíců</strong> od převzetí vozidla. Zákonná doba odpovědnosti prodávajícího je u spotřebitelské koupě 24 měsíců; u použité věci ji lze dohodou zkrátit, nejméně však na 12 měsíců. U vozidel z naší nabídky je doba odpovědnosti za vady sjednána na 12 měsíců. Je uvedena v kupní smlouvě a před jejím uzavřením vás na ni výslovně upozorníme.
        </li>
        <li>Projeví-li se vada během těchto 12 měsíců od převzetí, má se za to, že ji vozidlo mělo již při převzetí, pokud neprokážeme opak nebo pokud to nevylučuje povaha vady.</li>
        <li>Vadu nám prosím oznamte co nejdříve po jejím zjištění. Dalším používáním vozidla s vadou může vzniknout větší škoda.</li>
      </ul>

      <h2>5. Jak reklamaci uplatnit</h2>
      <ol>
        <li>Kontaktujte nás telefonicky ({phonesLine(s)}), e-mailem na <a href={`mailto:${s.email}`}>{s.email}</a>{s.responsibleEmail && <> nebo <a href={`mailto:${s.responsibleEmail}`}>{s.responsibleEmail}</a></>} anebo osobně na provozovně {s.address} (návštěvu je nutné předem domluvit telefonicky).</li>
        <li>Popište vadu, jak se projevuje a kdy jste ji zjistili. Uveďte, jaký způsob vyřízení požadujete.</li>
        <li>Přiložte kupní smlouvu nebo jiný doklad o koupi.</li>
        <li>Na domluveném místě nám zpřístupněte vozidlo, abychom mohli vadu posoudit. Pokud vozidlo není pojízdné, domluvíme se na jeho převozu.</li>
      </ol>
      <p>
        Při uplatnění reklamace vám vydáme písemné potvrzení, kdy jste reklamaci uplatnili, co je jejím obsahem a jaký způsob vyřízení požadujete. Po vyřízení vám vydáme potvrzení o datu a způsobu vyřízení, včetně potvrzení o provedení opravy a době jejího trvání, případně písemné zdůvodnění zamítnutí reklamace.
      </p>

      <h2>6. Vaše práva při vadě</h2>
      <ul>
        <li>Můžete požadovat odstranění vady <strong>opravou</strong>, nebo <strong>výměnou</strong>. U ojetého vozidla obvykle není výměna za jiný stejný vůz možná, proto vadu zpravidla řešíme opravou.</li>
        <li>
          Přiměřenou <strong>slevu</strong> nebo <strong>odstoupení od smlouvy</strong> můžete požadovat, pokud jsme vadu odmítli odstranit nebo ji neodstranili v přiměřené době, pokud se vada projeví opakovaně, pokud je vada podstatným porušením smlouvy, nebo je-li zřejmé, že vadu neodstraníme v přiměřené době nebo bez značných obtíží pro vás.
        </li>
        <li>Od smlouvy nelze odstoupit, je-li vada jen nevýznamná.</li>
      </ul>

      <h2>7. Lhůta pro vyřízení a náklady</h2>
      <p>
        Reklamaci vyřídíme bez zbytečného odkladu, nejpozději do 30 dnů ode dne jejího uplatnění, pokud se spolu nedohodneme na delší lhůtě. Pokud reklamaci v této lhůtě nevyřídíme, můžete od smlouvy odstoupit nebo požadovat přiměřenou slevu.
      </p>
      <p>Náklady na opravu oprávněné reklamace a účelně vynaložené náklady spojené s jejím uplatněním hradíme my.</p>

      <h2>8. Reklamace servisních služeb</h2>
      <p>
        Vady servisních prací, pneuservisu, mytí, čištění interiéru nebo přípravy na STK reklamujte bez zbytečného odkladu po jejich zjištění, stejným způsobem jako v bodě 5. Oprávněnou reklamaci vyřešíme bezplatným přepracováním nebo jiným dohodnutým způsobem, nejpozději do 30 dnů.
      </p>

      <h2>9. Mimosoudní řešení sporů</h2>
      <p>
        Pokud s vyřízením reklamace nebudete spokojeni, můžete se obrátit na Českou obchodní inspekci. Podrobnosti najdete na stránce <Link href="/adr">Mimosoudní řešení spotřebitelských sporů (ADR)</Link>.
      </p>
    </>
  );
}
