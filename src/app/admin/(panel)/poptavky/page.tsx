import Link from "next/link";
import { LeadDeleteButton } from "@/components/admin/LeadDeleteButton";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import { LeadTypeLabel, PageHead, tableClass } from "@/components/admin/ui";
import { GetForm } from "@/components/ui/GetForm";
import { LeadStatus, LeadType } from "@/generated/prisma/enums";
import { effectiveBooking, formatBooking } from "@/lib/booking";
import { formatDateTime, phoneDigits } from "@/lib/format";
import { CARS_CATEGORY, WANTED_CATEGORY, leadCategory, serviceCategory } from "@/lib/lead-categories";
import { LEAD_STATUS_LABELS, LEAD_STATUS_ORDER, LEAD_TYPE_LABELS, VEHICLE_STATUS_LABELS } from "@/lib/labels";
import { LEAD_RETENTION_DAYS } from "@/lib/leads/retention";
import { getLeads } from "@/lib/leads/service";
import { getPublicServices } from "@/lib/services/public";

export const metadata = { title: "Poptávky" };

export default async function LeadsPage({ searchParams }: PageProps<"/admin/poptavky">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && sp.status in LeadStatus ? (sp.status as LeadStatus) : undefined;
  const type = typeof sp.type === "string" && sp.type in LeadType ? (sp.type as LeadType) : undefined;
  const services = await getPublicServices();
  const categories = [CARS_CATEGORY, ...services.map(serviceCategory), WANTED_CATEGORY];
  const section = typeof sp.sluzba === "string" && categories.some((c) => c.key === sp.sluzba) ? sp.sluzba : undefined;
  const leads = await getLeads({ status, type, section });

  return (
    <>
      <PageHead title="Poptávky" />
      <p className="mb-4 text-sm text-muted">
        Poptávky, které nevedly k obchodu, se {LEAD_RETENTION_DAYS} dní od posledního kontaktu (poslední změny stavu) automaticky mažou. Poptávky ve stavu Rezervace a Prodáno se nemažou.
      </p>
      <GetForm action="/admin/poptavky" className="mb-4 flex flex-wrap items-end gap-2">
        <div>
          <label className="label" htmlFor="flt-status">Stav</label>
          <select id="flt-status" name="status" defaultValue={status ?? ""} className="field w-auto">
            <option value="">Všechny</option>
            {LEAD_STATUS_ORDER.map((k) => (
              <option key={k} value={k}>{LEAD_STATUS_LABELS[k]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="flt-section">Služba</label>
          <select id="flt-section" name="sluzba" defaultValue={section ?? ""} className="field w-auto">
            <option value="">Všechny</option>
            {categories.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="flt-type">Typ</label>
          <select id="flt-type" name="type" defaultValue={type ?? ""} className="field w-auto">
            <option value="">Všechny</option>
            {Object.entries(LEAD_TYPE_LABELS).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </select>
        </div>
        <button className="btn-outline">Filtrovat</button>
        {(status || type || section) && <Link href="/admin/poptavky" className="pb-2 text-sm text-muted underline">Zrušit</Link>}
      </GetForm>

      <div className="card overflow-x-auto">
        <table className={tableClass}>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Zákazník</th>
              <th>Kontakt</th>
              <th>Vůz</th>
              <th>Typ</th>
              <th>Termín</th>
              <th>Stav</th>
              <th><span className="sr-only">Smazat</span></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="hover:bg-card2">
                <td className="whitespace-nowrap text-muted">{formatDateTime(l.createdAt)}</td>
                <td>
                  <Link href={`/admin/poptavky/${l.id}`} className="font-semibold hover:text-acc">{l.name}</Link>
                  {l.message && <div className="max-w-[260px] truncate text-xs text-muted">{l.message}</div>}
                </td>
                <td className="whitespace-nowrap">
                  <a href={`tel:${phoneDigits(l.phone)}`} className="hover:text-acc">{l.phone}</a>
                  {l.email && <div className="text-xs text-muted">{l.email}</div>}
                </td>
                <td>
                  {l.vehicle ? `${l.vehicle.brand} ${l.vehicle.model}` : (l.car ?? "—")}
                  {l.vehicle && l.vehicle.status !== "DOSTUPNE" && <div className="text-xs text-muted">vůz: {VEHICLE_STATUS_LABELS[l.vehicle.status].toLowerCase()}</div>}
                </td>
                <td>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: leadCategory(l).color }} aria-hidden="true" />
                    <span>
                      <LeadTypeLabel type={l.type} />
                      {l.type === "SERVICE" && l.service && <span className="block text-xs text-muted">{l.service.title}</span>}
                    </span>
                  </span>
                </td>
                <td className="whitespace-nowrap">
                  {formatBooking(l) ?? "—"}
                  {formatBooking(l) && <div className="text-xs text-muted">{effectiveBooking(l).confirmed ? "potvrzeno" : "přání zákazníka"}</div>}
                </td>
                <td><LeadStatusSelect key={l.status} id={l.id} status={l.status} type={l.type} /></td>
                <td><LeadDeleteButton id={l.id} name={l.name} /></td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={8} className="text-muted">Žádné poptávky.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
