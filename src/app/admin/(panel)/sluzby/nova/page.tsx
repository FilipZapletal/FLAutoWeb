import { PageHead } from "@/components/admin/ui";
import { ServiceEditForm } from "@/components/admin/ServiceEditForm";
import { getAdminServices } from "@/lib/services/admin";

export const metadata = { title: "Přidat službu" };

export default async function NewServicePage() {
  const services = await getAdminServices();
  const sortOrder = services.length ? Math.max(...services.map((s) => s.sortOrder)) + 1 : 0;
  return (
    <>
      <PageHead title="Přidat službu" />
      <ServiceEditForm
        initial={{
          title: "",
          tag: "",
          icon: "WRENCH",
          summary: "",
          items: "",
          description: "",
          priceNote: "",
          metaTitle: "",
          metaDescription: "",
          published: true,
          sortOrder: String(sortOrder),
          slug: "",
          prices: [],
        }}
      />
    </>
  );
}
