import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Informace o ADR", alternates: { canonical: "/adr" } };

export default function Page() {
  return <LegalPage title="Informace o ADR" />;
}
