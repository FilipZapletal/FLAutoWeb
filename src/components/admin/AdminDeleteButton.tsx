"use client";

import { useAdminAction } from "./useAdminAction";

export function AdminDeleteButton({ id, email }: { id: number; email: string }) {
  const { run, pending } = useAdminAction();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => confirm(`Opravdu odebrat správce ${email}? Už se nepřihlásí.`) && run(`/api/admins/${id}`, "DELETE")}
      className="btn-outline btn-sm text-acc"
    >
      Odebrat
    </button>
  );
}
