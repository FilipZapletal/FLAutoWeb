"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { groupPrices, priceText } from "@/components/services/ServicePrice";
import { formatPrice } from "@/lib/format";
import { TIME_SLOT_LABELS } from "@/lib/labels";
import { orderTotal } from "@/lib/order-items";
import type { ServicePrice } from "@/lib/validation/service";
import { FormError, Honeypot, InputField, SelectField, TextareaField } from "./Field";
import { setDateRange } from "./ServiceForm";
import { useJsonSubmit } from "./useJsonSubmit";

/**
 * Objednávka služby s výběrem položek z ceníku (Crystal Finish) → lead typu SERVICE s uloženými položkami.
 * Cena je orientační, server ji vždy přepočítá z ceníku. Termín je nepovinný, majitel ho potvrdí telefonem.
 */
export function ServiceOrderForm({ serviceId, prices, contactName }: { serviceId: number; prices: ServicePrice[]; contactName?: string | null }) {
  const { submit, sending, done, error, fields, reset } = useJsonSubmit("/api/leads");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const groups = useMemo(() => groupPrices(prices), [prices]);
  const chosen = prices.filter((p) => selected.has(p.label));
  const total = orderTotal(chosen);

  function toggle(label: string) {
    setSelected((cur) => {
      const next = new Set(cur);
      if (!next.delete(label)) next.add(label);
      return next;
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (await submit({ ...data, kind: "order", serviceId, items: [...selected] })) {
      form.reset();
      setSelected(new Set());
      window.dispatchEvent(new Event("fl:lead-sent"));
    }
  }

  if (done) {
    return (
      <div className="card max-w-2xl border-sold/40 p-5 text-sm" role="status">
        <p className="font-semibold">Děkujeme, objednávku jsme přijali.</p>
        <p className="mt-1 text-muted">Ozveme se vám a domluvíme přesný termín{contactName ? ` (${contactName})` : ""}.</p>
        <button type="button" onClick={reset} className="mt-2 text-muted underline underline-offset-4">
          Odeslat další objednávku
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card relative grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-4 p-5" noValidate>
      <Honeypot />
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Co chcete objednat? *</legend>
        <div className="space-y-4">
          {groups.map((g, gi) => (
            <div key={gi}>
              {g.title && <h3 className="mb-1 border-b border-line pb-1.5 text-sm text-acc">{g.title}</h3>}
              <ul className="divide-y divide-line">
                {g.rows.map((p) => (
                  <li key={p.label}>
                    <label className="flex cursor-pointer items-start gap-3 py-2.5 text-sm">
                      <input type="checkbox" checked={selected.has(p.label)} onChange={() => toggle(p.label)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--acc)]" />
                      <span className="min-w-0 flex-1">
                        <span className="block">{p.label}</span>
                        {p.note && <span className="block text-xs text-muted">{p.note}</span>}
                      </span>
                      <span className="whitespace-nowrap font-semibold">{priceText(p)}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {fields.items && <p className="mt-2 text-xs text-acc" role="alert">{fields.items}</p>}
        <p className="mt-3 flex items-baseline justify-between gap-3 rounded-inner bg-card2 px-3 py-2 text-sm" aria-live="polite">
          <span className="text-muted">{chosen.length > 0 ? `Vybráno ${chosen.length} ${chosen.length === 1 ? "položka" : chosen.length < 5 ? "položky" : "položek"}` : "Zatím nic nevybráno"}</span>
          <span className="font-semibold">
            {chosen.length > 0 ? `Celkem ${total.fromAny ? "od " : ""}${formatPrice(total.sum)}` : "—"}
          </span>
        </p>
        <p className="mt-1 text-xs text-muted">Cena je orientační, přesnou potvrdíme po prohlídce vozu.</p>
      </fieldset>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2">
        <InputField label="Značka a model vozu" name="car" required capitalize="words" error={fields.car} className="md:col-span-2" />
        <InputField label="Jméno a příjmení" name="name" required autoComplete="name" capitalize="words" error={fields.name} />
        <InputField label="Telefon" name="phone" type="tel" required autoComplete="tel" inputMode="tel" error={fields.phone} />
        <InputField label="E-mail" name="email" type="email" autoComplete="email" hint="Pošleme vám potvrzení objednávky." error={fields.email} className="md:col-span-2" />
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
        <TextareaField label="Poznámka" name="message" rows={3} capitalize="first" placeholder="Např. stav vozu, zvláštní přání" className="md:col-span-2" error={fields.message} />
      </div>
      <FormError message={error} />
      <button className="btn" disabled={sending || selected.size === 0}>
        {sending ? "Odesílám…" : "Odeslat objednávku"}
      </button>
      <p className="text-xs text-muted">
        Odesláním berete na vědomí <Link href="/ochrana-osobnich-udaju" className="underline">zpracování osobních údajů</Link>.
      </p>
    </form>
  );
}
