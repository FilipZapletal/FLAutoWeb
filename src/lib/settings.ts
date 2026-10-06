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
  hoursWeekdays: "08:00 – 18:00",
  hoursSaturday: "dle předchozí domluvy",
  hoursSunday: "zavřeno, pouze po dohodě",
  facebookUrl: null,
  instagramUrl: null,
  mapNote: null,
  companyName: null,
  ico: null,
  dic: null,
  registeredOffice: null,
  registryEntry: null,
  tradeOffice: null,
  legalEffectiveDate: null,
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
