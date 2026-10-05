import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CatalogFilters } from "@/components/vehicles/CatalogFilters";
import { SortSelect } from "@/components/vehicles/SortSelect";
import { VehicleGrid } from "@/components/vehicles/VehicleCard";
import { filtersToQuery, parseFilters } from "@/lib/validation/filters";
import { getBrandModels, getFilterValues, searchVehicles } from "@/lib/vehicles/queries";

const catalogHref = (query: string) => (query ? `/vozy?${query}` : "/vozy");

export async function generateMetadata({ searchParams }: PageProps<"/vozy">): Promise<Metadata> {
  const filters = parseFilters(await searchParams);
  const filtered = Object.keys(filters).length > 0;
  return {
    title: "Nabídka vozů",
    description: "Aktuální nabídka ojetých vozů FL Auto. Filtrujte podle značky, ceny, roku, nájezdu, paliva a dalších parametrů.",
    alternates: { canonical: "/vozy" },
    // Kombinace filtrů neindexovat, jen hlavní katalog.
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function CatalogPage({ searchParams }: PageProps<"/vozy">) {
  const filters = parseFilters(await searchParams);
  const [result, brandModels, values] = await Promise.all([searchVehicles(filters), getBrandModels(), getFilterValues()]);
  const activeCount = Object.keys(filters).filter((k) => !["sort", "page"].includes(k)).length;

  return (
    <>
      <SectionTitle as="h1" className="mb-5">
        Nabídka vozů <span className="font-sans text-base font-normal normal-case text-muted">({result.total})</span>
      </SectionTitle>

      <CatalogFilters key={filtersToQuery(filters, { sort: undefined, page: undefined })} filters={filters} brandModels={brandModels} colors={values.colors} origins={values.origins} />

      <div className="my-5 flex flex-wrap items-center justify-between gap-3">
        {activeCount > 0 ? (
          <Link href="/vozy" className="text-sm text-muted underline underline-offset-4 hover:text-fg">
            Zrušit filtry ({activeCount})
          </Link>
        ) : (
          <span />
        )}
        <Suspense>
          <SortSelect value={filters.sort ?? "doporucene"} />
        </Suspense>
      </div>

      {result.items.length > 0 ? (
        <VehicleGrid vehicles={result.items} priorityCount={3} />
      ) : (
        <div className="card p-8 text-center">
          <p className="mb-4 text-muted">Žádné vozy neodpovídají zvoleným filtrům.</p>
          <Link href="/vozy" className="btn-outline">
            Zobrazit všechny vozy
          </Link>
        </div>
      )}

      <Pagination page={result.page} pageCount={result.pageCount} href={(page) => catalogHref(filtersToQuery(filters, { page: page > 1 ? page : undefined }))} />
    </>
  );
}
