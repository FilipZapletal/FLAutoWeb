"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAction } from "./useAdminAction";

export function ServiceActions({ id, slug, published }: { id: number; slug: string; published: boolean }) {
  const { run, pending } = useAdminAction();

  async function remove() {
    if (!confirm("Opravdu službu trvale smazat? Pokud ji chcete jen dočasně schovat, použijte „Skrýt“.")) return;
    await run(`/api/services/${id}`, "DELETE");
  }

  return (
    <div className="flex min-w-[15rem] flex-wrap gap-1.5">
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

/** Skrytí a smazání služby na stránce úprav (na telefonu se v seznamu nezobrazují). */
export function ServiceManage({ id, published }: { id: number; published: boolean }) {
  const { run, pending } = useAdminAction();
  const router = useRouter();

  async function remove() {
    if (!confirm("Opravdu službu trvale smazat? Pokud ji chcete jen dočasně schovat, použijte „Skrýt“.")) return;
    if (await run(`/api/services/${id}`, "DELETE")) router.replace("/admin/sluzby");
  }

  return (
    <section className="card mt-6 p-5">
      <h2 className="mb-3 text-base">Správa služby</h2>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={() => run(`/api/services/${id}`, "PUT", { published: !published })} className="btn-outline">
          {published ? "Skrýt na webu" : "Zobrazit na webu"}
        </button>
        <button type="button" disabled={pending} onClick={remove} className="btn-outline text-acc">Smazat službu</button>
      </div>
    </section>
  );
}
