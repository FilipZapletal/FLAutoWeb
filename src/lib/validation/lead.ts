import { z } from "zod";
import { BodyType, Fuel, LeadStatus, TimeSlot, Transmission } from "@/generated/prisma/enums";
import { bookingRange, isWeekend } from "@/lib/booking";
import { VEHICLE_LEAD_TYPES } from "@/lib/labels";
import { optionalEnum, optionalInt, optionalText, requiredText } from "./helpers";

const phone = z
  .string({ error: "Zadejte telefon" })
  .trim()
  .regex(/^\+?[\d\s()-]{9,20}$/, { error: "Zadejte platné telefonní číslo" })
  .refine((v) => v.replace(/\D/g, "").length >= 9, { error: "Zadejte platné telefonní číslo" });

const email = z.preprocess(
  (v) => (typeof v === "string" ? v.trim() || null : v ?? null),
  z.email({ error: "Zadejte platný e-mail" }).max(160).nullable(),
);

/** Honeypot – skryté pole, které vyplní jen roboti. */
const honeypot = z.string().max(0).optional().or(z.literal(""));

/** Preferovaný den servisu "RRRR-MM-DD" → Date (UTC půlnoc). Pracovní den od zítřka do 60 dní. */
const preferredDate = z
  .string({ error: "Vyberte datum" })
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Vyberte datum" })
  .superRefine((s, ctx) => {
    const { min, max } = bookingRange();
    // Neexistující den (např. 30. 2.) by Date tiše posunul na další měsíc.
    const d = new Date(`${s}T00:00:00.000Z`);
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) ctx.addIssue({ code: "custom", message: "Vyberte platné datum" });
    else if (s < min) ctx.addIssue({ code: "custom", message: "Vyberte datum nejdříve od zítřka" });
    else if (s > max) ctx.addIssue({ code: "custom", message: "Termín lze vybrat nejvýše 60 dní dopředu" });
    else if (isWeekend(s)) ctx.addIssue({ code: "custom", message: "Vyberte pracovní den (sobota jen po telefonické domluvě)" });
  })
  .transform((s) => new Date(`${s}T00:00:00.000Z`));

/** Nepovinný den: prázdné pole → null, jinak stejná pravidla jako u objednávky do servisu. */
const optionalPreferredDate = z.preprocess((v) => (v === "" || v == null ? null : v), preferredDate.nullable());

export const vehicleLeadSchema = z.object({
  kind: z.literal("vehicle"),
  vehicleId: z.number().int().positive(),
  name: requiredText(120),
  phone,
  email,
  type: z.enum(VEHICLE_LEAD_TYPES, { error: "Vyberte typ zájmu" }),
  /** Nepovinný preferovaný den a část dne (prohlídka, zavolání) */
  preferredDate: optionalPreferredDate,
  preferredSlot: z.preprocess((v) => (v === "" || v == null ? null : v), z.enum(TimeSlot).nullable()),
  message: optionalText(3000),
  website: honeypot,
});

export const serviceLeadSchema = z.object({
  kind: z.literal("service"),
  /** Vybraná služba (nepovinné) */
  serviceId: optionalInt(1, 2_147_483_647),
  name: requiredText(120),
  car: requiredText(120),
  preferredDate,
  preferredSlot: z.enum(TimeSlot, { error: "Vyberte dopoledne, nebo odpoledne" }),
  phone,
  email,
  message: optionalText(3000),
  website: honeypot,
});

/** „Sehnat auto na přání“ – zákazník hledá vůz, který není v nabídce. */
/** Objednávka s výběrem položek z ceníku služby (Crystal Finish). Ceny se na serveru vždy berou z ceníku, ne z formuláře. */
export const orderLeadSchema = z.object({
  kind: z.literal("order"),
  serviceId: z.number().int().positive(),
  items: z.array(z.string().trim().min(1).max(120)).min(1, { error: "Vyberte aspoň jednu položku z ceníku" }).max(30),
  car: requiredText(120),
  name: requiredText(120),
  phone,
  email,
  preferredDate: optionalPreferredDate,
  preferredSlot: z.preprocess((v) => (v === "" || v == null ? null : v), z.enum(TimeSlot).nullable()),
  message: optionalText(3000),
  website: honeypot,
});

export const wantedLeadSchema = z.object({
  kind: z.literal("wanted"),
  name: requiredText(120),
  phone,
  email,
  /** Co hledá (značka, model, popis) */
  car: requiredText(160),
  maxPrice: optionalInt(10_000, 100_000_000),
  yearFrom: optionalInt(1950, new Date().getFullYear() + 1),
  maxMileage: optionalInt(0, 3_000_000),
  fuel: optionalEnum(Fuel),
  transmission: optionalEnum(Transmission),
  bodyType: optionalEnum(BodyType),
  message: optionalText(2000),
  website: honeypot,
});

export const leadSchema = z.discriminatedUnion("kind", [vehicleLeadSchema, serviceLeadSchema, orderLeadSchema, wantedLeadSchema]);
export type LeadInput = z.infer<typeof leadSchema>;

/** Změna stavu poptávky, nebo domluvený termín servisní objednávky (datum "RRRR-MM-DD", prázdné = zrušit). */
const confirmedDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Vyberte platné datum" })
  .refine((v) => {
    const d = new Date(`${v}T00:00:00.000Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, { error: "Vyberte platné datum" })
  .nullable();

export const leadUpdateSchema = z.union([
  z.object({ status: z.enum(LeadStatus) }).strict(),
  z.object({ confirmedDate, confirmedSlot: z.enum(TimeSlot).nullable() }).strict(),
]);
