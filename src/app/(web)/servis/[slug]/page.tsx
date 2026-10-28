import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ServiceForm } from "@/components/forms/ServiceForm";
import { ServiceOrderForm } from "@/components/forms/ServiceOrderForm";
import { BeforeAfterSlider } from "@/components/services/BeforeAfterSlider";
import { PriceList } from "@/components/services/ServicePrice";
import { ServiceIconView } from "@/components/services/ServiceIconView";
import { CheckIcon, ChevronRightIcon, InstagramIcon, MailIcon, PhoneIcon } from "@/components/ui/icons";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ownerContacts } from "@/lib/contacts";
import { phoneDigits } from "@/lib/format";
import { jsonLdString, serviceJsonLd } from "@/lib/seo";
import { getServiceComparisons } from "@/lib/services/comparisons";
import { bookableServices, findServiceSlugRedirect, getPublicServices, getServiceBySlug } from "@/lib/services/public";
import { getSettings } from "@/lib/settings";

export async function generateMetadata({ params }: PageProps<"/servis/[slug]">): Promise<Metadata> {
  const s = await getServiceBySlug((await params).slug);
  if (!s) return { title: "Služba nenalezena" };
  const title = s.metaTitle ?? s.title;
  const description = s.metaDescription ?? s.summary;
  return {
    title,
    description,
    alternates: { canonical: `/servis/${s.slug}` },
    openGraph: { title, description, url: `/servis/${s.slug}`, type: "website" },
  };
}

/** Autoservis: na stránce je jen kontakt Lukáše (první kontakt = Jarek se tu nezobrazuje). */
const SERVICE_WITHOUT_FIRST_CONTACT = "autoservis-pneuservis";

export default async function ServiceDetailPage({ params }: PageProps<"/servis/[slug]">) {
  const { slug } = await params;
  const [s, services, settings] = await Promise.all([getServiceBySlug(slug), getPublicServices(), getSettings()]);
  if (!s) {
    const newSlug = await findServiceSlugRedirect(slug);
    if (newSlug) permanentRedirect(`/servis/${newSlug}`);
    notFound();
  }
  const comparisons = await getServiceComparisons(s.id);
  const others = services.filter((o) => o.id !== s.id);
  const own = s.contactPhone; // služba s vlastním kontaktem (Crystal Finish): jediný kontakt je tento telefon
  const orderable = !own || s.pickItems; // obecný termínový formulář se pro službu s vlastním kontaktem nenabízí, objednávka z ceníku ano

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(serviceJsonLd(s)) }} />
      <nav aria-label="Drobečková navigace" className="text-sm text-muted">
        <Link href="/servis" className="hover:text-fg">Servis</Link> <span aria-hidden="true">/</span> <span>{s.title}</span>
      </nav>

      <div className="mt-3 mb-8 flex items-start gap-4">
        <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-card2 text-acc sm:flex">
          <ServiceIconView icon={s.icon} size={28} />
        </span>
        <div>
          {s.tag && <p className="mb-1 text-[10px] uppercase tracking-widest text-muted">{s.tag}</p>}
          <h1 className="text-2xl md:text-3xl">{s.title}</h1>
          <p className="mt-2 max-w-2xl text-muted">{s.summary}</p>
        </div>
      </div>

      <div className="mb-12 grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div>
          {s.items.length > 0 && (
            <section className="mb-8">
              <SectionTitle className="mb-3">Co zahrnuje</SectionTitle>
              <ul className="card space-y-2 p-5 text-sm">
                {s.items.map((i) => (
                  <li key={i} className="flex gap-2">
                    <CheckIcon size={16} className="mt-0.5 shrink-0 text-acc" />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {s.description && (
            <section>
              <SectionTitle className="mb-3">Popis služby</SectionTitle>
              <div className="prose-text max-w-3xl whitespace-pre-line text-[0.95rem] leading-relaxed">{s.description}</div>
            </section>
          )}
        </div>
        <aside>
          {!s.pickItems && (
            <>
              <SectionTitle className="mb-3">Ceník</SectionTitle>
              <PriceList prices={s.prices} note={s.priceNote} />
            </>
          )}
          {own ? (
            <div className={`card p-5 ${s.pickItems ? "" : "mt-4"}`}>
              <p className="text-sm text-muted">{s.pickItems ? "Objednejte přímo na webu, nebo nám zavolejte:" : "Objednávky a dotazy vyřizujeme telefonicky:"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.pickItems && <a href="#objednavka" className="btn">Objednat</a>}
                <a href={`tel:${phoneDigits(own)}`} className={s.pickItems ? "btn-outline phone-ring" : "btn phone-ring"}>
                  <PhoneIcon size={16} /> {s.contactName ? `${s.contactName} ` : ""}{own}
                </a>
                {s.contactEmail && (
                  <a href={`mailto:${s.contactEmail}`} className="btn-outline">
                    <MailIcon size={16} /> {s.contactEmail}
                  </a>
                )}
                {s.instagramUrl && (
                  <a href={s.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
                    <InstagramIcon size={16} /> Instagram
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex flex-wrap gap-2 ${s.pickItems ? "" : "mt-4"}`}>
              <a href="#objednavka" className="btn">Objednat</a>
              {ownerContacts(settings)
                .slice(s.slug === SERVICE_WITHOUT_FIRST_CONTACT ? 1 : 0)
                .filter((c) => c.phone)
                .map((c, i) => (
                  <a key={c.name} href={`tel:${c.tel}`} className={`btn-outline ${i ? "phone-ring phone-ring-b" : "phone-ring"}`}>
                    <PhoneIcon size={16} /> {c.firstName} {c.phone}
                  </a>
                ))}
            </div>
          )}
          {s.pickItems && (
            // Objednávkový formulář už ukazuje všechny položky s cenami, takže samostatný ceník je jen na vyžádání.
            <details className="group mt-4">
              <summary className="btn-outline flex w-full cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">Zobrazit ceník</span>
                <span className="hidden group-open:inline">Skrýt ceník</span>
                <ChevronRightIcon size={16} className="transition-transform group-open:rotate-90" />
              </summary>
              <div className="mt-3">
                <PriceList prices={s.prices} note={s.priceNote} />
              </div>
            </details>
          )}
        </aside>
      </div>

      {comparisons.length > 0 && (
        <section className="mb-12" aria-labelledby="pred-a-po">
          <SectionTitle id="pred-a-po" className="mb-1">Před a po</SectionTitle>
          <p className="mb-4 text-sm text-muted">
            Přejeďte prstem nebo myší po fotce a uvidíte rozdíl.
            {s.instagramUrl && (
              <>
                {" "}Další práce najdete na{" "}
                <a href={s.instagramUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-fg">Instagramu</a>.
              </>
            )}
          </p>
          <ul className={`grid gap-5 ${comparisons.length > 1 ? "md:grid-cols-2" : "max-w-2xl"}`}>
            {comparisons.map((c) => (
              <li key={c.id}>
                <BeforeAfterSlider before={c.before} after={c.after} width={c.width} height={c.height} caption={c.caption} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {orderable && (
        <section id="objednavka" className="mb-12 scroll-mt-24">
          <SectionTitle className="mb-3">{s.pickItems ? "Objednat" : "Objednat se do servisu"}</SectionTitle>
          {s.pickItems ? (
            <ServiceOrderForm serviceId={s.id} prices={s.prices} contactName={s.contactName} />
          ) : (
            <ServiceForm services={bookableServices(services)} serviceId={s.id} />
          )}
        </section>
      )}

      {others.length > 0 && (
        <section>
          <SectionTitle className="mb-3">Další služby</SectionTitle>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <li key={o.id}>
                <Link href={`/servis/${o.slug}`} className="card flex items-center gap-3 p-4 transition-colors hover:border-acc">
                  <span className="text-acc"><ServiceIconView icon={o.icon} size={20} /></span>
                  <span className="font-semibold">{o.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
