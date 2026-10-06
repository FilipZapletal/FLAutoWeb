import Link from "next/link";
import { GetForm } from "@/components/ui/GetForm";
import { CarIcon, PhoneIcon, ShieldIcon, SparkleIcon, WrenchIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/Logo";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { VehicleGrid } from "@/components/vehicles/VehicleCard";
import { ABOUT_INTRO } from "@/lib/content";
import { phoneDigits } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { getBrandModels, getHomeVehicles } from "@/lib/vehicles/queries";

const QUICK_CATEGORIES = [
  { label: "Osobní vozy", href: "/vozy?kind=osobni" },
  { label: "SUV", href: "/vozy?body=SUV" },
  { label: "Kombi", href: "/vozy?body=KOMBI" },
  { label: "Automat", href: "/vozy?transmission=AUTOMAT" },
  { label: "Do 300 000 Kč", href: "/vozy?priceMax=300000" },
  { label: "Akční nabídky", href: "/vozy?sale=1" },
];

const PRICE_OPTIONS = [200_000, 300_000, 500_000, 800_000, 1_000_000];

export default async function HomePage() {
  const [brandModels, featured, newest, sale, settings] = await Promise.all([
    getBrandModels(),
    getHomeVehicles("featured", 3),
    getHomeVehicles("newest", 6),
    getHomeVehicles("sale", 3),
    getSettings(),
  ]);
  const brands = Object.keys(brandModels);

  return (
    <>
      <section className="card hero relative mb-6 overflow-hidden p-6 sm:p-10 md:p-16">
        <div className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 opacity-20" style={{ background: "radial-gradient(circle, var(--acc), transparent 70%)" }} />
        <div className="hero-logo pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] items-center md:flex" aria-hidden="true">
          <div className="relative -mr-[5%] w-[110%]">
            <Logo eager className="h-auto w-full" sizes="60vw" />
          </div>
        </div>
        <div className="relative">
          <p className="eyebrow mb-3">
            <span className="accent-bar" />
            Ojeté vozy s čistou historií
          </p>
          <h1 className="mb-3 text-4xl leading-tight md:text-5xl">
            Vůz,
            <br />
            který <span className="text-acc">stojí za to</span>
          </h1>
          <p className="mb-6 max-w-md text-muted">Každé auto v naší nabídce prochází kontrolou před prodejem. Žádná překvapení, jen jasná fakta.</p>
          <GetForm action="/vozy" className="flex max-w-xl flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="hero-brand">Značka</label>
            <select id="hero-brand" name="brand" className="field sm:max-w-[180px]" defaultValue="">
              <option value="">Značka</option>
              {brands.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="hero-price">Cena do</label>
            <select id="hero-price" name="priceMax" className="field sm:max-w-[180px]" defaultValue="">
              <option value="">Cena do</option>
              {PRICE_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p.toLocaleString("cs-CZ")} Kč
                </option>
              ))}
            </select>
            <button className="btn">Hledat vozy</button>
          </GetForm>
        </div>
      </section>

      <nav className="mb-10 flex flex-wrap gap-2" aria-label="Rychlé kategorie">
        {QUICK_CATEGORIES.map((c) => (
          <Link key={c.href} href={c.href} className="btn-outline">
            {c.label}
          </Link>
        ))}
      </nav>

      {featured.length > 0 && (
        <section className="mb-12">
          <SectionTitle className="mb-4">Doporučené vozy</SectionTitle>
          <VehicleGrid vehicles={featured} priorityCount={3} />
        </section>
      )}

      {sale.length > 0 && (
        <section className="mb-12">
          <SectionTitle className="mb-4">Akční nabídky</SectionTitle>
          <VehicleGrid vehicles={sale} />
        </section>
      )}

      <section className="mb-12">
        <div className="mb-4 flex items-end justify-between gap-4">
          <SectionTitle>Nově v nabídce</SectionTitle>
          <Link href="/vozy" className="text-sm text-muted underline-offset-4 hover:underline">
            Celá nabídka →
          </Link>
        </div>
        {newest.length > 0 ? <VehicleGrid vehicles={newest} /> : <p className="text-muted">Nabídku právě připravujeme.</p>}
      </section>

      <section className="mb-12 grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <div className="mb-3 flex gap-2 text-acc">
            <CarIcon />
            <WrenchIcon />
            <SparkleIcon />
            <ShieldIcon />
          </div>
          <h2 className="mb-1 text-lg">Dovoz, servis, mytí i STK</h2>
          <p className="mb-4 text-sm text-muted">Kompletní péče o váš vůz na jednom místě.</p>
          <Link href="/servis" className="btn">
            Zobrazit služby
          </Link>
        </div>
        <div className="card p-6">
          <div className="mb-3 text-acc">
            <PhoneIcon />
          </div>
          <h2 className="mb-1 text-lg">Máte dotaz?</h2>
          <p className="mb-4 text-sm text-muted">Rádi vám poradíme s výběrem vozu.</p>
          <div className="flex flex-wrap gap-2">
            <a href={`tel:${phoneDigits(settings.phone)}`} className="btn">
              {settings.phone}
            </a>
            <Link href="/kontakt" className="btn-outline">
              Kontaktovat nás
            </Link>
          </div>
        </div>
      </section>

      <section className="card p-6 md:p-8">
        <SectionTitle className="mb-3">O autobazaru FL Auto</SectionTitle>
        <p className="max-w-2xl text-muted">{ABOUT_INTRO}</p>
        <Link href="/o-nas" className="mt-4 inline-block text-sm underline underline-offset-4">
          Více o nás
        </Link>
      </section>
    </>
  );
}
