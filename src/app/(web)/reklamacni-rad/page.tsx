import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Reklamační řád", alternates: { canonical: "/reklamacni-rad" } };

export default function Page() {
  return <LegalPage title="Reklamační řád" />;
}
