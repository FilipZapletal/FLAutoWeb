import "server-only";
import { cache } from "react";
import type { Service } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { parseServicePrices, type ServicePrice } from "@/lib/validation/service";

const PUBLIC_SERVICE_WHERE = { published: true } as const;
const ORDER = [{ sortOrder: "asc" as const }, { id: "asc" as const }];

/** Veřejná data služby – bez interních polí. */
function toPublicService(s: Service) {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    tag: s.tag,
    icon: s.icon,
    summary: s.summary,
    items: s.items,
    description: s.description,
    prices: parseServicePrices(s.prices),
    priceNote: s.priceNote,
    contactPhone: s.contactPhone,
    metaTitle: s.metaTitle,
    metaDescription: s.metaDescription,
  };
}

export type PublicService = ReturnType<typeof toPublicService>;

export async function getPublicServices() {
  const rows = await db.service.findMany({ where: PUBLIC_SERVICE_WHERE, orderBy: ORDER });
  return rows.map(toPublicService);
}

export const getServiceBySlug = cache(async (slug: string) => {
  const row = await db.service.findFirst({ where: { slug, ...PUBLIC_SERVICE_WHERE } });
  return row ? toPublicService(row) : null;
});

export async function findServiceSlugRedirect(slug: string) {
  const s = await db.service.findFirst({ where: { previousSlugs: { has: slug }, ...PUBLIC_SERVICE_WHERE }, select: { slug: true } });
  return s?.slug ?? null;
}

export async function getPublishedService(id: number) {
  return db.service.findFirst({ where: { id, ...PUBLIC_SERVICE_WHERE }, select: { id: true, title: true, contactPhone: true } });
}

/** Služby, které se dají objednat online (služba s vlastním telefonním kontaktem se objednává jen telefonicky). */
export function bookableServices(services: PublicService[]) {
  return services.filter((s) => !s.contactPhone).map(({ id, title }) => ({ id, title }));
}

export async function getSitemapServices() {
  return db.service.findMany({ where: PUBLIC_SERVICE_WHERE, select: { slug: true, updatedAt: true }, orderBy: ORDER });
}

/** Nejnižší cena z ceníku pro kartu služby („od X Kč“), nebo null. */
export function lowestPrice(prices: ServicePrice[]) {
  // Doplňky (např. příplatek za vosk) se do ceny „od“ nepočítají, pokud existují i hlavní položky.
  const main = prices.filter((p) => !p.addon);
  const base = main.length ? main : prices;
  if (!base.length) return null;
  const min = Math.min(...base.map((p) => p.price));
  return { price: min, from: prices.length > 1 || prices.some((p) => p.from) };
}
