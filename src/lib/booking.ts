// Pravidla pro preferovaný termín servisu. Sdílí je formulář (min/max v kalendáři) i serverová validace.
import type { TimeSlot } from "@/generated/prisma/enums";
import { TIME_SLOT_LABELS } from "@/lib/labels";

/** Kolik dní dopředu se dá termín vybrat. */
export const BOOKING_DAYS_AHEAD = 60;

const TIME_ZONE = "Europe/Prague";

/** Dnešní datum v Praze jako "RRRR-MM-DD". */
export function pragueToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

/** Posun data "RRRR-MM-DD" o daný počet dní. */
export function addDays(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Rozsah, ze kterého lze vybírat: od dneška do BOOKING_DAYS_AHEAD dní, včetně víkendů (termín potvrzuje majitel). */
export function bookingRange(now = new Date()) {
  const today = pragueToday(now);
  return { min: today, max: addDays(today, BOOKING_DAYS_AHEAD) };
}

/** Přesný čas termínu "HH:MM" (00:00–23:59). */
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Datum servisního termínu (uložené jako UTC půlnoc) → "po 12. 10. 2026". */
export function formatBookingDate(d: Date | string) {
  return new Intl.DateTimeFormat("cs-CZ", { weekday: "short", day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" }).format(
    typeof d === "string" ? new Date(d) : d,
  );
}

type BookingFields = {
  preferredDate: Date | null;
  preferredSlot: TimeSlot | null;
  preferredTime?: string | null;
  confirmedDate?: Date | null;
  confirmedSlot?: TimeSlot | null;
  confirmedTime?: string | null;
};

/** Platný termín objednávky: domluvený majitelem, jinak přání zákazníka. */
export function effectiveBooking(lead: BookingFields) {
  return lead.confirmedDate
    ? { date: lead.confirmedDate, slot: lead.confirmedSlot ?? null, time: lead.confirmedTime ?? null, confirmed: true }
    : { date: lead.preferredDate, slot: lead.preferredSlot, time: lead.preferredTime ?? null, confirmed: false };
}

/** Čas termínu pro výpis: přesný čas, u starších objednávek část dne („dopoledne“), jinak null. */
export function bookingTimeLabel(b: { slot: TimeSlot | null; time: string | null }) {
  return b.time ?? (b.slot ? TIME_SLOT_LABELS[b.slot].toLowerCase() : null);
}

/** Klíč pro řazení v rámci dne: přesný čas, starší „dopoledne“ jako 08:00, „odpoledne“ jako 13:00. */
export function bookingSortKey(b: { slot: TimeSlot | null; time: string | null }) {
  return b.time ?? (b.slot === "DOPOLEDNE" ? "08:00" : b.slot === "ODPOLEDNE" ? "13:00" : "");
}

function describe(date: Date | null, slot: TimeSlot | null, time: string | null) {
  if (!date) return null;
  const t = bookingTimeLabel({ slot, time });
  return `${formatBookingDate(date)}${t ? `, ${time ? "v " : ""}${t}` : ""}`;
}

/** „po 12. 10. 2026, dopoledne“ – platný termín (potvrzený, jinak přání zákazníka); null, když objednávka termín nemá. */
export function formatBooking(lead: BookingFields) {
  const b = effectiveBooking(lead);
  return describe(b.date, b.slot, b.time);
}

/** Termín, který si přál zákazník při objednání. */
export function formatPreferredBooking(lead: BookingFields) {
  return describe(lead.preferredDate, lead.preferredSlot, lead.preferredTime ?? null);
}

/** Termín domluvený majitelem, nebo null. */
export function formatConfirmedBooking(lead: BookingFields) {
  return describe(lead.confirmedDate ?? null, lead.confirmedSlot ?? null, lead.confirmedTime ?? null);
}
