import Link from "next/link";
import { ReviewApproveButton } from "@/components/admin/ReviewApproveButton";
import { ReviewDeleteButton } from "@/components/admin/ReviewDeleteButton";
import { PageHead, tableClass } from "@/components/admin/ui";
import { Stars } from "@/components/reviews/Stars";
import { getAdminReviews } from "@/lib/reviews/service";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Recenze" };

export default async function ReviewsPage() {
  const [reviews, settings] = await Promise.all([getAdminReviews(), getSettings()]);

  return (
    <>
      <PageHead title="Recenze">
        <Link href="/admin/recenze/nova" className="btn">+ Přidat recenzi</Link>
      </PageHead>
      <p className="mb-4 max-w-2xl text-sm text-muted">
        Recenze se zobrazují na úvodní stránce a na stránce Servis podle zaškrtnutí (nejvýše 6 na stránce). Recenze, které napsali návštěvníci přes formulář na webu, se zobrazí
        až po vašem schválení (tlačítko Schválit). Před schválením zkontrolujte, že recenze není spam ani nevhodná.
        Hodnocení na Googlu{settings.googleRating !== null ? ` (${settings.googleRating.toLocaleString("cs-CZ")})` : ""} se nastavuje v{" "}
        <Link href="/admin/nastaveni" className="underline">Nastavení</Link>.
      </p>
      <div className="card overflow-x-auto">
        <table className={tableClass}>
          <thead>
            <tr>
              <th>Zákazník</th>
              <th>Hodnocení</th>
              <th>Text</th>
              <th>Zobrazení</th>
              <th>Pořadí</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="hover:bg-card2">
                <td>
                  <Link href={`/admin/recenze/${r.id}`} className="font-semibold hover:text-acc">{r.author}</Link>
                  {r.source && <div className="text-xs text-muted">{r.source}</div>}
                  {!r.approved && <div className="mt-1"><span className="badge bg-acc text-white">Čeká na schválení</span></div>}
                </td>
                <td><Stars rating={r.rating} size={14} /></td>
                <td><div className="max-w-[320px] truncate text-muted">{r.text}</div></td>
                <td className="whitespace-nowrap">
                  {!r.approved ? (
                    <span className="text-muted">Zatím neviditelná</span>
                  ) : (
                    [r.showOnHome && "Úvod", r.showOnService && "Servis"].filter(Boolean).join(", ") || <span className="text-muted">Skrytá</span>
                  )}
                </td>
                <td>{r.sortOrder}</td>
                <td>
                  <div className="flex gap-1.5">
                    {(!r.approved || r.fromCustomer) && <ReviewApproveButton id={r.id} approved={r.approved} />}
                    <Link href={`/admin/recenze/${r.id}`} className="btn-outline btn-sm">Upravit</Link>
                    <ReviewDeleteButton id={r.id} />
                  </div>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted">Zatím žádné recenze.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
