"use client";

import type { FormEvent } from "react";
import { FormError, InputField } from "@/components/forms/Field";
import { useJsonSubmit } from "@/components/forms/useJsonSubmit";
import type { SiteSettings } from "@/lib/validation/settings";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const { submit, sending, done, error, fields } = useJsonSubmit("/api/settings", "PUT");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit(Object.fromEntries(new FormData(e.currentTarget)));
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-5" noValidate>
      <fieldset className="card grid gap-3 p-5 sm:grid-cols-2">
        <h2 className="text-base sm:col-span-2">Kontakt</h2>
        <InputField label="Adresa" name="address" defaultValue={initial.address} error={fields.address} className="sm:col-span-2" />
        <InputField label="Upřesnění k adrese / příjezdu" name="mapNote" defaultValue={initial.mapNote ?? ""} error={fields.mapNote} className="sm:col-span-2" hint="Např. město a PSČ, vjezd z ulice…" />
        <InputField label="Telefon" name="phone" defaultValue={initial.phone} error={fields.phone} hint="Použije se i pro tlačítka Zavolat a WhatsApp." />
        <InputField label="E-mail" name="email" type="email" defaultValue={initial.email} error={fields.email} hint="Sem chodí i upozornění na poptávky (pokud není nastaven ADMIN_NOTIFY_EMAIL)." />
      </fieldset>
      <fieldset className="card grid gap-3 p-5 sm:grid-cols-2">
        <h2 className="text-base sm:col-span-2">Firemní údaje</h2>
        <p className="text-xs text-muted sm:col-span-2">Zobrazují se na stránkách Obchodní údaje, Ochrana osobních údajů a Reklamační řád. Nevyplněné údaje se tam ukážou jako [DOPLNIT …].</p>
        <InputField label="Obchodní firma / jméno podnikatele" name="companyName" defaultValue={initial.companyName ?? ""} error={fields.companyName} className="sm:col-span-2" hint="Např. „FL Auto s.r.o.“ nebo „Jan Novák“" />
        <InputField label="IČO" name="ico" defaultValue={initial.ico ?? ""} error={fields.ico} />
        <InputField label="DIČ" name="dic" defaultValue={initial.dic ?? ""} error={fields.dic} hint="Nechte prázdné, pokud nejste plátce DPH." />
        <InputField label="Sídlo / místo podnikání" name="registeredOffice" defaultValue={initial.registeredOffice ?? ""} error={fields.registeredOffice} className="sm:col-span-2" />
        <InputField label="Zápis v rejstříku" name="registryEntry" defaultValue={initial.registryEntry ?? ""} error={fields.registryEntry} className="sm:col-span-2" hint="Např. „zapsaná v obchodním rejstříku vedeném Krajským soudem v Ostravě, oddíl C, vložka 12345“ nebo „zapsán v živnostenském rejstříku“" />
        <InputField label="Příslušný živnostenský úřad" name="tradeOffice" defaultValue={initial.tradeOffice ?? ""} error={fields.tradeOffice} />
        <InputField label="Účinnost právních textů od" name="legalEffectiveDate" defaultValue={initial.legalEffectiveDate ?? ""} error={fields.legalEffectiveDate} hint="Např. 1. 11. 2026" />
      </fieldset>
      <fieldset className="card grid gap-3 p-5 sm:grid-cols-3">
        <h2 className="text-base sm:col-span-3">Otevírací doba</h2>
        <InputField label="Pondělí – pátek" name="hoursWeekdays" defaultValue={initial.hoursWeekdays} error={fields.hoursWeekdays} />
        <InputField label="Sobota" name="hoursSaturday" defaultValue={initial.hoursSaturday} error={fields.hoursSaturday} />
        <InputField label="Neděle" name="hoursSunday" defaultValue={initial.hoursSunday} error={fields.hoursSunday} />
      </fieldset>
      <fieldset className="card grid gap-3 p-5 sm:grid-cols-2">
        <h2 className="text-base sm:col-span-2">Sociální sítě</h2>
        <InputField label="Facebook (URL)" name="facebookUrl" type="url" defaultValue={initial.facebookUrl ?? ""} error={fields.facebookUrl} />
        <InputField label="Instagram (URL)" name="instagramUrl" type="url" defaultValue={initial.instagramUrl ?? ""} error={fields.instagramUrl} />
      </fieldset>
      <FormError message={error} />
      <div className="flex items-center gap-3">
        <button className="btn" disabled={sending}>{sending ? "Ukládám…" : "Uložit nastavení"}</button>
        {done && <span className="text-sm text-sold" role="status">✓ Uloženo</span>}
      </div>
    </form>
  );
}
