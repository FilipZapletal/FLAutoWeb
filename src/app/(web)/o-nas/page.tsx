import type { Metadata } from "next";
import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ABOUT_INTRO } from "@/lib/content";

export const metadata: Metadata = {
  title: "O nás",
  description: "Kdo jsme, jak vybíráme a kontrolujeme vozy v nabídce FL Auto.",
  alternates: { canonical: "/o-nas" },
};

// Texty dodal klient.

const SECTIONS = [
  ["Kdo jsme", ABOUT_INTRO],
  [
    "Zkušenosti",
    "Na trhu jsme přibližně rok a půl. Jako nováčky nás žene obrovská motivace vybudovat si dobré jméno a o to více si dáváme záležet na každém jednotlivém autě i na maximální spokojenosti každého zákazníka.",
  ],
  [
    "Jak vybíráme vozy",
    "Nekupujeme auta na objem, ale na kvalitu! Vybrané vozy pocházejí z prověřených zdrojů, nejčastěji s jasnou servisní historií. Vybíráme a kontrolujeme auta tak, jako bychom je kupovali sami pro sebe.",
  ],
  [
    "Kontrola vozidel",
    "Každý vůz před zařazením do nabídky důkladně prověřujeme – od diagnostiky a technického stavu až po historii najetých kilometrů. Chceme, abyste od nás odjížděli spokojeni a my měli čisté svědomí, že jsme prodali skvělé a prověřené auto.",
  ],
];

export default function AboutPage() {
  return (
    <>
      <SectionTitle as="h1" className="mb-6">O nás</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map(([title, text]) => (
          <section key={title} className="card p-6">
            <h2 className="mb-2 text-lg">{title}</h2>
            <p className="text-muted">{text}</p>
          </section>
        ))}
      </div>
      <section className="card mt-4 p-6">
        <h2 className="mb-2 text-lg">Tým a provozovna</h2>
        <p className="text-muted">
          Zakládáme si na neformálním a otevřeném jednání. Rádi vás přivítáme u nás, auto vám kompletně ukážeme a umožníme důkladnou prohlídku i zkušební jízdu bez jakéhokoliv tlaku.
        </p>
        <p className="mt-3 text-sm text-muted">[DOPLNIT: fotografie týmu a provozovny]</p>
      </section>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/vozy" className="btn">Prohlédnout nabídku</Link>
        <Link href="/kontakt" className="btn-outline">Kontakt</Link>
      </div>
    </>
  );
}
