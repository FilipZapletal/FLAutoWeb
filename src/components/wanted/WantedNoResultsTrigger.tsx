"use client";

import { useEffect } from "react";
import { WANTED_OPEN_EVENT } from "./events";
import type { Prefill } from "./storage";

/** Návštěvník nic nedělá tolik sekund → nabídneme okno. Jakákoli aktivita odpočet zruší. */
const IDLE_MS = 12_000;
const ACTIVITY = ["pointerdown", "keydown", "scroll", "touchstart", "input", "focusin"] as const;

/**
 * Katalog bez výsledků: okno se nabídne, až když návštěvník chvíli nic nedělá (má čas upravit filtry).
 * Předvyplněno podle filtrů.
 */
export function WantedNoResultsTrigger({ prefill }: { prefill: Prefill }) {
  const key = JSON.stringify(prefill);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const fire = () => window.dispatchEvent(new CustomEvent(WANTED_OPEN_EVENT, { detail: JSON.parse(key) }));
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(fire, IDLE_MS);
    };
    ACTIVITY.forEach((e) => window.addEventListener(e, arm, { passive: true, capture: true }));
    arm();
    return () => {
      clearTimeout(timer);
      ACTIVITY.forEach((e) => window.removeEventListener(e, arm, { capture: true }));
    };
  }, [key]);
  return null;
}
