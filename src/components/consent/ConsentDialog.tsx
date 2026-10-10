"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getConsent, saveConsent, useConsent } from "@/lib/consent";

/**
 * Okno „Nastavení soukromí“. Při první návštěvě se ukáže samo, později ho otevře odkaz v patičce.
 * Web nesleduje návštěvníky – souhlas se týká jen pohodlných funkcí uložených v jejich prohlížeči.
 */
export function ConsentDialog() {
  const { ready, decided } = useConsent();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [manual, setManual] = useState(false);
  const [view, setView] = useState<"main" | "settings">("main");
  const [checked, setChecked] = useState(true);
  const open = (ready && !decided) || manual;

  useEffect(() => {
    const onOpen = () => {
      setChecked(getConsent()?.functional ?? true);
      setView("settings");
      setManual(true);
    };
    window.addEventListener("fl:consent-open", onOpen);
    return () => window.removeEventListener("fl:consent-open", onOpen);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function decide(value: boolean) {
    saveConsent(value);
    setManual(false);
    setView("main");
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="consent-title"
      aria-describedby="consent-text"
      // Dokud se návštěvník nerozhodl, okno nejde zavřít klávesou Esc.
      onCancel={(e) => {
        if (!decided) e.preventDefault();
        else setManual(false);
      }}
      className="m-auto max-h-[calc(100dvh-1.5rem)] w-[min(40rem,calc(100vw-1.5rem))] overflow-y-auto rounded-card border border-line bg-card p-0 text-center text-fg shadow-2xl backdrop:bg-black/70"
    >
      {open && (
        <div className="p-6 sm:p-9">
          <h2 id="consent-title" className="border-b border-line pb-4 text-2xl normal-case">
            Nastavení soukromí
          </h2>

          {view === "main" ? (
            <>
              <p id="consent-text" className="mx-auto mt-6 max-w-xl text-sm leading-relaxed sm:text-base">
                Náš web vás nesleduje a nepoužívá analytické ani reklamní cookies. Ukládáme jen to, co je nutné pro jeho fungování, a – pokud
                souhlasíte – pohodlné funkce: světlý či tmavý režim, oblíbená auta a zapamatování zavřeného okna „Auto na přání“. Kliknutím na
                „Souhlasím“ tyto funkce povolíte. Podrobnosti najdete v{" "}
                <Link href="/cookies" className="underline" onClick={() => setManual(false)}>
                  Cookies
                </Link>{" "}
                a{" "}
                <Link href="/ochrana-osobnich-udaju" className="underline" onClick={() => setManual(false)}>
                  Ochraně osobních údajů
                </Link>
                .
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button type="button" className="btn-outline sm:min-w-44" onClick={() => setView("settings")}>
                  Nastavení
                </button>
                <button type="button" className="btn sm:min-w-44" onClick={() => decide(true)} autoFocus>
                  Souhlasím
                </button>
              </div>
              <p className="mt-5 text-sm text-muted">
                Souhlas můžete odmítnout{" "}
                <button type="button" className="text-acc underline underline-offset-2" onClick={() => decide(false)}>
                  zde
                </button>
                .
              </p>
            </>
          ) : (
            <>
              <div id="consent-text" className="mt-6 space-y-3 text-left text-sm">
                <label className="flex items-start gap-3 rounded-inner border border-line p-4 opacity-80">
                  <input type="checkbox" checked disabled className="mt-1 accent-[var(--acc)]" />
                  <span>
                    <strong className="block">Nezbytné – vždy zapnuto</strong>
                    <span className="text-muted">Potvrzení této volby a přihlášení do administrace (jen správci webu). Bez nich web nefunguje správně.</span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-inner border border-line p-4">
                  <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-1 accent-[var(--acc)]" />
                  <span>
                    <strong className="block">Pohodlné funkce</strong>
                    <span className="text-muted">
                      Zapamatuje si váš světlý či tmavý režim, oblíbená auta a to, že jste zavřeli okno „Auto na přání“. Údaje zůstanou jen ve vašem
                      prohlížeči a nikam se neodesílají. Bez souhlasu se oblíbená auta neuchovají po zavření stránky.
                    </span>
                  </span>
                </label>
                <p className="text-muted">
                  Analytické ani reklamní cookies nepoužíváme, proto je tu nenabízíme.
                </p>
              </div>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                {decided && (
                  <button type="button" className="btn-outline sm:min-w-44" onClick={() => setManual(false)}>
                    Zavřít
                  </button>
                )}
                {!decided && (
                  <button type="button" className="btn-outline sm:min-w-44" onClick={() => setView("main")}>
                    Zpět
                  </button>
                )}
                <button type="button" className="btn sm:min-w-44" onClick={() => decide(checked)}>
                  Uložit nastavení
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </dialog>
  );
}
