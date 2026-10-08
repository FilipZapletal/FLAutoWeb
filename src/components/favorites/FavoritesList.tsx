"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { VehicleGrid } from "@/components/vehicles/VehicleCard";
import { useConsent } from "@/lib/consent";
import { retainFavorites, useFavorites } from "@/lib/favorites";
import type { VehicleCardData } from "@/lib/vehicles/public";

export function FavoritesList() {
  const { ids } = useFavorites();
  const { decided, functional } = useConsent();
  const [loaded, setLoaded] = useState<{ key: string; items: VehicleCardData[] } | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    if (!key) return;
    const ctrl = new AbortController();
    fetch(`/api/favorites?ids=${key}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data: { items: VehicleCardData[] }) => {
        setLoaded({ key, items: data.items });
        // Vozy, které už nejsou v nabídce, ze seznamu zmizí.
        retainFavorites(data.items.map((v) => v.id));
      })
      .catch(() => undefined);
    return () => ctrl.abort();
  }, [key]);

  if (ids.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="mb-4 text-muted">Zatím tu nemáte žádná uložená auta. Kliknutím na srdíčko u vozu si ho uložíte, ať ho nemusíte hledat znovu.</p>
        <Link href="/vozy" className="btn">
          Prohlédnout nabídku
        </Link>
      </div>
    );
  }

  return (
    <>
      {decided && !functional && (
        <p className="card mb-5 border-acc/40 p-4 text-sm">
          Pohodlné funkce máte vypnuté, proto se seznam po zavření stránky neuchová. Zapnout je můžete v{" "}
          <span className="font-semibold">Nastavení soukromí</span> v patičce webu.
        </p>
      )}
      {loaded?.key === key ? <VehicleGrid vehicles={loaded.items} /> : <p className="text-muted">Načítám uložená auta…</p>}
    </>
  );
}
