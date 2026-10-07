import "server-only";
import type { LeadStatus } from "@/generated/prisma/client";
import { pragueToday } from "@/lib/booking";
import { db } from "@/lib/db";

/** Po kolika dnech od posledního kontaktu se poptávka bez obchodu smaže (musí odpovídat textu v Ochraně osobních údajů). */
export const LEAD_RETENTION_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Poptávky, které vedly k obchodu (Rezervace, Prodáno), se nemažou – jsou podkladem ke smlouvě
 * a účetnictví. Mažou se jen otevřené a ztracené.
 */
export const PURGEABLE_STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "NEGOTIATION", "LOST"];

/** Kdy se poptávka automaticky smaže (null = nemaže se). Slouží pro informaci v administraci. */
export function leadExpiresAt(lead: { status: LeadStatus; updatedAt: Date; preferredDate: Date | null }) {
  if (!PURGEABLE_STATUSES.includes(lead.status)) return null;
  const byAge = lead.updatedAt.getTime() + LEAD_RETENTION_DAYS * DAY_MS;
  // Servisní termín v budoucnosti poptávku „drží“ aspoň do dne po termínu.
  const byBooking = lead.preferredDate ? lead.preferredDate.getTime() + DAY_MS : 0;
  return new Date(Math.max(byAge, byBooking));
}

/** Smaže poptávky starší než LEAD_RETENTION_DAYS od posledního kontaktu (poslední změny). Vrací počet smazaných. */
export async function purgeExpiredLeads(now = new Date()) {
  const cutoff = new Date(now.getTime() - LEAD_RETENTION_DAYS * DAY_MS);
  const today = new Date(`${pragueToday(now)}T00:00:00.000Z`);
  const { count } = await db.lead.deleteMany({
    where: {
      status: { in: PURGEABLE_STATUSES },
      updatedAt: { lt: cutoff },
      // Neuplynulý servisní termín (objednáno dopředu) se nemaže.
      OR: [{ preferredDate: null }, { preferredDate: { lt: today } }],
    },
  });
  return count;
}
