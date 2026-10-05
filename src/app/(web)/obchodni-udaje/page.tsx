import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Obchodní údaje", alternates: { canonical: "/obchodni-udaje" } };

export default function Page() {
  return <LegalPage title="Obchodní údaje" />;
}
