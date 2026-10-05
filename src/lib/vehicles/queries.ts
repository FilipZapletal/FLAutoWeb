import "server-only";
import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import type { VehicleFilters } from "@/lib/validation/filters";
import {
  cardInclude,
  detailInclude,
  PUBLIC_VEHICLE_WHERE,
  toVehicleCard,
  toVehicleDetail,
} from "./public";

export const PAGE_SIZE = 12;

/** České řazení nezávislé na collation databáze. */
const czSort = (a: string, b: string) => a.localeCompare(b, "cs");

const insensitive = (value: string) => ({ equals: value, mode: "insensitive" as const });

function range(min?: number, max?: number) {
  if (min === undefined && max === undefined) return undefined;
  return { ...(min !== undefined && { gte: min }), ...(max !== undefined && { lte: max }) };
}

export function buildWhere(f: VehicleFilters): Prisma.VehicleWhereInput {
  const and: Prisma.VehicleWhereInput[] = [PUBLIC_VEHICLE_WHERE];
  if (f.brand) and.push({ brand: insensitive(f.brand) });
  if (f.model) and.push({ model: insensitive(f.model) });
  if (f.fuel) and.push({ fuel: f.fuel });
  if (f.transmission) and.push({ transmission: f.transmission });
  if (f.drive) and.push({ drive: f.drive });
  if (f.body) and.push({ bodyType: f.body });
  if (f.kind === "osobni") and.push({ bodyType: { not: "UZITKOVE" } });
  if (f.origin) and.push({ origin: insensitive(f.origin) });
  if (f.color) and.push({ color: insensitive(f.color) });
  if (f.seats) and.push({ seats: f.seats });
  if (f.doors) and.push({ doors: f.doors });
  if (f.ownersMax !== undefined) and.push({ owners: { lte: f.ownersMax } });
  if (f.sale) and.push({ salePrice: { not: null } });
  if (f.sold === "0") and.push({ status: { not: "PRODANO" } });
  if (f.stk) and.push({ stk: { gte: startOfMonthUtc() } });
  if (f.regMin) and.push({ registrationDate: { gte: new Date(Date.UTC(f.regMin, 0, 1)) } });

  const numeric: [keyof Prisma.VehicleWhereInput, number | undefined, number | undefined][] = [
    ["currentPrice", f.priceMin, f.priceMax],
    ["year", f.yearMin, f.yearMax],
    ["mileage", f.mileageMin, f.mileageMax],
    ["power", f.powerMin, f.powerMax],
    ["engineVolume", f.engineMin, f.engineMax],
  ];
  for (const [field, min, max] of numeric) {
    const r = range(min, max);
    if (r) and.push({ [field]: r });
  }
  return { AND: and };
}

function startOfMonthUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function buildOrder(sort: VehicleFilters["sort"]): Prisma.VehicleOrderByWithRelationInput[] {
  switch (sort) {
    case "cena_asc":
      return [{ currentPrice: "asc" }, { id: "desc" }];
    case "cena_desc":
      return [{ currentPrice: "desc" }, { id: "desc" }];
    case "rok_desc":
      return [{ year: "desc" }, { id: "desc" }];
    case "rok_asc":
      return [{ year: "asc" }, { id: "desc" }];
    case "najezd_asc":
      return [{ mileage: "asc" }, { id: "desc" }];
    case "najezd_desc":
      return [{ mileage: "desc" }, { id: "desc" }];
    default:
      return [{ featured: "desc" }, { createdAt: "desc" }, { id: "desc" }];
  }
}

/**
 * Katalog s filtry, řazením a stránkováním. Prodané vozy jsou vždy na konci
 * (dvě skupiny: neprodané → prodané, stránkuje se přes obě).
 */
export async function searchVehicles(f: VehicleFilters) {
  const where = buildWhere(f);
  const orderBy = buildOrder(f.sort);
  const page = f.page ?? 1;
  const offset = (page - 1) * PAGE_SIZE;

  const activeWhere: Prisma.VehicleWhereInput = { AND: [where, { status: { not: "PRODANO" } }] };
  const soldWhere: Prisma.VehicleWhereInput = { AND: [where, { status: "PRODANO" }] };
  const [activeCount, soldCount] = await Promise.all([
    db.vehicle.count({ where: activeWhere }),
    db.vehicle.count({ where: soldWhere }),
  ]);

  const rows = [];
  if (offset < activeCount) {
    rows.push(
      ...(await db.vehicle.findMany({ where: activeWhere, orderBy, skip: offset, take: PAGE_SIZE, include: cardInclude })),
    );
  }
  const remaining = PAGE_SIZE - rows.length;
  if (remaining > 0 && soldCount > 0) {
    rows.push(
      ...(await db.vehicle.findMany({
        where: soldWhere,
        orderBy,
        skip: Math.max(0, offset - activeCount),
        take: remaining,
        include: cardInclude,
      })),
    );
  }

  const total = activeCount + soldCount;
  return {
    items: rows.map(toVehicleCard),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Značky a jejich modely pro filtry (jen veřejně viditelné vozy). */
export async function getBrandModels() {
  const rows = await db.vehicle.findMany({
    where: PUBLIC_VEHICLE_WHERE,
    select: { brand: true, model: true },
    distinct: ["brand", "model"],
    orderBy: [{ brand: "asc" }, { model: "asc" }],
  });
  const map: Record<string, string[]> = {};
  for (const { brand, model } of [...rows].sort((a, b) => czSort(a.brand, b.brand) || czSort(a.model, b.model))) {
    (map[brand] ??= []).push(model);
  }
  return map;
}

/** Barvy a původ pro filtry (jen hodnoty, které se v nabídce vyskytují). */
export async function getFilterValues() {
  const [colors, origins] = await Promise.all([
    db.vehicle.findMany({ where: { ...PUBLIC_VEHICLE_WHERE, color: { not: null } }, select: { color: true }, distinct: ["color"], orderBy: { color: "asc" } }),
    db.vehicle.findMany({ where: { ...PUBLIC_VEHICLE_WHERE, origin: { not: null } }, select: { origin: true }, distinct: ["origin"], orderBy: { origin: "asc" } }),
  ]);
  return {
    colors: colors.map((c) => c.color!).sort(czSort),
    origins: origins.map((o) => o.origin!).sort(czSort),
  };
}

/** Detail vozu (deduplikováno v rámci requestu – volá ho stránka i metadata). */
export const getVehicleBySlug = cache(async (slug: string) => {
  const v = await db.vehicle.findFirst({ where: { slug, ...PUBLIC_VEHICLE_WHERE }, include: detailInclude });
  return v ? toVehicleDetail(v) : null;
});

/** Starý slug → aktuální slug (pro 301 redirect po přejmenování). */
export async function findSlugRedirect(slug: string) {
  const v = await db.vehicle.findFirst({
    where: { previousSlugs: { has: slug }, ...PUBLIC_VEHICLE_WHERE },
    select: { slug: true },
  });
  return v?.slug ?? null;
}

type HomeSection = "featured" | "newest" | "sale";

export async function getHomeVehicles(section: HomeSection, take = 6) {
  const base: Prisma.VehicleWhereInput = { ...PUBLIC_VEHICLE_WHERE, status: { in: ["DOSTUPNE", "REZERVOVANO"] } };
  const where: Prisma.VehicleWhereInput =
    section === "featured" ? { ...base, featured: true } : section === "sale" ? { ...base, salePrice: { not: null } } : base;
  const rows = await db.vehicle.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
    include: cardInclude,
  });
  return rows.map(toVehicleCard);
}

export async function getSitemapVehicles() {
  return db.vehicle.findMany({ where: PUBLIC_VEHICLE_WHERE, select: { slug: true, updatedAt: true } });
}
