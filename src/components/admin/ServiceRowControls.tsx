"use client";

import Link from "next/link";
import { useAdminAction } from "./useAdminAction";

export function ServiceActions({ id, slug, published }: { id: number; slug: string; published: boolean }) {
  const { run, pending } = useAdminAction();

  async function remove() {
    if (!confirm("Opravdu službu trvale smazat? Pokud ji chcete jen dočasně schovat, použijte „Skrýt“.")) return;
    await run(`/api/services/${id}`, "DELETE");
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <Link href={`/admin/sluzby/${id}`} className="btn-outline btn-sm">Upravit</Link>
      {published && (
        <Link href={`/servis/${slug}`} target="_blank" className="btn-outline btn-sm">Na webu ↗</Link>
      )}
      <button type="button" disabled={pending} onClick={() => run(`/api/services/${id}`, "PUT", { published: !published })} className="btn-outline btn-sm">
        {published ? "Skrýt" : "Zobrazit"}
      </button>
      <button type="button" disabled={pending} onClick={remove} className="btn-outline btn-sm text-acc">Smazat</button>
    </div>
  );
}
