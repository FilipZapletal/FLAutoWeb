import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/admin/ui";
import { ServiceEditForm } from "@/components/admin/ServiceEditForm";
import { ServiceComparisonsManager } from "@/components/admin/ServiceComparisonsManager";
import { ServiceManage } from "@/components/admin/ServiceRowControls";
import { parseId } from "@/lib/api";
import { getAdminService } from "@/lib/services/admin";
import { getServiceComparisons } from "@/lib/services/comparisons";
import { parseServicePrices } from "@/lib/validation/service";

export const metadata = { title: "Upravit službu" };

export default async function EditServicePage({ params }: PageProps<"/admin/sluzby/[id]">) {
  const id = parseId((await params).id);
  const s = id ? await getAdminService(id) : null;
  if (!s) notFound();
  const comparisons = await getServiceComparisons(s.id);

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
          contactPhone: s.contactPhone ?? "",
          contactName: s.contactName ?? "",
          pickItems: s.pickItems,
          metaTitle: s.metaTitle ?? "",
          metaDescription: s.metaDescription ?? "",
          published: s.published,
          sortOrder: String(s.sortOrder),
          slug: s.slug,
          prices: parseServicePrices(s.prices),
        }}
      />
      <ServiceComparisonsManager serviceId={s.id} initial={comparisons.map((c) => ({ id: c.id, caption: c.caption, before: { thumb: c.before.thumb }, after: { thumb: c.after.thumb } }))} />
      <ServiceManage id={s.id} published={s.published} />
    </>
  );
}
