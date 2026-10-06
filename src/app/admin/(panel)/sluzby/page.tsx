import Link from "next/link";
import { PageHead, tableClass } from "@/components/admin/ui";
import { ServiceActions } from "@/components/admin/ServiceRowControls";
import { ServiceIconView } from "@/components/services/ServiceIconView";
import { lowestPrice } from "@/lib/services/public";
import { getAdminServices } from "@/lib/services/admin";
import { formatPrice } from "@/lib/format";
import { parseServicePrices } from "@/lib/validation/service";

export const metadata = { title: "Služby" };

export default async function AdminServicesPage() {
  const services = await getAdminServices();

  return (
    <>
      <PageHead title="Služby">
        <Link href="/admin/sluzby/nova" className="btn">+ Přidat službu</Link>
      </PageHead>
      <p className="mb-4 text-sm text-muted">Služby se zobrazují na stránce Servis a každá má vlastní stránku s ceníkem.</p>

      <div className="card overflow-x-auto">
        <table className={tableClass}>
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Služba</th>
              <th>Cena</th>
              <th>Na webu</th>
              <th>Akce</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => {
              const prices = parseServicePrices(s.prices);
              const low = lowestPrice(prices);
              return (
                <tr key={s.id} className="hover:bg-card2">
                  <td className="text-muted">{s.sortOrder}</td>
                  <td className="min-w-[220px]">
                    <div className="flex items-center gap-2">
                      <span className="text-acc"><ServiceIconView icon={s.icon} size={18} /></span>
                      <Link href={`/admin/sluzby/${s.id}`} className="font-semibold hover:text-acc">{s.title}</Link>
                    </div>
                    <div className="text-xs text-muted">/servis/{s.slug} · {s.items.length} odrážek · {prices.length} položek ceníku</div>
                  </td>
                  <td className="whitespace-nowrap">{low ? `${low.from ? "od " : ""}${formatPrice(low.price)}` : <span className="text-muted">na dotaz</span>}</td>
                  <td>{s.published ? <span className="text-sold">Ano</span> : <span className="text-muted">Skrytá</span>}</td>
                  <td><ServiceActions id={s.id} slug={s.slug} published={s.published} /></td>
                </tr>
              );
            })}
            {services.length === 0 && (
              <tr>
                <td colSpan={5} className="text-muted">Zatím žádné služby.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
