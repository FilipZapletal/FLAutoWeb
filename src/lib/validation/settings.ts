import { z } from "zod";
import { optionalInt, optionalText, requiredText } from "./helpers";

const optionalUrl = z.preprocess(
  (v) => (typeof v === "string" ? v.trim() || null : v ?? null),
  z.url({ protocol: /^https?$/, error: "Zadejte celou adresu včetně https://" }).max(300).nullable(),
);

/** Hodnocení s jedním desetinným místem, přijímá i čárku („4,8“). */
const optionalRating = z.preprocess(
  (v) => (typeof v === "string" ? (v.trim() ? Number(v.trim().replace(",", ".")) : null) : v ?? null),
  z
    .number({ error: "Zadejte číslo, např. 4,8" })
    .min(1, { error: "Minimum je 1" })
    .max(5, { error: "Maximum je 5" })
    .transform((n) => Math.round(n * 10) / 10)
    .nullable(),
);

export const siteSettingsSchema = z.object({
  address: requiredText(200),
  phone: requiredText(40),
  email: z.email({ error: "Zadejte platný e-mail" }),
  // Otevírací doba – volný text (např. „Pouze po telefonické domluvě“)
  openingHours: requiredText(200),
  facebookUrl: optionalUrl,
  instagramUrl: optionalUrl,
  mapNote: optionalText(300),
  // Firemní údaje pro Obchodní údaje, Ochranu osobních údajů a Reklamační řád
  companyName: optionalText(200),
  ico: optionalText(20),
  dic: optionalText(20),
  registeredOffice: optionalText(200),
  registryEntry: optionalText(300),
  tradeOffice: optionalText(200),
  legalEffectiveDate: optionalText(40),
  // Odpovědná osoba za provozovnu a správce osobních údajů
  responsiblePerson: optionalText(120),
  responsiblePhone: optionalText(40),
  responsibleEmail: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || null : v ?? null),
    z.email({ error: "Zadejte platný e-mail" }).max(160).nullable(),
  ),
  // Hodnocení na Googlu – zadává se ručně podle profilu firmy; bez hodnocení se nezobrazuje
  googleRating: optionalRating,
  googleReviewCount: optionalInt(0, 100000),
  googleReviewsUrl: optionalUrl,
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;
