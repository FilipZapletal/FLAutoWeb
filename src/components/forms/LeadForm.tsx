"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { VEHICLE_LEAD_TYPE_OPTIONS } from "@/lib/labels";
import { FormError, Honeypot, InputField, SelectField, TextareaField } from "./Field";
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
      <div className="rounded border border-sold/40 bg-sold/10 p-4 text-sm" role="status">
        <p className="font-semibold">Děkujeme za váš zájem. Autobazar vás bude kontaktovat.</p>
        <button type="button" onClick={reset} className="mt-2 text-muted underline underline-offset-4">
          Odeslat další poptávku
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative grid gap-3" noValidate>
      <Honeypot />
      <InputField label="Jméno" name="name" required autoComplete="name" error={fields.name} />
      <div className="grid gap-3 sm:grid-cols-2">
        <InputField label="Telefon" name="phone" type="tel" required autoComplete="tel" inputMode="tel" error={fields.phone} />
        <InputField label="E-mail" name="email" type="email" autoComplete="email" error={fields.email} hint="Nepovinné – pošleme potvrzení." />
      </div>
      <SelectField label="Typ zájmu" name="type" defaultValue="INTEREST" error={fields.type}>
        {Object.entries(VEHICLE_LEAD_TYPE_OPTIONS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </SelectField>
      <TextareaField label="Zpráva" name="message" rows={3} error={fields.message} />
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
