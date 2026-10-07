"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { parseFilters } from "@/lib/validation/filters";
import { WANTED_OPEN_EVENT } from "./events";
import { filtersToPrefill, meaningfulFilterKeys } from "./prefill";
import { DISMISS_DAYS, hideFor, isHidden, patchSession, type Prefill, readSession, SUBMIT_DAYS } from "./storage";
import { WantedCarForm } from "./WantedCarForm";

/** Exit intent se bere vážně až po chvíli na webu. */
const MIN_TIME_ON_SITE_MS = 8000;

/**
 * Okno „Sehnat auto na přání“. Nabídne se jen návštěvníkovi, který v katalogu hledal
 * (použil filtry) a z nabídky si nevybral (neotevřel detail vozu ani neodeslal poptávku):
 *  1) katalog bez výsledků, 2) návrat zpět z katalogu, 3) pohyb myši k zavření stránky.
 * V jedné návštěvě se ukáže nejvýše jednou a po zavření několik dní vůbec.
 */
export function WantedCarPrompt() {
  const pathname = usePathname();
  // Text dotazu je stabilní hodnota (objekt searchParams se mění při každém vykreslení).
  const query = useSearchParams().toString();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<Prefill>({});
  const isOpen = useRef(false);
  const startedAt = useRef(0);
  /** Čas poslední události „zpět/vpřed“ v prohlížeči (router Next.js ji může zpracovat dřív než my). */
  const lastPopAt = useRef(0);
  const prevPath = useRef<string | null>(null);

  const tryOpen = useCallback((extra: Prefill, opts: { ignoreChosen?: boolean } = {}) => {
    if (isOpen.current || isHidden()) return;
    const session = readSession();
    if (session.shown || (session.chosen && !opts.ignoreChosen)) return;
    patchSession({ shown: true });
    isOpen.current = true;
    setPrefill({ ...(session.prefill ?? {}), ...extra });
    setOpen(true);
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
        if (Date.now() - lastPopAt.current < 2000 && s.engaged && !s.chosen) tryOpen({});
      }, 900);
      return () => clearTimeout(t);
    }
  }, [pathname, query, tryOpen]);

  useEffect(() => {
    startedAt.current = Date.now();
    const onPop = () => {
      lastPopAt.current = Date.now();
    };
    // Myš opustila okno nahoře (k adresnímu řádku nebo záložkám).
    const onLeave = (e: MouseEvent) => {
      if (e.clientY > 0 || Date.now() - startedAt.current < MIN_TIME_ON_SITE_MS) return;
      const s = readSession();
      if (s.engaged && !s.chosen) tryOpen({});
    };
    const onOpenEvent = (e: Event) => tryOpen((e as CustomEvent<Prefill>).detail ?? {}, { ignoreChosen: true });

    window.addEventListener("popstate", onPop);
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener(WANTED_OPEN_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener("popstate", onPop);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener(WANTED_OPEN_EVENT, onOpenEvent);
    };
  }, [tryOpen]);

  /** Zavření okna: uloží, že se několik dní neukáže. Bezpečné volat opakovaně (Esc, tlačítko, pozadí). */
  const finish = useCallback(() => {
    if (!isOpen.current) return;
    isOpen.current = false;
    setOpen(false);
    hideFor(DISMISS_DAYS);
  }, []);

  const closeDialog = useCallback(() => {
    finish();
    dialogRef.current?.close();
  }, [finish]);

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

  return (
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
            patchSession({ chosen: true });
            hideFor(SUBMIT_DAYS);
          }}
          onClose={closeDialog}
        />
      )}
    </dialog>
  );
}
