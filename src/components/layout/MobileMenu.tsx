"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ServiceIconView } from "@/components/services/ServiceIconView";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import type { ServiceIcon } from "@/generated/prisma/enums";
import { MAIN_NAV } from "./nav";

export type MenuService = { slug: string; title: string; icon: ServiceIcon };

export function MobileMenu({ services }: { services: MenuService[] }) {
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
        <nav id="mobile-menu" className="absolute inset-x-0 top-full border-b border-line/50 bg-bg/97 px-4 pb-4 backdrop-blur-xl" aria-label="Hlavní navigace">
          {MAIN_NAV.map((item) => (
            <div key={item.href}>
              <Link href={item.href} className={`block py-3 font-display text-lg uppercase ${item.href === "/servis" && services.length > 0 ? "" : "border-b border-line"}`}>
                {item.label}
              </Link>
              {/* Služby zvlášť, aby je návštěvník našel hned a nemusel nejdřív otevírat přehled Servis. */}
              {item.href === "/servis" && services.length > 0 && (
                <ul className="mb-1 border-b border-line pb-2 pl-3">
                  {services.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/servis/${s.slug}`} className="flex items-center gap-3 py-2 text-base">
                        <span className="text-acc"><ServiceIconView icon={s.icon} size={18} /></span>
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <Link href="/oblibene" className="block border-b border-line py-3 font-display text-lg uppercase">
            Oblíbená auta
          </Link>
        </nav>
      )}
    </>
  );
}
