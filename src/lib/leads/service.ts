import "server-only";
import type { LeadStatus, LeadType, Prisma, TimeSlot } from "@/generated/prisma/client";
import { effectiveBooking, pragueToday } from "@/lib/booking";
import { db } from "@/lib/db";
import { getPublishedService } from "@/lib/services/public";
import { formatKm, formatPrice } from "@/lib/format";
import { BODY_TYPE_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/labels";
import type { LeadInput } from "@/lib/validation/lead";
import { countPendingReviews } from "@/lib/reviews/service";
import { PUBLIC_VEHICLE_WHERE } from "@/lib/vehicles/public";

export class LeadVehicleNotFoundError extends Error {}

const vehicleSelect = { select: { brand: true, model: true, version: true, slug: true } } as const;
const serviceSelect = { select: { title: true } } as const;

export async function createLead(input: LeadInput) {
  let data: Prisma.LeadUncheckedCreateInput;
  if (input.kind === "vehicle") {
    const vehicle = await db.vehicle.findFirst({ where: { id: input.vehicleId, ...PUBLIC_VEHICLE_WHERE }, select: { id: true } });
    if (!vehicle) throw new LeadVehicleNotFoundError();
    data = { vehicleId: vehicle.id, name: input.name, phone: input.phone, email: input.email, type: input.type, message: input.message };
  } else if (input.kind === "wanted") {
    data = {
      vehicleId: null,
      name: input.name,
      phone: input.phone,
      email: input.email,
      type: "WANTED_CAR",
      car: input.car,
      message: wantedCarMessage(input),
    };
  } else {
    const service = input.serviceId ? await getPublishedService(input.serviceId) : null;
    data = {
      vehicleId: null,
      name: input.name,
      phone: input.phone,
      email: input.email,
      type: "SERVICE",
      message: input.message,
      car: input.car,
      serviceId: service && !service.contactPhone ? service.id : null,
      preferredDate: input.preferredDate,
      preferredSlot: input.preferredSlot,
    };
  }
  return db.lead.create({ data, include: { vehicle: vehicleSelect, service: serviceSelect } });
}

/** Požadavky na hledané auto jako čitelný text (zobrazí se v administraci i v e-mailu). */
function wantedCarMessage(input: Extract<LeadInput, { kind: "wanted" }>) {
  return [
    input.maxPrice !== null && `Maximální cena: ${formatPrice(input.maxPrice)}`,
    input.yearFrom !== null && `Rok výroby od: ${input.yearFrom}`,
    input.maxMileage !== null && `Maximální nájezd: ${formatKm(input.maxMileage)}`,
    input.fuel && `Palivo: ${FUEL_LABELS[input.fuel]}`,
    input.transmission && `Převodovka: ${TRANSMISSION_LABELS[input.transmission]}`,
    input.bodyType && `Karoserie: ${BODY_TYPE_LABELS[input.bodyType]}`,
    input.message && `\nPoznámka zákazníka:\n${input.message}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export type LeadListFilters = { status?: LeadStatus; type?: LeadType };

export async function getLeads(f: LeadListFilters = {}, take = 200) {
  return db.lead.findMany({
    where: { ...(f.status && { status: f.status }), ...(f.type && { type: f.type }) },
    orderBy: { createdAt: "desc" },
    take,
    include: { vehicle: vehicleSelect, service: serviceSelect },
  });
}

const utcDay = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

/** Servisní objednávka, jejíž platný termín (domluvený, jinak přání zákazníka) splňuje podmínku na datum. */
function bookingDateWhere(date: Prisma.DateTimeFilter): Prisma.LeadWhereInput {
  return { OR: [{ confirmedDate: date }, { confirmedDate: null, preferredDate: date }] };
}

/** Řazení podle platného termínu (den, dopoledne před odpolednem, pak podle vzniku). */
function byBooking(a: Parameters<typeof effectiveBooking>[0] & { createdAt: Date }, b: typeof a) {
  const ea = effectiveBooking(a);
  const eb = effectiveBooking(b);
  return (
    (ea.date?.getTime() ?? 0) - (eb.date?.getTime() ?? 0) ||
    (ea.slot ?? "").localeCompare(eb.slot ?? "") ||
    a.createdAt.getTime() - b.createdAt.getTime()
  );
}

/** Servisní objednávky s platným termínem od dneška, které ještě nejsou uzavřené (dashboard). */
export async function getUpcomingBookings(take = 15) {
  const rows = await db.lead.findMany({
    where: { type: "SERVICE", status: { notIn: ["SOLD", "LOST"] }, ...bookingDateWhere({ gte: utcDay(pragueToday()) }) },
    include: { service: serviceSelect },
  });
  return rows.sort(byBooking).slice(0, take);
}

/** Servisní objednávky s platným termínem v daný den ("RRRR-MM-DD"), seřazené podle části dne. */
export async function getBookingsOn(isoDate: string) {
  const rows = await db.lead.findMany({
    where: { type: "SERVICE", status: { notIn: ["SOLD", "LOST"] }, ...bookingDateWhere({ equals: utcDay(isoDate) }) },
    include: { service: serviceSelect },
  });
  return rows.sort(byBooking);
}

/**
 * Domluvený termín servisní objednávky. Prázdné datum termín zruší (platí zase přání zákazníka).
 * Uložení termínu posune novou nebo rozjednanou objednávku do stavu Potvrzeno, zrušení ji vrátí na Kontaktováno.
 * Vrací null, když objednávka neexistuje nebo není servisní.
 */
export async function updateLeadBooking(id: number, booking: { date: string | null; slot: TimeSlot | null }) {
  const lead = await db.lead.findUnique({ where: { id }, select: { type: true, status: true } });
  if (!lead || lead.type !== "SERVICE") return null;
  const open: LeadStatus[] = ["NEW", "CONTACTED", "NEGOTIATION"];
  const status = booking.date ? (open.includes(lead.status) ? "CONFIRMED" : lead.status) : lead.status === "CONFIRMED" ? "CONTACTED" : lead.status;
  return db.lead.update({
    where: { id },
    data: { confirmedDate: booking.date ? utcDay(booking.date) : null, confirmedSlot: booking.date ? booking.slot : null, status },
  });
}

export async function getLead(id: number) {
  return db.lead.findUnique({ where: { id }, include: { vehicle: vehicleSelect, service: serviceSelect } });
}

export async function updateLeadStatus(id: number, status: LeadStatus) {
  return db.lead.update({ where: { id }, data: { status } }).catch(() => null);
}

export async function getDashboardStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [activeVehicles, newLeads, reserved, serviceLeads, soldThisMonth, recentLeads, upcomingBookings, pendingReviews] = await Promise.all([
    db.vehicle.count({ where: { status: "DOSTUPNE", archivedAt: null } }),
    db.lead.count({ where: { status: "NEW" } }),
    db.vehicle.count({ where: { status: "REZERVOVANO", archivedAt: null } }),
    db.lead.count({ where: { type: "SERVICE", status: { in: ["NEW", "CONTACTED", "NEGOTIATION", "CONFIRMED"] } } }),
    db.vehicle.count({ where: { status: "PRODANO", soldAt: { gte: monthStart } } }),
    getLeads({}, 10),
    getUpcomingBookings(),
    countPendingReviews(),
  ]);
  return { activeVehicles, newLeads, reserved, serviceLeads, soldThisMonth, recentLeads, upcomingBookings, pendingReviews };
}
