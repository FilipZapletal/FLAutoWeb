"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { FormError, InputField, SelectField, TextareaField } from "@/components/forms/Field";
import { useJsonSubmit } from "@/components/forms/useJsonSubmit";
import type { EquipmentCategory } from "@/generated/prisma/enums";
import {
  BODY_TYPE_LABELS,
  DRIVE_LABELS,
  EQUIPMENT_CATEGORY_LABELS,
  FUEL_LABELS,
  ORIGIN_OPTIONS,
  TRANSMISSION_LABELS,
  VEHICLE_STATUS_LABELS,
} from "@/lib/labels";

export type VehicleFormValues = Record<string, string> & { featured?: string };
export type EquipmentItem = { id: number; name: string; category: EquipmentCategory };

type Props = {
  vehicleId?: number;
  initial: VehicleFormValues;
  equipment: EquipmentItem[];
  selectedEquipment: number[];
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="card p-5">
      <legend className="sr-only">{title}</legend>
      <h2 className="mb-4 text-base">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </fieldset>
  );
}

const options = (labels: Record<string, string>, empty?: string) => (
  <>
    {empty !== undefined && <option value="">{empty}</option>}
    {Object.entries(labels).map(([v, l]) => (
      <option key={v} value={v}>{l}</option>
    ))}
  </>
);

export function VehicleForm({ vehicleId, initial, equipment: initialEquipment, selectedEquipment }: Props) {
  const router = useRouter();
  const isEdit = vehicleId !== undefined;
  const { submit, sending, error, fields } = useJsonSubmit(isEdit ? `/api/vehicles/${vehicleId}` : "/api/vehicles", isEdit ? "PUT" : "POST");
  const [equipment, setEquipment] = useState(initialEquipment);
  const [checked, setChecked] = useState(() => new Set(selectedEquipment));
  const [saved, setSaved] = useState(false);
  const v = initial;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    delete data.equipment;
    const result = await submit({ ...data, featured: data.featured === "on", equipmentIds: [...checked] });
    if (!result) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (isEdit) {
      setSaved(true);
      router.refresh();
    } else {
      router.push(`/admin/vozidla/${result.id}/fotky?novy=1`);
    }
  }

  function toggle(id: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function addEquipment(category: EquipmentCategory, input: HTMLInputElement) {
    const name = input.value.trim();
    if (!name) return;
    const res = await fetch("/api/equipment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, category }) });
    if (!res.ok) return alert("Položku se nepodařilo přidat.");
    const item: EquipmentItem = await res.json();
    setEquipment((list) => (list.some((i) => i.id === item.id) ? list : [...list, item]));
    setChecked((prev) => new Set(prev).add(item.id));
    input.value = "";
  }

  const err = (name: string) => fields[name];

  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate>
      <FormError message={error} />

      <Section title="Základní údaje">
        <InputField label="Značka *" name="brand" defaultValue={v.brand} required error={err("brand")} />
        <InputField label="Model *" name="model" defaultValue={v.model} required error={err("model")} />
        <InputField label="Verze" name="version" defaultValue={v.version} placeholder="např. 2.0 TDI Style" error={err("version")} />
        <InputField label="Rok výroby *" name="year" type="number" inputMode="numeric" defaultValue={v.year} required error={err("year")} />
        <InputField label="První registrace" name="registrationDate" type="month" defaultValue={v.registrationDate} error={err("registrationDate")} />
        <SelectField label="Karoserie *" name="bodyType" defaultValue={v.bodyType} error={err("bodyType")}>
          {options(BODY_TYPE_LABELS, "Vyberte…")}
        </SelectField>
        <InputField label="Barva" name="color" defaultValue={v.color} error={err("color")} />
      </Section>

      <Section title="Cena a status">
        <InputField label="Cena (Kč) *" name="price" type="number" inputMode="numeric" defaultValue={v.price} required error={err("price")} />
        <InputField label="Akční cena (Kč)" name="salePrice" type="number" inputMode="numeric" defaultValue={v.salePrice} error={err("salePrice")} hint="Na webu se zobrazí jen akční cena." />
        <SelectField label="Status" name="status" defaultValue={v.status || "DOSTUPNE"} error={err("status")}>
          {options(VEHICLE_STATUS_LABELS)}
        </SelectField>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={v.featured === "true"} className="accent-[var(--acc)]" /> Doporučený vůz (úvodní stránka)
        </label>
      </Section>

      <Section title="Motor">
        <SelectField label="Palivo *" name="fuel" defaultValue={v.fuel} error={err("fuel")}>
          {options(FUEL_LABELS, "Vyberte…")}
        </SelectField>
        <InputField label="Objem motoru (ccm)" name="engineVolume" type="number" inputMode="numeric" defaultValue={v.engineVolume} error={err("engineVolume")} />
        <InputField label="Výkon (kW)" name="power" type="number" inputMode="numeric" defaultValue={v.power} error={err("power")} />
        <SelectField label="Převodovka *" name="transmission" defaultValue={v.transmission} error={err("transmission")}>
          {options(TRANSMISSION_LABELS, "Vyberte…")}
        </SelectField>
        <SelectField label="Pohon" name="drive" defaultValue={v.drive} error={err("drive")}>
          {options(DRIVE_LABELS, "—")}
        </SelectField>
      </Section>

      <Section title="Provoz">
        <InputField label="Nájezd (km) *" name="mileage" type="number" inputMode="numeric" defaultValue={v.mileage} required error={err("mileage")} />
        <InputField label="STK platná do" name="stk" type="month" defaultValue={v.stk} error={err("stk")} />
        <InputField label="Spotřeba" name="consumption" defaultValue={v.consumption} placeholder="např. 5,2 l/100 km" error={err("consumption")} />
        <InputField label="Emise" name="emissions" defaultValue={v.emissions} placeholder="např. EURO 6, 136 g/km" error={err("emissions")} />
      </Section>

      <Section title="Další údaje">
        <InputField label="VIN" name="vin" defaultValue={v.vin} maxLength={17} className="font-mono" error={err("vin")} hint="Veřejně se zobrazí jen maskovaný." />
        <InputField label="Počet majitelů" name="owners" type="number" inputMode="numeric" defaultValue={v.owners} error={err("owners")} />
        <SelectField label="Původ" name="origin" defaultValue={v.origin} error={err("origin")}>
          <option value="">—</option>
          {ORIGIN_OPTIONS.map((o) => (
            <option key={o}>{o}</option>
          ))}
          {v.origin && !ORIGIN_OPTIONS.includes(v.origin as (typeof ORIGIN_OPTIONS)[number]) && <option>{v.origin}</option>}
        </SelectField>
        <InputField label="Počet míst" name="seats" type="number" inputMode="numeric" defaultValue={v.seats} error={err("seats")} />
        <InputField label="Počet dveří" name="doors" type="number" inputMode="numeric" defaultValue={v.doors} error={err("doors")} />
        <InputField
          label="URL adresa (slug)"
          name="slug"
          defaultValue={v.slug}
          placeholder={isEdit ? undefined : "vytvoří se automaticky"}
          error={err("slug")}
          hint={isEdit ? "Při změně bude stará adresa přesměrována." : "Např. skoda-octavia-2022. Nechte prázdné."}
        />
      </Section>

      <fieldset className="card p-5">
        <h2 className="mb-4 text-base">Popis</h2>
        <TextareaField label="Popis vozu" name="description" rows={7} defaultValue={v.description} error={err("description")} />
      </fieldset>

      <fieldset className="card p-5">
        <h2 className="mb-4 text-base">Výbava</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(EQUIPMENT_CATEGORY_LABELS) as EquipmentCategory[]).map((cat) => (
            <div key={cat}>
              <h3 className="mb-2 text-sm text-muted">{EQUIPMENT_CATEGORY_LABELS[cat]}</h3>
              <div className="space-y-1.5 text-sm">
                {equipment
                  .filter((i) => i.category === cat)
                  .map((i) => (
                    <label key={i.id} className="flex items-center gap-2">
                      <input type="checkbox" name="equipment" checked={checked.has(i.id)} onChange={() => toggle(i.id)} className="accent-[var(--acc)]" />
                      {i.name}
                    </label>
                  ))}
              </div>
              <div className="mt-2 flex gap-1">
                <input
                  type="text"
                  placeholder="Další položka…"
                  aria-label={`Přidat položku výbavy – ${EQUIPMENT_CATEGORY_LABELS[cat]}`}
                  className="field py-1 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addEquipment(cat, e.currentTarget);
                    }
                  }}
                />
                <button type="button" className="btn-outline btn-sm" onClick={(e) => addEquipment(cat, e.currentTarget.previousElementSibling as HTMLInputElement)}>
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-3 border-t border-line bg-bg/95 px-1 py-3 backdrop-blur">
        <button className="btn" disabled={sending}>
          {sending ? "Ukládám…" : isEdit ? "Uložit změny" : "Uložit a přidat fotky"}
        </button>
        <Link href="/admin/vozidla" className="btn-outline">Zpět</Link>
        {saved && <span className="text-sm text-sold" role="status">✓ Uloženo</span>}
        {Object.keys(fields).length > 0 && <span className="text-sm text-acc">Opravte zvýrazněná pole.</span>}
      </div>
    </form>
  );
}
