"use client";

import { useAdminAction } from "./useAdminAction";

export function ReviewDeleteButton({ id }: { id: number }) {
  const { run, pending } = useAdminAction();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => confirm("Opravdu recenzi smazat?") && run(`/api/reviews/${id}`, "DELETE")}
      className="btn-outline btn-sm text-acc"
    >
      Smazat
    </button>
  );
}
