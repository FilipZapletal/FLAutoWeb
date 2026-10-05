import { formatKm, formatMonthYear } from "@/lib/format";
import { BODY_TYPE_LABELS, DRIVE_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/labels";
import type { VehicleDetailData } from "@/lib/vehicles/public";

type Row = [label: string, value: string | number | null | undefined];

/** Technické údaje rozdělené do skupin podle zadání. Prázdné hodnoty se nezobrazují. */
export function SpecTable({ v }: { v: VehicleDetailData }) {
  const groups: [string, Row[]][] = [
    [
      "Základní",
      [
        ["Značka", v.brand],
        ["Model", [v.model, v.version].filter(Boolean).join(" ")],
        ["Rok výroby", v.year],
        ["První registrace", formatMonthYear(v.registrationDate)],
        ["Karoserie", BODY_TYPE_LABELS[v.bodyType]],
        ["Barva", v.color],
      ],
    ],
    [
      "Motor",
      [
        ["Palivo", FUEL_LABELS[v.fuel]],
        ["Objem", v.engineVolume ? `${v.engineVolume.toLocaleString("cs-CZ")} ccm` : null],
        ["Výkon", v.power ? `${v.power} kW (${Math.round(v.power * 1.36)} k)` : null],
        ["Převodovka", TRANSMISSION_LABELS[v.transmission]],
        ["Pohon", v.drive ? DRIVE_LABELS[v.drive] : null],
      ],
    ],
    [
      "Provoz",
      [
        ["Nájezd", formatKm(v.mileage)],
        ["STK do", formatMonthYear(v.stk)],
        ["Spotřeba", v.consumption],
        ["Emise", v.emissions],
      ],
    ],
    [
      "Další",
      [
        ["Počet majitelů", v.owners],
        ["Původ", v.origin],
        ["Počet míst", v.seats],
        ["Počet dveří", v.doors],
        ["VIN", v.vinMasked],
      ],
    ],
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {groups.map(([title, rows]) => {
        const filled = rows.filter(([, value]) => value !== null && value !== undefined && value !== "");
        if (!filled.length) return null;
        return (
          <section key={title} className="card p-4">
            <h3 className="mb-2 text-sm text-muted">{title}</h3>
            <dl className="divide-y divide-line text-sm">
              {filled.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-1.5">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </div>
  );
}
