"use client";

import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";

/**
 * GET formulář, který do URL nedává prázdná pole (čistší a sdílitelné odkazy).
 * Funguje i bez JavaScriptu jako běžný formulář.
 */
export function GetForm({ action, children, className }: { action: string; children: ReactNode; className?: string }) {
  const router = useRouter();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const qs = new URLSearchParams();
    for (const [k, v] of new FormData(e.currentTarget)) {
      if (typeof v === "string" && v.trim() !== "") qs.set(k, v.trim());
    }
    const query = qs.toString();
    router.push(query ? `${action}?${query}` : action);
  }

  return (
    <form action={action} method="get" onSubmit={onSubmit} className={className}>
      {children}
    </form>
  );
}
