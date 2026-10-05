import type { VehicleStatus } from "@/generated/prisma/enums";
import { VEHICLE_STATUS_LABELS } from "@/lib/labels";

/** Rezervováno = červený štítek, Prodáno = zelený (tmavý text). Dostupné bez štítku. */
export function StatusBadge({ status, className = "" }: { status: VehicleStatus; className?: string }) {
  if (status === "DOSTUPNE") return null;
  const style =
    status === "PRODANO" ? "bg-sold text-[#0b0c0e]" : status === "REZERVOVANO" ? "bg-acc text-white" : "bg-muted text-bg";
  return <span className={`badge ${style} ${className}`}>{VEHICLE_STATUS_LABELS[status]}</span>;
}
