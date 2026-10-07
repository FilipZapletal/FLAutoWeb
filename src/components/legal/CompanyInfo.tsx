import Link from "next/link";
import { Fill } from "@/components/layout/LegalPage";
import type { SiteSettings } from "@/lib/validation/settings";

/** Identifikační údaje provozovatele a orgány dozoru. */
export function CompanyInfo({ s }: { s: SiteSettings }) {
  const rows: [string, React.ReactNode][] = [
    ["Obchodní firma / jméno", <Fill key="n" value={s.companyName} label="obchodní firma / jméno podnikatele" />],
    ["IČO", <Fill key="i" value={s.ico} label="IČO" />],
    ["DIČ", s.dic || "neplátce DPH / nevyplněno"],
    ["Sídlo", <Fill key="s" value={s.registeredOffice} label="sídlo / místo podnikání" />],
    ["Zápis v rejstříku", <Fill key="r" value={s.registryEntry} label="zápis v obchodním nebo živnostenském rejstříku" />],
    ["Provozovna", `${s.address}${s.mapNote ? `, ${s.mapNote}` : ""}`],
    ["Telefon", <a key="p" href={`tel:${s.phone.replace(/[^\d+]/g, "")}`}>{s.phone}</a>],
    ["E-mail", <a key="e" href={`mailto:${s.email}`}>{s.email}</a>],
    ["Otevírací doba", s.openingHours],
    [
      "Odpovědná osoba za provozovnu a správce osobních údajů",
      s.responsiblePerson ? (
        <span key="r">
          {s.responsiblePerson}
          {s.responsiblePhone && <>, <a href={`tel:${s.responsiblePhone.replace(/[^\d+]/g, "")}`}>{s.responsiblePhone}</a></>}
          {s.responsibleEmail && <>, <a href={`mailto:${s.responsibleEmail}`}>{s.responsibleEmail}</a></>}
        </span>
      ) : (
        <Fill key="r" value={null} label="odpovědná osoba (jméno, telefon, e-mail)" />
      ),
    ],
  ];

  return (
    <>
      <h2>Provozovatel webu a prodejce vozidel</h2>
      <table>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th className="w-1/3">{label}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Orgány dozoru</h2>
      <ul>
        <li>
          Dozor nad ochranou spotřebitele vykonává Česká obchodní inspekce,{" "}
          <a href="https://coi.gov.cz" target="_blank" rel="noopener noreferrer">coi.gov.cz</a>.
        </li>
        <li>
          Dozor nad dodržováním živnostenského zákona vykonává příslušný živnostenský úřad: <Fill value={s.tradeOffice} label="příslušný živnostenský úřad" />.
        </li>
        <li>
          Dozor nad ochranou osobních údajů vykonává Úřad pro ochranu osobních údajů,{" "}
          <a href="https://uoou.gov.cz" target="_blank" rel="noopener noreferrer">uoou.gov.cz</a>.
        </li>
      </ul>

      <h2>Další informace</h2>
      <ul>
        <li><Link href="/reklamacni-rad">Reklamační řád</Link></li>
        <li><Link href="/adr">Mimosoudní řešení spotřebitelských sporů (ADR)</Link></li>
        <li><Link href="/ochrana-osobnich-udaju">Ochrana osobních údajů</Link></li>
        <li><Link href="/cookies">Cookies</Link></li>
      </ul>
      <p>
        Údaje o vozidlech na tomto webu (výbava, parametry, fotografie) mají informativní charakter. Rozhodující je stav vozidla při prohlídce a údaje uvedené v kupní smlouvě a předávacím protokolu. Nabídka na webu není návrhem na uzavření smlouvy; kupní smlouva vzniká až jejím podpisem.
      </p>
    </>
  );
}
