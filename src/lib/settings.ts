import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { siteSettingsSchema, type SiteSettings } from "@/lib/validation/settings";

const KEY = "site";

/** Výchozí údaje ze zadání – použijí se, dokud admin v Nastavení nic neuloží. */
export const DEFAULT_SETTINGS: SiteSettings = {
  address: "Frýdecká 652/295",
  phone: "+420 604 452 221",
  email: "jarekfrejky@gmail.com",
  openingHours: "Pouze po telefonické domluvě",
  facebookUrl: null,
  instagramUrl: null,
  mapNote: null,
  // Údaje ověřeny ve veřejném rejstříku ARES (IČO 07481233)
  companyName: "Lukáš Gvožď",
  ico: "07481233",
  dic: "CZ8810185571",
  registeredOffice: "Za Kolibou 340, Horní Datyně, 739 32 Vratimov",
  registryEntry: "Fyzická osoba zapsaná v živnostenském rejstříku",
  tradeOffice: "Magistrát města Ostravy",
  legalEffectiveDate: null,
  responsiblePerson: "Lukáš Gvožď",
  responsiblePhone: "+420 776 623 397",
  responsibleEmail: "gvozd809@icloud.com",
  googleRating: null,
  googleReviewCount: null,
  googleReviewsUrl: null,
};

/** Nastavení webu (jedno čtení z DB na request). */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const row = await db.setting.findUnique({ where: { key: KEY } });
  const parsed = siteSettingsSchema.safeParse({ ...DEFAULT_SETTINGS, ...(row?.value as object | null) });
  return parsed.success ? parsed.data : DEFAULT_SETTINGS;
});

export async function saveSettings(value: SiteSettings) {
  await db.setting.upsert({ where: { key: KEY }, create: { key: KEY, value }, update: { value } });
}
