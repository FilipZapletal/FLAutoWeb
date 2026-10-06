import { z } from "zod";
import { LeadStatus, TimeSlot } from "@/generated/prisma/enums";
import { bookingRange, isWeekend } from "@/lib/booking";
import { VEHICLE_LEAD_TYPES } from "@/lib/labels";
import { optionalInt, optionalText, requiredText } from "./helpers";

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

export const vehicleLeadSchema = z.object({
  kind: z.literal("vehicle"),
  vehicleId: z.number().int().positive(),
  name: requiredText(120),
  phone,
  email,
  type: z.enum(VEHICLE_LEAD_TYPES, { error: "Vyberte typ zájmu" }),
  message: optionalText(3000),
  website: honeypot,
});

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

export const leadSchema = z.discriminatedUnion("kind", [vehicleLeadSchema, serviceLeadSchema]);
export type LeadInput = z.infer<typeof leadSchema>;

export const leadUpdateSchema = z.object({ status: z.enum(LeadStatus) }).strict();
