"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { FormError, Honeypot, InputField, TextareaField } from "./Field";
import { useJsonSubmit } from "./useJsonSubmit";

/** Objednávka do servisu → lead typu SERVICE. */
export function ServiceForm() {
  const { submit, sending, done, error, fields, reset } = useJsonSubmit("/api/leads");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (await submit({ ...Object.fromEntries(new FormData(form)), kind: "service" })) form.reset();
  }

  if (done) {
    return (
      <div className="card max-w-2xl border-sold/40 p-5 text-sm" role="status">
        <p className="font-semibold">Děkujeme, váš požadavek jsme přijali a brzy se ozveme.</p>
        <button type="button" onClick={reset} className="mt-2 text-muted underline underline-offset-4">
          Odeslat další požadavek
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card relative grid max-w-2xl gap-3 p-5 md:grid-cols-2" noValidate>
      <Honeypot />
      <InputField label="Jméno" name="name" required autoComplete="name" error={fields.name} />
      <InputField label="Značka a model vozu" name="car" required error={fields.car} />
      <InputField label="Telefon" name="phone" type="tel" required autoComplete="tel" inputMode="tel" error={fields.phone} />
      <InputField label="E-mail" name="email" type="email" autoComplete="email" error={fields.email} />
      <TextareaField label="Poznámka" name="message" rows={3} placeholder="Co je potřeba udělat / STK do kdy platí" className="md:col-span-2" error={fields.message} />
      <div className="md:col-span-2">
        <FormError message={error} />
      </div>
      <button className="btn md:col-span-2" disabled={sending}>
        {sending ? "Odesílám…" : "Odeslat poptávku servisu"}
      </button>
      <p className="text-xs text-muted md:col-span-2">
        Odesláním berete na vědomí <Link href="/ochrana-osobnich-udaju" className="underline">zpracování osobních údajů</Link>.
      </p>
    </form>
  );
}
