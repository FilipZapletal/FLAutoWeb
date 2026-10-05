import { SectionTitle } from "@/components/ui/SectionTitle";

/** Právní stránka – text dodá klient, nic se nevymýšlí. */
export function LegalPage({ title }: { title: string }) {
  return (
    <>
      <SectionTitle as="h1" className="mb-6">{title}</SectionTitle>
      <div className="card max-w-3xl p-6">
        <p className="text-muted">[DOPLNIT PRÁVNÍ TEXT KLIENTEM]</p>
      </div>
    </>
  );
}
