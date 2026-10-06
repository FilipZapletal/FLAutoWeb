import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { ComplaintsPolicy } from "@/components/legal/ComplaintsPolicy";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Reklamační řád",
  description: "Jak reklamovat ojeté vozidlo nebo servisní službu u FL Auto – lhůty, postup a vaše práva.",
  alternates: { canonical: "/reklamacni-rad" },
};

export default async function Page() {
  const s = await getSettings();
  return (
    <LegalPage title="Reklamační řád" effectiveDate={s.legalEffectiveDate}>
      <ComplaintsPolicy s={s} />
    </LegalPage>
  );
}
