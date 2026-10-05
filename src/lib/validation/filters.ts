import { z } from "zod";
import { BodyType, Drive, Fuel, Transmission } from "@/generated/prisma/enums";

export const SORT_OPTIONS = {
  doporucene: "Doporučené",
  cena_asc: "Nejlevnější",
  cena_desc: "Nejdražší",
  rok_desc: "Nejnovější",
  rok_asc: "Nejstarší",
  najezd_asc: "Nejnižší nájezd",
  najezd_desc: "Nejvyšší nájezd",
} as const;
export type SortKey = keyof typeof SORT_OPTIONS;

const int = z.coerce.number().int().min(0).max(100_000_000);
const text = z.string().trim().min(1).max(80);

// Každé pole se validuje zvlášť – neplatná hodnota v URL se jen ignoruje.
const fields = {
  brand: text,
  model: text,
  priceMin: int,
  priceMax: int,
  yearMin: int,
  yearMax: int,
  mileageMin: int,
  mileageMax: int,
  fuel: z.enum(Fuel),
  transmission: z.enum(Transmission),
  drive: z.enum(Drive),
  body: z.enum(BodyType),
  /** „Osobní vozy“ = vše kromě užitkových */
  kind: z.literal("osobni"),
  powerMin: int,
  powerMax: int,
  engineMin: int,
  engineMax: int,
  regMin: int,
  ownersMax: int,
  origin: text,
  color: text,
  stk: z.literal("1"),
  seats: int,
  doors: int,
  sale: z.literal("1"),
  sold: z.literal("0"),
  sort: z.enum(Object.keys(SORT_OPTIONS) as [SortKey, ...SortKey[]]),
  page: z.coerce.number().int().min(1).max(10_000),
} as const;

type Fields = typeof fields;
export type VehicleFilters = { [K in keyof Fields]?: z.infer<Fields[K]> };

export function parseFilters(
  params: Record<string, string | string[] | undefined> | URLSearchParams,
): VehicleFilters {
  const get = (k: string) =>
    params instanceof URLSearchParams ? params.get(k) ?? undefined : [params[k]].flat()[0];
  const out: Record<string, unknown> = {};
  for (const [key, schema] of Object.entries(fields)) {
    const raw = get(key);
    if (raw === undefined || raw === "") continue;
    const parsed = schema.safeParse(raw);
    if (parsed.success) out[key] = parsed.data;
  }
  return out as VehicleFilters;
}

/** Filtry → query string (bez prázdných hodnot). */
export function filtersToQuery(filters: VehicleFilters, overrides: Partial<Record<keyof VehicleFilters, string | number | undefined>> = {}) {
  const qs = new URLSearchParams();
  const merged = { ...filters, ...overrides } as Record<string, unknown>;
  for (const [k, v] of Object.entries(merged)) {
    if (v === undefined || v === null || v === "") continue;
    qs.set(k, String(v));
  }
  return qs.toString();
}
