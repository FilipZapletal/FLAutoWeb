import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { CookiesPolicy } from "@/components/legal/CookiesPolicy";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Jaké cookies a údaje v prohlížeči web FL Auto používá.",
  alternates: { canonical: "/cookies" },
};

export default async function Page() {
  const s = await getSettings();
  return (
    <LegalPage title="Cookies" effectiveDate={s.legalEffectiveDate}>
      <CookiesPolicy />
    </LegalPage>
  );
}
