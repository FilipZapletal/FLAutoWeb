import Link from "next/link";
import { LeadRow, leadSubject } from "@/components/admin/LeadRow";
import { RowList } from "@/components/admin/MobileRows";
import { LeadStatusBadge, LeadTypeLabel, PageHead, StatCard, tableClass } from "@/components/admin/ui";
import { formatBooking, effectiveBooking } from "@/lib/booking";
import { formatDateTime, phoneDigits } from "@/lib/format";
import { LEAD_TYPE_LABELS } from "@/lib/labels";
import { leadCategory } from "@/lib/lead-categories";
import { getAnalytics } from "@/lib/analytics/stats";
import { getDashboard } from "@/lib/leads/service";

export const metadata = { title: "Dashboard" };

type Row = Awaited<ReturnType<typeof getDashboard>>["todo"][number];

const Dot = ({ color }: { color: string }) => <span className="mr-2 inline-block h-2.5 w-2.5 shrink-0 rounded-full align-middle" style={{ background: color }} aria-hidden="true" />;

function Customer({ l }: { l: Row }) {
  return (
    <>
      <Link href={`/admin/poptavky/${l.id}`} className="font-semibold hover:text-acc">{l.name}</Link>
      <div className="text-xs text-muted">
        <a href={`tel:${phoneDigits(l.phone)}`} className="hover:text-acc">{l.phone}</a>
      </div>
    </>
  );
}

export default async function DashboardPage({ searchParams }: PageProps<"/admin">) {
  const sp = await searchParams;
  const [d, visits] = await Promise.all([getDashboard(typeof sp.sekce === "string" ? sp.sekce : ""), getAnalytics(7)]);
  const s = d.stats;
  const tab = (active: boolean) => `btn-outline btn-sm shrink-0 ${active ? "border-acc text-acc" : ""}`;
  const totalNew = d.sections.reduce((n, c) => n + c.newCount, 0);

  return (
    <>
      <PageHead title="Dashboard">
        <div className="flex gap-2">
          <Link href="/admin/kalendar" className="btn-outline max-md:hidden">Kalendář</Link>
          <Link href="/admin/vozidla/novy" className="btn">+ Přidat vozidlo</Link>
        </div>
      </PageHead>
      <div className="mb-6 grid grid-cols-2 gap-2 md:mb-8 md:gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Aktivní vozy" value={s.activeVehicles} href="/admin/vozidla" />
        <StatCard label="Nové poptávky" value={s.newLeads} href="/admin/poptavky?status=NEW" />
        <StatCard label="Rezervované vozy" value={s.reserved} href="/admin/vozidla" />
        <StatCard label="Servisní poptávky (otevřené)" value={s.serviceLeads} href="/admin/poptavky?type=SERVICE" />
        <StatCard label="Prodáno tento měsíc" value={s.soldThisMonth} />
        <StatCard label="Recenze ke schválení" value={s.pendingReviews} href="/admin/recenze" />
      </div>

      <Link href="/admin/analyza" className="card mb-5 flex items-center justify-between gap-3 p-3 transition-colors hover:border-acc md:p-4">
        <span className="min-w-0 text-sm">
          <span className="block font-semibold">Návštěvnost za 7 dní</span>
          <span className="text-muted">
            {visits.hasData
              ? `${visits.totals.visitors.toLocaleString("cs-CZ")} návštěvníků · ${visits.totals.conversionRate} % kontaktovalo nás · ${visits.totals.noConversionRate} % odešlo bez akce`
              : "Zatím žádná data, měření právě začíná"}
          </span>
        </span>
        <span className="shrink-0 text-sm text-acc">Podrobnosti →</span>
      </Link>

      <nav aria-label="Služby" className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        <Link href="/admin" className={tab(!d.active)} aria-current={!d.active ? "page" : undefined}>
          Vše
          {totalNew > 0 && <span className="ml-2 rounded-full bg-acc px-1.5 text-[11px] text-white">{totalNew}</span>}
        </Link>
        {d.sections.map((c) => (
          <Link key={c.key} href={`/admin?sekce=${c.key}`} className={tab(d.active?.key === c.key)} aria-current={d.active?.key === c.key ? "page" : undefined}>
            <Dot color={c.color} />
            {c.label}
            {c.newCount > 0 && <span className="ml-2 rounded-full bg-acc px-1.5 text-[11px] text-white">{c.newCount}</span>}
          </Link>
        ))}
      </nav>

      <h2 className="mb-3 text-lg">
        K vyřízení{d.active ? ` – ${d.active.label}` : ""}
      </h2>
      <p className="mb-3 text-sm text-muted">Otevřené poptávky a objednávky, u kterých ještě není domluvený termín.</p>
      <RowList empty="Nic nečeká na vyřízení.">
        {d.todo.map((l) => (
          <LeadRow key={l.id} lead={l} />
        ))}
      </RowList>
      <div className="card mb-8 overflow-x-auto max-md:hidden">
        <table className={tableClass}>
          <thead>
            <tr>
              <th>Přijato</th>
              <th>Zákazník</th>
              <th>Co chce</th>
              <th>Typ</th>
              <th>Přání termínu</th>
              <th>Stav</th>
            </tr>
          </thead>
          <tbody>
            {d.todo.map((l) => (
              <tr key={l.id} className="hover:bg-card2">
                <td className="whitespace-nowrap text-muted">{formatDateTime(l.createdAt)}</td>
                <td><Customer l={l} /></td>
                <td><Dot color={leadCategory(l).color} />{leadSubject(l)}</td>
                <td><LeadTypeLabel type={l.type} /></td>
                <td className="whitespace-nowrap">{formatBooking(l) ?? "—"}</td>
                <td><LeadStatusBadge status={l.status} /></td>
              </tr>
            ))}
            {d.todo.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted">Nic nečeká na vyřízení.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg">
          Potvrzené termíny{d.active ? ` – ${d.active.label}` : ""}
        </h2>
        <Link href="/admin/kalendar" className="text-sm text-muted underline">Zobrazit v kalendáři</Link>
      </div>
      <RowList empty="Žádné potvrzené termíny.">
        {d.schedule.map((l) => (
          <LeadRow key={l.id} lead={l} />
        ))}
      </RowList>
      <div className="card overflow-x-auto max-md:hidden">
        <table className={tableClass}>
          <thead>
            <tr>
              <th>Termín</th>
              <th>Služba</th>
              <th>Zákazník</th>
              <th>Co</th>
              <th>Stav</th>
            </tr>
          </thead>
          <tbody>
            {d.schedule.map((l) => (
              <tr key={l.id} className="hover:bg-card2">
                <td className="whitespace-nowrap">
                  <span className="font-semibold">{formatBooking(l)}</span>
                  {effectiveBooking(l).confirmed && <div className="text-xs text-muted">potvrzeno</div>}
                </td>
                <td className="whitespace-nowrap">
                  <Dot color={leadCategory(l).color} />
                  {l.type === "SERVICE" ? (l.service?.title ?? "Servis") : LEAD_TYPE_LABELS[l.type]}
                </td>
                <td><Customer l={l} /></td>
                <td>{leadSubject(l)}</td>
                <td><LeadStatusBadge status={l.status} /></td>
              </tr>
            ))}
            {d.schedule.length === 0 && (
              <tr>
                <td colSpan={5} className="text-muted">Žádné potvrzené termíny.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
