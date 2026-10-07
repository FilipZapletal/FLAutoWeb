import Link from "next/link";
import { PhoneIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/Logo";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";
import type { OwnerContact } from "@/lib/contacts";
import { SITE_TAGLINE } from "@/lib/site";
import { MobileMenu } from "./MobileMenu";
import { MAIN_NAV } from "./nav";

export function Header({ contacts }: { contacts: OwnerContact[] }) {
  const callable = contacts.filter((c) => c.tel);
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="FL Auto – úvodní stránka">
          <Logo height={40} priority sizes="100px" />
          <span className="ml-1 hidden text-[10px] uppercase tracking-widest text-muted lg:block">{SITE_TAGLINE}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Hlavní navigace">
          {MAIN_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition-opacity hover:opacity-70">
              {item.label}
            </Link>
          ))}
          <Link href="/admin" className="btn-outline btn-sm" prefetch={false}>
            Admin
          </Link>
          <ThemeSwitch />
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          {callable.length === 1 ? (
            <a href={`tel:${callable[0].tel}`} className="btn-outline btn-sm" aria-label={`Zavolat ${callable[0].phone}`}>
              <PhoneIcon size={16} />
            </a>
          ) : (
            callable.length > 1 && (
              <details className="relative">
                <summary className="btn-outline btn-sm list-none [&::-webkit-details-marker]:hidden" aria-label="Zavolat">
                  <PhoneIcon size={16} />
                </summary>
                <ul className="absolute right-0 top-full z-40 mt-2 w-60 rounded border border-line bg-card p-2 shadow-xl">
                  {callable.map((c) => (
                    <li key={c.name}>
                      <a href={`tel:${c.tel}`} className="block rounded px-3 py-2 hover:bg-card2">
                        <span className="block text-xs text-muted">{c.name}</span>
                        <span className="font-semibold">{c.phone}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            )
          )}
          <ThemeSwitch />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
