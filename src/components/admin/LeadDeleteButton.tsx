"use client";

import { useRouter } from "next/navigation";
import { useAdminAction } from "./useAdminAction";

/** Ruční smazání poptávky (natrvalo). Po smazání z detailu se vrátí na seznam. */
export function LeadDeleteButton({ id, name, backTo, label = "Smazat" }: { id: number; name: string; backTo?: string; label?: string }) {
  const { run, pending } = useAdminAction();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        if (!confirm(`Opravdu smazat poptávku od ${name}? Smaže se natrvalo a nejde vrátit.`)) return;
        if ((await run(`/api/leads/${id}`, "DELETE")) && backTo) router.replace(backTo);
      }}
      className="btn-outline btn-sm text-acc"
    >
      {label}
    </button>
  );
}
