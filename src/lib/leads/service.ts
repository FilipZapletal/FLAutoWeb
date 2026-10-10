import "server-only";
import type { LeadStatus, LeadType, Prisma } from "@/generated/prisma/client";
import { pragueToday } from "@/lib/booking";
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

/** Servisní objednávky s termínem od dneška, které ještě nejsou uzavřené (dashboard). */
export async function getUpcomingBookings(take = 10) {
  return db.lead.findMany({
    where: {
      type: "SERVICE",
      preferredDate: { gte: new Date(`${pragueToday()}T00:00:00.000Z`) },
      status: { notIn: ["SOLD", "LOST"] },
    },
    orderBy: [{ preferredDate: "asc" }, { preferredSlot: "asc" }, { createdAt: "asc" }],
    take,
    include: { service: serviceSelect },
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
    db.lead.count({ where: { type: "SERVICE", status: { in: ["NEW", "CONTACTED", "NEGOTIATION"] } } }),
    db.vehicle.count({ where: { status: "PRODANO", soldAt: { gte: monthStart } } }),
    getLeads({}, 10),
    getUpcomingBookings(),
    countPendingReviews(),
  ]);
  return { activeVehicles, newLeads, reserved, serviceLeads, soldThisMonth, recentLeads, upcomingBookings, pendingReviews };
}
