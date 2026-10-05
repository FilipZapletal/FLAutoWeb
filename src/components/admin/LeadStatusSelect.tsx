"use client";

import { LeadStatus } from "@/generated/prisma/enums";
import { LEAD_STATUS_LABELS } from "@/lib/labels";
import { useAdminAction } from "./useAdminAction";

export function LeadStatusSelect({ id, status }: { id: number; status: LeadStatus }) {
  const { run, pending } = useAdminAction();
  return (
    <select
      aria-label="Stav poptávky"
      defaultValue={status}
      disabled={pending}
      onChange={(e) => run(`/api/leads/${id}`, "PUT", { status: e.target.value })}
      className="field w-auto min-w-[140px] py-1.5 text-sm"
    >
      {Object.values(LeadStatus).map((s) => (
        <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
      ))}
    </select>
  );
}
