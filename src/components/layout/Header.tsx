import Link from "next/link";
import { PhoneIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/Logo";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";
import { phoneDigits } from "@/lib/format";
import { SITE_TAGLINE } from "@/lib/site";
import { MobileMenu } from "./MobileMenu";
import { MAIN_NAV } from "./nav";

export function Header({ phone }: { phone: string }) {
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
          <a href={`tel:${phoneDigits(phone)}`} className="btn-outline btn-sm" aria-label={`Zavolat ${phone}`}>
            <PhoneIcon size={16} />
          </a>
          <ThemeSwitch />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
