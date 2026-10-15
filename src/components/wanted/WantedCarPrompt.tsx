"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { isConsentDecided } from "@/lib/consent";
import { parseFilters } from "@/lib/validation/filters";
import { WANTED_OPEN_EVENT } from "./events";
import { filtersToPrefill, meaningfulFilterKeys } from "./prefill";
import {
  autoPopupAllowed,
  BUBBLE_AFTER_MS,
  bubbleWanted,
  hideBubble,
  markShown,
  markSubmitted,
  patchSession,
  type Prefill,
  readSession,
  showBubble,
  TIMER_MS,
} from "./storage";
import { armChime } from "@/lib/chime";
import { WantedBubble } from "./WantedBubble";
import { WantedCarForm } from "./WantedCarForm";

/** Exit intent (myš k zavření stránky) se bere vážně až po chvíli na webu. */
const MIN_TIME_FOR_EXIT_MS = 30_000;
/** Mobil (bez myši): tolik vteřin bez dotyku a posouvání se bere jako „přemýšlí“. */
const MOBILE_IDLE_MS = 20_000;
const ACTIVITY = ["pointerdown", "keydown", "scroll", "touchstart", "input", "focusin"] as const;

/** Nejde okno ukázat zrovna teď? (návštěvník píše do formuláře nebo je otevřené jiné okno) */
function userBusy() {
  const el = document.activeElement;
  const typing = el instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) && el.closest("dialog") === null;
  return typing || document.querySelector("dialog[open], [role=dialog]") !== null;
}

/**
 * Okno „Sehnat auto na přání“. Samo se nabídne návštěvníkovi, který nic nevybral a nic neodeslal:
 *  1) katalog bez výsledků, když chvíli nic nedělá, 2) návrat zpět z katalogu po hledání,
 *  3) myš míří k zavření stránky po hledání (na mobilu místo toho: po hledání chvíli nic nedělá,
 *     nebo odejde do jiné aplikace a vrátí se), 4) po 5 minutách strávených na webu.
 * V jedné návštěvě nejvýše jednou a celkem nejvýše třikrát. Čeká, až se návštěvník rozhodne v okně soukromí.
 * Bublinka v rohu úvodní stránky (Auto na přání + služby servisu) se objeví po minutě na webu, nebo po zavření okna.
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

  /** Bublinka se ukazuje jen na úvodní stránce, až se návštěvník rozhodl v okně soukromí a neskryl ji. */
  const syncBubble = useCallback(() => {
    setBubble(pathname === "/" && !isOpen.current && isConsentDecided() && bubbleWanted());
  }, [pathname]);

  useEffect(armChime, []);

  useEffect(() => {
    syncBubble();
    window.addEventListener("fl:consent-changed", syncBubble);
    return () => window.removeEventListener("fl:consent-changed", syncBubble);
  }, [syncBubble]);

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

    // Mobil nemá myš, takže „míří k zavření“ nahrazuje nečinnost a návrat do karty.
    const touch = window.matchMedia("(hover: none)").matches;
    let idle: ReturnType<typeof setTimeout> | undefined;
    const thinking = () => {
      const wait = MIN_TIME_FOR_EXIT_MS - (Date.now() - startedAt.current);
      if (wait > 0) {
        // Na webu je teprve chvíli: zkusí se to znovu, až uplyne minimální doba.
        clearTimeout(idle);
        idle = setTimeout(thinking, wait);
        return;
      }
      const s = readSession();
      if (s.engaged && !s.chosen) tryAutoOpen({});
    };
    const armIdle = () => {
      clearTimeout(idle);
      idle = setTimeout(thinking, MOBILE_IDLE_MS);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") thinking();
    };
    if (touch) {
      ACTIVITY.forEach((e) => window.addEventListener(e, armIdle, { passive: true, capture: true }));
      document.addEventListener("visibilitychange", onVisible);
      armIdle();
    }

    window.addEventListener("popstate", onPop);
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener(WANTED_OPEN_EVENT, onOpenEvent);
    window.addEventListener("fl:lead-sent", onLeadSent);
    return () => {
      clearTimeout(idle);
      if (touch) {
        ACTIVITY.forEach((e) => window.removeEventListener(e, armIdle, { capture: true }));
        document.removeEventListener("visibilitychange", onVisible);
      }
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
      if (active >= BUBBLE_AFTER_MS && !readSession().bubbleOn) {
        showBubble();
        syncBubble();
      }
      if (active >= TIMER_MS && tryAutoOpen({}, { ignoreChosen: true })) fired = true;
    }, 1000);
    return () => {
      clearInterval(id);
      patchSession({ activeMs: active });
    };
  }, [tryAutoOpen, syncBubble]);

  // Otevření/zavření nativního <dialog> (focus trap, Esc a zámek posunu stránky).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Na telefonu se kvůli prvnímu poli nemá hned vysunout klávesnice: focus dostane okno samotné.
      if (window.matchMedia("(hover: none)").matches) dialog.focus({ preventScroll: true });
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
    showBubble();
    patchSession({ chimed: true }); // po zavření okna bublinka bez zvuku
    syncBubble();
  }, [syncBubble]);

  const closeDialog = useCallback(() => {
    finish();
    dialogRef.current?.close();
  }, [finish]);

  return (
    <>
      {bubble && !open && <WantedBubble onOpenWanted={() => openWith({})} onHide={() => { hideBubble(); setBubble(false); }} />}

      <dialog
        ref={dialogRef}
        aria-labelledby="wc-title"
        aria-describedby="wc-desc"
        tabIndex={-1}
        onClose={finish}
        onCancel={finish}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeDialog();
        }}
        className="m-auto max-h-[calc(100dvh-1.5rem)] outline-none w-[min(36rem,calc(100vw-1.5rem))] overflow-y-auto rounded-card border border-line bg-card p-0 text-fg shadow-2xl backdrop:bg-black/70"
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
