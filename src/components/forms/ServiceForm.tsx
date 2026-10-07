"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { bookingRange } from "@/lib/booking";
import { TIME_SLOT_LABELS } from "@/lib/labels";
import { FormError, Honeypot, InputField, SelectField, TextareaField } from "./Field";
import { useJsonSubmit } from "./useJsonSubmit";

/**
 * Rozsah kalendáře se nastaví až v prohlížeči podle dnešního data (HTML stránky
 * může pocházet z cache a nemá se lišit mezi serverem a klientem). Kontroluje se i na serveru.
 */
function setDateRange(el: HTMLInputElement | null) {
  if (!el) return;
  const { min, max } = bookingRange();
  el.min = min;
  el.max = max;
}

type Props = { services?: { id: number; title: string }[]; serviceId?: number };

/** Objednávka do servisu s preferovaným termínem → lead typu SERVICE (volitelně s vybranou službou). */
export function ServiceForm({ services = [], serviceId }: Props) {
  const { submit, sending, done, error, fields, reset } = useJsonSubmit("/api/leads");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (await submit({ ...Object.fromEntries(new FormData(form)), kind: "service" })) form.reset();
  }

  if (done) {
    return (
      <div className="card max-w-2xl border-sold/40 p-5 text-sm" role="status">
        <p className="font-semibold">Děkujeme, objednávku jsme přijali.</p>
        <p className="mt-1 text-muted">Termín je zatím předběžný, ozveme se vám a potvrdíme ho.</p>
        <button type="button" onClick={reset} className="mt-2 text-muted underline underline-offset-4">
          Odeslat další objednávku
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card relative grid max-w-2xl gap-3 p-5 md:grid-cols-2" noValidate>
      <Honeypot />
      {services.length > 0 && (
        <SelectField label="Služba" name="serviceId" defaultValue={serviceId ?? ""} error={fields.serviceId} className="md:col-span-2">
          <option value="">Nevím / více služeb</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </SelectField>
      )}
      <InputField
        label="Preferovaný den"
        name="preferredDate"
        type="date"
        required
        ref={setDateRange}
        hint="Pracovní dny, nejdříve od zítřka. Sobotu domluvíme telefonicky."
        error={fields.preferredDate}
      />
      <SelectField label="Část dne" name="preferredSlot" required defaultValue="" error={fields.preferredSlot}>
        <option value="" disabled>Vyberte</option>
        {Object.entries(TIME_SLOT_LABELS).map(([k, l]) => (
          <option key={k} value={k}>{l}</option>
        ))}
      </SelectField>
      <InputField label="Značka a model vozu" name="car" required error={fields.car} />
      <InputField label="Jméno" name="name" required autoComplete="name" error={fields.name} />
      <InputField label="Telefon" name="phone" type="tel" required autoComplete="tel" inputMode="tel" error={fields.phone} />
      <InputField label="E-mail" name="email" type="email" autoComplete="email" hint="Pošleme vám potvrzení objednávky." error={fields.email} />
      <TextareaField label="Poznámka" name="message" rows={3} placeholder="Co je potřeba udělat / STK do kdy platí" className="md:col-span-2" error={fields.message} />
      <div className="md:col-span-2">
        <FormError message={error} />
      </div>
      <button className="btn md:col-span-2" disabled={sending}>
        {sending ? "Odesílám…" : "Objednat termín"}
      </button>
      <p className="text-xs text-muted md:col-span-2">
        Odesláním berete na vědomí <Link href="/ochrana-osobnich-udaju" className="underline">zpracování osobních údajů</Link>.
      </p>
    </form>
  );
}
