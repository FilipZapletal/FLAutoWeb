import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Ochrana osobních údajů", alternates: { canonical: "/ochrana-osobnich-udaju" } };

export default function Page() {
  return <LegalPage title="Ochrana osobních údajů" />;
}
