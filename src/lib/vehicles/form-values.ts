import "server-only";
import type { Vehicle } from "@/generated/prisma/client";

const month = (d: Date | null) => (d ? d.toISOString().slice(0, 7) : "");
const str = (v: string | number | null | undefined) => (v === null || v === undefined ? "" : String(v));

/** Vůz z DB → hodnoty formuláře v adminu (vše jako text). */
export function toFormValues(v: Vehicle): Record<string, string> {
  return {
    brand: v.brand,
    model: v.model,
    version: str(v.version),
    price: str(v.price),
    salePrice: str(v.salePrice),
    year: str(v.year),
    registrationDate: month(v.registrationDate),
    mileage: str(v.mileage),
    fuel: v.fuel,
    transmission: v.transmission,
    drive: str(v.drive),
    bodyType: v.bodyType,
    engineVolume: str(v.engineVolume),
    power: str(v.power),
    color: str(v.color),
    vin: str(v.vin),
    stk: month(v.stk),
    owners: str(v.owners),
    origin: str(v.origin),
    consumption: str(v.consumption),
    emissions: str(v.emissions),
    seats: str(v.seats),
    doors: str(v.doors),
    description: str(v.description),
    status: v.status,
    featured: String(v.featured),
    slug: v.slug,
  };
}
