import { Fill } from "@/components/layout/LegalPage";
import { ownerContacts } from "@/lib/contacts";
import type { SiteSettings } from "@/lib/validation/settings";

/** Identifikace provozovatele – sdílená pro všechny právní stránky. */
export function CompanyBlock({ s }: { s: SiteSettings }) {
  return (
    <ul>
      <li><strong><Fill value={s.companyName} label="obchodní firma / jméno podnikatele" /></strong></li>
      <li>
        IČO: <Fill value={s.ico} label="IČO" />
        {s.dic && <>, DIČ: {s.dic}</>}
      </li>
      <li>Sídlo: <Fill value={s.registeredOffice} label="sídlo / místo podnikání" /></li>
      <li><Fill value={s.registryEntry} label="zápis v obchodním nebo živnostenském rejstříku" /></li>
      <li>Provozovna: {s.address}{s.mapNote ? `, ${s.mapNote}` : ""}</li>
      {ownerContacts(s).map((c) => (
        <li key={c.name}>
          {c.name}
          {c.role ? ` (${c.role})` : ""}
          {c.phone && <>, tel. <a href={`tel:${c.tel}`}>{c.phone}</a></>}
          {c.email && <>, e-mail <a href={`mailto:${c.email}`}>{c.email}</a></>}
        </li>
      ))}
    </ul>
  );
}
