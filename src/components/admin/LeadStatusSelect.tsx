"use client";

import { LeadStatus, type LeadType } from "@/generated/prisma/enums";
import { LEAD_STATUS_LABELS } from "@/lib/labels";
import { useAdminAction } from "./useAdminAction";

/** Stav „Potvrzeno“ patří jen k servisním objednávkám. */
export function LeadStatusSelect({ id, status, type }: { id: number; status: LeadStatus; type: LeadType }) {
  const { run, pending } = useAdminAction();
  return (
    <select
      aria-label="Stav poptávky"
      defaultValue={status}
      disabled={pending}
      onChange={(e) => run(`/api/leads/${id}`, "PUT", { status: e.target.value })}
      className="field w-auto min-w-[140px] py-1.5 text-sm"
    >
      {Object.values(LeadStatus)
        .filter((s) => s !== "CONFIRMED" || type === "SERVICE" || status === "CONFIRMED")
        .map((s) => (
          <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
        ))}
    </select>
  );
}
