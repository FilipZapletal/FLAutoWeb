import "server-only";
import { FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/labels";
import { absoluteUrl, siteUrl } from "@/lib/site";
import type { VehicleDetailData } from "@/lib/vehicles/public";

export function vehicleTitle(v: Pick<VehicleDetailData, "brand" | "model" | "version" | "year">) {
  return [v.brand, v.model, v.version, v.year].filter(Boolean).join(" ");
}

const AVAILABILITY = {
  DOSTUPNE: "https://schema.org/InStock",
  REZERVOVANO: "https://schema.org/Reserved",
  PRODANO: "https://schema.org/SoldOut",
  SKRYTE: "https://schema.org/OutOfStock",
} as const;

const FUEL_SCHEMA = { BENZIN: "Gasoline", DIESEL: "Diesel", HYBRID: "Hybrid", PLUGIN_HYBRID: "Plug-in hybrid", ELEKTRO: "Electricity", LPG_CNG: "LPG/CNG" } as const;

/** schema.org Car (Vehicle + Product) s nabídkou (Offer). */
export function vehicleJsonLd(v: VehicleDetailData) {
  const url = siteUrl(`/vozy/${v.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: vehicleTitle(v),
    url,
    brand: { "@type": "Brand", name: v.brand },
    model: v.model,
    vehicleModelDate: String(v.year),
    ...(v.registrationDate && { dateVehicleFirstRegistered: v.registrationDate.slice(0, 10) }),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: v.mileage, unitCode: "KMT" },
    fuelType: FUEL_SCHEMA[v.fuel],
    vehicleTransmission: TRANSMISSION_LABELS[v.transmission],
    ...(v.color && { color: v.color }),
    ...(v.power && { vehicleEngine: { "@type": "EngineSpecification", enginePower: { "@type": "QuantitativeValue", value: v.power, unitCode: "KWT" } } }),
    ...(v.seats && { seatingCapacity: v.seats }),
    ...(v.doors && { numberOfDoors: v.doors }),
    itemCondition: "https://schema.org/UsedCondition",
    image: v.images.slice(0, 10).map((i) => absoluteUrl(i.large)),
    description: v.description ?? undefined,
    offers: {
      "@type": "Offer",
      price: v.price,
      priceCurrency: "CZK",
      availability: AVAILABILITY[v.status],
      url,
      seller: { "@type": "AutoDealer", name: "FL Auto", url: siteUrl() },
    },
  };
}

export function vehicleDescription(v: VehicleDetailData) {
  const parts = [
    `${v.mileage.toLocaleString("cs-CZ")} km`,
    FUEL_LABELS[v.fuel],
    TRANSMISSION_LABELS[v.transmission],
    v.power ? `${v.power} kW` : null,
    `${v.price.toLocaleString("cs-CZ")} Kč`,
  ].filter(Boolean);
  return `${vehicleTitle(v)} – ${parts.join(", ")}. Prověřený vůz v nabídce FL Auto.`;
}

/** JSON do <script type="application/ld+json"> bez možnosti ukončit tag. */
export const jsonLdString = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
