"use client";

import { useEffect } from "react";
import { WANTED_OPEN_EVENT } from "./events";
import type { Prefill } from "./storage";

/** Katalog bez výsledků: po chvilce vyzve k vyplnění „auta na přání“ (předvyplněného podle filtrů). */
export function WantedNoResultsTrigger({ prefill }: { prefill: Prefill }) {
  const key = JSON.stringify(prefill);
  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new CustomEvent(WANTED_OPEN_EVENT, { detail: JSON.parse(key) })), 1500);
    return () => clearTimeout(t);
  }, [key]);
  return null;
}
