"use client";

import { useAdminAction } from "./useAdminAction";

/** Schválí recenzi z webu (zobrazí se veřejně) nebo schválenou stáhne zpět. */
export function ReviewApproveButton({ id, approved }: { id: number; approved: boolean }) {
  const { run, pending } = useAdminAction();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => run(`/api/reviews/${id}`, "PUT", { approved: !approved })}
      className={approved ? "btn-outline btn-sm" : "btn btn-sm"}
    >
      {approved ? "Stáhnout" : "Schválit"}
    </button>
  );
}
