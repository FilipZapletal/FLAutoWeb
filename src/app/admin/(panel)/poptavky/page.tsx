import Link from "next/link";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import { LeadTypeLabel, PageHead, tableClass } from "@/components/admin/ui";
import { GetForm } from "@/components/ui/GetForm";
import { LeadStatus, LeadType } from "@/generated/prisma/enums";
import { formatBooking } from "@/lib/booking";
import { formatDateTime, phoneDigits } from "@/lib/format";
import { LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from "@/lib/labels";
import { getLeads } from "@/lib/leads/service";

export const metadata = { title: "Poptávky" };

export default async function LeadsPage({ searchParams }: PageProps<"/admin/poptavky">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && sp.status in LeadStatus ? (sp.status as LeadStatus) : undefined;
  const type = typeof sp.type === "string" && sp.type in LeadType ? (sp.type as LeadType) : undefined;
  const leads = await getLeads({ status, type });

  return (
    <>
      <PageHead title="Poptávky" />
      <GetForm action="/admin/poptavky" className="mb-4 flex flex-wrap items-end gap-2">
        <div>
          <label className="label" htmlFor="flt-status">Stav</label>
          <select id="flt-status" name="status" defaultValue={status ?? ""} className="field w-auto">
            <option value="">Všechny</option>
            {Object.entries(LEAD_STATUS_LABELS).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
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
        {(status || type) && <Link href="/admin/poptavky" className="pb-2 text-sm text-muted underline">Zrušit</Link>}
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
                <td>{l.vehicle ? `${l.vehicle.brand} ${l.vehicle.model}` : (l.car ?? "—")}</td>
                <td><LeadTypeLabel type={l.type} /></td>
                <td className="whitespace-nowrap">{formatBooking(l) ?? "—"}</td>
                <td><LeadStatusSelect key={l.status} id={l.id} status={l.status} /></td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="text-muted">Žádné poptávky.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
