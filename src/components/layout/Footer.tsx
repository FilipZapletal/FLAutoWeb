import Link from "next/link";
import { FacebookIcon, InstagramIcon } from "@/components/ui/icons";
import { phoneDigits } from "@/lib/format";
import type { SiteSettings } from "@/lib/validation/settings";
import { LEGAL_NAV, MAIN_NAV } from "./nav";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-16 border-t border-line pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="mb-3 text-base">FL Auto</h2>
          <p className="text-muted">Prodej · Servis · Mytí · STK</p>
          <div className="mt-4 flex gap-3">
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted hover:text-fg">
                <FacebookIcon size={20} />
              </a>
            )}
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted hover:text-fg">
                <InstagramIcon size={20} />
              </a>
            )}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-base">Kontakt</h2>
          <address className="space-y-1 not-italic text-muted">
            <p>{settings.address}</p>
            <p>
              <a href={`tel:${phoneDigits(settings.phone)}`} className="hover:text-fg">
                {settings.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${settings.email}`} className="break-all hover:text-fg">
                {settings.email}
              </a>
            </p>
          </address>
        </div>
        <div>
          <h2 className="mb-3 text-base">Otevírací doba</h2>
          <dl className="space-y-1 text-muted">
            <div>Po–Pá: {settings.hoursWeekdays}</div>
            <div>Sobota: {settings.hoursSaturday}</div>
            <div>Neděle: {settings.hoursSunday}</div>
          </dl>
        </div>
        <div>
          <h2 className="mb-3 text-base">Odkazy</h2>
          <ul className="space-y-1 text-muted">
            {[...MAIN_NAV, ...LEGAL_NAV].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="border-t border-line py-5 text-center text-xs text-muted">© {new Date().getFullYear()} FL Auto</p>
    </footer>
  );
}
