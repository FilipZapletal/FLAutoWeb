"use client";

import { useEffect, useRef } from "react";

/**
 * Přepínač motivu. Nedělá re-render – jen změní data-theme na <html>
 * (animaci zajišťuje CSS) a uloží volbu do localStorage.
 */
export function ThemeSwitch() {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    ref.current?.setAttribute("aria-checked", String(document.documentElement.dataset.theme === "dark"));
  }, []);

  function toggle() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("ab_theme", next);
    } catch {}
    document.querySelectorAll(".theme-switch").forEach((b) => b.setAttribute("aria-checked", String(next === "dark")));
  }

  return (
    <button ref={ref} type="button" className="theme-switch" role="switch" aria-checked="true" aria-label="Tmavý režim" onClick={toggle} suppressHydrationWarning>
      <svg className="ico sun" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg className="ico moon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
      <span className="knob" />
    </button>
  );
}
