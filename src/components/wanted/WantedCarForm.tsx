"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { FormError, Honeypot, InputField, SelectField, TextareaField } from "@/components/forms/Field";
import { useJsonSubmit } from "@/components/forms/useJsonSubmit";
import { BODY_TYPE_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/labels";
import type { Prefill } from "./storage";

const P = "wc-"; // předpona id – na stránce může být i jiný formulář se stejnými poli

const options = (labels: Record<string, string>) =>
  Object.entries(labels).map(([v, l]) => (
    <option key={v} value={v}>
      {l}
    </option>
  ));

type Props = { prefill: Prefill; onSent: () => void; onClose: () => void };

export function WantedCarForm({ prefill, onSent, onClose }: Props) {
  const { submit, sending, done, error, fields } = useJsonSubmit("/api/leads");
  const hasDetails = Boolean(prefill.maxPrice || prefill.yearFrom || prefill.maxMileage || prefill.fuel || prefill.transmission || prefill.bodyType);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (await submit({ ...Object.fromEntries(new FormData(e.currentTarget)), kind: "wanted" })) onSent();
  }

  if (done) {
    return (
      <div className="p-6 text-center" role="status">
        <h2 id="wc-title" className="text-xl">Děkujeme!</h2>
        <p className="mt-3 text-sm">
          Vaši poptávku jsme přijali. Pokusíme se takové auto sehnat a ozveme se vám s odpovědí, zda je poptávka reálná.
        </p>
        <button type="button" onClick={onClose} className="btn mt-5">
          Zavřít
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative grid gap-3 p-5 sm:p-6" noValidate>
      <Honeypot />
      <div>
        <h2 id="wc-title" className="text-xl">Nenašli jste, co hledáte?</h2>
        <p id="wc-desc" className="mt-2 text-sm text-muted">
          Napište nám, jaké auto byste chtěli. Pokusíme se ho pro vás sehnat a ozveme se, zda je poptávka reálná.
        </p>
      </div>

      <InputField idPrefix={P} label="Jaké auto hledáte? *" name="car" required defaultValue={prefill.car} placeholder="Např. Škoda Octavia kombi, diesel, automat" error={fields.car} autoFocus />

      <div className="grid gap-3 sm:grid-cols-2">
        <InputField idPrefix={P} label="Jméno *" name="name" required autoComplete="name" error={fields.name} />
        <InputField idPrefix={P} label="Telefon *" name="phone" type="tel" required autoComplete="tel" inputMode="tel" error={fields.phone} />
        <InputField idPrefix={P} label="E-mail" name="email" type="email" autoComplete="email" error={fields.email} className="sm:col-span-2" hint="Odpověď vám pošleme e-mailem, nebo zavoláme." />
      </div>

      {/* Sbalené pole se odešlou taky – předvyplněné hodnoty z filtrů tedy nepropadnou. */}
      <details className="rounded border border-line p-3" open={Object.keys(fields).some((k) => ["maxPrice", "yearFrom", "maxMileage", "fuel", "transmission", "bodyType", "message"].includes(k))}>
        <summary className="cursor-pointer font-display text-sm uppercase tracking-wide text-muted hover:text-fg">
          Upřesnit požadavky (nepovinné)
          {hasDetails && <span className="ml-2 font-sans text-xs normal-case tracking-normal text-acc">předvyplněno podle vašeho hledání</span>}
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <InputField idPrefix={P} label="Maximální cena (Kč)" name="maxPrice" inputMode="numeric" defaultValue={prefill.maxPrice} error={fields.maxPrice} />
          <InputField idPrefix={P} label="Rok výroby od" name="yearFrom" inputMode="numeric" defaultValue={prefill.yearFrom} error={fields.yearFrom} />
          <InputField idPrefix={P} label="Maximální nájezd (km)" name="maxMileage" inputMode="numeric" defaultValue={prefill.maxMileage} error={fields.maxMileage} />
          <SelectField idPrefix={P} label="Karoserie" name="bodyType" defaultValue={prefill.bodyType ?? ""} error={fields.bodyType}>
            <option value="">Je mi jedno</option>
            {options(BODY_TYPE_LABELS)}
          </SelectField>
          <SelectField idPrefix={P} label="Palivo" name="fuel" defaultValue={prefill.fuel ?? ""} error={fields.fuel}>
            <option value="">Je mi jedno</option>
            {options(FUEL_LABELS)}
          </SelectField>
          <SelectField idPrefix={P} label="Převodovka" name="transmission" defaultValue={prefill.transmission ?? ""} error={fields.transmission}>
            <option value="">Je mi jedno</option>
            {options(TRANSMISSION_LABELS)}
          </SelectField>
          <TextareaField idPrefix={P} label="Další požadavky" name="message" rows={3} className="sm:col-span-2" placeholder="Barva, výbava, vaše představy…" error={fields.message} />
        </div>
      </details>

      <FormError message={error} />

      <div className="flex flex-wrap items-center gap-2">
        <button className="btn" disabled={sending}>
          {sending ? "Odesílám…" : "Odeslat poptávku"}
        </button>
        <button type="button" onClick={onClose} className="btn-outline">
          Ne, děkuji
        </button>
      </div>
      <p className="text-xs text-muted">
        Odesláním berete na vědomí <Link href="/ochrana-osobnich-udaju" className="underline" onClick={onClose}>zpracování osobních údajů</Link>.
      </p>
    </form>
  );
}
