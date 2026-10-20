import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadBookingForm } from "@/components/admin/LeadBookingForm";
import { LeadDeleteButton } from "@/components/admin/LeadDeleteButton";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import { LeadStatusBadge, LeadTypeLabel, PageHead } from "@/components/admin/ui";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";
import { parseId } from "@/lib/api";
import { effectiveBooking, formatConfirmedBooking, formatPreferredBooking, pragueToday } from "@/lib/booking";
import { formatDate, formatDateTime, formatPrice, phoneDigits, whatsappLink } from "@/lib/format";
import { VEHICLE_STATUS_LABELS } from "@/lib/labels";
import { parseOrderItems, orderTotal } from "@/lib/order-items";
import { leadExpiresAt } from "@/lib/leads/retention";
import { getLead } from "@/lib/leads/service";

export const metadata = { title: "Detail poptávky" };

export default async function LeadDetailPage({ params }: PageProps<"/admin/poptavky/[id]">) {
  const id = parseId((await params).id);
  const lead = id ? await getLead(id) : null;
  if (!lead) notFound();

  const preferred = formatPreferredBooking(lead);
  const confirmedText = formatConfirmedBooking(lead);
  const booking = effectiveBooking(lead);
  const items = parseOrderItems(lead.items);
  const total = orderTotal(items);
  const expires = leadExpiresAt(lead);
  // Prázdné hodnoty (false/null) jsou řádky, které se u daného typu poptávky nezobrazují.
  const rows: ([string, React.ReactNode] | false | null | "")[] = [
    ["Datum", formatDateTime(lead.createdAt)],
    ["Typ", <LeadTypeLabel key="t" type={lead.type} />],
    lead.service && ["Služba", lead.service.title],
    items.length > 0 && [
      "Objednané položky",
      <div key="i">
        <ul className="space-y-1">
          {items.map((i) => (
            <li key={i.label} className="flex justify-between gap-3">
              <span>{i.label}</span>
              <span className="whitespace-nowrap text-muted">{i.from ? "od " : ""}{formatPrice(i.price)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 border-t border-line pt-2 font-semibold">
          Celkem {total.fromAny ? "od " : ""}{formatPrice(total.sum)} <span className="font-normal text-muted">(orientační, podle ceníku)</span>
        </p>
      </div>,
    ],
    confirmedText && ["Domluvený termín", <span key="c" className="font-semibold">{confirmedText}</span>],
    preferred && [confirmedText ? "Přání zákazníka" : "Termín", <span key="b" className={confirmedText ? "" : "font-semibold"}>{preferred}{!confirmedText && <span className="font-normal text-muted"> (přání zákazníka)</span>}</span>],
    [
      "Vůz",
      lead.vehicle ? (
        <span key="v">
          <Link href={`/vozy/${lead.vehicle.slug}`} target="_blank" className="underline">
            {[lead.vehicle.brand, lead.vehicle.model, lead.vehicle.version].filter(Boolean).join(" ")} ↗
          </Link>
          <span className="block text-xs text-muted">Stav vozu: {VEHICLE_STATUS_LABELS[lead.vehicle.status]} (mění se automaticky podle stavu poptávky)</span>
        </span>
      ) : (
        (lead.car ?? "—")
      ),
    ],
    ["Telefon", <a key="p" href={`tel:${phoneDigits(lead.phone)}`} className="font-semibold hover:text-acc">{lead.phone}</a>],
    ["E-mail", lead.email ? <a key="e" href={`mailto:${lead.email}`} className="hover:text-acc">{lead.email}</a> : "—"],
  ];

  return (
    <>
      <PageHead title={lead.name}>
        <Link href="/admin/poptavky" className="btn-outline">← Všechny poptávky</Link>
      </PageHead>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="card p-5">
          <dl className="divide-y divide-line text-sm">
            {rows.filter((r) => !!r).map(([label, value]) => (
              <div key={label} className="grid grid-cols-[100px_minmax(0,1fr)] gap-3 py-2 sm:grid-cols-[120px_minmax(0,1fr)]">
                <dt className="text-muted">{label}</dt>
                <dd className="[overflow-wrap:anywhere]">{value}</dd>
              </div>
            ))}
          </dl>
          <h2 className="mb-2 mt-5 text-base">Zpráva</h2>
          <p className="whitespace-pre-line rounded-inner bg-card2 p-3 text-sm [overflow-wrap:anywhere]">{lead.message || "—"}</p>
        </div>
        <div className="card h-fit space-y-4 p-5">
          <div>
            <p className="label">Aktuální stav</p>
            <LeadStatusBadge status={lead.status} />
          </div>
          <div>
            <p className="label">Změnit stav</p>
            <LeadStatusSelect key={lead.status} id={lead.id} status={lead.status} type={lead.type} />
            <p className="mt-2 text-xs text-muted">
              {lead.type === "SERVICE"
                ? "Nová → Kontaktováno → Potvrzeno (termín domluven) → hotovo"
                : lead.type === "WANTED_CAR"
                  ? "Nová → Kontaktováno → V jednání → Prodáno (nebo Ztraceno)"
                  : "Nová → Kontaktováno → Potvrzeno (prohlídka domluvena) → V jednání → Rezervace → Prodáno. Rezervace a Prodáno se propíšou do stavu vozu."}
            </p>
            <p className="mt-2 text-xs text-muted">
              {expires
                ? `Automaticky se smaže ${formatDate(expires)}, pokud se do té doby nezmění její stav.${lead.type === "SERVICE" || lead.type === "WANTED_CAR" ? "" : " Rezervace a Prodáno se nemažou."}`
                : "Poptávka se nemaže (vedla k rezervaci nebo prodeji)."}
            </p>
          </div>
          {lead.type !== "WANTED_CAR" && (
            <div className="border-t border-line pt-4">
              <LeadBookingForm
                key={`${lead.confirmedDate?.getTime() ?? 0}-${lead.confirmedSlot}`}
                id={lead.id}
                date={booking.date ? booking.date.toISOString().slice(0, 10) : null}
                slot={booking.slot}
                confirmed={booking.confirmed}
                min={pragueToday()}
              />
            </div>
          )}
          <div className="flex flex-col gap-2 border-t border-line pt-4">
            <a href={`tel:${phoneDigits(lead.phone)}`} className="btn"><PhoneIcon size={16} /> Zavolat</a>
            <a href={whatsappLink(lead.phone)} target="_blank" rel="noopener noreferrer" className="btn-outline"><WhatsAppIcon size={16} /> WhatsApp</a>
            {lead.email && <a href={`mailto:${lead.email}`} className="btn-outline"><MailIcon size={16} /> E-mail</a>}
          </div>
          <div className="border-t border-line pt-4">
            <LeadDeleteButton id={lead.id} name={lead.name} backTo="/admin/poptavky" label="Smazat poptávku" />
          </div>
        </div>
      </div>
    </>
  );
}
