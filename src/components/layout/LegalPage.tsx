import { SectionTitle } from "@/components/ui/SectionTitle";

/** Obal právní stránky: nadpis, karta s textem a datum účinnosti. */
export function LegalPage({ title, effectiveDate, children }: { title: string; effectiveDate?: string | null; children: React.ReactNode }) {
  return (
    <>
      <SectionTitle as="h1" className="mb-6">{title}</SectionTitle>
      <article className="card legal max-w-3xl p-6 md:p-8">
        {children}
        <p className="mt-8 border-t border-line pt-4 text-sm text-muted">
          Účinné od: <Fill value={effectiveDate} label="datum účinnosti" />
        </p>
      </article>
    </>
  );
}

/** Hodnota z Nastavení, nebo viditelný zástupný text [DOPLNIT: …]. */
export function Fill({ value, label }: { value: string | null | undefined; label: string }) {
  return value ? <>{value}</> : <span className="text-acc">[DOPLNIT: {label}]</span>;
}
