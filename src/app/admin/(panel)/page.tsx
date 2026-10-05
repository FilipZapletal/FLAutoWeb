import Link from "next/link";
import { LeadStatusBadge, LeadTypeLabel, PageHead, StatCard, tableClass } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { getDashboardStats } from "@/lib/leads/service";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const s = await getDashboardStats();
  return (
    <>
      <PageHead title="Dashboard">
        <Link href="/admin/vozidla/novy" className="btn">+ Přidat vozidlo</Link>
      </PageHead>
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Aktivní vozy" value={s.activeVehicles} href="/admin/vozidla" />
        <StatCard label="Nové poptávky" value={s.newLeads} href="/admin/poptavky?status=NEW" />
        <StatCard label="Rezervované vozy" value={s.reserved} href="/admin/vozidla" />
        <StatCard label="Servisní poptávky (otevřené)" value={s.serviceLeads} href="/admin/poptavky?type=SERVICE" />
        <StatCard label="Prodáno tento měsíc" value={s.soldThisMonth} />
      </div>

      <h2 className="mb-3 text-lg">Poslední poptávky</h2>
      <div className="card overflow-x-auto">
        <table className={tableClass}>
          <thead>
            <tr>
              <th>Zákazník</th>
              <th>Vůz</th>
              <th>Typ</th>
              <th>Datum</th>
              <th>Stav</th>
            </tr>
          </thead>
          <tbody>
            {s.recentLeads.map((l) => (
              <tr key={l.id} className="hover:bg-card2">
                <td>
                  <Link href={`/admin/poptavky/${l.id}`} className="font-semibold hover:text-acc">{l.name}</Link>
                </td>
                <td>{l.vehicle ? `${l.vehicle.brand} ${l.vehicle.model}` : "—"}</td>
                <td><LeadTypeLabel type={l.type} /></td>
                <td className="whitespace-nowrap text-muted">{formatDateTime(l.createdAt)}</td>
                <td><LeadStatusBadge status={l.status} /></td>
              </tr>
            ))}
            {s.recentLeads.length === 0 && (
              <tr>
                <td colSpan={5} className="text-muted">Zatím žádné poptávky.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
