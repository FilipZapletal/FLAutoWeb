import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { TermsPolicy } from "@/components/legal/TermsPolicy";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Obchodní podmínky",
  description: "Obchodní podmínky FL Auto: objednávka služby, cena a platba na provozovně, odstoupení od smlouvy.",
  alternates: { canonical: "/obchodni-podminky" },
};

export default async function Page() {
  const s = await getSettings();
  return (
    <LegalPage title="Obchodní podmínky" effectiveDate={s.legalEffectiveDate}>
      <TermsPolicy s={s} />
    </LegalPage>
  );
}
