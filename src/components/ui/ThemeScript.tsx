"use client";

import { useLayoutEffect } from "react";

/** Motiv: uložená volba (localStorage), jinak nastavení systému. */
function applyTheme() {
  let t: string | null = null;
  try {
    t = localStorage.getItem("ab_theme");
  } catch {}
  if (t !== "light" && t !== "dark") t = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", t);
}

/**
 * Nastaví motiv ještě před vykreslením (bez probliknutí). Skript se spustí jen
 * z HTML ze serveru. Pokud React vykreslí layout znovu v prohlížeči (např. po
 * chybě), dostane typ „application/json“ – React kvůli němu nehlásí varování
 * a motiv nastaví efekt níže.
 */
export function ThemeScript() {
  useLayoutEffect(() => {
    if (!document.documentElement.dataset.theme) applyTheme();
  }, []);

  return (
    <script
      suppressHydrationWarning
      type={typeof window === "undefined" ? undefined : "application/json"}
      dangerouslySetInnerHTML={{ __html: `(${applyTheme.toString()})()` }}
    />
  );
}
