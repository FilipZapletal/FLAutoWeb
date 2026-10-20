import Link from "next/link";
import { LeadStatusBadge, PageHead } from "@/components/admin/ui";
import { addDays, effectiveBooking, formatBookingDate, pragueToday } from "@/lib/booking";
import { phoneDigits } from "@/lib/format";
import { LEAD_TYPE_LABELS, TIME_SLOT_LABELS } from "@/lib/labels";
import { CARS_CATEGORY, WANTED_CATEGORY, leadCategory, serviceCategory } from "@/lib/lead-categories";
import { getBookingsBetween } from "@/lib/leads/service";
import { getPublicServices } from "@/lib/services/public";

export const metadata = { title: "Kalendář" };

const WEEKDAYS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
const monthLabel = (iso: string) => new Intl.DateTimeFormat("cs-CZ", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}-01T00:00:00.000Z`));

/** "RRRR-MM" posunuté o n měsíců. */
function shiftMonth(ym: string, n: number) {
  const d = new Date(`${ym}-01T00:00:00.000Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 7);
}

export default async function CalendarPage({ searchParams }: PageProps<"/admin/kalendar">) {
  const sp = await searchParams;
  const today = pragueToday();
  const currentMonth = today.slice(0, 7);
  const requested = typeof sp.m === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(sp.m) ? sp.m : currentMonth;
  // Kalendář ukazuje jen nadcházející objednávky, takže minulé měsíce se nenabízejí.
  const month = requested < currentMonth ? currentMonth : requested;
  const first = `${month}-01`;
  const nextMonth = shiftMonth(month, 1);
  const last = addDays(`${nextMonth}-01`, -1);
  const daysInMonth = Number(last.slice(8));
  const offset = (new Date(`${first}T00:00:00.000Z`).getUTCDay() + 6) % 7; // pondělí = 0

  const [bookings, services] = await Promise.all([getBookingsBetween(first, last), getPublicServices()]);
  const byDay = new Map<string, typeof bookings>();
  for (const b of bookings) {
    const date = effectiveBooking(b).date!.toISOString().slice(0, 10);
    byDay.set(date, [...(byDay.get(date) ?? []), b]);
  }

  const firstWithItems = [...byDay.keys()].sort()[0];
  const requestedDay = typeof sp.den === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.den) && sp.den.startsWith(month) ? sp.den : null;
  const selected = requestedDay ?? (month === currentMonth ? today : (firstWithItems ?? first));
  const dayItems = byDay.get(selected) ?? [];
  const categories = [CARS_CATEGORY, ...services.map(serviceCategory), WANTED_CATEGORY].filter((c) => c.key !== WANTED_CATEGORY.key);

  const cells: (string | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`)];
  while (cells.length % 7) cells.push(null);

  return (
    <>
      <PageHead title="Kalendář">
        <Link href="/admin" className="btn-outline">← Dashboard</Link>
      </PageHead>
      <p className="mb-4 text-sm text-muted">Nadcházející objednávky a prohlídky podle domluveného termínu. Plná barva = potvrzeno, čárkovaně = zatím jen přání zákazníka.</p>

      <div className="mb-3 flex items-center justify-between gap-3">
        {month > currentMonth ? (
          <Link href={`/admin/kalendar?m=${shiftMonth(month, -1)}`} className="btn-outline btn-sm" aria-label="Předchozí měsíc">‹</Link>
        ) : (
          <span className="btn-outline btn-sm invisible" aria-hidden="true">‹</span>
        )}
        <h2 className="text-lg capitalize">{monthLabel(month)}</h2>
        <Link href={`/admin/kalendar?m=${nextMonth}`} className="btn-outline btn-sm" aria-label="Další měsíc">›</Link>
      </div>

      <div className="card overflow-hidden p-2 sm:p-3">
        <div className="mb-1 grid grid-cols-7 text-center text-[11px] uppercase tracking-wider text-muted sm:text-xs">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, i) => {
            if (!date) return <div key={i} />;
            const items = byDay.get(date) ?? [];
            const past = date < today;
            const isSelected = date === selected;
            const cls = `flex min-h-14 flex-col gap-1 rounded-inner border p-1 text-left sm:min-h-24 sm:p-1.5 ${
              isSelected ? "border-acc bg-card2" : "border-line"
            } ${past ? "opacity-40" : "transition-colors hover:border-acc"}`;
            const body = (
              <>
                <span className={`text-xs font-semibold sm:text-sm ${date === today ? "text-acc" : ""}`}>{Number(date.slice(8))}</span>
                {/* Telefon: jen barevné tečky. Počítač: štítky se jménem. */}
                <span className="flex flex-wrap gap-0.5 sm:hidden">
                  {items.slice(0, 6).map((b) => (
                    <span key={b.id} className="h-2 w-2 rounded-full" style={{ background: leadCategory(b).color }} />
                  ))}
                </span>
                <span className="hidden flex-col gap-0.5 sm:flex">
                  {items.slice(0, 3).map((b) => {
                    const { confirmed, slot } = effectiveBooking(b);
                    const color = leadCategory(b).color;
                    return (
                      <span
                        key={b.id}
                        className={`truncate rounded px-1 text-[11px] leading-5 ${confirmed ? "text-black" : "border border-dashed"}`}
                        style={confirmed ? { background: color } : { borderColor: color, color }}
                      >
                        {slot ? `${slot === "DOPOLEDNE" ? "dop." : "odp."} ` : ""}
                        {b.name}
                      </span>
                    );
                  })}
                  {items.length > 3 && <span className="text-[11px] text-muted">+ {items.length - 3} další</span>}
                </span>
              </>
            );
            return past ? (
              <div key={date} className={cls} aria-disabled="true">{body}</div>
            ) : (
              <Link key={date} href={`/admin/kalendar?m=${month}&den=${date}`} className={cls} aria-current={isSelected ? "date" : undefined}>
                {body}
              </Link>
            );
          })}
        </div>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label="Legenda">
        {categories.map((c) => (
          <li key={c.key} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} aria-hidden="true" />
            {c.label}
          </li>
        ))}
      </ul>

      <h2 className="mb-3 mt-8 text-lg">{formatBookingDate(selected)}</h2>
      <div className="space-y-2">
        {dayItems.map((b) => {
          const { confirmed, slot } = effectiveBooking(b);
          const cat = leadCategory(b);
          return (
            <div key={b.id} className="card flex flex-wrap items-center gap-x-4 gap-y-1 p-3 text-sm" style={{ borderLeft: `4px solid ${cat.color}` }}>
              <span className="w-24 shrink-0 font-semibold">{slot ? TIME_SLOT_LABELS[slot] : "Bez upřesnění"}</span>
              <span className="min-w-0 flex-1">
                <Link href={`/admin/poptavky/${b.id}`} className="font-semibold [overflow-wrap:anywhere] hover:text-acc">{b.name}</Link>
                <span className="block text-xs text-muted [overflow-wrap:anywhere]">
                  {b.type === "SERVICE" ? (b.service?.title ?? "Servis") : `${LEAD_TYPE_LABELS[b.type]}: ${b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : "—"}`}
                  {b.car ? ` · ${b.car}` : ""} · {confirmed ? "potvrzeno" : "přání zákazníka"}
                </span>
              </span>
              <a href={`tel:${phoneDigits(b.phone)}`} className="hover:text-acc">{b.phone}</a>
              <LeadStatusBadge status={b.status} />
            </div>
          );
        })}
        {dayItems.length === 0 && <p className="text-sm text-muted">V tento den není nic objednáno.</p>}
      </div>
    </>
  );
}
