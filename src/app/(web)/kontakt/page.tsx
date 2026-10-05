import type { Metadata } from "next";
import { MapEmbed } from "@/components/layout/MapEmbed";
import { ClockIcon, FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/ui/icons";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { phoneDigits, whatsappLink } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Adresa, telefon, e-mail a otevírací doba autobazaru FL Auto.",
  alternates: { canonical: "/kontakt" },
};

export default async function ContactPage() {
  const s = await getSettings();
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
          <p className="flex items-center gap-3">
            <PhoneIcon className="shrink-0 text-acc" />
            <a href={`tel:${phoneDigits(s.phone)}`} className="font-semibold hover:opacity-80">{s.phone}</a>
          </p>
          <p className="flex items-center gap-3">
            <MailIcon className="shrink-0 text-acc" />
            <a href={`mailto:${s.email}`} className="break-all hover:opacity-80">{s.email}</a>
          </p>
          <div className="flex items-start gap-3 border-t border-line pt-4">
            <ClockIcon className="mt-0.5 shrink-0 text-acc" />
            <div>
              <h2 className="mb-1 text-base">Otevírací doba</h2>
              <dl className="text-sm">
                <div><dt className="inline text-muted">Pondělí – pátek: </dt><dd className="inline">{s.hoursWeekdays}</dd></div>
                <div><dt className="inline text-muted">Sobota: </dt><dd className="inline">{s.hoursSaturday}</dd></div>
                <div><dt className="inline text-muted">Neděle: </dt><dd className="inline">{s.hoursSunday}</dd></div>
              </dl>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-line pt-4">
            <a href={`tel:${phoneDigits(s.phone)}`} className="btn"><PhoneIcon size={16} /> Zavolat</a>
            <a href={whatsappLink(s.phone)} target="_blank" rel="noopener noreferrer" className="btn-outline"><WhatsAppIcon size={16} /> WhatsApp</a>
            {s.facebookUrl && <a href={s.facebookUrl} target="_blank" rel="noopener noreferrer" className="btn-outline" aria-label="Facebook"><FacebookIcon size={16} /></a>}
            {s.instagramUrl && <a href={s.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-outline" aria-label="Instagram"><InstagramIcon size={16} /></a>}
          </div>
        </div>

        <div className="space-y-3">
          <MapEmbed address={s.address} />
          <a href={directions} target="_blank" rel="noopener noreferrer" className="btn w-full">Jak se k nám dostanete</a>
        </div>
      </div>

      <section className="card mt-6 p-6">
        <h2 className="mb-2 text-lg">Provozovna</h2>
        <p className="text-muted">[DOPLNIT: fotografie provozovny]</p>
      </section>
    </>
  );
}
