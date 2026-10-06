import { Fill } from "@/components/layout/LegalPage";
import type { SiteSettings } from "@/lib/validation/settings";

/** Identifikace provozovatele – sdílená pro všechny právní stránky. */
export function CompanyBlock({ s }: { s: SiteSettings }) {
  return (
    <ul>
      <li><strong><Fill value={s.companyName} label="obchodní firma / jméno podnikatele" /></strong></li>
      <li>IČO: <Fill value={s.ico} label="IČO" /></li>
      <li>Sídlo: <Fill value={s.registeredOffice} label="sídlo / místo podnikání" /></li>
      <li><Fill value={s.registryEntry} label="zápis v obchodním nebo živnostenském rejstříku" /></li>
      <li>Provozovna: {s.address}{s.mapNote ? `, ${s.mapNote}` : ""}</li>
      <li>E-mail: <a href={`mailto:${s.email}`}>{s.email}</a>, telefon: {s.phone}</li>
    </ul>
  );
}
