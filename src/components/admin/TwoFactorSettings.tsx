"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FormError, InputField } from "@/components/forms/Field";
import { useJsonSubmit } from "@/components/forms/useJsonSubmit";

type Props = { enabled: boolean; enabledAt: string | null; recoveryLeft: number };

const codeField = { name: "code", required: true, inputMode: "numeric", autoComplete: "one-time-code", maxLength: 20 } as const;

/** Dvoufázové ověření (TOTP) – zapnutí s QR kódem, záložní kódy, vypnutí. */
export function TwoFactorSettings({ enabled, enabledAt, recoveryLeft }: Props) {
  const router = useRouter();
  const setup = useJsonSubmit("/api/auth/2fa/setup");
  const enable = useJsonSubmit("/api/auth/2fa");
  const regenerate = useJsonSubmit("/api/auth/2fa", "PUT");
  const disable = useJsonSubmit("/api/auth/2fa", "DELETE");
  const [pending, setPending] = useState<{ secret: string; qr: string } | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [mode, setMode] = useState<"idle" | "regenerate" | "disable">("idle");

  const send = (s: typeof enable) => async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    return s.submit(Object.fromEntries(new FormData(e.currentTarget)));
  };

  if (codes) {
    return (
      <section className="card grid max-w-md gap-3 p-5">
        <h2 className="text-lg font-bold">Záložní kódy</h2>
        <p className="text-sm">
          Uložte si je na bezpečné místo (vytisknout, správce hesel). Každý platí jen jednou a použijete ho, když nebudete
          mít po ruce telefon. <strong>Znovu se už nezobrazí.</strong>
        </p>
        <ul className="grid grid-cols-2 gap-2 rounded-inner bg-card2 p-3 font-mono text-sm">
          {codes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-outline btn-sm" onClick={() => navigator.clipboard?.writeText(codes.join("\n"))}>
            Kopírovat
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              setCodes(null);
              setMode("idle");
              router.refresh();
            }}
          >
            Mám uloženo
          </button>
        </div>
      </section>
    );
  }

  if (!enabled) {
    return (
      <section className="card grid max-w-md gap-3 p-5">
        <h2 className="text-lg font-bold">Dvoufázové ověření (2FA)</h2>
        <p className="text-sm text-muted">
          Při přihlášení budete kromě hesla zadávat i 6místný kód z aplikace v telefonu (Google Authenticator, Microsoft
          Authenticator apod.). Ukradené heslo pak samo nestačí.
        </p>
        {!pending ? (
          <>
            <FormError message={setup.error} />
            <button
              type="button"
              className="btn"
              disabled={setup.sending}
              onClick={async () => {
                const data = await setup.submit({});
                if (data) setPending(data);
              }}
            >
              {setup.sending ? "Připravuji…" : "Zapnout 2FA"}
            </button>
          </>
        ) : (
          <form
            className="grid gap-3"
            onSubmit={async (e) => {
              const data = await send(enable)(e);
              if (data) setCodes(data.recoveryCodes);
            }}
          >
            <ol className="ml-5 list-decimal space-y-1 text-sm">
              <li>V aplikaci zvolte přidání účtu a naskenujte QR kód.</li>
              <li>Opište 6místný kód, který aplikace ukáže, a potvrďte heslem.</li>
            </ol>
            {/* eslint-disable-next-line @next/next/no-img-element -- QR je data: URL vygenerované serverem */}
            <img src={pending.qr} alt="QR kód pro ověřovací aplikaci" width={200} height={200} className="rounded-inner bg-white p-2" />
            <p className="text-xs text-muted">
              Nejde naskenovat? Zadejte klíč ručně: <code className="break-all font-mono">{pending.secret}</code>
            </p>
            <InputField label="Kód z aplikace" {...codeField} autoFocus error={enable.fields.code} />
            <InputField label="Vaše heslo" name="password" type="password" required autoComplete="current-password" error={enable.fields.password} />
            <FormError message={enable.error} />
            <button className="btn" disabled={enable.sending}>
              {enable.sending ? "Ověřuji…" : "Ověřit a zapnout"}
            </button>
          </form>
        )}
      </section>
    );
  }

  return (
    <section className="card grid max-w-md gap-3 p-5">
      <h2 className="text-lg font-bold">Dvoufázové ověření (2FA)</h2>
      <p className="text-sm">
        <span className="font-semibold text-sold">✓ Zapnuto</span>
        {enabledAt && <span className="text-muted"> od {new Date(enabledAt).toLocaleDateString("cs-CZ")}</span>}. Zbývá{" "}
        {recoveryLeft} záložních kódů.
      </p>
      {recoveryLeft <= 2 && <p className="text-sm text-acc">Dochází vám záložní kódy – vygenerujte si nové.</p>}

      {mode === "idle" && (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-outline btn-sm" onClick={() => setMode("regenerate")}>
            Nové záložní kódy
          </button>
          <button type="button" className="btn-outline btn-sm text-acc" onClick={() => setMode("disable")}>
            Vypnout 2FA
          </button>
        </div>
      )}

      {mode === "regenerate" && (
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            const data = await send(regenerate)(e);
            if (data) setCodes(data.recoveryCodes);
          }}
        >
          <p className="text-sm text-muted">Staré záložní kódy přestanou platit.</p>
          <InputField label="Kód z aplikace" {...codeField} autoFocus error={regenerate.fields.code} />
          <FormError message={regenerate.error} />
          <div className="flex gap-2">
            <button className="btn btn-sm" disabled={regenerate.sending}>
              Vygenerovat
            </button>
            <button type="button" className="btn-outline btn-sm" onClick={() => setMode("idle")}>
              Zrušit
            </button>
          </div>
        </form>
      )}

      {mode === "disable" && (
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            if (await send(disable)(e)) {
              setMode("idle");
              router.refresh();
            }
          }}
        >
          <p className="text-sm text-muted">Bez 2FA bude k přihlášení stačit jen heslo. Nedoporučujeme.</p>
          <InputField label="Vaše heslo" name="password" type="password" required autoComplete="current-password" error={disable.fields.password} />
          <InputField label="Kód z aplikace nebo záložní kód" {...codeField} error={disable.fields.code} />
          <FormError message={disable.error} />
          <div className="flex gap-2">
            <button className="btn btn-sm" disabled={disable.sending}>
              Vypnout 2FA
            </button>
            <button type="button" className="btn-outline btn-sm" onClick={() => setMode("idle")}>
              Zrušit
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
