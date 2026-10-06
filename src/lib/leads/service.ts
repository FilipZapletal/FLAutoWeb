import "server-only";
import type { LeadStatus, LeadType, Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { getPublishedService } from "@/lib/services/public";
import type { LeadInput } from "@/lib/validation/lead";
import { PUBLIC_VEHICLE_WHERE } from "@/lib/vehicles/public";

export class LeadVehicleNotFoundError extends Error {}

const vehicleSelect = { select: { brand: true, model: true, version: true, slug: true } } as const;

export async function createLead(input: LeadInput) {
  let data: Prisma.LeadUncheckedCreateInput;
  if (input.kind === "vehicle") {
    const vehicle = await db.vehicle.findFirst({ where: { id: input.vehicleId, ...PUBLIC_VEHICLE_WHERE }, select: { id: true } });
    if (!vehicle) throw new LeadVehicleNotFoundError();
    data = { vehicleId: vehicle.id, name: input.name, phone: input.phone, email: input.email, type: input.type, message: input.message };
  } else {
    const service = input.serviceId ? await getPublishedService(input.serviceId) : null;
    data = {
      vehicleId: null,
      name: input.name,
      phone: input.phone,
      email: input.email,
      type: "SERVICE",
      message: [service && `Služba: ${service.title}`, `Vůz: ${input.car}`, input.message].filter(Boolean).join("\n\n"),
    };
  }
  return db.lead.create({ data, include: { vehicle: vehicleSelect } });
}

export type LeadListFilters = { status?: LeadStatus; type?: LeadType };

export async function getLeads(f: LeadListFilters = {}, take = 200) {
  return db.lead.findMany({
    where: { ...(f.status && { status: f.status }), ...(f.type && { type: f.type }) },
    orderBy: { createdAt: "desc" },
    take,
    include: { vehicle: vehicleSelect },
  });
}

export async function getLead(id: number) {
  return db.lead.findUnique({ where: { id }, include: { vehicle: vehicleSelect } });
}

export async function updateLeadStatus(id: number, status: LeadStatus) {
  return db.lead.update({ where: { id }, data: { status } }).catch(() => null);
}

export async function getDashboardStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [activeVehicles, newLeads, reserved, serviceLeads, soldThisMonth, recentLeads] = await Promise.all([
    db.vehicle.count({ where: { status: "DOSTUPNE", archivedAt: null } }),
    db.lead.count({ where: { status: "NEW" } }),
    db.vehicle.count({ where: { status: "REZERVOVANO", archivedAt: null } }),
    db.lead.count({ where: { type: "SERVICE", status: { in: ["NEW", "CONTACTED", "NEGOTIATION"] } } }),
    db.vehicle.count({ where: { status: "PRODANO", soldAt: { gte: monthStart } } }),
    getLeads({}, 10),
  ]);
  return { activeVehicles, newLeads, reserved, serviceLeads, soldThisMonth, recentLeads };
}
