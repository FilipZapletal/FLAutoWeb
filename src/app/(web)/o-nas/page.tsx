import type { Metadata } from "next";
import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";

export const metadata: Metadata = {
  title: "O nás",
  description: "Kdo jsme, jak vybíráme a kontrolujeme vozy v nabídce FL Auto.",
  alternates: { canonical: "/o-nas" },
};

// Texty doplní klient – nevymýšlet čísla ani tvrzení.
const SECTIONS = [
  ["Kdo jsme", "[DOPLNIT: kdo autobazar provozuje, historie firmy]"],
  ["Zkušenosti", "[DOPLNIT: roky zkušeností, počet prodaných vozů]"],
  ["Jak vybíráme vozy", "[DOPLNIT: podle čeho vybíráme vozy do nabídky]"],
  ["Kontrola vozidel", "[DOPLNIT: co kontrolujeme před prodejem]"],
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
        <p className="text-muted">[DOPLNIT: fotografie týmu a provozovny]</p>
      </section>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/vozy" className="btn">Prohlédnout nabídku</Link>
        <Link href="/kontakt" className="btn-outline">Kontakt</Link>
      </div>
    </>
  );
}
