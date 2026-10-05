"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { FormError, InputField } from "@/components/forms/Field";
import { useJsonSubmit } from "@/components/forms/useJsonSubmit";

export function LoginForm() {
  const router = useRouter();
  const { submit, sending, error } = useJsonSubmit("/api/auth/login");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (await submit(Object.fromEntries(new FormData(e.currentTarget)))) {
      router.replace("/admin");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <InputField label="E-mail" name="email" type="email" required autoComplete="username" autoFocus />
      <InputField label="Heslo" name="password" type="password" required autoComplete="current-password" />
      <FormError message={error} />
      <button className="btn" disabled={sending}>
        {sending ? "Přihlašuji…" : "Přihlásit"}
      </button>
    </form>
  );
}
