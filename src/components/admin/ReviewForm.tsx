"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { FormError, InputField, SelectField, TextareaField } from "@/components/forms/Field";
import { useJsonSubmit } from "@/components/forms/useJsonSubmit";

export type ReviewFormValues = {
  author: string;
  text: string;
  rating: number;
  source: string;
  showOnHome: boolean;
  showOnService: boolean;
  sortOrder: number;
  approved: boolean;
};

export function ReviewForm({ reviewId, initial }: { reviewId?: number; initial: ReviewFormValues }) {
  const router = useRouter();
  const isEdit = reviewId !== undefined;
  const { submit, sending, error, fields } = useJsonSubmit(isEdit ? `/api/reviews/${reviewId}` : "/api/reviews", isEdit ? "PUT" : "POST");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Nezaškrtnuté políčko se ve formuláři neodesílá, proto schválení posíláme výslovně.
    if (await submit({ ...Object.fromEntries(fd), approved: fd.get("approved") === "on" })) {
      router.push("/admin/recenze");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-5" noValidate>
      <fieldset className="card grid gap-3 p-5 sm:grid-cols-2">
        <InputField label="Jméno zákazníka" name="author" defaultValue={initial.author} error={fields.author} hint="Např. „Petr N.“ – zveřejňujte jen se souhlasem zákazníka." />
        <InputField label="Zdroj" name="source" defaultValue={initial.source} error={fields.source} hint="Např. Google, Facebook (nepovinné)" />
        <TextareaField label="Text recenze" name="text" rows={5} defaultValue={initial.text} error={fields.text} className="sm:col-span-2" />
        <SelectField label="Hodnocení" name="rating" defaultValue={String(initial.rating)} error={fields.rating}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{"★".repeat(n)} ({n})</option>
          ))}
        </SelectField>
        <InputField label="Pořadí" name="sortOrder" type="number" min={0} defaultValue={initial.sortOrder} error={fields.sortOrder} hint="Menší číslo = dříve" />
        <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
          <input type="checkbox" name="approved" defaultChecked={initial.approved} /> Schváleno – recenze se smí zobrazit na webu
        </label>
        <div className="flex flex-wrap gap-5 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="showOnHome" defaultChecked={initial.showOnHome} /> Zobrazit na úvodní stránce
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="showOnService" defaultChecked={initial.showOnService} /> Zobrazit na stránce Servis
          </label>
        </div>
      </fieldset>
      <FormError message={error} />
      <div>
        <button className="btn" disabled={sending}>{sending ? "Ukládám…" : isEdit ? "Uložit změny" : "Přidat recenzi"}</button>
      </div>
    </form>
  );
}
