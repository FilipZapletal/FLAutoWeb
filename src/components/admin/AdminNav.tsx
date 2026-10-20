"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarIcon, CarIcon, GridIcon, HomeIcon, InboxIcon } from "@/components/ui/icons";

type Counts = { newLeads: number; pendingReviews: number };

const MAIN = [
  { href: "/admin", label: "Přehled", Icon: HomeIcon },
  { href: "/admin/poptavky", label: "Poptávky", Icon: InboxIcon, badge: "newLeads" as const },
  { href: "/admin/kalendar", label: "Kalendář", Icon: CalendarIcon },
  { href: "/admin/vozidla", label: "Vozidla", Icon: CarIcon },
];

const MORE = [
  { href: "/admin/analyza", label: "Analýza" },
  { href: "/admin/sluzby", label: "Služby" },
  { href: "/admin/recenze", label: "Recenze", badge: "pendingReviews" as const },
  { href: "/admin/nastaveni", label: "Nastavení" },
  { href: "/admin/spravci", label: "Správci" },
  { href: "/admin/heslo", label: "Změna hesla" },
];

const isActive = (pathname: string, href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

function Badge({ n }: { n: number }) {
  if (n <= 0) return null;
  return <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-acc px-1 text-[10px] font-bold leading-none text-white">{n > 99 ? "99+" : n}</span>;
}

function useLogout() {
  const router = useRouter();
  return async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/prihlaseni");
    router.refresh();
  };
}

/** Postranní menu administrace na počítači a tabletu. Na telefonu místo něj slouží spodní lišta. */
export function AdminNav({ counts }: { counts: Counts }) {
  const pathname = usePathname();
  const logout = useLogout();
  const items = [{ href: "/admin", label: "Dashboard" }, { href: "/admin/kalendar", label: "Kalendář" }, { href: "/admin/vozidla", label: "Vozidla" }, { href: "/admin/poptavky", label: "Poptávky", badge: "newLeads" as const }, ...MORE];
  return (
    <nav className="hidden flex-col gap-2 text-sm md:flex" aria-label="Administrace">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const n = "badge" in item && item.badge ? counts[item.badge] : 0;
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`btn-outline justify-start ${active ? "border-acc text-acc" : ""}`}>
            {item.label}
            {n > 0 && <span className="ml-auto rounded-full bg-acc px-1.5 text-[11px] text-white">{n}</span>}
          </Link>
        );
      })}
      <Link href="/" className="btn-outline justify-start text-muted" target="_blank">
        Zobrazit web ↗
      </Link>
      <button type="button" onClick={logout} className="btn-outline justify-start text-acc">
        Odhlásit
      </button>
    </nav>
  );
}

/** Spodní lišta administrace na telefonu: hlavní činnosti na dosah palce, zbytek pod „Více“. */
export function AdminBottomBar({ counts }: { counts: Counts }) {
  const pathname = usePathname();
  const logout = useLogout();
  // Nabídka „Více“ je otevřená jen na stránce, na které se otevřela (po přechodu jinam se sama zavře).
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const moreActive = MORE.some((m) => isActive(pathname, m.href));
  const itemCls = (active: boolean) => `relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${active ? "text-acc" : "text-muted"}`;

  return (
    <>
      {open && (
        <>
          <button type="button" aria-label="Zavřít nabídku" className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setOpenOn(null)} />
          <div className="card fixed inset-x-3 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-40 p-2 md:hidden" role="menu">
            {MORE.map((m) => (
              <Link key={m.href} href={m.href} role="menuitem" className={`relative flex items-center justify-between rounded-inner px-4 py-3 text-base ${isActive(pathname, m.href) ? "text-acc" : ""}`}>
                {m.label}
                {"badge" in m && m.badge && counts[m.badge] > 0 && <span className="rounded-full bg-acc px-2 text-xs text-white">{counts[m.badge]}</span>}
              </Link>
            ))}
            <div className="mt-1 flex gap-2 border-t border-line pt-2">
              <Link href="/" target="_blank" className="btn-outline flex-1 text-muted">Zobrazit web ↗</Link>
              <button type="button" onClick={logout} className="btn-outline flex-1 text-acc">Odhlásit</button>
            </div>
          </div>
        </>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Administrace – hlavní menu">
        {MAIN.map(({ href, label, Icon, ...rest }) => {
          const active = isActive(pathname, href);
          const n = "badge" in rest && rest.badge ? counts[rest.badge] : 0;
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={itemCls(active)}>
              <span className="relative">
                <Icon size={22} />
                <Badge n={n} />
              </span>
              {label}
            </Link>
          );
        })}
        <button type="button" onClick={() => setOpenOn(open ? null : pathname)} aria-expanded={open} className={itemCls(open || moreActive)}>
          <span className="relative">
            <GridIcon size={22} />
            <Badge n={counts.pendingReviews} />
          </span>
          Více
        </button>
      </nav>
    </>
  );
}
