import { LeadStatusBadge } from "@/components/admin/ui";
import { Row } from "@/components/admin/MobileRows";
import { PhoneIcon } from "@/components/ui/icons";
import { effectiveBooking, formatBooking } from "@/lib/booking";
import { formatDateTime, phoneDigits } from "@/lib/format";
import { LEAD_TYPE_LABELS } from "@/lib/labels";
import { leadCategory } from "@/lib/lead-categories";
import { parseOrderItems } from "@/lib/order-items";
import type { LeadStatus, LeadType } from "@/generated/prisma/enums";

type LeadLike = {
  id: number;
  name: string;
  phone: string;
  type: LeadType;
  status: LeadStatus;
  car: string | null;
  items: unknown;
  createdAt: Date;
  preferredDate: Date | null;
  preferredSlot: Parameters<typeof formatBooking>[0]["preferredSlot"];
  preferredTime: string | null;
  confirmedDate: Date | null;
  confirmedSlot: Parameters<typeof formatBooking>[0]["preferredSlot"];
  confirmedTime: string | null;
  vehicle: { brand: string; model: string } | null;
  service: { id: number; slug: string; title: string } | null;
};

/** Co zákazník chce: vůz, služba (a počet objednaných položek), hledané auto. */
export function leadSubject(l: LeadLike) {
  if (l.vehicle) return `${l.vehicle.brand} ${l.vehicle.model}`;
  const items = parseOrderItems(l.items);
  if (l.type === "SERVICE") return [l.service?.title, items.length ? `${items.length} položek` : null, l.car].filter(Boolean).join(" · ") || "—";
  return l.car ?? "—";
}

/** Řádek poptávky pro telefon (seznam poptávek a nástěnka). */
export function LeadRow({ lead: l }: { lead: LeadLike }) {
  const term = formatBooking(l);
  const confirmed = effectiveBooking(l).confirmed;
  return (
    <Row
      href={`/admin/poptavky/${l.id}`}
      leading={<span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: leadCategory(l).color }} aria-hidden="true" />}
      title={l.name}
      chip={<LeadStatusBadge status={l.status} />}
      lines={[
        l.type === "SERVICE" ? leadSubject(l) : `${LEAD_TYPE_LABELS[l.type]} · ${leadSubject(l)}`,
        term ? `${term} · ${confirmed ? "potvrzeno" : "přání zákazníka"}` : `Přijato ${formatDateTime(l.createdAt)}`,
      ]}
      aside={
        <a href={`tel:${phoneDigits(l.phone)}`} aria-label={`Zavolat ${l.name}`} className="btn-outline btn-sm !px-2.5">
          <PhoneIcon size={16} />
        </a>
      }
    />
  );
}
