/* eslint-disable @next/next/no-img-element -- náhledy z vlastního úložiště */
import Link from "next/link";
import { PageHead, tableClass } from "@/components/admin/ui";
import { FeaturedToggle, VehicleActions, VehicleStatusSelect } from "@/components/admin/VehicleRowControls";
import { formatKm, formatPrice } from "@/lib/format";
import { imageUrls } from "@/lib/images/variants";
import { getAdminVehicles } from "@/lib/vehicles/admin";

export const metadata = { title: "Vozidla" };

export default async function AdminVehiclesPage({ searchParams }: PageProps<"/admin/vozidla">) {
  const archived = (await searchParams).archiv === "1";
  const vehicles = await getAdminVehicles(archived);

  return (
    <>
      <PageHead title={archived ? "Archiv vozidel" : "Vozidla"}>
        <div className="flex flex-wrap gap-2">
          <Link href={archived ? "/admin/vozidla" : "/admin/vozidla?archiv=1"} className="btn-outline">
            {archived ? "← Aktivní vozidla" : "Archiv"}
          </Link>
          <Link href="/admin/vozidla/novy" className="btn">+ Přidat vozidlo</Link>
        </div>
      </PageHead>

      <div className="card overflow-x-auto">
        <table className={tableClass}>
          <thead>
            <tr>
              <th className="w-20">Foto</th>
              <th>Vůz</th>
              <th>Cena</th>
              <th>Status</th>
              <th title="Doporučený na úvodní stránce">★</th>
              <th>Akce</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="hover:bg-card2">
                <td>
                  {v.images[0] ? (
                    <img src={imageUrls(v.images[0].storageKey).thumb} alt="" className="aspect-[4/3] w-16 rounded-inner object-cover" loading="lazy" />
                  ) : (
                    <Link href={`/admin/vozidla/${v.id}/fotky`} className="flex aspect-[4/3] w-16 items-center justify-center rounded-inner bg-card2 text-[10px] text-muted">bez fotky</Link>
                  )}
                </td>
                <td className="min-w-[200px]">
                  <Link href={`/admin/vozidla/${v.id}`} className="font-semibold hover:text-acc">{v.brand} {v.model}</Link>
                  <div className="text-xs text-muted">
                    {[v.version, v.year, formatKm(v.mileage)].filter(Boolean).join(" · ")} · {v._count.images} fotek · {v._count.leads} poptávek
                  </div>
                </td>
                <td className="whitespace-nowrap">
                  {formatPrice(v.currentPrice)}
                  {v.salePrice && <div className="text-xs text-acc">akce (běžně {formatPrice(v.price)})</div>}
                </td>
                <td><VehicleStatusSelect key={v.status} id={v.id} status={v.status} /></td>
                <td><FeaturedToggle id={v.id} featured={v.featured} /></td>
                <td><VehicleActions id={v.id} slug={v.slug} archived={Boolean(v.archivedAt)} publicVisible={!v.archivedAt && v.status !== "SKRYTE"} /></td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted">{archived ? "Archiv je prázdný." : "Zatím žádná vozidla."}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
