"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeartIcon } from "@/components/ui/icons";
import { isConsentDecided } from "@/lib/consent";
import { parseFilters } from "@/lib/validation/filters";
import { WANTED_OPEN_EVENT } from "./events";
import { filtersToPrefill, meaningfulFilterKeys } from "./prefill";
import {
  autoPopupAllowed,
  bubbleWanted,
  hideBubble,
  markDismissed,
  markShown,
  markSubmitted,
  patchSession,
  type Prefill,
  readSession,
  TIMER_MS,
} from "./storage";
import { WantedCarForm } from "./WantedCarForm";

/** Exit intent (myš k zavření stránky) se bere vážně až po chvíli na webu. */
const MIN_TIME_FOR_EXIT_MS = 30_000;

/** Nejde okno ukázat zrovna teď? (návštěvník píše do formuláře nebo je otevřené jiné okno) */
function userBusy() {
  const el = document.activeElement;
  const typing = el instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) && el.closest("dialog") === null;
  return typing || document.querySelector("dialog[open], [role=dialog]") !== null;
}

/**
 * Okno „Sehnat auto na přání“. Samo se nabídne návštěvníkovi, který nic nevybral a nic neodeslal:
 *  1) katalog bez výsledků, když chvíli nic nedělá, 2) návrat zpět z katalogu po hledání,
 *  3) myš míří k zavření stránky po hledání, 4) po 5 minutách strávených na webu.
 * V jedné návštěvě nejvýše jednou a celkem nejvýše třikrát. Po zavření se zmenší do bublinky
 * na boku stránky, odkud ho lze kdykoli znovu otevřít. Čeká, až se návštěvník rozhodne v okně soukromí.
 */
export function WantedCarPrompt() {
  const pathname = usePathname();
  // Text dotazu je stabilní hodnota (objekt searchParams se mění při každém vykreslení).
  const query = useSearchParams().toString();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [prefill, setPrefill] = useState<Prefill>({});
  const isOpen = useRef(false);
  const startedAt = useRef(0);
  /** Čas poslední události „zpět/vpřed“ v prohlížeči (router Next.js ji může zpracovat dřív než my). */
  const lastPopAt = useRef(0);
  const prevPath = useRef<string | null>(null);

  const openWith = useCallback((extra: Prefill) => {
    isOpen.current = true;
    setPrefill({ ...(readSession().prefill ?? {}), ...extra });
    setBubble(false);
    setOpen(true);
  }, []);

  /** Samovolné zobrazení – s ohledem na souhlas, limity a to, co zrovna návštěvník dělá. Vrací true, když se ukázalo. */
  const tryAutoOpen = useCallback(
    (extra: Prefill, opts: { ignoreChosen?: boolean } = {}) => {
      if (isOpen.current || !isConsentDecided() || !autoPopupAllowed()) return false;
      const s = readSession();
      if (s.shown || s.inquirySent || (s.chosen && !opts.ignoreChosen)) return false;
      if (userBusy()) return false;
      patchSession({ shown: true });
      markShown();
      openWith(extra);
      return true;
    },
    [openWith],
  );

  // Bublinka z minulé návštěvy.
  useEffect(() => {
    const sync = () => setBubble(!isOpen.current && bubbleWanted());
    sync();
    window.addEventListener("fl:consent-changed", sync);
    return () => window.removeEventListener("fl:consent-changed", sync);
  }, []);

  // Sledování, co návštěvník dělá (jen v sessionStorage, bez osobních údajů).
  useEffect(() => {
    const prev = prevPath.current;
    prevPath.current = pathname;

    if (pathname === "/vozy") {
      const filters = parseFilters(new URLSearchParams(query));
      if (meaningfulFilterKeys(filters).length > 0) patchSession({ engaged: true, prefill: filtersToPrefill(filters) });
    } else if (pathname.startsWith("/vozy/")) {
      patchSession({ chosen: true });
    }

    // Odešel z katalogu, aniž by si něco vybral. Jen když šlo o tlačítko Zpět (ne o klik na odkaz).
    if (prev === "/vozy" && pathname !== "/vozy" && !pathname.startsWith("/vozy/")) {
      const t = setTimeout(() => {
        const s = readSession();
        if (Date.now() - lastPopAt.current < 2000 && s.engaged && !s.chosen) tryAutoOpen({});
      }, 900);
      return () => clearTimeout(t);
    }
  }, [pathname, query, tryAutoOpen]);

  useEffect(() => {
    startedAt.current = Date.now();
    const onPop = () => {
      lastPopAt.current = Date.now();
    };
    // Myš opustila okno nahoře (k adresnímu řádku nebo záložkám).
    const onLeave = (e: MouseEvent) => {
      if (e.clientY > 0 || Date.now() - startedAt.current < MIN_TIME_FOR_EXIT_MS) return;
      const s = readSession();
      if (s.engaged && !s.chosen) tryAutoOpen({});
    };
    const onOpenEvent = (e: Event) => tryAutoOpen((e as CustomEvent<Prefill>).detail ?? {}, { ignoreChosen: true });
    // Odeslaná poptávka kdekoli na webu: okno se už samo nabízet nebude.
    const onLeadSent = () => patchSession({ inquirySent: true });

    window.addEventListener("popstate", onPop);
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener(WANTED_OPEN_EVENT, onOpenEvent);
    window.addEventListener("fl:lead-sent", onLeadSent);
    return () => {
      window.removeEventListener("popstate", onPop);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener(WANTED_OPEN_EVENT, onOpenEvent);
      window.removeEventListener("fl:lead-sent", onLeadSent);
    };
  }, [tryAutoOpen]);

  // Časovač: po TIMER_MS aktivního času na webu (karta je vidět) se okno nabídne.
  useEffect(() => {
    let active = readSession().activeMs;
    let fired = false;
    const id = setInterval(() => {
      if (document.visibilityState !== "visible" || fired) return;
      active += 1000;
      if (active % 5000 === 0) patchSession({ activeMs: active });
      if (active >= TIMER_MS && tryAutoOpen({}, { ignoreChosen: true })) fired = true;
    }, 1000);
    return () => {
      clearInterval(id);
      patchSession({ activeMs: active });
    };
  }, [tryAutoOpen]);

  // Otevření/zavření nativního <dialog> (focus trap, Esc a zámek posunu stránky).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /** Zavření okna (Esc, tlačítko, pozadí): zmenší se do bublinky. Bezpečné volat opakovaně. */
  const finish = useCallback(() => {
    if (!isOpen.current) return;
    isOpen.current = false;
    setOpen(false);
    markDismissed();
    setBubble(bubbleWanted());
  }, []);

  const closeDialog = useCallback(() => {
    finish();
    dialogRef.current?.close();
  }, [finish]);

  return (
    <>
      {bubble && !open && (
        <div className="fixed bottom-20 right-3 z-30 flex items-center md:bottom-5 md:right-5">
          <button
            type="button"
            onClick={() => openWith({})}
            className="flex items-center gap-2 rounded-l-full border border-r-0 border-line bg-card py-2.5 pl-4 pr-3 text-sm font-semibold shadow-lg transition-colors hover:border-acc"
          >
            <HeartIcon size={16} className="text-acc" />
            <span className="hidden sm:inline">Hledáte auto na přání?</span>
            <span className="sm:hidden">Auto na přání</span>
          </button>
          <button
            type="button"
            onClick={() => {
              hideBubble();
              setBubble(false);
            }}
            aria-label="Skrýt bublinku"
            title="Skrýt"
            className="rounded-r-full border border-line bg-card py-2.5 pl-2 pr-3 text-muted shadow-lg transition-colors hover:text-fg"
          >
            ×
          </button>
        </div>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="wc-title"
        aria-describedby="wc-desc"
        onClose={finish}
        onCancel={finish}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeDialog();
        }}
        className="m-auto max-h-[calc(100dvh-1.5rem)] w-[min(36rem,calc(100vw-1.5rem))] overflow-y-auto rounded border border-line bg-card p-0 text-fg shadow-2xl backdrop:bg-black/70"
      >
        {open && (
          <WantedCarForm
            prefill={prefill}
            onSent={() => {
              patchSession({ inquirySent: true });
              markSubmitted();
            }}
            onClose={closeDialog}
          />
        )}
      </dialog>
    </>
  );
}
