"use client";

import type { FormEvent } from "react";
import { FormError, InputField } from "@/components/forms/Field";
import { useJsonSubmit } from "@/components/forms/useJsonSubmit";

export function PasswordForm() {
  const { submit, sending, done, error, fields } = useJsonSubmit("/api/auth/password", "PUT");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (await submit(Object.fromEntries(new FormData(form)))) form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="card grid max-w-md gap-3 p-5">
      <InputField label="Současné heslo" name="currentPassword" type="password" required autoComplete="current-password" error={fields.currentPassword} />
      <InputField label="Nové heslo" name="newPassword" type="password" required minLength={10} autoComplete="new-password" error={fields.newPassword} hint="Alespoň 10 znaků." />
      <InputField label="Nové heslo znovu" name="confirmPassword" type="password" required autoComplete="new-password" error={fields.confirmPassword} />
      <FormError message={error} />
      <div className="flex items-center gap-3">
        <button className="btn" disabled={sending}>
          {sending ? "Ukládám…" : "Změnit heslo"}
        </button>
        {done && <span className="text-sm text-sold" role="status">✓ Heslo změněno</span>}
      </div>
    </form>
  );
}
