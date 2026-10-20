"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { VehicleStatus } from "@/generated/prisma/enums";
import { VEHICLE_STATUS_LABELS } from "@/lib/labels";
import { StarIcon } from "@/components/ui/icons";
import { useAdminAction } from "./useAdminAction";

export function VehicleStatusSelect({ id, status }: { id: number; status: VehicleStatus }) {
  const { run, pending } = useAdminAction();
  return (
    <select
      aria-label="Status vozu"
      defaultValue={status}
      disabled={pending}
      onChange={(e) => run(`/api/vehicles/${id}`, "PUT", { status: e.target.value })}
      className="field w-auto min-w-[140px] py-1.5 text-sm"
    >
      {Object.values(VehicleStatus).map((s) => (
        <option key={s} value={s}>{VEHICLE_STATUS_LABELS[s]}</option>
      ))}
    </select>
  );
}

export function FeaturedToggle({ id, featured }: { id: number; featured: boolean }) {
  const { run, pending } = useAdminAction();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => run(`/api/vehicles/${id}`, "PUT", { featured: !featured })}
      className={featured ? "text-acc" : "text-muted hover:text-fg"}
      aria-pressed={featured}
      title={featured ? "Doporučený na úvodní stránce – kliknutím zrušíte" : "Zobrazit mezi doporučenými na úvodní stránce"}
    >
      <StarIcon filled={featured} />
    </button>
  );
}

export function VehicleActions({ id, slug, archived, publicVisible }: { id: number; slug: string; archived: boolean; publicVisible: boolean }) {
  const { run, pending } = useAdminAction();

  async function remove() {
    if (!confirm("Opravdu vůz TRVALE smazat i s fotkami? Prodané vozy je lepší ponechat (zůstávají jako reference) nebo archivovat.")) return;
    await run(`/api/vehicles/${id}`, "DELETE");
  }

  return (
    <div className="flex min-w-[15rem] flex-wrap gap-1.5">
      <Link href={`/admin/vozidla/${id}`} className="btn-outline btn-sm">Upravit</Link>
      <Link href={`/admin/vozidla/${id}/fotky`} className="btn-outline btn-sm">Fotografie</Link>
      {publicVisible && (
        <Link href={`/vozy/${slug}`} target="_blank" className="btn-outline btn-sm">Na webu ↗</Link>
      )}
      <button type="button" disabled={pending} onClick={() => run(`/api/vehicles/${id}`, "PUT", { archived: !archived })} className="btn-outline btn-sm">
        {archived ? "Obnovit" : "Archivovat"}
      </button>
      <button type="button" disabled={pending} onClick={remove} className="btn-outline btn-sm text-acc">Smazat</button>
    </div>
  );
}

/** Archivace a smazání vozu na stránce úprav (na telefonu se v seznamu nezobrazují). */
export function VehicleManage({ id, archived }: { id: number; archived: boolean }) {
  const { run, pending } = useAdminAction();
  const router = useRouter();

  async function remove() {
    if (!confirm("Opravdu vůz TRVALE smazat i s fotkami? Prodané vozy je lepší ponechat (zůstávají jako reference) nebo archivovat.")) return;
    if (await run(`/api/vehicles/${id}`, "DELETE")) router.replace("/admin/vozidla");
  }

  return (
    <section className="card mt-6 p-5">
      <h2 className="mb-3 text-base">Správa vozu</h2>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={() => run(`/api/vehicles/${id}`, "PUT", { archived: !archived })} className="btn-outline">
          {archived ? "Obnovit z archivu" : "Archivovat"}
        </button>
        <button type="button" disabled={pending} onClick={remove} className="btn-outline text-acc">Smazat vůz</button>
      </div>
      <p className="mt-2 text-xs text-muted">Archivovaný vůz se na webu nezobrazuje, ale zůstává v adminu. Smazání je nevratné.</p>
    </section>
  );
}
