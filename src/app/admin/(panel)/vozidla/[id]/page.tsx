import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/admin/ui";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { parseId } from "@/lib/api";
import { getAdminVehicle, getEquipmentCatalog } from "@/lib/vehicles/admin";
import { toFormValues } from "@/lib/vehicles/form-values";

export const metadata = { title: "Upravit vozidlo" };

export default async function EditVehiclePage({ params }: PageProps<"/admin/vozidla/[id]">) {
  const id = parseId((await params).id);
  const [vehicle, equipment] = await Promise.all([id ? getAdminVehicle(id) : null, getEquipmentCatalog()]);
  if (!vehicle) notFound();

  return (
    <>
      <PageHead title={`${vehicle.brand} ${vehicle.model}`}>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/vozidla/${vehicle.id}/fotky`} className="btn-outline">Fotografie</Link>
          {!vehicle.archivedAt && vehicle.status !== "SKRYTE" && (
            <Link href={`/vozy/${vehicle.slug}`} target="_blank" className="btn-outline">Zobrazit na webu ↗</Link>
          )}
        </div>
      </PageHead>
      {vehicle.archivedAt && <p className="card mb-4 p-3 text-sm text-muted">Vůz je archivovaný – na webu se nezobrazuje.</p>}
      <VehicleForm
        vehicleId={vehicle.id}
        initial={toFormValues(vehicle)}
        equipment={equipment}
        selectedEquipment={vehicle.equipment.map((e) => e.equipmentId)}
      />
    </>
  );
}
