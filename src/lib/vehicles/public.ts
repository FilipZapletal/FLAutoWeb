import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { imageUrls, type ImageUrls } from "@/lib/images/variants";
import { maskVin } from "@/lib/vin";

/** Vozy, které smí vidět veřejnost (ne skryté, ne archivované). */
export const PUBLIC_VEHICLE_WHERE = {
  status: { not: "SKRYTE" },
  archivedAt: null,
} satisfies Prisma.VehicleWhereInput;

/** Kolik fotek se listuje přímo na kartě vozu (hlavní první). Zbytek je v detailu. */
export const CARD_IMAGE_LIMIT = 10;

const mainImageInclude = {
  images: {
    where: { mediaType: "IMAGE" },
    orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }],
    take: CARD_IMAGE_LIMIT,
  },
} satisfies Prisma.VehicleInclude;

export const cardInclude = mainImageInclude;

export const detailInclude = {
  images: { where: { mediaType: "IMAGE" }, orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }] },
  equipment: { include: { equipment: true } },
} satisfies Prisma.VehicleInclude;

type CardRow = Prisma.VehicleGetPayload<{ include: typeof cardInclude }>;
type DetailRow = Prisma.VehicleGetPayload<{ include: typeof detailInclude }>;

export type PublicImage = ImageUrls & { id: number; alt: string; width: number; height: number };

function toImage(v: { brand: string; model: string }, img: CardRow["images"][number], i: number): PublicImage {
  return {
    id: img.id,
    alt: img.alt || `${v.brand} ${v.model} – fotografie ${i + 1}`,
    width: img.width,
    height: img.height,
    ...imageUrls(img.storageKey),
  };
}

/** Fotka na kartě: jen to, co karta potřebuje (náhled 400 px a 1024 px). */
export type CardImage = { id: number; alt: string; src: string; srcSet: string; width: number; height: number };

function toCardImage(v: { brand: string; model: string }, img: CardRow["images"][number], i: number): CardImage {
  const u = imageUrls(img.storageKey);
  return {
    id: img.id,
    alt: img.alt || `${v.brand} ${v.model} – fotografie ${i + 1}`,
    src: u.src,
    srcSet: `${u.thumb} 400w, ${u.src} 1024w`,
    width: img.width,
    height: img.height,
  };
}

/** Data pro kartu vozu. Žádný VIN, žádná interní pole. */
export function toVehicleCard(v: CardRow) {
  return {
    id: v.id,
    slug: v.slug,
    brand: v.brand,
    model: v.model,
    version: v.version,
    year: v.year,
    mileage: v.mileage,
    fuel: v.fuel,
    transmission: v.transmission,
    power: v.power,
    price: v.currentPrice,
    isSale: v.salePrice !== null,
    status: v.status,
    images: v.images.map((img, i) => toCardImage(v, img, i)),
  };
}
export type VehicleCardData = ReturnType<typeof toVehicleCard>;

/** Data pro detail vozu. VIN je maskovaný, původní cena se při akci neposílá. */
export function toVehicleDetail(v: DetailRow) {
  return {
    ...toVehicleCard({ ...v, images: v.images.slice(0, 1) }),
    registrationDate: v.registrationDate?.toISOString() ?? null,
    drive: v.drive,
    bodyType: v.bodyType,
    engineVolume: v.engineVolume,
    color: v.color,
    vinMasked: maskVin(v.vin),
    stk: v.stk?.toISOString() ?? null,
    owners: v.owners,
    origin: v.origin,
    consumption: v.consumption,
    emissions: v.emissions,
    seats: v.seats,
    doors: v.doors,
    description: v.description,
    updatedAt: v.updatedAt.toISOString(),
    images: v.images.map((img, i) => toImage(v, img, i)),
    equipment: v.equipment
      .map((e) => e.equipment)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "cs"))
      .map(({ id, name, category }) => ({ id, name, category })),
  };
}
export type VehicleDetailData = ReturnType<typeof toVehicleDetail>;
