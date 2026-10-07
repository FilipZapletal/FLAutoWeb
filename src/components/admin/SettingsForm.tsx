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
        <InputField label="DIČ" name="dic" defaultValue={initial.dic ?? ""} error={fields.dic} hint="Včetně předpony CZ. Nechte prázdné, pokud nejste plátce DPH." />
        <InputField label="Sídlo / místo podnikání" name="registeredOffice" defaultValue={initial.registeredOffice ?? ""} error={fields.registeredOffice} className="sm:col-span-2" />
        <InputField label="Zápis v rejstříku" name="registryEntry" defaultValue={initial.registryEntry ?? ""} error={fields.registryEntry} className="sm:col-span-2" hint="Např. „zapsaná v obchodním rejstříku vedeném Krajským soudem v Ostravě, oddíl C, vložka 12345“ nebo „zapsán v živnostenském rejstříku“" />
        <InputField label="Příslušný živnostenský úřad" name="tradeOffice" defaultValue={initial.tradeOffice ?? ""} error={fields.tradeOffice} />
        <InputField label="Účinnost právních textů od" name="legalEffectiveDate" defaultValue={initial.legalEffectiveDate ?? ""} error={fields.legalEffectiveDate} hint="Např. 1. 11. 2026" />
      </fieldset>
      <fieldset className="card grid gap-3 p-5 sm:grid-cols-3">
        <h2 className="text-base sm:col-span-3">Odpovědná osoba za provozovnu a správce osobních údajů</h2>
        <p className="text-xs text-muted sm:col-span-3">Zobrazuje se na Kontaktu, v Obchodních údajích a v Ochraně osobních údajů. Na tento e-mail a telefon se zákazníci obrací s žádostmi o osobní údaje.</p>
        <InputField label="Jméno" name="responsiblePerson" defaultValue={initial.responsiblePerson ?? ""} error={fields.responsiblePerson} />
        <InputField label="Telefon" name="responsiblePhone" defaultValue={initial.responsiblePhone ?? ""} error={fields.responsiblePhone} />
        <InputField label="E-mail" name="responsibleEmail" type="email" defaultValue={initial.responsibleEmail ?? ""} error={fields.responsibleEmail} hint="Chodí sem i upozornění na nové poptávky." />
      </fieldset>
      <fieldset className="card grid gap-3 p-5">
        <h2 className="text-base">Otevírací doba</h2>
        <InputField label="Text otevírací doby" name="openingHours" defaultValue={initial.openingHours} error={fields.openingHours} hint="Zobrazí se v patičce a na Kontaktu. Např. „Pouze po telefonické domluvě“." />
      </fieldset>
      <fieldset className="card grid gap-3 p-5 sm:grid-cols-2">
        <h2 className="text-base sm:col-span-2">Sociální sítě</h2>
        <InputField label="Facebook (URL)" name="facebookUrl" type="url" defaultValue={initial.facebookUrl ?? ""} error={fields.facebookUrl} />
        <InputField label="Instagram (URL)" name="instagramUrl" type="url" defaultValue={initial.instagramUrl ?? ""} error={fields.instagramUrl} />
      </fieldset>
      <fieldset className="card grid gap-3 p-5 sm:grid-cols-3">
        <h2 className="text-base sm:col-span-3">Hodnocení na Googlu</h2>
        <p className="text-xs text-muted sm:col-span-3">Opište aktuální hodnocení z profilu firmy na Googlu. Zobrazí se u recenzí na úvodní stránce a na stránce Servis. Když hodnocení necháte prázdné, nezobrazí se.</p>
        <InputField label="Hodnocení (1–5)" name="googleRating" inputMode="decimal" defaultValue={initial.googleRating?.toLocaleString("cs-CZ") ?? ""} error={fields.googleRating} hint="Např. 4,8" />
        <InputField label="Počet recenzí" name="googleReviewCount" inputMode="numeric" defaultValue={initial.googleReviewCount ?? ""} error={fields.googleReviewCount} />
        <InputField label="Odkaz na recenze (URL)" name="googleReviewsUrl" type="url" defaultValue={initial.googleReviewsUrl ?? ""} error={fields.googleReviewsUrl} hint="Odkaz na profil firmy v Mapách Google" />
      </fieldset>
      <FormError message={error} />
      <div className="flex items-center gap-3">
        <button className="btn" disabled={sending}>{sending ? "Ukládám…" : "Uložit nastavení"}</button>
        {done && <span className="text-sm text-sold" role="status">✓ Uloženo</span>}
      </div>
    </form>
  );
}
