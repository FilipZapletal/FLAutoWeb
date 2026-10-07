import type { VehicleFilters } from "@/lib/validation/filters";
import type { Prefill } from "./storage";

/** Filtry z katalogu, které se berou jako „zákazník hledá“ (řazení a stránkování ne). */
export function meaningfulFilterKeys(filters: VehicleFilters) {
  return Object.keys(filters).filter((k) => !["sort", "page", "sold"].includes(k));
}

/** Co zákazník nastavil ve filtrech → předvyplnění formuláře. */
export function filtersToPrefill(f: VehicleFilters): Prefill {
  const car = [f.brand, f.model].filter(Boolean).join(" ");
  return {
    ...(car && { car }),
    ...(f.priceMax !== undefined && { maxPrice: f.priceMax }),
    ...(f.yearMin !== undefined && { yearFrom: f.yearMin }),
    ...(f.mileageMax !== undefined && { maxMileage: f.mileageMax }),
    ...(f.fuel && { fuel: f.fuel }),
    ...(f.transmission && { transmission: f.transmission }),
    ...(f.body && { bodyType: f.body }),
  };
}
