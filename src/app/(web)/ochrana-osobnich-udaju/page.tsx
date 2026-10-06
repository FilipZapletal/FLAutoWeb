import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů",
  description: "Jak FL Auto zpracovává osobní údaje z poptávek a při prodeji vozidel a jaká máte práva.",
  alternates: { canonical: "/ochrana-osobnich-udaju" },
};

export default async function Page() {
  const s = await getSettings();
  return (
    <LegalPage title="Ochrana osobních údajů" effectiveDate={s.legalEffectiveDate}>
      <PrivacyPolicy s={s} />
    </LegalPage>
  );
}
