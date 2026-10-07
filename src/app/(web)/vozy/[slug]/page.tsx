import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { LeadForm } from "@/components/forms/LeadForm";
import { PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";
import { EquipmentList } from "@/components/vehicles/EquipmentList";
import { Gallery } from "@/components/vehicles/Gallery";
import { MobileStickyBar } from "@/components/vehicles/MobileStickyBar";
import { Price } from "@/components/vehicles/Price";
import { SpecTable } from "@/components/vehicles/SpecTable";
import { StatusBadge } from "@/components/vehicles/StatusBadge";
import { ownerContacts } from "@/lib/contacts";
import { formatKm, whatsappLink } from "@/lib/format";
import { FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/labels";
import { jsonLdString, vehicleDescription, vehicleJsonLd, vehicleTitle } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { absoluteUrl } from "@/lib/site";
import { findSlugRedirect, getVehicleBySlug } from "@/lib/vehicles/queries";

export async function generateMetadata({ params }: PageProps<"/vozy/[slug]">): Promise<Metadata> {
  const v = await getVehicleBySlug((await params).slug);
  if (!v) return { title: "Vůz nenalezen" };
  const title = `${vehicleTitle(v)} – ${v.price.toLocaleString("cs-CZ")} Kč`;
  const description = vehicleDescription(v);
  const image = v.images[0];
  return {
    title,
    description,
    alternates: { canonical: `/vozy/${v.slug}` },
    openGraph: {
      title,
      description,
      url: `/vozy/${v.slug}`,
      type: "website",
      images: image ? [{ url: absoluteUrl(image.og), type: "image/jpeg", alt: image.alt }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [absoluteUrl(image.og)] : undefined },
  };
}

export default async function VehicleDetailPage({ params }: PageProps<"/vozy/[slug]">) {
  const { slug } = await params;
  const [v, settings] = await Promise.all([getVehicleBySlug(slug), getSettings()]);
  if (!v) {
    const newSlug = await findSlugRedirect(slug);
    if (newSlug) permanentRedirect(`/vozy/${newSlug}`);
    notFound();
  }

  const sold = v.status === "PRODANO";
  const title = [v.brand, v.model].join(" ");
  const facts = [
    ["Rok", v.year],
    ["Nájezd", formatKm(v.mileage)],
    ["Palivo", FUEL_LABELS[v.fuel]],
    ["Převodovka", TRANSMISSION_LABELS[v.transmission]],
    ["Výkon", v.power ? `${v.power} kW` : null],
  ].filter(([, value]) => value) as [string, string | number][];
  const waText = `Dobrý den, mám zájem o vůz ${vehicleTitle(v)}.`;
  const contacts = ownerContacts(settings).filter((c) => c.phone);

  return (
    <div className="pb-20 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(vehicleJsonLd(v)) }} />
      <Link href="/vozy" className="text-sm text-muted hover:text-fg">
        ← Zpět na nabídku
      </Link>

      <div className="mt-3 grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="md:order-2">
          <h1 className="text-2xl md:text-3xl">
            <span className="text-acc">{v.brand}</span> {v.model}
            {v.version && <span className="mt-1 block font-sans text-base font-normal normal-case text-muted">{v.version}</span>}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Price value={v.price} isSale={v.isSale} className="text-3xl" />
            <StatusBadge status={v.status} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            {facts.map(([label, value]) => (
              <div key={label} className="card px-3 py-2">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 hidden flex-wrap gap-2 md:flex">
            {!sold && (
              <a href="#poptavka" className="btn">
                Poptat vůz
              </a>
            )}
            {contacts.map((c) => (
              <a key={c.name} href={`tel:${c.tel}`} className="btn-outline">
                <PhoneIcon size={16} /> {c.firstName} {c.phone}
              </a>
            ))}
          </div>
          {sold && (
            <p className="card mt-5 border-sold/40 p-4 text-sm">
              Tento vůz je již prodaný a zůstává v nabídce jako reference. <Link href="/vozy?sold=0" className="underline">Prohlédněte si aktuální nabídku.</Link>
            </p>
          )}
        </div>
        <div className="md:order-1">
          <Gallery images={v.images} title={title} />
        </div>
      </div>

      {v.description && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl">Popis vozu</h2>
          <div className="prose-text max-w-3xl whitespace-pre-line text-[0.95rem] leading-relaxed">{v.description}</div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-3 text-xl">Technické údaje</h2>
        <SpecTable v={v} />
      </section>

      {v.equipment.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl">Výbava</h2>
          <div className="card p-5">
            <EquipmentList items={v.equipment} />
          </div>
        </section>
      )}

      {!sold && (
        <section id="poptavka" className="mt-10 scroll-mt-24">
          <div className="card grid gap-6 p-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:p-6">
            <div>
              <h2 className="mb-4 text-xl">Máte zájem o tento vůz?</h2>
              <LeadForm vehicleId={v.id} />
            </div>
            <div className="flex flex-col gap-3 border-t border-line pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <p className="text-sm text-muted">Raději se domluvíte přímo?</p>
              {contacts.map((c, i) => (
                <div key={c.name} className="grid gap-2">
                  <a href={`tel:${c.tel}`} className={i === 0 ? "btn" : "btn-outline"}>
                    <PhoneIcon size={16} /> Zavolat – {c.firstName} {c.phone}
                  </a>
                  <a href={whatsappLink(c.phone!, waText)} target="_blank" rel="noopener noreferrer" className="btn-outline">
                    <WhatsAppIcon size={16} /> WhatsApp – {c.firstName}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <MobileStickyBar contacts={ownerContacts(settings)} showInquiry={!sold} />
    </div>
  );
}
