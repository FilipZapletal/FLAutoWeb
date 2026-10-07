import type { Metadata } from "next";
import Link from "next/link";
import { MapEmbed } from "@/components/layout/MapEmbed";
import { ClockIcon, FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/ui/icons";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ownerContacts } from "@/lib/contacts";
import { phoneDigits, whatsappLink } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Adresa, telefony, e-maily a otevírací doba autobazaru FL Auto. Návštěva po telefonické domluvě.",
  alternates: { canonical: "/kontakt" },
};

export default async function ContactPage() {
  const s = await getSettings();
  const contacts = ownerContacts(s);
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.address)}`;

  return (
    <>
      <SectionTitle as="h1" className="mb-6">Kontakt</SectionTitle>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card space-y-4 p-6">
          <p className="flex items-start gap-3">
            <PinIcon className="mt-0.5 shrink-0 text-acc" />
            <span>
              {s.address}
              {s.mapNote && <span className="block text-sm text-muted">{s.mapNote}</span>}
            </span>
          </p>

          {contacts.map((c) => (
            <div key={c.name} className="space-y-2 border-t border-line pt-4">
              <h2 className="text-base">{c.name}</h2>
              {c.phone && (
                <p className="flex items-center gap-3">
                  <PhoneIcon className="shrink-0 text-acc" />
                  <a href={`tel:${c.tel}`} className="font-semibold hover:opacity-80">{c.phone}</a>
                </p>
              )}
              {c.email && (
                <p className="flex items-center gap-3">
                  <MailIcon className="shrink-0 text-acc" />
                  <a href={`mailto:${c.email}`} className="break-all hover:opacity-80">{c.email}</a>
                </p>
              )}
              {c.phone && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <a href={`tel:${c.tel}`} className="btn btn-sm"><PhoneIcon size={14} /> Zavolat</a>
                  <a href={whatsappLink(c.phone)} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm"><WhatsAppIcon size={14} /> WhatsApp</a>
                </div>
              )}
            </div>
          ))}

          <div className="flex items-start gap-3 border-t border-line pt-4">
            <ClockIcon className="mt-0.5 shrink-0 text-acc" />
            <div>
              <h2 className="mb-1 text-base">Otevírací doba</h2>
              <p className="text-sm">{s.openingHours}</p>
              <p className="mt-1 text-xs text-muted">Před návštěvou nám prosím zavolejte, domluvíme si termín:</p>
              <ul className="mt-1 space-y-0.5 text-sm">
                {contacts
                  .filter((c) => c.phone)
                  .map((c) => (
                    <li key={c.name}>
                      <span className="text-muted">{c.name}: </span>
                      <a href={`tel:${c.tel}`} className="font-semibold hover:text-acc">{c.phone}</a>
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          {(s.instagramUrl || s.facebookUrl) && (
            <div className="border-t border-line pt-4">
              <h2 className="mb-2 text-base">Sledujte nás</h2>
              <div className="flex flex-wrap gap-2">
                {s.instagramUrl && (
                  <a href={s.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-outline"><InstagramIcon size={16} /> Instagram</a>
                )}
                {s.facebookUrl && (
                  <a href={s.facebookUrl} target="_blank" rel="noopener noreferrer" className="btn-outline"><FacebookIcon size={16} /> Facebook</a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <MapEmbed address={s.address} />
          <a href={directions} target="_blank" rel="noopener noreferrer" className="btn w-full">Jak se k nám dostanete</a>
        </div>
      </div>

      <section className="card mt-6 p-6">
        <h2 className="mb-3 text-lg">Provozovatel a odpovědná osoba</h2>
        <dl className="grid gap-x-8 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-muted">Provozovatel</dt>
          <dd>{s.companyName ?? "[DOPLNIT]"}{s.ico && `, IČO ${s.ico}`}{s.dic && `, DIČ ${s.dic}`}</dd>
          {s.registeredOffice && (
            <>
              <dt className="text-muted">Sídlo</dt>
              <dd>{s.registeredOffice}</dd>
            </>
          )}
          {s.responsiblePerson && (
            <>
              <dt className="text-muted">Odpovědná osoba</dt>
              <dd>
                {s.responsiblePerson}
                {s.responsiblePhone && <>, <a href={`tel:${phoneDigits(s.responsiblePhone)}`} className="hover:text-acc">{s.responsiblePhone}</a></>}
                {s.responsibleEmail && <>, <a href={`mailto:${s.responsibleEmail}`} className="break-all hover:text-acc">{s.responsibleEmail}</a></>}
              </dd>
            </>
          )}
        </dl>
        <p className="mt-4 text-sm text-muted">Další údaje najdete v <Link href="/obchodni-udaje" className="underline">obchodních údajích</Link>.</p>
      </section>

      <section className="card mt-6 p-6">
        <h2 className="mb-2 text-lg">Provozovna</h2>
        <p className="text-muted">[DOPLNIT: fotografie provozovny]</p>
      </section>
    </>
  );
}
