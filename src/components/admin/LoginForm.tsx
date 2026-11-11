"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FormError, InputField } from "@/components/forms/Field";
import { useJsonSubmit } from "@/components/forms/useJsonSubmit";

export function LoginForm() {
  const router = useRouter();
  const login = useJsonSubmit("/api/auth/login");
  const mfa = useJsonSubmit("/api/auth/mfa");
  const [needCode, setNeedCode] = useState(false);

  function finish(recoveryLeft?: number) {
    if (typeof recoveryLeft === "number") {
      alert(`Přihlásili jste se záložním kódem. Zbývá vám ${recoveryLeft} záložních kódů – nové si vygenerujte v sekci Heslo a 2FA.`);
    }
    router.replace("/admin");
    router.refresh();
  }

  async function onLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = await login.submit(Object.fromEntries(new FormData(e.currentTarget)));
    if (!data) return;
    if (data.mfa) setNeedCode(true);
    else finish();
  }

  async function onCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = await mfa.submit(Object.fromEntries(new FormData(e.currentTarget)));
    if (data) finish(data.recoveryLeft);
  }

  if (needCode) {
    return (
      <form key="code" method="post" onSubmit={onCode} className="grid gap-3">
        <p className="text-sm text-muted">Zadejte 6místný kód z ověřovací aplikace v telefonu.</p>
        <InputField
          label="Ověřovací kód"
          name="code"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={20}
          hint="Nemáte telefon? Zadejte jeden ze záložních kódů."
        />
        <FormError message={mfa.error} />
        <button className="btn" disabled={mfa.sending}>
          {mfa.sending ? "Ověřuji…" : "Ověřit"}
        </button>
        <button
          type="button"
          className="text-sm text-muted underline"
          onClick={() => {
            setNeedCode(false);
            mfa.reset();
            login.reset();
          }}
        >
          Zpět na přihlášení
        </button>
      </form>
    );
  }

  return (
    <form key="login" method="post" onSubmit={onLogin} className="grid gap-3">
      <InputField label="E-mail" name="email" type="email" required autoComplete="username" autoFocus />
      <InputField label="Heslo" name="password" type="password" required autoComplete="current-password" />
      <FormError message={login.error} />
      <button className="btn" disabled={login.sending}>
        {login.sending ? "Přihlašuji…" : "Přihlásit"}
      </button>
    </form>
  );
}
