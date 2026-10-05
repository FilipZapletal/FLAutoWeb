"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { BODY_TYPE_LABELS, DRIVE_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/labels";
import type { VehicleFilters } from "@/lib/validation/filters";

type Props = {
  filters: VehicleFilters;
  brandModels: Record<string, string[]>;
  colors: string[];
  origins: string[];
};

const ADVANCED_KEYS = ["fuel", "transmission", "drive", "body", "powerMin", "powerMax", "engineMin", "engineMax", "regMin", "ownersMax", "origin", "color", "seats", "doors", "stk", "sale"] as const;

function Select({ name, label, value, options }: { name: string; label: string; value?: string | number; options: [string, string][] }) {
  return (
    <div>
      <label className="label" htmlFor={`f-${name}`}>{label}</label>
      <select id={`f-${name}`} name={name} defaultValue={value ?? ""} className="field">
        <option value="">Vše</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </div>
  );
}

function Range({ name, label, filters, unit }: { name: string; label: string; filters: VehicleFilters; unit?: string }) {
  const f = filters as Record<string, unknown>;
  return (
    <fieldset>
      <legend className="label">{label}{unit && ` (${unit})`}</legend>
      <div className="flex gap-2">
        <input name={`${name}Min`} type="number" inputMode="numeric" min={0} placeholder="od" aria-label={`${label} od`} defaultValue={f[`${name}Min`] as number | undefined} className="field" />
        <input name={`${name}Max`} type="number" inputMode="numeric" min={0} placeholder="do" aria-label={`${label} do`} defaultValue={f[`${name}Max`] as number | undefined} className="field" />
      </div>
    </fieldset>
  );
}

export function CatalogFilters({ filters, brandModels, colors, origins }: Props) {
  const router = useRouter();
  const [brand, setBrand] = useState(filters.brand ?? "");
  const models = brandModels[brand] ?? [];
  const hasAdvanced = ADVANCED_KEYS.some((k) => filters[k] !== undefined);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const qs = new URLSearchParams();
    for (const [k, v] of data) {
      if (k === "showSold" || typeof v !== "string" || !v.trim()) continue;
      qs.set(k, v.trim());
    }
    if (!data.has("showSold")) qs.set("sold", "0");
    if (filters.sort) qs.set("sort", filters.sort);
    if (filters.kind) qs.set("kind", filters.kind);
    const query = qs.toString();
    router.push(query ? `/vozy?${query}` : "/vozy", { scroll: false });
  }

  return (
    <form onSubmit={onSubmit} className="card p-4" aria-label="Filtry vozů">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label" htmlFor="f-brand">Značka</label>
          <select id="f-brand" name="brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="field">
            <option value="">Všechny značky</option>
            {Object.keys(brandModels).map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="f-model">Model</label>
          <select key={brand} id="f-model" name="model" defaultValue={brand === filters.brand ? filters.model ?? "" : ""} disabled={!brand} className="field">
            <option value="">{brand ? "Všechny modely" : "Nejdřív vyberte značku"}</option>
            {models.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        <Range name="price" label="Cena" unit="Kč" filters={filters} />
        <Range name="year" label="Rok výroby" filters={filters} />
        <Range name="mileage" label="Nájezd" unit="km" filters={filters} />
        <Select name="fuel" label="Palivo" value={filters.fuel} options={Object.entries(FUEL_LABELS)} />
        <Select name="transmission" label="Převodovka" value={filters.transmission} options={Object.entries(TRANSMISSION_LABELS)} />
        <Select name="body" label="Karoserie" value={filters.body} options={Object.entries(BODY_TYPE_LABELS)} />
      </div>

      <details className="mt-4 border-t border-line pt-3" open={hasAdvanced}>
        <summary className="cursor-pointer font-display text-sm uppercase tracking-wide text-muted hover:text-fg">Další filtry</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select name="drive" label="Pohon" value={filters.drive} options={Object.entries(DRIVE_LABELS)} />
          <Range name="power" label="Výkon" unit="kW" filters={filters} />
          <Range name="engine" label="Objem motoru" unit="ccm" filters={filters} />
          <div>
            <label className="label" htmlFor="f-regMin">První registrace od roku</label>
            <input id="f-regMin" name="regMin" type="number" inputMode="numeric" min={1950} placeholder="např. 2018" defaultValue={filters.regMin} className="field" />
          </div>
          <Select name="ownersMax" label="Počet majitelů (max.)" value={filters.ownersMax} options={[["1", "1"], ["2", "2"], ["3", "3"]]} />
          <Select name="origin" label="Původ" value={filters.origin} options={origins.map((o) => [o, o])} />
          <Select name="color" label="Barva" value={filters.color} options={colors.map((c) => [c, c])} />
          <Select name="seats" label="Počet míst" value={filters.seats} options={[2, 4, 5, 7, 8, 9].map((n) => [String(n), String(n)])} />
          <Select name="doors" label="Počet dveří" value={filters.doors} options={[2, 3, 4, 5].map((n) => [String(n), String(n)])} />
          <div className="flex flex-col justify-end gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="stk" value="1" defaultChecked={filters.stk === "1"} className="accent-[var(--acc)]" /> S platnou STK
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="sale" value="1" defaultChecked={filters.sale === "1"} className="accent-[var(--acc)]" /> Jen akční nabídky
            </label>
          </div>
        </div>
      </details>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="showSold" defaultChecked={filters.sold !== "0"} className="accent-[var(--acc)]" /> Zobrazit i prodané vozy
        </label>
        <button className="btn">Zobrazit vozy</button>
      </div>
    </form>
  );
}
