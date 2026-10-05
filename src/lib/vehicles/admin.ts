import "server-only";
import type { Prisma, VehicleStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { removeVehicleImageFiles } from "@/lib/images/process";
import { slugify } from "@/lib/slug";
import type { VehicleInput, VehicleQuickUpdate } from "@/lib/validation/vehicle";

export class SlugTakenError extends Error {}

/** Unikátní slug: značka-model-rok, při kolizi s verzí, pak s číslem. */
async function uniqueSlug(input: Pick<VehicleInput, "brand" | "model" | "version" | "year">, excludeId?: number) {
  const candidates = [
    slugify(input.brand, input.model, input.year),
    slugify(input.brand, input.model, input.version, input.year),
  ];
  for (const c of candidates) if (!(await slugExists(c, excludeId))) return c;
  for (let i = 2; ; i++) {
    const c = `${candidates[1]}-${i}`;
    if (!(await slugExists(c, excludeId))) return c;
  }
}

async function slugExists(slug: string, excludeId?: number) {
  const hit = await db.vehicle.findFirst({
    where: { OR: [{ slug }, { previousSlugs: { has: slug } }], ...(excludeId && { id: { not: excludeId } }) },
    select: { id: true },
  });
  return Boolean(hit);
}

function soldAtFor(status: VehicleStatus, previous?: { status: VehicleStatus; soldAt: Date | null }) {
  if (status !== "PRODANO") return null;
  return previous?.status === "PRODANO" ? previous.soldAt : new Date();
}

/** Ponechá jen id výbavy, která v katalogu skutečně existují. */
async function existingEquipmentIds(ids: number[]) {
  if (!ids.length) return [];
  const rows = await db.equipment.findMany({ where: { id: { in: ids } }, select: { id: true } });
  return rows.map((r) => r.id);
}

function toData(input: VehicleInput) {
  const { equipmentIds: _e, slug: _s, ...rest } = input;
  return { ...rest, currentPrice: input.salePrice ?? input.price };
}

export async function createVehicle(input: VehicleInput) {
  let slug = input.slug;
  if (slug && (await slugExists(slug))) throw new SlugTakenError();
  slug ??= await uniqueSlug(input);
  const equipmentIds = await existingEquipmentIds(input.equipmentIds);
  return db.vehicle.create({
    data: {
      ...toData(input),
      slug,
      soldAt: soldAtFor(input.status),
      equipment: { create: equipmentIds.map((equipmentId) => ({ equipmentId })) },
    },
  });
}

export async function updateVehicle(id: number, input: VehicleInput) {
  const existing = await db.vehicle.findUnique({ where: { id }, select: { slug: true, previousSlugs: true, status: true, soldAt: true } });
  if (!existing) return null;

  // Slug se mění jen ručně – URL vozu zůstává stabilní i po úpravě údajů.
  let slug = existing.slug;
  let previousSlugs = existing.previousSlugs;
  if (input.slug && input.slug !== existing.slug) {
    if (await slugExists(input.slug, id)) throw new SlugTakenError();
    slug = input.slug;
    previousSlugs = [...previousSlugs.filter((s) => s !== input.slug), existing.slug];
  }

  const equipmentIds = await existingEquipmentIds(input.equipmentIds);
  return db.$transaction(async (tx) => {
    await tx.vehicleEquipment.deleteMany({ where: { vehicleId: id } });
    return tx.vehicle.update({
      where: { id },
      data: {
        ...toData(input),
        slug,
        previousSlugs,
        soldAt: soldAtFor(input.status, existing),
        equipment: { create: equipmentIds.map((equipmentId) => ({ equipmentId })) },
      },
    });
  });
}

export async function quickUpdateVehicle(id: number, input: VehicleQuickUpdate) {
  const existing = await db.vehicle.findUnique({ where: { id }, select: { status: true, soldAt: true } });
  if (!existing) return null;
  const data: Prisma.VehicleUpdateInput = {};
  if (input.status) {
    data.status = input.status;
    data.soldAt = soldAtFor(input.status, existing);
  }
  if (input.archived !== undefined) data.archivedAt = input.archived ? new Date() : null;
  if (input.featured !== undefined) data.featured = input.featured;
  return db.vehicle.update({ where: { id }, data });
}

/** Trvalé smazání vč. fotek v úložišti. Leady zůstanou (vehicle_id → NULL). */
export async function deleteVehicle(id: number) {
  const images = await db.vehicleImage.findMany({ where: { vehicleId: id }, select: { storageKey: true } });
  const deleted = await db.vehicle.delete({ where: { id } }).catch(() => null);
  if (deleted) await Promise.all(images.map((i) => removeVehicleImageFiles(i.storageKey)));
  return deleted;
}

export async function getAdminVehicles(archived: boolean) {
  return db.vehicle.findMany({
    where: { archivedAt: archived ? { not: null } : null },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      images: { orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }], take: 1 },
      _count: { select: { images: true, leads: true } },
    },
  });
}

export async function getAdminVehicle(id: number) {
  return db.vehicle.findUnique({
    where: { id },
    include: { equipment: { select: { equipmentId: true } } },
  });
}

export async function getEquipmentCatalog() {
  return db.equipment.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }] });
}
