import { phoneDigits } from "@/lib/format";
import type { SiteSettings } from "@/lib/validation/settings";

export type OwnerContact = { name: string; firstName: string; phone: string | null; email: string | null; tel: string | null; role: string | null };

/**
 * Kontakty obou majitelů (FL Auto). Zobrazují se všude společně; vlastní kontakt
 * má jen služba Crystal Finish (viz Service.contactPhone).
 */
export function ownerContacts(s: SiteSettings): OwnerContact[] {
  const make = (name: string | null, phone: string | null, email: string | null, role: string | null): OwnerContact => {
    const full = name ?? "Kontakt";
    return { name: full, firstName: full.split(" ")[0], phone, email, tel: phone ? phoneDigits(phone) : null, role };
  };
  const list = [make(s.contactName, s.phone, s.email, null)];
  if (s.responsiblePerson && (s.responsiblePhone || s.responsibleEmail)) {
    list.push(make(s.responsiblePerson, s.responsiblePhone, s.responsibleEmail, "odpovědná osoba za provozovnu a správce osobních údajů"));
  }
  return list;
}

/** „Jarek +420 604 452 221 · Lukáš +420 776 623 397“ pro texty a e-maily. */
export function phonesLine(s: SiteSettings, separator = " · ") {
  return ownerContacts(s)
    .filter((c) => c.phone)
    .map((c) => `${c.firstName} ${c.phone}`)
    .join(separator);
}
