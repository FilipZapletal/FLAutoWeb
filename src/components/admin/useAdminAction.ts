"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Volání admin API s obnovením serverových dat po úspěchu. */
export function useAdminAction() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function run(url: string, method: "PUT" | "DELETE" | "POST", body?: unknown) {
    setPending(true);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.status === 401) {
        router.replace("/admin/prihlaseni");
        return false;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Akce se nepovedla.");
        return false;
      }
      router.refresh();
      return true;
    } finally {
      setPending(false);
    }
  }

  return { run, pending };
}
