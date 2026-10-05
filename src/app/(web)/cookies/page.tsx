import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Cookies", alternates: { canonical: "/cookies" } };

export default function Page() {
  return <LegalPage title="Cookies" />;
}
