import type { Metadata } from "next";
import { ServiceForm } from "@/components/forms/ServiceForm";
import { CarIcon, CheckIcon, ShieldIcon, SparkleIcon, WrenchIcon } from "@/components/ui/icons";
import { SectionTitle } from "@/components/ui/SectionTitle";

export const metadata: Metadata = {
  title: "Servis",
  description: "Dovoz aut z EU, autoservis a pneuservis, ruční mytí a čištění interiéru, příprava na STK a emise.",
  alternates: { canonical: "/servis" },
};

const SERVICES = [
  {
    Icon: CarIcon,
    tag: "Dovoz na klíč",
    title: "Dovoz aut z EU",
    text: "Individuální dovoz prověřených automobilů z Německa a zemí EU na přání, včetně nabídky kvalitních ojetých vozů.",
    items: [
      "Vyhledání a prověření vozu v zahraničí (historie, nájezd, tachometr)",
      "Kompletní fyzická kontrola technického stavu před koupí",
      "Doprava vozidla do ČR a zajištění přepisu",
      "Kompletní dovozová STK, emise a přihlášení na české SPZ",
      "Pomoc s financováním i pojištěním vozidla",
    ],
  },
  {
    Icon: WrenchIcon,
    tag: "Rychle & spolehlivě",
    title: "Autoservis & Pneuservis",
    text: "Pravidelná údržba, diagnostika, opravy mechanických částí a kompletní servis pneumatik.",
    items: [
      "Výměna motorového oleje, filtrů a provozních kapalin",
      "Kontrola a výměna brzdových destiček, kotoučů a brzdové kapaliny",
      "Kompletní pneuservis – přezouvání a vyvažování kol",
      "Opravy defektů pneumatik a sezónní uskladnění",
    ],
  },
  {
    Icon: SparkleIcon,
    tag: "Špičková čistota",
    title: "Ruční mytí & čištění interiéru",
    text: "Prémiová a šetrná péče o karoserii i vnitřek vozu s důrazem na každý detail.",
    items: [
      "Šetrné vícefázové ruční mytí karoserie s pH neutrální chemií",
      "Hloubkové mokré tepování sedadel, koberců a kufru",
      "Čištění, výživa a impregnace kožených sedadel",
      "Mytí a odmaštění oken bez šmouh zevnitř i zvenčí",
      "Dezinfekce interiéru a klimatizace ozonem",
    ],
  },
  {
    Icon: ShieldIcon,
    tag: "Bez starostí",
    title: "Příprava na STK & emise",
    text: "Kompletní příprava vozidla a bezstarostné vyřízení technické kontroly bez čekání.",
    items: [
      "Základní před-prohlídka vozidla podle metodiky STK",
      "Kontrola a seřízení světel, brzdové soustavy a řízení",
      "Kontrola podvozku, výfukového potrubí a emisního systému",
      "Rychlé odstranění případných nedostatků před prohlídkou",
    ],
  },
];

export default function ServicePage() {
  return (
    <>
      <SectionTitle as="h1" className="mb-2">Servis</SectionTitle>
      <p className="mb-6 max-w-xl text-muted">Kompletní péče o váš vůz – od dovozu ze zahraničí přes servis a mytí až po přípravu na STK.</p>

      <div className="mb-12 grid gap-4 md:grid-cols-2">
        {SERVICES.map(({ Icon, tag, title, text, items }) => (
          <article key={title} className="card p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-card2 text-acc">
                <Icon size={24} />
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted">{tag}</span>
            </div>
            <h2 className="mb-1 text-lg">{title}</h2>
            <p className="mb-3 text-sm text-muted">{text}</p>
            <ul className="space-y-1.5 text-sm">
              {items.map((i) => (
                <li key={i} className="flex gap-2">
                  <CheckIcon size={16} className="mt-0.5 shrink-0 text-acc" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <SectionTitle className="mb-3">Objednat se do servisu</SectionTitle>
      <ServiceForm />
    </>
  );
}
