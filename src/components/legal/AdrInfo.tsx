import Link from "next/link";
import { phonesLine } from "@/lib/contacts";
import type { SiteSettings } from "@/lib/validation/settings";

/** Informace o mimosoudním řešení spotřebitelských sporů (§ 14 zákona o ochraně spotřebitele). */
export function AdrInfo({ s }: { s: SiteSettings }) {
  return (
    <>
      <p>
        ADR (z anglického <em>Alternative Dispute Resolution</em>) je mimosoudní řešení sporů mezi spotřebitelem a podnikatelem. Jde o rychlejší a bezplatnou alternativu k soudu.
      </p>

      <h2>Nejdřív se obraťte na nás</h2>
      <p>
        Pokud nejste spokojeni s vozidlem, servisní službou nebo vyřízením reklamace, napište nám na <a href={`mailto:${s.email}`}>{s.email}</a>{s.responsibleEmail && <> nebo <a href={`mailto:${s.responsibleEmail}`}>{s.responsibleEmail}</a></>} či zavolejte ({phonesLine(s)}). Většinu situací dokážeme vyřešit přímou domluvou. Postup při reklamaci popisuje <Link href="/reklamacni-rad">reklamační řád</Link>.
      </p>

      <h2>Kdo spor řeší</h2>
      <p>
        Pokud se spor nepodaří vyřešit dohodou, máte jako spotřebitel právo na mimosoudní řešení sporu z kupní smlouvy nebo ze smlouvy o poskytnutí služby. Příslušným subjektem je:
      </p>
      <p>
        <strong>Česká obchodní inspekce</strong>
        <br />
        Ústřední inspektorát – oddělení ADR
        <br />
        Štěpánská 567/15, 120 00 Praha 2
        <br />
        E-mail: <a href="mailto:adr@coi.cz">adr@coi.cz</a>
        <br />
        Web: <a href="https://coi.gov.cz/informace-o-adr/" target="_blank" rel="noopener noreferrer">coi.gov.cz/informace-o-adr</a>
      </p>

      <h2>Jak řízení probíhá</h2>
      <ul>
        <li>Návrh můžete podat nejpozději do 1 roku ode dne, kdy jste u nás poprvé uplatnili právo, které je předmětem sporu (např. reklamaci).</li>
        <li>Návrh podáte nejjednodušeji online formulářem na webu České obchodní inspekce, případně písemně nebo e-mailem. Uveďte popis sporu, co požadujete a kdy jste se na nás obrátili.</li>
        <li>Řízení je pro spotřebitele bezplatné. Česká obchodní inspekce vystupuje jako nestranný prostředník a pomáhá stranám dosáhnout dohody.</li>
        <li>Mimosoudním řešením sporu není dotčeno vaše právo obrátit se na soud.</li>
      </ul>

      <h2>Dozor nad ochranou spotřebitele</h2>
      <p>
        Dozor nad dodržováním povinností při prodeji spotřebitelům vykonává Česká obchodní inspekce,{" "}
        <a href="https://coi.gov.cz" target="_blank" rel="noopener noreferrer">coi.gov.cz</a>.
      </p>
    </>
  );
}
