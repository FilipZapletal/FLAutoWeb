import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/admin/ui";
import { ServiceEditForm } from "@/components/admin/ServiceEditForm";
import { parseId } from "@/lib/api";
import { getAdminService } from "@/lib/services/admin";
import { parseServicePrices } from "@/lib/validation/service";

export const metadata = { title: "Upravit službu" };

export default async function EditServicePage({ params }: PageProps<"/admin/sluzby/[id]">) {
  const id = parseId((await params).id);
  const s = id ? await getAdminService(id) : null;
  if (!s) notFound();

  return (
    <>
      <PageHead title={s.title}>
        {s.published && (
          <Link href={`/servis/${s.slug}`} target="_blank" className="btn-outline">Zobrazit na webu ↗</Link>
        )}
      </PageHead>
      {!s.published && <p className="card mb-4 p-3 text-sm text-muted">Služba je skrytá – na webu se nezobrazuje.</p>}
      <ServiceEditForm
        serviceId={s.id}
        initial={{
          title: s.title,
          tag: s.tag ?? "",
          icon: s.icon,
          summary: s.summary,
          items: s.items.join("\n"),
          description: s.description ?? "",
          priceNote: s.priceNote ?? "",
          metaTitle: s.metaTitle ?? "",
          metaDescription: s.metaDescription ?? "",
          published: s.published,
          sortOrder: String(s.sortOrder),
          slug: s.slug,
          prices: parseServicePrices(s.prices),
        }}
      />
    </>
  );
}
