import { PageHead } from "@/components/admin/ui";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { getEquipmentCatalog } from "@/lib/vehicles/admin";

export const metadata = { title: "Přidat vozidlo" };

export default async function NewVehiclePage() {
  const equipment = await getEquipmentCatalog();
  return (
    <>
      <PageHead title="Přidat vozidlo" />
      <VehicleForm initial={{ status: "DOSTUPNE", seats: "5" }} equipment={equipment} selectedEquipment={[]} />
    </>
  );
}
