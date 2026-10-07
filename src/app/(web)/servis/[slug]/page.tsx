import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ServiceForm } from "@/components/forms/ServiceForm";
import { PriceList } from "@/components/services/ServicePrice";
import { ServiceIconView } from "@/components/services/ServiceIconView";
import { CheckIcon, PhoneIcon } from "@/components/ui/icons";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { phoneDigits } from "@/lib/format";
import { jsonLdString, serviceJsonLd } from "@/lib/seo";
import { findServiceSlugRedirect, getPublicServices, getServiceBySlug } from "@/lib/services/public";
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

export default async function ServiceDetailPage({ params }: PageProps<"/servis/[slug]">) {
  const { slug } = await params;
  const [s, services, settings] = await Promise.all([getServiceBySlug(slug), getPublicServices(), getSettings()]);
  if (!s) {
    const newSlug = await findServiceSlugRedirect(slug);
    if (newSlug) permanentRedirect(`/servis/${newSlug}`);
    notFound();
  }
  const others = services.filter((o) => o.id !== s.id);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(serviceJsonLd(s)) }} />
      <nav aria-label="Drobečková navigace" className="text-sm text-muted">
        <Link href="/servis" className="hover:text-fg">Servis</Link> <span aria-hidden="true">/</span> <span>{s.title}</span>
      </nav>

      <div className="mt-3 mb-8 flex items-start gap-4">
        <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-card2 text-acc sm:flex">
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
          <SectionTitle className="mb-3">Ceník</SectionTitle>
          <PriceList prices={s.prices} note={s.priceNote} />
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="#objednavka" className="btn">Objednat</a>
            <a href={`tel:${phoneDigits(settings.phone)}`} className="btn-outline">
              <PhoneIcon size={16} /> {settings.phone}
            </a>
          </div>
        </aside>
      </div>

      <section id="objednavka" className="mb-12 scroll-mt-24">
        <SectionTitle className="mb-3">Objednat se do servisu</SectionTitle>
        <ServiceForm services={services.map(({ id, title }) => ({ id, title }))} serviceId={s.id} />
      </section>

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
