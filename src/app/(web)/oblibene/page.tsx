import type { Metadata } from "next";
import { FavoritesList } from "@/components/favorites/FavoritesList";
import { SectionTitle } from "@/components/ui/SectionTitle";

export const metadata: Metadata = {
  title: "Oblíbená auta",
  description: "Auta, která jste si uložili. Seznam je uložený jen ve vašem prohlížeči, bez registrace.",
  alternates: { canonical: "/oblibene" },
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return (
    <>
      <SectionTitle as="h1" className="mb-2">Oblíbená auta</SectionTitle>
      <p className="mb-6 max-w-xl text-sm text-muted">Seznam je uložený jen ve vašem prohlížeči (bez registrace). Na jiném zařízení ho neuvidíte.</p>
      <FavoritesList />
    </>
  );
}
