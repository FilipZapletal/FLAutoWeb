import { z } from "zod";
import { BodyType, Drive, Fuel, Transmission, VehicleStatus } from "@/generated/prisma/enums";
import {
  optionalEnum,
  optionalInt,
  optionalMonth,
  optionalText,
  requiredInt,
  requiredText,
} from "./helpers";

const currentYear = new Date().getFullYear();

export const vehicleSchema = z
  .object({
    brand: requiredText(60),
    model: requiredText(80),
    version: optionalText(120),
    price: requiredInt(1, 100_000_000),
    salePrice: optionalInt(1, 100_000_000),
    year: requiredInt(1950, currentYear + 1),
    registrationDate: optionalMonth,
    mileage: requiredInt(0, 3_000_000),
    fuel: z.enum(Fuel, { error: "Vyberte palivo" }),
    transmission: z.enum(Transmission, { error: "Vyberte převodovku" }),
    drive: optionalEnum(Drive),
    bodyType: z.enum(BodyType, { error: "Vyberte karoserii" }),
    engineVolume: optionalInt(50, 10_000),
    power: optionalInt(1, 2_000),
    color: optionalText(40),
    vin: z.preprocess(
      (v) => (typeof v === "string" ? v.trim().toUpperCase() || null : v ?? null),
      z
        .string()
        .regex(/^[A-HJ-NPR-Z0-9]{17}$/, { error: "VIN má 17 znaků (bez I, O, Q)" })
        .nullable(),
    ),
    stk: optionalMonth,
    owners: optionalInt(0, 50),
    origin: optionalText(40),
    consumption: optionalText(60),
    emissions: optionalText(60),
    seats: optionalInt(1, 60),
    doors: optionalInt(0, 10),
    description: optionalText(10_000),
    status: z.enum(VehicleStatus).default("DOSTUPNE"),
    featured: z.boolean().default(false),
    slug: z.preprocess(
      (v) => (typeof v === "string" ? v.trim() || null : v ?? null),
      z
        .string()
        .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { error: "Jen malá písmena bez diakritiky, čísla a pomlčky" })
        .max(120)
        .nullable(),
    ),
    equipmentIds: z.array(z.number().int().positive()).max(500).default([]),
  })
  .refine((v) => v.salePrice === null || v.salePrice < v.price, {
    path: ["salePrice"],
    error: "Akční cena musí být nižší než cena",
  });

export type VehicleInput = z.infer<typeof vehicleSchema>;

/** Rychlé akce z tabulky v adminu (změna statusu, archivace, doporučení). */
export const vehicleQuickUpdateSchema = z
  .object({
    status: z.enum(VehicleStatus).optional(),
    archived: z.boolean().optional(),
    featured: z.boolean().optional(),
  })
  .strict();

export type VehicleQuickUpdate = z.infer<typeof vehicleQuickUpdateSchema>;
