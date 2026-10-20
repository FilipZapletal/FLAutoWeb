import Link from "next/link";
import type { LeadStatus, LeadType, VehicleStatus } from "@/generated/prisma/enums";
import { LEAD_STATUS_LABELS, LEAD_TYPE_LABELS, VEHICLE_STATUS_LABELS } from "@/lib/labels";

export function PageHead({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="flex items-center gap-2 text-xl">
        <span className="accent-bar" /> {title}
      </h1>
      {children}
    </div>
  );
}

export function StatCard({ label, value, href }: { label: string; value: number; href?: string }) {
  const body = (
    <>
      <div className="text-[11px] leading-tight text-muted md:text-xs">{label}</div>
      <div className="font-display text-2xl font-bold md:text-3xl">{value}</div>
    </>
  );
  return href ? (
    <Link href={href} className="card block p-3 transition-colors hover:border-acc md:p-4">
      {body}
    </Link>
  ) : (
    <div className="card p-3 md:p-4">{body}</div>
  );
}

const LEAD_STATUS_STYLE: Record<LeadStatus, string> = {
  NEW: "bg-acc text-white",
  CONTACTED: "bg-amber-500 text-black",
  NEGOTIATION: "bg-sky-500 text-black",
  CONFIRMED: "bg-emerald-500 text-black",
  RESERVED: "bg-violet-500 text-white",
  SOLD: "bg-sold text-[#0b0c0e]",
  LOST: "bg-card2 text-muted",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <span className={`badge ${LEAD_STATUS_STYLE[status]}`}>{LEAD_STATUS_LABELS[status]}</span>;
}

const VEHICLE_STATUS_STYLE: Record<VehicleStatus, string> = {
  DOSTUPNE: "bg-card2 text-fg",
  REZERVOVANO: "bg-acc text-white",
  PRODANO: "bg-sold text-[#0b0c0e]",
  SKRYTE: "bg-card2 text-muted",
};

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  return <span className={`badge shrink-0 ${VEHICLE_STATUS_STYLE[status]}`}>{VEHICLE_STATUS_LABELS[status]}</span>;
}

export function LeadTypeLabel({ type }: { type: LeadType }) {
  return <span className={type === "SERVICE" ? "text-acc" : ""}>{LEAD_TYPE_LABELS[type]}</span>;
}

export const tableClass = "w-full border-collapse text-sm [&_td]:border-b [&_td]:border-line [&_td]:px-3 [&_td]:py-2.5 [&_td]:align-middle [&_th]:border-b [&_th]:border-line [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-display [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-muted";
