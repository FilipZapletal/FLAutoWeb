import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import { LeadStatusBadge, LeadTypeLabel, PageHead } from "@/components/admin/ui";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";
import { parseId } from "@/lib/api";
import { formatBooking } from "@/lib/booking";
import { formatDate, formatDateTime, phoneDigits, whatsappLink } from "@/lib/format";
import { leadExpiresAt } from "@/lib/leads/retention";
import { getLead } from "@/lib/leads/service";

export const metadata = { title: "Detail poptávky" };

export default async function LeadDetailPage({ params }: PageProps<"/admin/poptavky/[id]">) {
  const id = parseId((await params).id);
  const lead = id ? await getLead(id) : null;
  if (!lead) notFound();

  const booking = formatBooking(lead);
  const expires = leadExpiresAt(lead);
  // Prázdné hodnoty (false/null) jsou řádky, které se u daného typu poptávky nezobrazují.
  const rows: ([string, React.ReactNode] | false | null | "")[] = [
    ["Datum", formatDateTime(lead.createdAt)],
    ["Typ", <LeadTypeLabel key="t" type={lead.type} />],
    lead.service && ["Služba", lead.service.title],
    booking && ["Termín", <span key="b" className="font-semibold">{booking} <span className="font-normal text-muted">(přání zákazníka)</span></span>],
    [
      "Vůz",
      lead.vehicle ? (
        <Link key="v" href={`/vozy/${lead.vehicle.slug}`} target="_blank" className="underline">
          {[lead.vehicle.brand, lead.vehicle.model, lead.vehicle.version].filter(Boolean).join(" ")} ↗
        </Link>
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
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="card p-5">
          <dl className="divide-y divide-line text-sm">
            {rows.filter((r) => !!r).map(([label, value]) => (
              <div key={label} className="grid grid-cols-[120px_1fr] gap-3 py-2">
                <dt className="text-muted">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <h2 className="mb-2 mt-5 text-base">Zpráva</h2>
          <p className="whitespace-pre-line rounded-inner bg-card2 p-3 text-sm">{lead.message || "—"}</p>
        </div>
        <div className="card h-fit space-y-4 p-5">
          <div>
            <p className="label">Aktuální stav</p>
            <LeadStatusBadge status={lead.status} />
          </div>
          <div>
            <p className="label">Změnit stav</p>
            <LeadStatusSelect key={lead.status} id={lead.id} status={lead.status} />
            <p className="mt-2 text-xs text-muted">Nová → Kontaktováno → V jednání → Rezervace → Prodáno (nebo Ztraceno)</p>
            <p className="mt-2 text-xs text-muted">
              {expires
                ? `Automaticky se smaže ${formatDate(expires)}, pokud se do té doby nezmění její stav. Rezervace a Prodáno se nemažou.`
                : "Poptávka se nemaže (vedla k rezervaci nebo prodeji)."}
            </p>
          </div>
          <div className="flex flex-col gap-2 border-t border-line pt-4">
            <a href={`tel:${phoneDigits(lead.phone)}`} className="btn"><PhoneIcon size={16} /> Zavolat</a>
            <a href={whatsappLink(lead.phone)} target="_blank" rel="noopener noreferrer" className="btn-outline"><WhatsAppIcon size={16} /> WhatsApp</a>
            {lead.email && <a href={`mailto:${lead.email}`} className="btn-outline"><MailIcon size={16} /> E-mail</a>}
          </div>
        </div>
      </div>
    </>
  );
}
