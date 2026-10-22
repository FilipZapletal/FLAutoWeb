"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { TIME_SLOT_LABELS, VEHICLE_LEAD_TYPE_OPTIONS } from "@/lib/labels";
import { FormError, Honeypot, InputField, SelectField, TextareaField } from "./Field";
import { setDateRange } from "./ServiceForm";
import { useJsonSubmit } from "./useJsonSubmit";

/** Poptávka u konkrétního vozu. */
export function LeadForm({ vehicleId }: { vehicleId: number }) {
  const { submit, sending, done, error, fields, reset } = useJsonSubmit("/api/leads");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (await submit({ ...data, kind: "vehicle", vehicleId })) {
      form.reset();
      window.dispatchEvent(new Event("fl:lead-sent"));
    }
  }

  if (done) {
    return (
      <div className="rounded-inner border border-sold/40 bg-sold/10 p-4 text-sm" role="status">
        <p className="font-semibold">Děkujeme za váš zájem. Autobazar vás bude kontaktovat.</p>
        <p className="mt-1 text-muted">Případný termín je zatím předběžný, ozveme se vám a potvrdíme ho.</p>
        <button type="button" onClick={reset} className="mt-2 text-muted underline underline-offset-4">
          Odeslat další poptávku
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative grid grid-cols-[minmax(0,1fr)] gap-3" noValidate>
      <Honeypot />
      <InputField label="Jméno a příjmení" name="name" required autoComplete="name" capitalize="words" error={fields.name} />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
        <InputField label="Telefon" name="phone" type="tel" required autoComplete="tel" inputMode="tel" error={fields.phone} />
        <InputField label="E-mail" name="email" type="email" autoComplete="email" error={fields.email} hint="Nepovinné – pošleme potvrzení." />
      </div>
      <SelectField label="Typ zájmu" name="type" defaultValue="INTEREST" error={fields.type}>
        {Object.entries(VEHICLE_LEAD_TYPE_OPTIONS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </SelectField>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
        <InputField
          label="Preferovaný den (nepovinné)"
          name="preferredDate"
          type="date"
          ref={setDateRange}
          hint="Pracovní dny, nejdříve od zítřka. Přesný termín domluvíme telefonicky."
          error={fields.preferredDate}
        />
        <SelectField label="Část dne" name="preferredSlot" defaultValue="" error={fields.preferredSlot}>
          <option value="">Bez upřesnění</option>
          {Object.entries(TIME_SLOT_LABELS).map(([k, l]) => (
            <option key={k} value={k}>{l}</option>
          ))}
        </SelectField>
      </div>
      <TextareaField label="Zpráva" name="message" rows={3} capitalize="first" error={fields.message} />
      <FormError message={error} />
      <button className="btn" disabled={sending}>
        {sending ? "Odesílám…" : "Odeslat poptávku"}
      </button>
      <p className="text-xs text-muted">
        Odesláním poptávky berete na vědomí <Link href="/ochrana-osobnich-udaju" className="underline">zpracování osobních údajů</Link>.
      </p>
    </form>
  );
}
