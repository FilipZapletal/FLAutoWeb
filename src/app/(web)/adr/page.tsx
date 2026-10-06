import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { AdrInfo } from "@/components/legal/AdrInfo";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Mimosoudní řešení sporů (ADR)",
  description: "Informace o mimosoudním řešení spotřebitelských sporů u České obchodní inspekce.",
  alternates: { canonical: "/adr" },
};

export default async function Page() {
  const s = await getSettings();
  return (
    <LegalPage title="Mimosoudní řešení sporů (ADR)" effectiveDate={s.legalEffectiveDate}>
      <AdrInfo s={s} />
    </LegalPage>
  );
}
