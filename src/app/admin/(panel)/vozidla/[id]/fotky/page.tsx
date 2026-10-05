import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageManager } from "@/components/admin/ImageManager";
import { PageHead } from "@/components/admin/ui";
import { parseId } from "@/lib/api";
import { db } from "@/lib/db";
import { getVehicleImages } from "@/lib/vehicles/images";

export const metadata = { title: "Fotografie vozu" };

export default async function VehiclePhotosPage({ params, searchParams }: PageProps<"/admin/vozidla/[id]/fotky">) {
  const id = parseId((await params).id);
  const vehicle = id ? await db.vehicle.findUnique({ where: { id }, select: { id: true, brand: true, model: true, slug: true } }) : null;
  if (!vehicle) notFound();
  const images = await getVehicleImages(vehicle.id);
  const isNew = (await searchParams).novy === "1";

  return (
    <>
      <PageHead title={`Fotografie – ${vehicle.brand} ${vehicle.model}`}>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/vozidla/${vehicle.id}`} className="btn-outline">Upravit údaje</Link>
          <Link href="/admin/vozidla" className="btn-outline">Seznam vozidel</Link>
        </div>
      </PageHead>
      {isNew && <p className="card mb-4 border-sold/40 p-3 text-sm">✓ Vůz byl uložen. Teď nahrajte fotografie.</p>}
      <ImageManager vehicleId={vehicle.id} initial={images.map(({ id, isMain, thumb, src }) => ({ id, isMain, thumb, src }))} />
    </>
  );
}
