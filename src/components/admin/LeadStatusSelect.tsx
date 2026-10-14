"use client";

import type { LeadStatus, LeadType } from "@/generated/prisma/enums";
import { LEAD_STATUS_LABELS, LEAD_STATUS_ORDER, VEHICLE_STATUS_LABELS } from "@/lib/labels";
import { toast } from "./Toaster";
import { useAdminAction } from "./useAdminAction";

/** Stav „Potvrzeno“ (domluvený termín) mají všechny poptávky kromě hledaného auta. */
export function LeadStatusSelect({ id, status, type }: { id: number; status: LeadStatus; type: LeadType }) {
  const { run, pending } = useAdminAction();
  return (
    <select
      aria-label="Stav poptávky"
      defaultValue={status}
      disabled={pending}
      onChange={(e) =>
        run(`/api/leads/${id}`, "PUT", { status: e.target.value }, (data) => {
          const vehicle = data.vehicleStatus as keyof typeof VEHICLE_STATUS_LABELS | null;
          if (vehicle) toast(`Vůz byl automaticky nastaven na „${VEHICLE_STATUS_LABELS[vehicle]}“.`);
        })
      }
      className="field w-auto min-w-[140px] py-1.5 text-sm"
    >
      {LEAD_STATUS_ORDER.filter((s: LeadStatus) => (s !== "CONFIRMED" || type !== "WANTED_CAR" || status === "CONFIRMED")).map((s) => (
        <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
      ))}
    </select>
  );
}
