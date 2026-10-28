import "server-only";
import { db } from "@/lib/db";
import { processServiceImage, removeVehicleImageFiles, UploadStageError } from "@/lib/images/process";
import { imageUrls } from "@/lib/images/variants";

/** Dvojice fotek „před a po“ na stránce služby. Nic z toho se nikdy nepoužívá u vozů ani na úvodní stránce. */
export async function getServiceComparisons(serviceId: number) {
  const rows = await db.serviceComparison.findMany({ where: { serviceId }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
  return rows.map((r) => ({
    id: r.id,
    caption: r.caption,
    width: r.width,
    height: r.height,
    before: imageUrls(r.beforeKey),
    after: imageUrls(r.afterKey),
  }));
}

export type ServiceComparisonView = Awaited<ReturnType<typeof getServiceComparisons>>[number];

export async function addServiceComparison(serviceId: number, before: Buffer, after: Buffer, caption: string | null) {
  const b = await processServiceImage(serviceId, before);
  let a: Awaited<ReturnType<typeof processServiceImage>>;
  try {
    a = await processServiceImage(serviceId, after);
  } catch (e) {
    await removeVehicleImageFiles(b.storageKey).catch(() => undefined);
    throw e;
  }
  try {
    const agg = await db.serviceComparison.aggregate({ where: { serviceId }, _max: { sortOrder: true } });
    return await db.serviceComparison.create({
      data: {
        serviceId,
        caption,
        beforeKey: b.storageKey,
        afterKey: a.storageKey,
        width: b.width,
        height: b.height,
        sortOrder: (agg._max.sortOrder ?? -1) + 1,
      },
    });
  } catch (e) {
    await Promise.all([b, a].map((x) => removeVehicleImageFiles(x.storageKey).catch(() => undefined)));
    throw new UploadStageError("zápis do databáze", e);
  }
}

export async function deleteServiceComparison(serviceId: number, id: number) {
  const row = await db.serviceComparison.findFirst({ where: { id, serviceId } });
  if (!row) return false;
  await db.serviceComparison.delete({ where: { id } });
  await removeComparisonFiles([row.beforeKey, row.afterKey]);
  return true;
}

/** Klíče všech fotek služby – pro úklid úložiště, až se služba smaže (řádky v databázi zaniknou s ní). */
export async function listServiceComparisonKeys(serviceId: number) {
  const rows = await db.serviceComparison.findMany({ where: { serviceId }, select: { beforeKey: true, afterKey: true } });
  return rows.flatMap((r) => [r.beforeKey, r.afterKey]);
}

export async function removeComparisonFiles(keys: string[]) {
  await Promise.all(keys.map((k) => removeVehicleImageFiles(k).catch(() => undefined)));
}
