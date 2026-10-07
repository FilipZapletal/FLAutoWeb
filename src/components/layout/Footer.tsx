import Link from "next/link";
import { FacebookIcon, InstagramIcon } from "@/components/ui/icons";
import { ownerContacts } from "@/lib/contacts";
import type { SiteSettings } from "@/lib/validation/settings";
import { LEGAL_NAV, MAIN_NAV } from "./nav";

export function Footer({ settings }: { settings: SiteSettings }) {
  const contacts = ownerContacts(settings);
  return (
    <footer className="mt-16 border-t border-line pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="mb-3 text-base">FL Auto</h2>
          <p className="text-muted">Prodej · Servis · Mytí · STK</p>
          {(settings.facebookUrl || settings.instagramUrl) && <p className="mt-4 text-xs uppercase tracking-widest">Sledujte nás</p>}
          <div className="mt-2 flex gap-3">
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
          <address className="space-y-3 not-italic text-muted">
            <p>{settings.address}</p>
            {contacts.map((c) => (
              <p key={c.name}>
                <span className="font-semibold text-fg">{c.name}</span>
                {c.phone && (
                  <>
                    <br />
                    <a href={`tel:${c.tel}`} className="hover:text-fg">
                      {c.phone}
                    </a>
                  </>
                )}
                {c.email && (
                  <>
                    <br />
                    <a href={`mailto:${c.email}`} className="break-all hover:text-fg">
                      {c.email}
                    </a>
                  </>
                )}
              </p>
            ))}
          </address>
        </div>
        <div>
          <h2 className="mb-3 text-base">Otevírací doba</h2>
          <p className="text-muted">{settings.openingHours}</p>
          <ul className="mt-2 space-y-1">
            {contacts
              .filter((c) => c.phone)
              .map((c) => (
                <li key={c.name}>
                  <span className="text-muted">{c.firstName}: </span>
                  <a href={`tel:${c.tel}`} className="font-semibold hover:text-acc">
                    {c.phone}
                  </a>
                </li>
              ))}
          </ul>
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
