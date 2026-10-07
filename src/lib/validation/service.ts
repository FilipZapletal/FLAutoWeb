import { z } from "zod";
import { ServiceIcon } from "@/generated/prisma/enums";
import { optionalText, requiredInt, requiredText } from "./helpers";

export const servicePriceSchema = z.object({
  label: requiredText(120),
  price: requiredInt(0, 10_000_000),
  /** Cena „od“ (konečná cena podle rozsahu práce) */
  from: z.boolean().default(false),
});

export type ServicePrice = z.infer<typeof servicePriceSchema>;

/** Ceník uložený v DB (JSON) – při čtení se ověří, neplatné položky se zahodí. */
export function parseServicePrices(value: unknown): ServicePrice[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((p) => {
    const r = servicePriceSchema.safeParse(p);
    return r.success ? [r.data] : [];
  });
}

/** Odrážky: textarea (řádek = odrážka) nebo pole. */
const lines = z.preprocess(
  (v) => (typeof v === "string" ? v.split("\n") : v ?? []),
  z
    .array(z.string().trim().max(300, { error: "Odrážka může mít maximálně 300 znaků" }))
    .transform((a) => a.filter(Boolean))
    .pipe(z.array(z.string()).max(30, { error: "Maximálně 30 odrážek" })),
);

export const serviceSchema = z.object({
  title: requiredText(120),
  tag: optionalText(60),
  icon: z.enum(ServiceIcon).default("WRENCH"),
  summary: requiredText(400),
  items: lines,
  description: optionalText(10_000),
  prices: z.array(servicePriceSchema).max(50).default([]),
  priceNote: optionalText(300),
  metaTitle: optionalText(70),
  metaDescription: optionalText(170),
  published: z.boolean().default(true),
  sortOrder: z.preprocess((v) => (v === "" || v == null ? 0 : v), requiredInt(0, 999)),
  slug: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || null : v ?? null),
    z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { error: "Jen malá písmena bez diakritiky, čísla a pomlčky" })
      .max(120)
      .nullable(),
  ),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

/** Rychlá akce z tabulky v adminu (zveřejnit / skrýt). */
export const serviceQuickUpdateSchema = z.object({ published: z.boolean() }).strict();
