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

/** "po 12. 10. 2026, dopoledne" – nebo null, když lead termín nemá (starší servisní poptávky). */
export function formatBooking(lead: { preferredDate: Date | null; preferredSlot: TimeSlot | null }) {
  if (!lead.preferredDate) return null;
  const slot = lead.preferredSlot ? `, ${TIME_SLOT_LABELS[lead.preferredSlot].toLowerCase()}` : "";
  return `${formatBookingDate(lead.preferredDate)}${slot}`;
}
