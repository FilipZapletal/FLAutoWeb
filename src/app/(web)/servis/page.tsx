import type { Metadata } from "next";
import { ServiceForm } from "@/components/forms/ServiceForm";
import { ServiceCard } from "@/components/services/ServiceCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getPublicServices } from "@/lib/services/public";

export const metadata: Metadata = {
  title: "Servis",
  description: "Dovoz aut z EU, autoservis a pneuservis, ruční mytí a čištění interiéru, příprava na STK a emise.",
  alternates: { canonical: "/servis" },
};

export default async function ServicePage() {
  const services = await getPublicServices();

  return (
    <>
      <SectionTitle as="h1" className="mb-2">Servis</SectionTitle>
      <p className="mb-6 max-w-xl text-muted">Kompletní péče o váš vůz – od dovozu ze zahraničí přes servis a mytí až po přípravu na STK.</p>

      {services.length > 0 && (
        <div className="mb-12 grid gap-4 md:grid-cols-2">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}

      <SectionTitle className="mb-3">Objednat se do servisu</SectionTitle>
      <ServiceForm services={services.map(({ id, title }) => ({ id, title }))} />
    </>
  );
}
