"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { MAIN_NAV } from "./nav";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Po navigaci menu zavřít.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button type="button" className="btn-outline btn-sm" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Zavřít menu" : "Otevřít menu"} onClick={() => setOpen((o) => !o)}>
        {open ? <CloseIcon size={16} /> : <MenuIcon size={16} />}
      </button>
      {open && (
        <nav id="mobile-menu" className="absolute inset-x-0 top-full border-b border-line/50 bg-bg/85 px-4 pb-4 backdrop-blur-xl" aria-label="Hlavní navigace">
          {MAIN_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="block border-b border-line py-3 font-display text-lg uppercase">
              {item.label}
            </Link>
          ))}
          <Link href="/oblibene" className="block border-b border-line py-3 font-display text-lg uppercase">
            Oblíbená auta
          </Link>
        </nav>
      )}
    </>
  );
}
