import Link from "next/link";
import { LeadStatusBadge, LeadTypeLabel, PageHead, StatCard, tableClass } from "@/components/admin/ui";
import { formatBooking, effectiveBooking } from "@/lib/booking";
import { formatDateTime, phoneDigits } from "@/lib/format";
import { LEAD_TYPE_LABELS } from "@/lib/labels";
import { leadCategory } from "@/lib/lead-categories";
import { getDashboard } from "@/lib/leads/service";
import { parseOrderItems } from "@/lib/order-items";

export const metadata = { title: "Dashboard" };

type Row = Awaited<ReturnType<typeof getDashboard>>["todo"][number];

const Dot = ({ color }: { color: string }) => <span className="mr-2 inline-block h-2.5 w-2.5 shrink-0 rounded-full align-middle" style={{ background: color }} aria-hidden="true" />;

/** Co zákazník chce: vůz, služba (a počet objednaných položek), hledané auto. */
function subject(l: Row) {
  if (l.vehicle) return `${l.vehicle.brand} ${l.vehicle.model}`;
  const items = parseOrderItems(l.items);
  if (l.type === "SERVICE") return [l.service?.title, items.length ? `${items.length} položek` : null, l.car].filter(Boolean).join(" · ") || "—";
  return l.car ?? "—";
}

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
  const d = await getDashboard(typeof sp.sekce === "string" ? sp.sekce : "");
  const s = d.stats;
  const tab = (active: boolean) => `btn-outline btn-sm shrink-0 ${active ? "border-acc text-acc" : ""}`;
  const totalNew = d.sections.reduce((n, c) => n + c.newCount, 0);

  return (
    <>
      <PageHead title="Dashboard">
        <div className="flex gap-2">
          <Link href="/admin/kalendar" className="btn-outline">Kalendář</Link>
          <Link href="/admin/vozidla/novy" className="btn">+ Přidat vozidlo</Link>
        </div>
      </PageHead>
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Aktivní vozy" value={s.activeVehicles} href="/admin/vozidla" />
        <StatCard label="Nové poptávky" value={s.newLeads} href="/admin/poptavky?status=NEW" />
        <StatCard label="Rezervované vozy" value={s.reserved} href="/admin/vozidla" />
        <StatCard label="Servisní poptávky (otevřené)" value={s.serviceLeads} href="/admin/poptavky?type=SERVICE" />
        <StatCard label="Prodáno tento měsíc" value={s.soldThisMonth} />
        <StatCard label="Recenze ke schválení" value={s.pendingReviews} href="/admin/recenze" />
      </div>

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
      <div className="card mb-8 overflow-x-auto">
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
                <td data-label="Přijato" className="whitespace-nowrap text-muted">{formatDateTime(l.createdAt)}</td>
                <td data-label="Zákazník"><Customer l={l} /></td>
                <td data-label="Co chce"><Dot color={leadCategory(l).color} />{subject(l)}</td>
                <td data-label="Typ"><LeadTypeLabel type={l.type} /></td>
                <td data-label="Přání termínu" className="whitespace-nowrap">{formatBooking(l) ?? "—"}</td>
                <td data-label="Stav"><LeadStatusBadge status={l.status} /></td>
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
      <div className="card overflow-x-auto">
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
                <td data-label="Termín" className="whitespace-nowrap">
                  <span className="font-semibold">{formatBooking(l)}</span>
                  {effectiveBooking(l).confirmed && <div className="text-xs text-muted">potvrzeno</div>}
                </td>
                <td data-label="Služba" className="whitespace-nowrap">
                  <Dot color={leadCategory(l).color} />
                  {l.type === "SERVICE" ? (l.service?.title ?? "Servis") : LEAD_TYPE_LABELS[l.type]}
                </td>
                <td data-label="Zákazník"><Customer l={l} /></td>
                <td data-label="Co">{subject(l)}</td>
                <td data-label="Stav"><LeadStatusBadge status={l.status} /></td>
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
