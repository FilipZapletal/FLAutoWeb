import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { CompanyInfo } from "@/components/legal/CompanyInfo";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Obchodní údaje",
  description: "Identifikační údaje provozovatele autobazaru FL Auto a orgány dozoru.",
  alternates: { canonical: "/obchodni-udaje" },
};

export default async function Page() {
  const s = await getSettings();
  return (
    <LegalPage title="Obchodní údaje" effectiveDate={s.legalEffectiveDate}>
      <CompanyInfo s={s} />
    </LegalPage>
  );
}
