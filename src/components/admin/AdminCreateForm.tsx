"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { FormError, InputField } from "@/components/forms/Field";
import { useJsonSubmit } from "@/components/forms/useJsonSubmit";

export function AdminCreateForm() {
  const router = useRouter();
  const { submit, sending, done, error, fields } = useJsonSubmit("/api/admins", "POST");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (await submit(Object.fromEntries(new FormData(form)))) {
      form.reset();
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="card grid max-w-md gap-3 p-5">
      <h2 className="font-display text-lg">Přidat správce</h2>
      <InputField label="E-mail" name="email" type="email" required autoComplete="off" error={fields.email} />
      <InputField label="Dočasné heslo" name="password" type="password" required minLength={10} autoComplete="new-password" error={fields.password} hint="Alespoň 10 znaků. Nový správce si ho po přihlášení změní v Změna hesla." />
      <InputField label="Dočasné heslo znovu" name="confirmPassword" type="password" required autoComplete="new-password" error={fields.confirmPassword} />
      <InputField label="Vaše heslo" name="currentPassword" type="password" required autoComplete="current-password" error={fields.currentPassword} hint="Pro potvrzení, že účet zakládáte opravdu vy." />
      <FormError message={error} />
      <div className="flex items-center gap-3">
        <button className="btn" disabled={sending}>
          {sending ? "Ukládám…" : "Přidat správce"}
        </button>
        {done && <span className="text-sm text-sold" role="status">✓ Správce přidán</span>}
      </div>
    </form>
  );
}
