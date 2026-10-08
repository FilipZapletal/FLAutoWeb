"use client";

import { useSyncExternalStore } from "react";

// Souhlas návštěvníka s ukládáním pohodlných funkcí do prohlížeče.
// - Nezbytné údaje (potvrzení této volby, přihlášení do administrace) se ukládají vždy.
// - Pohodlné funkce („functional“): světlý/tmavý režim, oblíbená auta, zapamatování zavřeného okna
//   „Auto na přání“. Bez souhlasu se nezapisují do localStorage.

const KEY = "fl_consent";
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
/** Údaje, které se při odmítnutí pohodlných funkcí smažou. */
const FUNCTIONAL_KEYS = ["ab_theme", "fl_favorites", "fl_wanted"];

export type Consent = { functional: boolean; at: number };

const listeners = new Set<() => void>();
let memory: Consent | null = null; // záloha, když prohlížeč nedovolí zápis (anonymní režim)
let lastRaw: string | null | undefined;
let lastValue: Consent | null = null;

function readStored(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== lastRaw) {
      lastRaw = raw;
      const parsed = raw ? (JSON.parse(raw) as Consent) : null;
      lastValue = parsed && typeof parsed.at === "number" && Date.now() - parsed.at < MAX_AGE_MS ? parsed : null;
    }
    return lastValue;
  } catch {
    return null;
  }
}

/** Aktuální souhlas, nebo null, když se návštěvník ještě nerozhodl (stabilní reference pro React). */
export function getConsent(): Consent | null {
  return readStored() ?? memory;
}

/** Smí se teď do prohlížeče ukládat pohodlné funkce? */
export const canPersist = () => getConsent()?.functional === true;
export const isConsentDecided = () => getConsent() !== null;

function notify() {
  listeners.forEach((l) => l());
  window.dispatchEvent(new Event("fl:consent-changed"));
}

export function saveConsent(functional: boolean) {
  const value: Consent = { functional, at: Date.now() };
  memory = value;
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {}
  if (!functional) {
    for (const k of FUNCTIONAL_KEYS) {
      try {
        localStorage.removeItem(k);
      } catch {}
    }
  }
  notify();
}

/** Otevře okno Nastavení soukromí (odkaz v patičce). */
export const openConsentSettings = () => window.dispatchEvent(new Event("fl:consent-open"));

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** `ready` je false při vykreslení na serveru; `decided` říká, zda už návštěvník volil. */
export function useConsent() {
  const c = useSyncExternalStore(subscribe, getConsent, () => undefined);
  return { ready: c !== undefined, decided: c != null, functional: c?.functional === true };
}
