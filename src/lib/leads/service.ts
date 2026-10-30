import "server-only";
import type { LeadStatus, LeadType, Prisma, VehicleStatus } from "@/generated/prisma/client";
import { bookingSortKey, effectiveBooking, pragueToday } from "@/lib/booking";
import { db } from "@/lib/db";
import { CARS_CATEGORY, SERVICE_KEY_PREFIX, WANTED_CATEGORY, serviceCategory, type LeadCategory } from "@/lib/lead-categories";
import { getPublicServices, getPublishedService } from "@/lib/services/public";
import { formatKm, formatPrice } from "@/lib/format";
import { BODY_TYPE_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/labels";
import type { LeadInput } from "@/lib/validation/lead";
import { countPendingReviews } from "@/lib/reviews/service";
import { PUBLIC_VEHICLE_WHERE } from "@/lib/vehicles/public";
import { parseServicePrices } from "@/lib/validation/service";

export class LeadVehicleNotFoundError extends Error {}
/** Vybrané položky ceníku neexistují (ceník se mezitím změnil). */
export class LeadItemsError extends Error {}

const vehicleSelect = { select: { brand: true, model: true, version: true, slug: true, status: true } } as const;
const serviceSelect = { select: { id: true, slug: true, title: true, contactEmail: true, contactPhone: true, contactName: true } } as const;

export async function createLead(input: LeadInput) {
  let data: Prisma.LeadUncheckedCreateInput;
  if (input.kind === "vehicle") {
    const vehicle = await db.vehicle.findFirst({ where: { id: input.vehicleId, ...PUBLIC_VEHICLE_WHERE }, select: { id: true } });
    if (!vehicle) throw new LeadVehicleNotFoundError();
    data = {
      vehicleId: vehicle.id,
      name: input.name,
      phone: input.phone,
      email: input.email,
      type: input.type,
      message: input.message,
      preferredDate: input.preferredDate,
      preferredTime: input.preferredDate ? input.preferredTime : null,
    };
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
  } else if (input.kind === "order") {
    const service = await getPublishedService(input.serviceId);
    if (!service || !service.pickItems) throw new LeadItemsError();
    // Položky a ceny se berou z ceníku služby, ne z toho, co poslal prohlížeč.
    const catalog = parseServicePrices(service.prices);
    const items = [...new Set(input.items)].flatMap((label) => {
      const hit = catalog.find((p) => p.label === label);
      return hit ? [{ label: hit.label, price: hit.price, from: hit.from }] : [];
    });
    if (items.length === 0) throw new LeadItemsError();
    data = {
      vehicleId: null,
      name: input.name,
      phone: input.phone,
      email: input.email,
      type: "SERVICE",
      message: input.message,
      car: input.car,
      serviceId: service.id,
      items,
      preferredDate: input.preferredDate,
      preferredTime: input.preferredDate ? input.preferredTime : null,
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
      preferredTime: input.preferredTime,
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

export type LeadListFilters = { status?: LeadStatus; type?: LeadType; section?: string };

export async function getLeads(f: LeadListFilters = {}, take = 200) {
  return db.lead.findMany({
    where: { ...(f.section && (await sectionWhere(f.section))), ...(f.status && { status: f.status }), ...(f.type && { type: f.type }) },
    orderBy: { createdAt: "desc" },
    take,
    include: { vehicle: vehicleSelect, service: serviceSelect },
  });
}

const utcDay = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

/** Objednávka, jejíž platný termín (domluvený, jinak přání zákazníka) splňuje podmínku na datum. */
function bookingDateWhere(date: Prisma.DateTimeFilter): Prisma.LeadWhereInput {
  return { OR: [{ confirmedDate: date }, { confirmedDate: null, preferredDate: date }] };
}

/** Řazení podle platného termínu (den, čas, pak podle vzniku). */
function byBooking(a: Parameters<typeof effectiveBooking>[0] & { createdAt: Date }, b: typeof a) {
  const ea = effectiveBooking(a);
  const eb = effectiveBooking(b);
  return (
    (ea.date?.getTime() ?? 0) - (eb.date?.getTime() ?? 0) ||
    bookingSortKey(ea).localeCompare(bookingSortKey(eb)) ||
    a.createdAt.getTime() - b.createdAt.getTime()
  );
}

/** Objednávky s platným termínem v daný den ("RRRR-MM-DD"), seřazené podle času (připomenutí). */
export async function getBookingsOn(isoDate: string) {
  const rows = await db.lead.findMany({
    where: { status: { notIn: ["SOLD", "LOST"] }, type: { not: "WANTED_CAR" }, ...bookingDateWhere({ equals: utcDay(isoDate) }) },
    include: { service: serviceSelect, vehicle: vehicleSelect },
  });
  return rows.sort(byBooking);
}

/** Objednávky s platným termínem v rozmezí dnů (včetně) pro kalendář. Neuzavřené, od dneška dál. */
export async function getBookingsBetween(fromIso: string, toIso: string) {
  const from = fromIso > pragueToday() ? fromIso : pragueToday();
  if (from > toIso) return [];
  const rows = await db.lead.findMany({
    where: {
      status: { notIn: ["SOLD", "LOST"] },
      type: { not: "WANTED_CAR" },
      ...bookingDateWhere({ gte: utcDay(from), lte: utcDay(toIso) }),
    },
    include: { service: serviceSelect, vehicle: vehicleSelect },
  });
  return rows.sort(byBooking);
}

/**
 * Domluvený termín objednávky (servis, prohlídka vozu…). Prázdné datum termín zruší (platí zase přání zákazníka).
 * Uložení termínu posune novou nebo rozjednanou objednávku do stavu Potvrzeno, zrušení ji vrátí na Kontaktováno.
 * Vrací null, když objednávka neexistuje nebo jde o hledané auto (to termín nemá).
 */
export type BookingChange = "confirmed" | "changed" | "cancelled" | null;

/**
 * Uloží (nebo zruší) domluvený termín. Vrací i předchozí potvrzený termín a druh změny,
 * aby šlo zákazníkovi poslat e-mail o potvrzení, změně nebo zrušení termínu.
 */
export async function updateLeadBooking(id: number, booking: { date: string | null; time: string | null }) {
  const lead = await db.lead.findUnique({ where: { id }, select: { type: true, status: true, confirmedDate: true, confirmedSlot: true, confirmedTime: true } });
  if (!lead || lead.type === "WANTED_CAR") return null;
  const open: LeadStatus[] = ["NEW", "CONTACTED", "NEGOTIATION"];
  const status = booking.date ? (open.includes(lead.status) ? "CONFIRMED" : lead.status) : lead.status === "CONFIRMED" ? "CONTACTED" : lead.status;
  const confirmedDate = booking.date ? utcDay(booking.date) : null;
  const confirmedTime = booking.date ? booking.time : null;
  const updated = await db.lead.update({
    where: { id },
    // Starší „část dne“ nahrazuje přesný čas.
    data: { confirmedDate, confirmedTime, confirmedSlot: null, status },
    include: { vehicle: vehicleSelect, service: serviceSelect },
  });
  const same = lead.confirmedDate?.getTime() === confirmedDate?.getTime() && lead.confirmedTime === confirmedTime && !lead.confirmedSlot;
  const change: BookingChange = same ? null : !confirmedDate ? "cancelled" : lead.confirmedDate ? "changed" : "confirmed";
  return { ...updated, bookingChange: change, previousBooking: { confirmedDate: lead.confirmedDate, confirmedSlot: lead.confirmedSlot, confirmedTime: lead.confirmedTime } };
}

export async function getLead(id: number) {
  return db.lead.findUnique({ where: { id }, include: { vehicle: vehicleSelect, service: serviceSelect } });
}

/** Trvalé smazání poptávky (ruční, vedle automatického mazání po 30 dnech). Vrací false, když neexistuje. */
export async function deleteLead(id: number) {
  return db.lead.delete({ where: { id } }).then(
    () => true,
    () => false,
  );
}

const DRIVING: LeadStatus[] = ["RESERVED", "SOLD"];

/**
 * Stav vozu následuje poptávku: Rezervace → vůz Rezervováno, Prodáno → vůz Prodáno (s datem prodeje).
 * Opustí-li poptávka stav Rezervace/Prodáno (padla), vůz se vrátí do nabídky, pokud ho nedrží jiná poptávka.
 * Skrytý vůz se nemění. Ruční změna stavu vozu ve správě vozidel zůstává možná.
 * Vrací nový stav vozu, nebo null, když se nic nezměnilo.
 */
async function syncVehicleWithLead(leadId: number, vehicleId: number, previous: LeadStatus, status: LeadStatus): Promise<VehicleStatus | null> {
  if (!DRIVING.includes(previous) && !DRIVING.includes(status)) return null;
  const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId }, select: { status: true, soldAt: true } });
  if (!vehicle || vehicle.status === "SKRYTE") return null;
  const others = await db.lead.findMany({ where: { vehicleId, id: { not: leadId }, status: { in: DRIVING } }, select: { status: true } });
  const otherSold = others.some((o) => o.status === "SOLD");
  const otherReserved = others.some((o) => o.status === "RESERVED");
  let target: VehicleStatus | null;
  if (status === "SOLD") target = "PRODANO";
  else if (status === "RESERVED") target = otherSold ? null : "REZERVOVANO";
  else target = otherSold ? "PRODANO" : otherReserved ? "REZERVOVANO" : "DOSTUPNE";
  if (!target || target === vehicle.status) return null;
  await db.vehicle.update({
    where: { id: vehicleId },
    data: { status: target, soldAt: target === "PRODANO" ? (vehicle.status === "PRODANO" ? vehicle.soldAt : new Date()) : null },
  });
  return target;
}

/** Změní stav poptávky a propíše ho do vozu. Vrací poptávku a případně nový stav vozu. */
export async function updateLeadStatus(id: number, status: LeadStatus) {
  const lead = await db.lead.findUnique({ where: { id }, select: { status: true, vehicleId: true } });
  if (!lead) return null;
  const updated = await db.lead.update({ where: { id }, data: { status } });
  const vehicleStatus = lead.vehicleId && lead.status !== status ? await syncVehicleWithLead(id, lead.vehicleId, lead.status, status) : null;
  return { ...updated, vehicleStatus };
}

// --- Nástěnka: rozdělení podle „služeb“ ---

const OPEN: LeadStatus[] = ["NEW", "CONTACTED", "NEGOTIATION"];

export type DashboardSection = LeadCategory & { newCount: number };

/** Podmínka na poptávky jedné „služby“ (klíč ze záložky); neznámý klíč nebo „vse“ = všechny. */
async function sectionWhere(key: string): Promise<Prisma.LeadWhereInput> {
  if (key === CARS_CATEGORY.key) return { type: { notIn: ["SERVICE", "WANTED_CAR"] } };
  if (key === WANTED_CATEGORY.key) return { type: "WANTED_CAR" };
  if (key.startsWith(SERVICE_KEY_PREFIX)) return { type: "SERVICE", service: { slug: key.slice(SERVICE_KEY_PREFIX.length) } };
  return {};
}

export async function getDashboard(sectionKey: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const services = await getPublicServices();
  const categories: LeadCategory[] = [CARS_CATEGORY, ...services.map(serviceCategory), WANTED_CATEGORY];
  const active = categories.find((c) => c.key === sectionKey) ?? null;
  const where = active ? await sectionWhere(active.key) : {};
  const today = utcDay(pragueToday());

  const [activeVehicles, newLeads, reserved, serviceLeads, soldThisMonth, pendingReviews, newByType, newByService, todo, schedule] = await Promise.all([
    db.vehicle.count({ where: { status: "DOSTUPNE", archivedAt: null } }),
    db.lead.count({ where: { status: "NEW" } }),
    db.vehicle.count({ where: { status: "REZERVOVANO", archivedAt: null } }),
    db.lead.count({ where: { type: "SERVICE", status: { in: [...OPEN, "CONFIRMED"] } } }),
    db.vehicle.count({ where: { status: "PRODANO", soldAt: { gte: monthStart } } }),
    countPendingReviews(),
    db.lead.groupBy({ by: ["type"], where: { status: "NEW" }, _count: true }),
    db.lead.groupBy({ by: ["serviceId"], where: { status: "NEW", type: "SERVICE" }, _count: true }),
    // K vyřízení: otevřené poptávky bez domluveného termínu, nejnovější nahoře.
    db.lead.findMany({
      where: { ...where, status: { in: OPEN }, confirmedDate: null },
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { service: serviceSelect, vehicle: vehicleSelect },
    }),
    // Potvrzené termíny od dneška.
    db.lead.findMany({
      where: { ...where, status: { notIn: ["SOLD", "LOST"] }, confirmedDate: { gte: today } },
      include: { service: serviceSelect, vehicle: vehicleSelect },
    }),
  ]);

  const newOf = (key: string) => {
    if (key === CARS_CATEGORY.key) return newByType.filter((t) => t.type !== "SERVICE" && t.type !== "WANTED_CAR").reduce((n, t) => n + t._count, 0);
    if (key === WANTED_CATEGORY.key) return newByType.find((t) => t.type === "WANTED_CAR")?._count ?? 0;
    const svc = services.find((x) => serviceCategory(x).key === key);
    return svc ? (newByService.find((t) => t.serviceId === svc.id)?._count ?? 0) : 0;
  };
  const sections: DashboardSection[] = categories.map((c) => ({ ...c, newCount: newOf(c.key) }));

  return {
    stats: { activeVehicles, newLeads, reserved, serviceLeads, soldThisMonth, pendingReviews },
    sections,
    active,
    todo,
    schedule: schedule.sort(byBooking).slice(0, 20),
  };
}
