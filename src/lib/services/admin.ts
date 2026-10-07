import "server-only";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import type { ServiceInput } from "@/lib/validation/service";

export class ServiceSlugTakenError extends Error {}

async function slugExists(slug: string, excludeId?: number) {
  const hit = await db.service.findFirst({
    where: { OR: [{ slug }, { previousSlugs: { has: slug } }], ...(excludeId && { id: { not: excludeId } }) },
    select: { id: true },
  });
  return Boolean(hit);
}

async function uniqueSlug(title: string) {
  const base = slugify(title) || "sluzba";
  if (!(await slugExists(base))) return base;
  for (let i = 2; ; i++) if (!(await slugExists(`${base}-${i}`))) return `${base}-${i}`;
}

function toData(input: ServiceInput) {
  const { slug: _s, ...rest } = input;
  return rest;
}

export async function createService(input: ServiceInput) {
  let slug = input.slug;
  if (slug && (await slugExists(slug))) throw new ServiceSlugTakenError();
  slug ??= await uniqueSlug(input.title);
  return db.service.create({ data: { ...toData(input), slug } });
}

export async function updateService(id: number, input: ServiceInput) {
  const existing = await db.service.findUnique({ where: { id }, select: { slug: true, previousSlugs: true } });
  if (!existing) return null;

  // Slug se mění jen ručně – stará adresa se pak přesměruje.
  let slug = existing.slug;
  let previousSlugs = existing.previousSlugs;
  if (input.slug && input.slug !== existing.slug) {
    if (await slugExists(input.slug, id)) throw new ServiceSlugTakenError();
    slug = input.slug;
    previousSlugs = [...previousSlugs.filter((s) => s !== input.slug), existing.slug];
  }
  return db.service.update({ where: { id }, data: { ...toData(input), slug, previousSlugs } });
}

export async function setServicePublished(id: number, published: boolean) {
  return db.service.update({ where: { id }, data: { published } }).catch(() => null);
}

export async function deleteService(id: number) {
  return db.service.delete({ where: { id } }).catch(() => null);
}

export async function getAdminServices() {
  return db.service.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
}

export async function getAdminService(id: number) {
  return db.service.findUnique({ where: { id } });
}
