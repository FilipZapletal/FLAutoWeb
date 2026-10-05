import { z } from "zod";
import { LeadStatus } from "@/generated/prisma/enums";
import { VEHICLE_LEAD_TYPES } from "@/lib/labels";
import { optionalText, requiredText } from "./helpers";

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

export const serviceLeadSchema = z.object({
  kind: z.literal("service"),
  name: requiredText(120),
  car: requiredText(120),
  phone,
  email,
  message: optionalText(3000),
  website: honeypot,
});

export const leadSchema = z.discriminatedUnion("kind", [vehicleLeadSchema, serviceLeadSchema]);
export type LeadInput = z.infer<typeof leadSchema>;

export const leadUpdateSchema = z.object({ status: z.enum(LeadStatus) }).strict();
