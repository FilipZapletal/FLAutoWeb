"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FormError, InputField, SelectField, TextareaField } from "@/components/forms/Field";
import { useJsonSubmit } from "@/components/forms/useJsonSubmit";
import { SERVICE_ICON_LABELS } from "@/lib/labels";

export type ServiceFormValues = {
  title: string;
  tag: string;
  icon: string;
  summary: string;
  items: string;
  description: string;
  priceNote: string;
  contactPhone: string;
  metaTitle: string;
  metaDescription: string;
  published: boolean;
  sortOrder: string;
  slug: string;
  prices: { label: string; price: number; from: boolean; group?: string | null; note?: string | null; addon?: boolean }[];
};

type PriceRow = { key: number; label: string; price: string; from: boolean; group: string; note: string; addon: boolean };

let nextKey = 1;
const priceRow = (p?: ServiceFormValues["prices"][number]): PriceRow => ({
  key: nextKey++,
  label: p?.label ?? "",
  price: p ? String(p.price) : "",
  from: p?.from ?? false,
  group: p?.group ?? "",
  note: p?.note ?? "",
  addon: p?.addon ?? false,
});

export function ServiceEditForm({ serviceId, initial }: { serviceId?: number; initial: ServiceFormValues }) {
  const router = useRouter();
  const isEdit = serviceId !== undefined;
  const { submit, sending, error, fields } = useJsonSubmit(isEdit ? `/api/services/${serviceId}` : "/api/services", isEdit ? "PUT" : "POST");
  const [prices, setPrices] = useState<PriceRow[]>(() => initial.prices.map((p) => priceRow(p)));
  const [saved, setSaved] = useState(false);
  const v = initial;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const rows = prices.filter((p) => p.label.trim() || p.price.trim());
    const result = await submit({
      ...data,
      published: data.published === "on",
      prices: rows.map((p) => ({ label: p.label, price: p.price, from: p.from, group: p.group, note: p.note, addon: p.addon })),
    });
    if (!result) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (isEdit) {
      setSaved(true);
      router.refresh();
    } else {
      router.push(`/admin/sluzby/${result.id}`);
    }
  }

  const update = (key: number, patch: Partial<PriceRow>) => setPrices((list) => list.map((p) => (p.key === key ? { ...p, ...patch } : p)));

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-5" noValidate>
      <FormError message={error} />

      <fieldset className="card grid gap-3 p-5 sm:grid-cols-2">
        <h2 className="text-base sm:col-span-2">Základní údaje</h2>
        <InputField label="Název služby *" name="title" defaultValue={v.title} required error={fields.title} className="sm:col-span-2" />
        <InputField label="Štítek" name="tag" defaultValue={v.tag} placeholder="např. Rychle & spolehlivě" error={fields.tag} />
        <SelectField label="Ikona" name="icon" defaultValue={v.icon || "WRENCH"} error={fields.icon}>
          {Object.entries(SERVICE_ICON_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </SelectField>
        <TextareaField label="Krátký popis *" name="summary" rows={2} defaultValue={v.summary} error={fields.summary} className="sm:col-span-2" hint="Zobrazí se na kartě v přehledu služeb i pod nadpisem na stránce služby." />
        <TextareaField label="Co služba zahrnuje" name="items" rows={6} defaultValue={v.items} error={fields.items} className="sm:col-span-2" hint="Každý řádek = jedna odrážka." />
        <TextareaField label="Podrobný popis" name="description" rows={6} defaultValue={v.description} error={fields.description} className="sm:col-span-2" hint="Nepovinné. Zobrazí se jen na stránce služby." />
      </fieldset>

      <fieldset className="card p-5">
        <h2 className="mb-1 text-base">Ceník</h2>
        <p className="mb-4 text-xs text-muted">Bez položek se na webu zobrazí „Cena na dotaz“. Ceny zadávejte v Kč. Položky se stejným nadpisem sekce po sobě se na webu seskupí pod jeden nadpis.</p>
        <div className="grid gap-2">
          {prices.map((p, i) => (
            <div key={p.key} className="grid items-start gap-2 sm:grid-cols-[minmax(0,1fr)_140px_auto_auto]">
              <div>
                <input
                  aria-label={`Položka ${i + 1} – název`}
                  placeholder="např. Přezutí kol"
                  value={p.label}
                  onChange={(e) => update(p.key, { label: e.target.value })}
                  className="field"
                  aria-invalid={fields[`prices.${i}.label`] ? true : undefined}
                />
                {fields[`prices.${i}.label`] && <p className="mt-1 text-xs text-acc">{fields[`prices.${i}.label`]}</p>}
              </div>
              <div>
                <input
                  aria-label={`Položka ${i + 1} – cena v Kč`}
                  placeholder="Kč"
                  inputMode="numeric"
                  value={p.price}
                  onChange={(e) => update(p.key, { price: e.target.value })}
                  className="field"
                  aria-invalid={fields[`prices.${i}.price`] ? true : undefined}
                />
                {fields[`prices.${i}.price`] && <p className="mt-1 text-xs text-acc">{fields[`prices.${i}.price`]}</p>}
              </div>
              <label className="flex items-center gap-2 py-2 text-sm">
                <input type="checkbox" checked={p.from} onChange={(e) => update(p.key, { from: e.target.checked })} className="accent-[var(--acc)]" /> cena „od“
              </label>
              <button type="button" className="btn-outline btn-sm self-center text-acc" onClick={() => setPrices((list) => list.filter((x) => x.key !== p.key))} aria-label={`Odebrat položku ${i + 1}`}>
                Odebrat
              </button>
              <div className="grid gap-2 sm:col-span-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <input aria-label={`Položka ${i + 1} – nadpis sekce`} placeholder="Nadpis sekce (nepovinné, např. Exteriér)" value={p.group} onChange={(e) => update(p.key, { group: e.target.value })} className="field py-1.5 text-sm" />
                <input aria-label={`Položka ${i + 1} – popisek`} placeholder="Popisek pod položkou (nepovinné)" value={p.note} onChange={(e) => update(p.key, { note: e.target.value })} className="field py-1.5 text-sm" />
                <label className="flex items-center gap-2 py-1.5 text-sm" title="Doplněk se nezapočítává do ceny „od“ na kartě služby">
                  <input type="checkbox" checked={p.addon} onChange={(e) => update(p.key, { addon: e.target.checked })} className="accent-[var(--acc)]" /> doplněk
                </label>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="btn-outline btn-sm mt-3" onClick={() => setPrices((list) => [...list, priceRow()])}>
          + Přidat položku ceníku
        </button>
        <InputField label="Poznámka k ceníku" name="priceNote" defaultValue={v.priceNote} error={fields.priceNote} className="mt-4" placeholder="např. Ceny jsou orientační, přesnou cenu sdělíme po prohlídce vozu." />
      </fieldset>

      <fieldset className="card grid gap-3 p-5">
        <h2 className="text-base">Vlastní kontakt služby</h2>
        <InputField label="Telefon služby" name="contactPhone" defaultValue={v.contactPhone} error={fields.contactPhone} placeholder="např. +420 735 231 876" hint="Nepovinné. Je-li vyplněn, je to na stránce služby jediný kontakt a online objednávka se pro službu nenabízí (objednává se jen telefonicky). Kontakty majitelů se tam nezobrazí." />
      </fieldset>

      <fieldset className="card grid gap-3 p-5 sm:grid-cols-2">
        <h2 className="text-base sm:col-span-2">Zobrazení a SEO</h2>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="published" defaultChecked={v.published} className="accent-[var(--acc)]" /> Zobrazit na webu
        </label>
        <InputField label="Pořadí" name="sortOrder" type="number" inputMode="numeric" defaultValue={v.sortOrder} error={fields.sortOrder} hint="Nižší číslo = výš v přehledu." />
        <InputField
          label="URL adresa (slug)"
          name="slug"
          defaultValue={v.slug}
          placeholder={isEdit ? undefined : "vytvoří se z názvu"}
          error={fields.slug}
          hint={isEdit ? "Při změně bude stará adresa přesměrována." : "Např. pneuservis. Nechte prázdné."}
        />
        <InputField label="SEO titulek" name="metaTitle" defaultValue={v.metaTitle} maxLength={70} error={fields.metaTitle} className="sm:col-span-2" hint="Titulek ve výsledcích vyhledávání. Prázdné = název služby." />
        <TextareaField label="SEO popis" name="metaDescription" rows={2} maxLength={170} defaultValue={v.metaDescription} error={fields.metaDescription} className="sm:col-span-2" hint="Do 160 znaků. Prázdné = krátký popis." />
      </fieldset>

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-3 border-t border-line bg-bg/95 px-1 py-3 backdrop-blur">
        <button className="btn" disabled={sending}>
          {sending ? "Ukládám…" : isEdit ? "Uložit změny" : "Vytvořit službu"}
        </button>
        <Link href="/admin/sluzby" className="btn-outline">Zpět</Link>
        {saved && <span className="text-sm text-sold" role="status">✓ Uloženo</span>}
        {Object.keys(fields).length > 0 && <span className="text-sm text-acc">Opravte zvýrazněná pole.</span>}
      </div>
    </form>
  );
}
