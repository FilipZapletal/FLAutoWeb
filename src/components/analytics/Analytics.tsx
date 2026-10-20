"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { sendStat, track } from "@/lib/analytics-client";

/** Zaznamená zobrazení stránek a kliknutí na telefon, WhatsApp, e-mail a sociální sítě. Nic se neukládá do zařízení. */
export function Analytics() {
  const pathname = usePathname();
  const first = useRef(true);
  const last = useRef({ path: "", at: 0 });

  useEffect(() => {
    // Stejná stránka dvakrát těsně po sobě (např. vývojový režim) se počítá jednou.
    if (last.current.path === pathname && Date.now() - last.current.at < 2000) return;
    last.current = { path: pathname, at: Date.now() };
    const entry = first.current;
    first.current = false;
    let ref: string | undefined;
    if (entry && document.referrer) {
      try {
        ref = new URL(document.referrer).hostname;
      } catch {}
    }
    sendStat({ type: "view", path: pathname, entry, ref, device: window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop" });
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) track("call");
      else if (/wa\.me|whatsapp\.com/i.test(href)) track("whatsapp");
      else if (href.startsWith("mailto:")) track("email");
      else if (/instagram\.com|facebook\.com/i.test(href)) track("social");
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
