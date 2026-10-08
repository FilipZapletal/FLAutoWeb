import Link from "next/link";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { formatKm } from "@/lib/format";
import { FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/labels";
import type { VehicleCardData } from "@/lib/vehicles/public";
import { Price } from "./Price";
import { StatusBadge } from "./StatusBadge";
import { VehicleImage } from "./VehicleImage";

export function VehicleCard({ vehicle: v, priority = false }: { vehicle: VehicleCardData; priority?: boolean }) {
  const specs = [formatKm(v.mileage), FUEL_LABELS[v.fuel], TRANSMISSION_LABELS[v.transmission], v.power ? `${v.power} kW` : null].filter(Boolean);
  return (
    <article className="card group relative flex flex-col overflow-hidden transition-colors hover:border-acc">
      <Link href={`/vozy/${v.slug}`} className="relative block aspect-[16/10] overflow-hidden" tabIndex={-1} aria-hidden="true">
        <VehicleImage image={v.image} sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" priority={priority} className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]" />
        <StatusBadge status={v.status} className="absolute left-2.5 top-2.5" />
      </Link>
      <FavoriteButton vehicleId={v.id} label={`${v.brand} ${v.model}`} className="absolute right-2.5 top-2.5 z-10" />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base tracking-wide">
          <Link href={`/vozy/${v.slug}`}>
            <span className="text-acc">{v.brand}</span> {v.model}
          </Link>
        </h3>
        <p className="text-sm text-muted">{[v.version, v.year].filter(Boolean).join(" · ")}</p>
        <p className="mt-1 text-xs text-muted">{specs.join(" · ")}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <Price value={v.price} isSale={v.isSale} className="text-xl" />
          <Link href={`/vozy/${v.slug}`} className="btn-outline btn-sm">
            Zobrazit vůz
          </Link>
        </div>
      </div>
    </article>
  );
}

export function VehicleGrid({ vehicles, priorityCount = 0 }: { vehicles: VehicleCardData[]; priorityCount?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((v, i) => (
        <VehicleCard key={v.id} vehicle={v} priority={i < priorityCount} />
      ))}
    </div>
  );
}
