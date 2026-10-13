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

/** Rozsah, ze kterého lze vybírat: od zítřka do BOOKING_DAYS_AHEAD dní. */
export function bookingRange(now = new Date()) {
  const today = pragueToday(now);
  return { min: addDays(today, 1), max: addDays(today, BOOKING_DAYS_AHEAD) };
}

/** Sobota a neděle se objednat nedají (sobota jen po domluvě). */
export function isWeekend(isoDate: string) {
  const day = new Date(`${isoDate}T00:00:00.000Z`).getUTCDay();
  return day === 0 || day === 6;
}

/** Datum servisního termínu (uložené jako UTC půlnoc) → "po 12. 10. 2026". */
export function formatBookingDate(d: Date | string) {
  return new Intl.DateTimeFormat("cs-CZ", { weekday: "short", day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" }).format(
    typeof d === "string" ? new Date(d) : d,
  );
}

type BookingFields = {
  preferredDate: Date | null;
  preferredSlot: TimeSlot | null;
  confirmedDate?: Date | null;
  confirmedSlot?: TimeSlot | null;
};

/** Platný termín objednávky: domluvený majitelem, jinak přání zákazníka. */
export function effectiveBooking(lead: BookingFields) {
  return lead.confirmedDate
    ? { date: lead.confirmedDate, slot: lead.confirmedSlot ?? null, confirmed: true }
    : { date: lead.preferredDate, slot: lead.preferredSlot, confirmed: false };
}

function describe(date: Date | null, slot: TimeSlot | null) {
  if (!date) return null;
  return `${formatBookingDate(date)}${slot ? `, ${TIME_SLOT_LABELS[slot].toLowerCase()}` : ""}`;
}

/** „po 12. 10. 2026, dopoledne“ – platný termín (potvrzený, jinak přání zákazníka); null, když objednávka termín nemá. */
export function formatBooking(lead: BookingFields) {
  const b = effectiveBooking(lead);
  return describe(b.date, b.slot);
}

/** Termín, který si přál zákazník při objednání. */
export function formatPreferredBooking(lead: BookingFields) {
  return describe(lead.preferredDate, lead.preferredSlot);
}

/** Termín domluvený majitelem, nebo null. */
export function formatConfirmedBooking(lead: BookingFields) {
  return describe(lead.confirmedDate ?? null, lead.confirmedSlot ?? null);
}
