"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/vozidla", label: "Vozidla" },
  { href: "/admin/poptavky", label: "Poptávky" },
  { href: "/admin/sluzby", label: "Služby" },
  { href: "/admin/nastaveni", label: "Nastavení" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/prihlaseni");
    router.refresh();
  }

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 text-sm md:flex-col md:overflow-visible" aria-label="Administrace">
      {ITEMS.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`btn-outline justify-start ${active ? "border-acc text-acc" : ""}`}>
            {item.label}
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
