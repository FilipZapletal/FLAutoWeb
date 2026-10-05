import { z } from "zod";
import { optionalText, requiredText } from "./helpers";

const optionalUrl = z.preprocess(
  (v) => (typeof v === "string" ? v.trim() || null : v ?? null),
  z.url({ protocol: /^https?$/, error: "Zadejte celou adresu včetně https://" }).max(300).nullable(),
);

export const siteSettingsSchema = z.object({
  address: requiredText(200),
  phone: requiredText(40),
  email: z.email({ error: "Zadejte platný e-mail" }),
  hoursWeekdays: requiredText(100),
  hoursSaturday: requiredText(100),
  hoursSunday: requiredText(100),
  facebookUrl: optionalUrl,
  instagramUrl: optionalUrl,
  mapNote: optionalText(300),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;
